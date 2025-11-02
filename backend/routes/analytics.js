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
              else: null
            }
          }
        }
      },
      {
        $group: {
          _id: '$locationName',
          avgPrice: { $avg: '$price' },
          avgPricePerSqFt: {
            $avg: {
              $cond: {
                if: { $ne: ['$pricePerSqFt', null] },
                then: '$pricePerSqFt',
                else: '$$REMOVE'
              }
            }
          },
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

// Get historical price trends by location and time period
router.get('/historical-price-trends', async (req, res) => {
  try {
    const { location, years = 5 } = req.query;
    const yearsAgo = new Date();
    yearsAgo.setFullYear(yearsAgo.getFullYear() - parseInt(years));

    let matchStage = {
      'priceHistory.0': { $exists: true },
      'priceHistory.date': { $gte: yearsAgo }
    };

    if (location) {
      matchStage.locationName = location;
    }

    const trends = await Property.aggregate([
      { $match: matchStage },
      {
        $project: {
          locationName: 1,
          priceHistory: {
            $filter: {
              input: '$priceHistory',
              as: 'history',
              cond: { $gte: ['$$history.date', yearsAgo] }
            }
          }
        }
      },
      { $unwind: '$priceHistory' },
      {
        $group: {
          _id: {
            location: '$locationName',
            year: { $year: '$priceHistory.date' }
          },
          avgPrice: { $avg: '$priceHistory.price' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.location',
          data: {
            $push: {
              year: '$_id.year',
              price: '$avgPrice',
              count: '$count'
            }
          }
        }
      },
      {
        $project: {
          location: '$_id',
          data: {
            $sortArray: { input: '$data', sortBy: { year: 1 } }
          },
          _id: 0
        }
      },
      { $sort: { location: 1 } }
    ]);

    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
