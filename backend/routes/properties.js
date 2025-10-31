const express = require('express');
const Property = require('../models/Property');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { importProperties } = require('../scripts/importProperties');

const router = express.Router();
const { findByCsvId } = require('../utils/propertyCsv');

// Get properties with optional bounds filter
router.get('/', async (req, res) => {
  try {
    const { north, south, east, west, search, city, locationName, areaName } = req.query;
    let query = {};

    if (north && south && east && west) {
      query = {
        'coordinates.lat': { $gte: parseFloat(south), $lte: parseFloat(north) },
        'coordinates.lng': { $gte: parseFloat(west), $lte: parseFloat(east) }
      };
    }

    if (search) {
      const re = new RegExp(search, 'i');
      query.$or = [
        { title: re },
        { location: re },
        { locationName: re },
        { areaName: re },
        { city: re }
      ];
    }

    if (city) query.city = new RegExp(`^${city}$`, 'i');
    if (locationName) query.locationName = new RegExp(locationName, 'i');
    if (areaName) query.areaName = new RegExp(areaName, 'i');

    const properties = await Property.find(query).limit(500);
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get property by ID
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      // Fallback to CSV by CSV ID
      const fromCsv = await findByCsvId(req.params.id);
      if (!fromCsv) return res.status(404).json({ message: 'Property not found' });
      return res.json(fromCsv);
    }
    res.json(property);
  } catch (error) {
    // If invalid ObjectId or error, also try CSV fallback
    try {
      const fromCsv = await findByCsvId(req.params.id);
      if (fromCsv) return res.json(fromCsv);
    } catch (e) {}
    res.status(500).json({ message: error.message });
  }
});

// Direct CSV endpoint by CSV ID
router.get('/csv/:csvId', async (req, res) => {
  try {
    const fromCsv = await findByCsvId(req.params.csvId);
    if (!fromCsv) return res.status(404).json({ message: 'Property not found' });
    res.json(fromCsv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create property (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const property = new Property(req.body);
    await property.save();
    res.status(201).json(property);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update property (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete property (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json({ message: 'Property deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Import properties from CSV (admin only)
router.post('/import-csv', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // This endpoint can trigger the import script
    const { exec } = require('child_process');
    exec('npm run import', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).json({ message: 'Import failed', error: error.message });
      }
      res.json({ message: 'Properties import initiated', output: stdout });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload CSV (alias) — matches frontend AdminDashboard; ignores uploaded file and imports repo CSV
router.post('/upload-csv', authenticateToken, requireAdmin, upload.single('csv'), async (req, res) => {
  try {
    const result = await importProperties();
    res.json({ message: 'Properties imported from properties.csv', ...result });
  } catch (error) {
    res.status(500).json({ message: 'Import failed', error: error.message });
  }
});

module.exports = router;
