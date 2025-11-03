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
      {
        $match: {
          avgPricePerSqFt: { $gt: 0 }
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

// Get property type distribution
router.get('/property-types', async (req, res) => {
  try {
    const propertyTypes = await Property.aggregate([
      {
        $match: { propertyType: { $ne: null } }
      },
      {
        $group: {
          _id: '$propertyType',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          avgArea: { $avg: '$carpetArea' },
          avgPricePerSqFt: { $avg: '$sqftPrice' }
        }
      },
      {
        $match: {
          avgPrice: { $gt: 0 },
          avgArea: { $gt: 0 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    res.json(propertyTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get developer analysis
router.get('/developers', async (req, res) => {
  try {
    const developers = await Property.aggregate([
      {
        $match: { developer: { $ne: null } }
      },
      {
        $group: {
          _id: '$developer',
          propertyCount: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          totalValue: { $sum: '$price' },
          locations: { $addToSet: '$locationName' }
        }
      },
      {
        $match: {
          propertyCount: { $gte: 5 } // Only developers with 5+ properties
        }
      },
      { $sort: { propertyCount: -1 } },
      { $limit: 10 }
    ]);
    res.json(developers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get amenities analysis
router.get('/amenities-analysis', async (req, res) => {
  try {
    const amenitiesAnalysis = await Property.aggregate([
      { $unwind: '$amenities' },
      {
        $group: {
          _id: '$amenities',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);

    // Also get properties with/without key amenities
    const keyAmenities = await Property.aggregate([
      {
        $project: {
          price: 1,
          hasLift: { $cond: ['$lift', 1, 0] },
          hasParking: { $cond: ['$parking', 1, 0] },
          hasSecurity: { $cond: ['$security', 1, 0] },
          hasSwimmingPool: { $cond: ['$swimmingPool', 1, 0] },
          hasGym: { $cond: ['$gymnasium', 1, 0] }
        }
      },
      {
        $group: {
          _id: null,
          avgPriceWithLift: { $avg: { $cond: [{ $eq: ['$hasLift', 1] }, '$price', null] } },
          avgPriceWithoutLift: { $avg: { $cond: [{ $eq: ['$hasLift', 0] }, '$price', null] } },
          avgPriceWithParking: { $avg: { $cond: [{ $eq: ['$hasParking', 1] }, '$price', null] } },
          avgPriceWithoutParking: { $avg: { $cond: [{ $eq: ['$hasParking', 0] }, '$price', null] } },
          avgPriceWithSecurity: { $avg: { $cond: [{ $eq: ['$hasSecurity', 1] }, '$price', null] } },
          avgPriceWithoutSecurity: { $avg: { $cond: [{ $eq: ['$hasSecurity', 0] }, '$price', null] } },
          avgPriceWithPool: { $avg: { $cond: [{ $eq: ['$hasSwimmingPool', 1] }, '$price', null] } },
          avgPriceWithoutPool: { $avg: { $cond: [{ $eq: ['$hasSwimmingPool', 0] }, '$price', null] } },
          avgPriceWithGym: { $avg: { $cond: [{ $eq: ['$hasGym', 1] }, '$price', null] } },
          avgPriceWithoutGym: { $avg: { $cond: [{ $eq: ['$hasGym', 0] }, '$price', null] } }
        }
      }
    ]);

    res.json({
      popularAmenities: amenitiesAnalysis,
      keyAmenitiesImpact: keyAmenities[0] || {}
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get possession status analysis
router.get('/possession-status', async (req, res) => {
  try {
    const possessionData = await Property.aggregate([
      {
        $match: { possessionStatus: { $ne: null } }
      },
      {
        $group: {
          _id: '$possessionStatus',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          avgArea: { $avg: '$carpetArea' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    res.json(possessionData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get bedroom distribution
router.get('/bedroom-analysis', async (req, res) => {
  try {
    const bedroomData = await Property.aggregate([
      {
        $match: { bedrooms: { $ne: null, $gt: 0 } }
      },
      {
        $group: {
          _id: '$bedrooms',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          avgArea: { $avg: '$carpetArea' },
          avgPricePerSqFt: { $avg: '$sqftPrice' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(bedroomData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get area vs price correlation
router.get('/area-price-correlation', async (req, res) => {
  try {
    const correlationData = await Property.aggregate([
      {
        $match: {
          carpetArea: { $gt: 0 },
          price: { $gt: 0 }
        }
      },
      {
        $bucket: {
          groupBy: '$carpetArea',
          boundaries: [0, 500, 1000, 1500, 2000, 2500, 3000, 4000, 5000],
          default: '5000+',
          output: {
            count: { $sum: 1 },
            avgPrice: { $avg: '$price' },
            avgPricePerSqFt: { $avg: '$sqftPrice' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(correlationData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get top property recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const recommendations = await Property.aggregate([
      {
        $match: {
          price: { $gt: 0 },
          carpetArea: { $gt: 0 },
          locationName: { $ne: null }
        }
      },
      {
        $addFields: {
          projectedReturn: {
            $multiply: [
              { $divide: ['$price', 1000000] }, // Normalize price
              0.08 // Assume 8% annual return
            ]
          },
          rentalYield: {
            $cond: {
              if: { $gt: ['$price', 0] },
              then: { $multiply: [{ $divide: [{ $multiply: ['$price', 0.01] }, '$price'] }, 100] }, // 1% of price as annual rent
              else: 0
            }
          },
          riskScore: {
            $cond: {
              if: { $eq: ['$possessionStatus', 'Ready to Move'] },
              then: 1, // Low risk
              else: {
                $cond: {
                  if: { $eq: ['$possessionStatus', 'Under Construction'] },
                  then: 2, // Medium risk
                  else: 3 // High risk
                }
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          title: '$projectName',
          currentPrice: '$price',
          priceTrend: { $literal: 'up' }, // Placeholder
          predictedGrowth: { $multiply: ['$projectedReturn', 100] },
          rentalYield: 1,
          riskLevel: {
            $switch: {
              branches: [
                { case: { $eq: ['$riskScore', 1] }, then: 'Low' },
                { case: { $eq: ['$riskScore', 2] }, then: 'Medium' },
                { case: { $eq: ['$riskScore', 3] }, then: 'High' }
              ],
              default: 'Medium'
            }
          },
          riskScore: 1,
          paybackPeriod: { $divide: ['$price', { $multiply: ['$price', 0.01] }] }, // Price / annual rent
          maintenanceCost: { $multiply: ['$price', 0.005] }, // 0.5% of price
          location: '$locationName',
          propertyType: 1,
          bedrooms: 1,
          carpetArea: 1,
          sqftPrice: 1
        }
      },
      { $sort: { predictedGrowth: -1, rentalYield: -1 } },
      { $limit: 10 }
    ]);

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
