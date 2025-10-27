const express = require('express');
const Property = require('../models/Property');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get properties with optional bounds filter
router.get('/', async (req, res) => {
  try {
    const { north, south, east, west } = req.query;
    let query = {};

    if (north && south && east && west) {
      query = {
        'coordinates.lat': { $gte: parseFloat(south), $lte: parseFloat(north) },
        'coordinates.lng': { $gte: parseFloat(west), $lte: parseFloat(east) }
      };
    }

    const properties = await Property.find(query);
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get property by ID
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json(property);
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

module.exports = router;
