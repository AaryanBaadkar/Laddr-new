const express = require('express');
const Property = require('../models/Property');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get price trends by locality
router.get('/price-trends', async (req, res) => {
  try {
    const trends = await Property.aggregate([
      {
        $match: { carpetArea: { $gt: 0 }, price: { $gt: 0 } }
      },
      {
        $addFields: {
          pricePerSqFt: {
            $cond: {
              if: { $gt: ['$carpetArea', 0] },
              then: { $divide: ['$price', '$carpetArea'] },
              else: 0
            }
          }
        }
      },
      {
        $group: {
          _id: '$locationName',
          avgPrice: { $avg: '$price' },
          avgPricePerSqFt: { $avg: '$pricePerSqFt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { avgPrice: -1 } }
    ]);
    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get neighborhood rankings
router.get('/neighborhoods', async (req, res) => {
  try {
    const neighborhoods = await Property.aggregate([
      {
        $group: {
          _id: '$locationName',
          properties: { $push: '$$ROOT' },
          avgPrice: { $avg: '$price' }
        }
      },
      {
        $project: {
          locationName: '$_id',
          propertyCount: { $size: '$properties' },
          avgPrice: 1,
          amenitiesScore: {
            $sum: {
              $map: {
                input: '$properties',
                as: 'prop',
                in: { $size: '$$prop.amenities' }
              }
            }
          }
        }
      },
      { $sort: { amenitiesScore: -1 } }
    ]);
    res.json(neighborhoods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
