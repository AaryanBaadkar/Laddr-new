const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
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

// CSV upload (admin only)
const upload = multer({ dest: 'uploads/' });
router.post('/upload-csv', authenticateToken, requireAdmin, upload.single('csv'), async (req, res) => {
  try {
    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        // Process and save properties
        for (const row of results) {
          const property = new Property({
            title: row.title,
            price: parseFloat(row.price),
            carpetArea: parseFloat(row.carpetArea),
            coveredArea: parseFloat(row.coveredArea),
            bedrooms: parseInt(row.bedrooms),
            bathrooms: parseInt(row.bathrooms),
            furnishingType: row.furnishingType,
            locationName: row.locationName,
            coordinates: { lat: parseFloat(row.lat), lng: parseFloat(row.lng) },
            amenities: row.amenities ? row.amenities.split(',') : [],
            developer: row.developer,
            floor: row.floor,
            society: row.society,
            powerBackup: row.powerBackup === 'true',
            parking: row.parking === 'true',
          });
          await property.save();
        }
        fs.unlinkSync(req.file.path); // Remove uploaded file
        res.json({ message: 'Properties imported successfully' });
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
