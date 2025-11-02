const express = require('express');
const Property = require('../models/Property');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { importProperties } = require('../scripts/importProperties');

const router = express.Router();
const { findByCsvId, getPropertiesFromCsv } = require('../utils/propertyCsv');

// Get properties with optional bounds filter - NOW READING DIRECTLY FROM CSV
router.get('/', async (req, res) => {
  try {
    const { north, south, east, west, search, city, locationName, areaName, limit } = req.query;
    
    // Read directly from CSV with filters
    const properties = await getPropertiesFromCsv({
      north,
      south,
      east,
      west,
      search,
      city,
      locationName,
      areaName,
      limit: limit || 1000
    });

    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties from CSV:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get property by ID - NOW READING DIRECTLY FROM CSV
router.get('/:id', async (req, res) => {
  try {
    // Read directly from CSV by ID
    const property = await findByCsvId(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    console.error('Error fetching property from CSV:', error);
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
