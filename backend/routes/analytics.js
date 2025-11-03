const express = require('express');
const { getPropertiesFromCsv } = require('../utils/propertyCsv');

const router = express.Router();

// Helper: Clean numbers (remove ₹, commas, text)
const cleanNumber = (value) => {
  if (!value || value === 'NA' || value === '') return 0;
  const str = value.toString().replace(/[^0-9.]/g, '');
  return parseFloat(str) || 0;
};

// Helper: Estimate rent based on area and locality
const estimateRent = (area, locality) => {
  const baseRentPerSqft = 25; // default base rent in ₹/sqft/month
  let localityMultiplier = 1;
  const loc = (locality || '').toLowerCase();
  
  if (loc.includes('downtown') || loc.includes('city center')) localityMultiplier = 1.5;
  else if (loc.includes('prime') || loc.includes('central')) localityMultiplier = 1.3;
  else if (loc.includes('suburb')) localityMultiplier = 0.9;
  else if (loc.includes('rural')) localityMultiplier = 0.7;
  
  return area * baseRentPerSqft * localityMultiplier;
};

// Helper: Calculate weighted score
const computeScore = (roi, yieldPercent, amenitiesCount, luxuryFactor, locationScore) => {
  return (
    roi * 0.4 + 
    yieldPercent * 0.3 + 
    amenitiesCount * 0.1 + 
    luxuryFactor * 0.1 + 
    locationScore * 0.1
  );
};

// Analyze properties using the provided algorithm
const analyzeProperties = (properties) => {
  if (!properties || properties.length === 0) {
    console.warn('No properties provided to analyzeProperties');
    return null;
  }
  
  const validProperties = properties.filter(p => p && p.price > 0 && p.price !== null);
  console.log(`Analyzing ${validProperties.length} valid properties out of ${properties.length} total`);
  
  if (validProperties.length === 0) {
    console.warn('No valid properties with price > 0');
    return null;
  }
  
  const analyzedProperties = validProperties.map(property => {
      const price = property.price || 0;
      const sqftPrice = property.sqftPrice || 0;
      const carpetArea = property.carpetArea || 0;
      const maintenance = property.maintenanceCharges || 0;
      const appreciation = 7; // Default 7% appreciation
      
      // Estimate annual rent if not in CSV
      const monthlyRent = estimateRent(carpetArea, property.locality || property.areaName);
      const annualRent = monthlyRent * 12;
      
      // ROI: appreciation + rental return - maintenance
      const yearlyReturn = (price * appreciation) / 100;
      const totalAnnualGain = yearlyReturn + annualRent;
      const roi = price > 0 ? ((totalAnnualGain - maintenance) / price) * 100 : 0;
      
      // Yield: rent vs price
      const yieldPercent = price > 0 ? (annualRent / price) * 100 : 0;
      
      // Amenity scoring (count amenities array)
      const amenitiesCount = property.amenities ? property.amenities.length : 0;
      
      // Luxury features (keywords)
      const luxuryWords = ['pool', 'club', 'gym', 'helipad', 'jacuzzi', 'skydeck', 'golf', 'villa', 'infinity'];
      const amenityStr = (property.amenitiesFacing || '').toLowerCase() + ' ' + 
                        (property.propertyUniqueness || '').toLowerCase() + ' ' +
                        (property.title || '').toLowerCase() + ' ' +
                        (property.projectName || '').toLowerCase();
      const luxuryFactor = luxuryWords.reduce((count, word) => 
        count + (amenityStr.includes(word) ? 1 : 0), 0
      );
      
      // Location score
      const location = (property.locality || property.areaName || property.locationName || '').toLowerCase();
      let locationScore = 5; // default
      if (location.includes('downtown') || location.includes('city center')) locationScore = 10;
      else if (location.includes('prime')) locationScore = 8;
      else if (location.includes('suburb')) locationScore = 6;
      
      // Overall score
      const score = computeScore(roi, yieldPercent, amenitiesCount, luxuryFactor, locationScore);
      
      return {
        ...property,
        roi: parseFloat(roi.toFixed(2)),
        yield: parseFloat(yieldPercent.toFixed(2)),
        score: parseFloat(score.toFixed(2)),
        annualRent: Math.round(annualRent),
        projectedReturn: parseFloat(roi.toFixed(2))
      };
    });
  
  if (analyzedProperties.length === 0) return null;
  
  const bestROI = [...analyzedProperties].sort((a, b) => b.roi - a.roi)[0];
  const bestYield = [...analyzedProperties].sort((a, b) => b.yield - a.yield)[0];
  const bestOverall = [...analyzedProperties].sort((a, b) => b.score - a.score)[0];
  
  return {
    bestROI,
    bestYield,
    recommendation: bestOverall,
    analyzedProperties
  };
};

// Helper function to calculate statistics from properties
const calculateStats = (properties) => {
  const validProperties = properties.filter(p => p.price > 0 && p.carpetArea > 0);
  
  if (validProperties.length === 0) return null;
  
  const totalPrice = validProperties.reduce((sum, p) => sum + (p.price || 0), 0);
  const totalSqFt = validProperties.reduce((sum, p) => sum + (p.carpetArea || 0), 0);
  const avgPrice = totalPrice / validProperties.length;
  const avgPricePerSqFt = totalSqFt > 0 ? totalPrice / totalSqFt : 0;
  
  return {
    avgPrice,
    avgPricePerSqFt,
    count: validProperties.length,
    minPrice: Math.min(...validProperties.map(p => p.price)),
    maxPrice: Math.max(...validProperties.map(p => p.price))
  };
};

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
    const { city } = req.query;
    const filters = city ? { city } : {};
    const properties = await getPropertiesFromCsv(filters);
    
    // Group by locationName
    const locationMap = {};
    properties.forEach(property => {
      const location = property.locationName || property.areaName || property.city || 'Unknown';
      if (!locationMap[location]) {
        locationMap[location] = [];
      }
      locationMap[location].push(property);
    });
    
    const neighborhoods = Object.entries(locationMap).map(([location, props]) => {
      const stats = calculateStats(props);
      const amenitiesScore = props.reduce((sum, p) => sum + (p.amenities ? p.amenities.length : 0), 0);
      
      return {
        locationName: location,
        propertyCount: props.length,
        avgPrice: stats ? Math.round(stats.avgPrice) : 0,
        amenitiesScore
      };
    }).filter(n => n.propertyCount > 0).sort((a, b) => b.amenitiesScore - a.amenitiesScore);
    
    res.json(neighborhoods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get historical price trends by location and time period (simulated based on current data)
router.get('/historical-price-trends', async (req, res) => {
  try {
    const { location, city, years = 5 } = req.query;
    const yearsInt = parseInt(years);
    
    const filters = {};
    if (location) {
      filters.locationName = location;
    }
    if (city) {
      filters.city = city;
    }
    
    const properties = await getPropertiesFromCsv(filters);
    const validProperties = properties.filter(p => p.price > 0 && p.price !== null);
    
    if (validProperties.length === 0) {
      return res.json([]);
    }
    
    // Group by location if no specific location requested
    const locationMap = {};
    validProperties.forEach(property => {
      const loc = property.locationName || property.areaName || property.city || 'Unknown';
      if (!locationMap[loc]) {
        locationMap[loc] = [];
      }
      locationMap[loc].push(property);
    });
    
    const trends = Object.entries(locationMap).slice(0, 10).map(([loc, props]) => {
      const avgPrice = props.reduce((sum, p) => sum + p.price, 0) / props.length;
      const pricePerSqFt = props.filter(p => p.carpetArea > 0).reduce((sum, p) => sum + (p.price / p.carpetArea), 0) / props.filter(p => p.carpetArea > 0).length;
      
      // Calculate growth rate based on price per sqft (higher price = lower growth typically)
      let growthRate = 0.08; // Default 8%
      if (pricePerSqFt > 15000) {
        growthRate = 0.05; // 5% for expensive areas
      } else if (pricePerSqFt > 8000) {
        growthRate = 0.07; // 7% for mid-range
      } else {
        growthRate = 0.10; // 10% for affordable areas
      }
      
      // Generate historical data points
      const data = [];
      for (let i = yearsInt; i >= 0; i--) {
        const year = new Date().getFullYear() - i;
        // Reverse calculate price based on growth rate
        const historicalPrice = avgPrice / Math.pow(1 + growthRate, i);
        data.push({
          year,
          price: Math.round(historicalPrice)
        });
      }
      
      return {
        location: loc,
        data,
        avgPrice: Math.round(avgPrice),
        growthRate: Math.round(growthRate * 1000) / 10
      };
    });
    
    res.json(trends);
  } catch (error) {
    console.error('Error in historical-price-trends:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get available cities
router.get('/cities', async (req, res) => {
  try {
    console.log('Fetching cities from CSV...');
    const properties = await getPropertiesFromCsv();
    console.log(`Loaded ${properties.length} properties from CSV`);
    const cities = [...new Set(properties.map(p => p.city).filter(Boolean))].sort();
    console.log(`Found ${cities.length} cities:`, cities.slice(0, 10));
    if (cities.length === 0) {
      console.warn('No cities found in properties data');
    }
    res.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: error.message, error: error.toString() });
  }
});

// Get statistics summary
router.get('/summary', async (req, res) => {
  try {
    const { city } = req.query;
    const filters = city ? { city } : {};
    const properties = await getPropertiesFromCsv(filters);
    const validProperties = properties.filter(p => p.price > 0 && p.price !== null);
    
    if (validProperties.length === 0) {
      return res.json({
        totalProperties: 0,
        avgPrice: 0,
        totalValue: 0,
        avgPricePerSqFt: 0,
        propertiesByType: {},
        topLocations: []
      });
    }
    
    const totalProperties = validProperties.length;
    const avgPrice = validProperties.reduce((sum, p) => sum + p.price, 0) / totalProperties;
    const totalValue = validProperties.reduce((sum, p) => sum + p.price, 0);
    
    const propertiesWithArea = validProperties.filter(p => p.carpetArea > 0);
    const avgPricePerSqFt = propertiesWithArea.length > 0
      ? propertiesWithArea.reduce((sum, p) => sum + (p.price / p.carpetArea), 0) / propertiesWithArea.length
      : 0;
    
    // Properties by type
    const propertiesByType = {};
    validProperties.forEach(p => {
      const type = p.propertyType || 'Unknown';
      propertiesByType[type] = (propertiesByType[type] || 0) + 1;
    });
    
    // Top locations by property count
    const locationMap = {};
    validProperties.forEach(p => {
      const loc = p.locationName || p.areaName || 'Unknown';
      locationMap[loc] = (locationMap[loc] || 0) + 1;
    });
    const topLocations = Object.entries(locationMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));
    
    res.json({
      totalProperties,
      avgPrice: Math.round(avgPrice),
      totalValue: Math.round(totalValue),
      avgPricePerSqFt: Math.round(avgPricePerSqFt),
      propertiesByType,
      topLocations
    });
  } catch (error) {
    console.error('Error in summary:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get locations by city
router.get('/locations', async (req, res) => {
  try {
    const { city } = req.query;
    const filters = city ? { city } : {};
    const properties = await getPropertiesFromCsv(filters);
    const locations = [...new Set(properties.map(p => p.locationName || p.areaName).filter(Boolean))].sort();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get ROI forecast based on the algorithm
router.get('/roi-forecast', async (req, res) => {
  try {
    const { city, locationName } = req.query;
    const filters = {};
    if (city) filters.city = city;
    if (locationName) filters.locationName = locationName;
    
    const properties = await getPropertiesFromCsv(filters);
    const analysis = analyzeProperties(properties);
    
    if (!analysis || analysis.analyzedProperties.length === 0) {
      return res.json({
        current: 0,
        projectedCAGR: 0,
        data: []
      });
    }
    
    // Calculate average ROI from analyzed properties
    const avgROI = analysis.analyzedProperties.reduce((sum, p) => sum + p.roi, 0) / analysis.analyzedProperties.length;
    const avgYield = analysis.analyzedProperties.reduce((sum, p) => sum + p.yield, 0) / analysis.analyzedProperties.length;
    
    // Projected CAGR based on average yield growth
    const projectedCAGR = 1.8 + (avgYield * 0.1); // CAGR based on yield
    
    const data = [
      { period: '1 Year', value: Math.round((avgROI * 0.7) * 10) / 10 },
      { period: '3 Years', value: Math.round((avgROI * 0.85) * 10) / 10 },
      { period: '5 Years', value: Math.round(avgROI * 10) / 10 },
      { period: '10 Years', value: Math.round((avgROI * 1.3) * 10) / 10 }
    ];
    
    res.json({
      current: Math.round(avgROI * 10) / 10,
      projectedCAGR: Math.round(projectedCAGR * 10) / 10,
      data
    });
  } catch (error) {
    console.error('Error in roi-forecast:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get rental yield distribution by neighborhood using algorithm
router.get('/rental-yield', async (req, res) => {
  try {
    const { city } = req.query;
    const filters = city ? { city } : {};
    const properties = await getPropertiesFromCsv(filters);
    const analysis = analyzeProperties(properties);
    
    if (!analysis || analysis.analyzedProperties.length === 0) {
      return res.json({
        average: 0,
        change: 0,
        data: []
      });
    }
    
    // Group by neighborhood
    const neighborhoodMap = {};
    analysis.analyzedProperties.forEach(property => {
      const neighborhood = property.locationName || property.areaName || property.city || 'Unknown';
      if (!neighborhoodMap[neighborhood]) {
        neighborhoodMap[neighborhood] = [];
      }
      neighborhoodMap[neighborhood].push(property);
    });
    
    const neighborhoods = Object.entries(neighborhoodMap)
      .map(([neighborhood, props]) => {
        if (props.length === 0) return null;
        
        // Calculate average yield for this neighborhood
        const avgYield = props.reduce((sum, p) => sum + p.yield, 0) / props.length;
        
        return {
          neighborhood,
          value: Math.round(avgYield * 10) / 10,
          propertyCount: props.length
        };
      })
      .filter(n => n !== null && n.propertyCount >= 3) // At least 3 properties
      .slice(0, 15) // Top 15 neighborhoods
      .sort((a, b) => b.value - a.value);
    
    const average = neighborhoods.length > 0
      ? neighborhoods.reduce((sum, n) => sum + n.value, 0) / neighborhoods.length
      : 0;
    
    res.json({
      average: Math.round(average * 10) / 10,
      change: 0.5,
      data: neighborhoods
    });
  } catch (error) {
    console.error('Error in rental-yield:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get investment recommendations using the algorithm
router.get('/recommendations', async (req, res) => {
  try {
    const { city, budgetMin, budgetMax, propertyType, riskLevel } = req.query;
    
    const filters = {};
    if (city) filters.city = city;
    
    let properties = await getPropertiesFromCsv(filters);
    
    // Filter by budget
    if (budgetMin) {
      const min = parseFloat(budgetMin);
      properties = properties.filter(p => p.price >= min);
    }
    if (budgetMax) {
      const max = parseFloat(budgetMax);
      properties = properties.filter(p => p.price <= max);
    }
    
    // Filter by property type
    if (propertyType && propertyType !== 'All') {
      properties = properties.filter(p => 
        p.propertyType && p.propertyType.toLowerCase().includes(propertyType.toLowerCase())
      );
    }
    
    // Analyze properties using the algorithm
    const analysis = analyzeProperties(properties);
    if (!analysis) {
      return res.json([]);
    }
    
    let scoredProperties = analysis.analyzedProperties;
    
    // Add risk assessment based on price per sqft
    scoredProperties = scoredProperties.map(property => {
      const pricePerSqFt = property.price / (property.carpetArea || 1);
      let riskLevelCalc = 'Low';
      let riskScore = 2;
      if (pricePerSqFt > 15000) {
        riskLevelCalc = 'High';
        riskScore = 5;
      } else if (pricePerSqFt > 8000) {
        riskLevelCalc = 'Medium';
        riskScore = 4;
      }
      
      const predictedGrowth = Math.min(60, Math.max(20, 30 + (property.score / 2)));
      
      return {
        ...property,
        pricePerSqFt: Math.round(pricePerSqFt),
        rentalYield: property.yield,
        riskLevel: riskLevelCalc,
        riskScore,
        investmentScore: property.score,
        predictedGrowth: Math.round(predictedGrowth * 10) / 10,
        paybackPeriod: property.yield > 0 ? Math.round(100 / property.yield) : 0,
        maintenanceCost: Math.round(property.price * 0.01),
        priceTrend: `+${Math.round((predictedGrowth / 5))}% over 5 years`
      };
    });
    
    // Sort by score
    scoredProperties.sort((a, b) => b.score - a.score);
    
    // Filter by risk level if specified
    let filtered = scoredProperties;
    if (riskLevel && riskLevel !== 'All Risk') {
      const level = riskLevel.replace(' Risk', '');
      filtered = scoredProperties.filter(p => p.riskLevel === level);
    }
    
    res.json(filtered.slice(0, 10)); // Return top 10
  } catch (error) {
    console.error('Error in recommendations:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get property analysis for comparison page
router.get('/property-analysis', async (req, res) => {
  try {
    const { propertyIds } = req.query;
    if (!propertyIds) {
      return res.status(400).json({ message: 'Property IDs required' });
    }
    
    const ids = Array.isArray(propertyIds) ? propertyIds : propertyIds.split(',');
    const allProperties = await getPropertiesFromCsv();
    const properties = allProperties.filter(p => ids.includes(p.id?.toString()) || ids.includes(p._id?.toString()));
    
    const analysis = analyzeProperties(properties);
    if (!analysis) {
      return res.json({
        bestROI: null,
        bestYield: null,
        recommendation: null
      });
    }
    
    res.json({
      bestROI: {
        name: analysis.bestROI.projectName || analysis.bestROI.title || 'Property',
        value: `${analysis.bestROI.roi}%`
      },
      bestYield: {
        name: analysis.bestYield.projectName || analysis.bestYield.title || 'Property',
        value: `${analysis.bestYield.yield}%`
      },
      recommendation: {
        name: analysis.recommendation.projectName || analysis.recommendation.title || 'Property'
      }
    });
  } catch (error) {
    console.error('Error in property-analysis:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get risk factors for a location
router.get('/risk-factors', async (req, res) => {
  try {
    const { city, locationName } = req.query;
    const filters = {};
    if (city) filters.city = city;
    if (locationName) filters.locationName = locationName;
    
    const properties = await getPropertiesFromCsv(filters);
    
    if (properties.length === 0) {
      return res.json([]);
    }
    
    const validPriceProps = properties.filter(p => p.price > 0);
    const validPriceAreaProps = properties.filter(p => p.price > 0 && p.carpetArea > 0);
    
    const avgPrice = validPriceProps.length > 0
      ? validPriceProps.reduce((sum, p) => sum + p.price, 0) / validPriceProps.length
      : 0;
    const avgPricePerSqFt = validPriceAreaProps.length > 0
      ? validPriceAreaProps.reduce((sum, p) => sum + (p.price / p.carpetArea), 0) / validPriceAreaProps.length
      : 0;
    
    // Assess risk factors based on property data
    const riskFactors = [
      {
        name: 'Flood Risk',
        level: avgPricePerSqFt > 12000 ? 'Medium' : 'Low'
      },
      {
        name: 'Crime/Safety',
        level: properties.length > 0 && (properties.filter(p => p.security).length / properties.length > 0.7) ? 'Low' : 'Medium'
      },
      {
        name: 'Market Volatility',
        level: avgPricePerSqFt > 15000 ? 'High' : avgPricePerSqFt > 8000 ? 'Medium' : 'Low'
      },
      {
        name: 'Economic Stability',
        level: properties.length > 50 ? 'Stable' : 'Moderate'
      }
    ];
    
    res.json(riskFactors);
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
    const { city } = req.query;
    const filters = city ? { city } : {};
    const properties = await getPropertiesFromCsv(filters);

    // Count amenities occurrences and accumulate prices
    const amenityStats = {};
    const keyImpact = {
      withLift: [], withoutLift: [],
      withParking: [], withoutParking: [],
      withSecurity: [], withoutSecurity: []
    };

    properties.forEach(p => {
      const price = p.price || 0;
      (p.amenities || []).forEach(a => {
        const key = a;
        if (!amenityStats[key]) amenityStats[key] = { count: 0, totalPrice: 0 };
        amenityStats[key].count += 1;
        amenityStats[key].totalPrice += price;
      });

      if (price > 0) {
        if (p.lift) keyImpact.withLift.push(price); else keyImpact.withoutLift.push(price);
        if (p.parking) keyImpact.withParking.push(price); else keyImpact.withoutParking.push(price);
        if (p.security) keyImpact.withSecurity.push(price); else keyImpact.withoutSecurity.push(price);
      }
    });

    const popularAmenities = Object.entries(amenityStats)
      .map(([name, s]) => ({ _id: name, count: s.count, avgPrice: Math.round(s.totalPrice / Math.max(1, s.count)) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    const avg = arr => arr.length ? Math.round(arr.reduce((t, v) => t + v, 0) / arr.length) : 0;

    res.json({
      popularAmenities,
      keyAmenitiesImpact: {
        avgPriceWithLift: avg(keyImpact.withLift),
        avgPriceWithParking: avg(keyImpact.withParking),
        avgPriceWithSecurity: avg(keyImpact.withSecurity)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get possession status analysis
router.get('/possession-status', async (req, res) => {
  try {
    const { city } = req.query;
    const filters = city ? { city } : {};
    const properties = await getPropertiesFromCsv(filters);

    const map = {};
    properties.forEach(p => {
      const key = p.possessionStatus || 'Unknown';
      if (!map[key]) map[key] = { count: 0, totalPrice: 0, totalArea: 0 };
      map[key].count += 1;
      if (p.price) map[key].totalPrice += p.price;
      if (p.carpetArea) map[key].totalArea += p.carpetArea;
    });

    const result = Object.entries(map)
      .map(([status, s]) => ({
        _id: status,
        count: s.count,
        avgPrice: Math.round(s.totalPrice / Math.max(1, s.count)),
        avgArea: Math.round(s.totalArea / Math.max(1, s.count))
      }))
      .sort((a, b) => b.count - a.count);

    res.json(result);
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

// NOTE: Mongo-based recommendations endpoint removed in favor of CSV-driven one defined above

module.exports = router;
