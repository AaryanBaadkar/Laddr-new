import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsPage = () => {
  const navigate = useNavigate();

  const [selectedCity, setSelectedCity] = useState('');
  const [budgetRange, setBudgetRange] = useState([0, 10000000]);
  const [selectedPropertyType, setSelectedPropertyType] = useState('All');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('All Risk');
  const [selectedStrategy, setSelectedStrategy] = useState('Capital Appreciation');
  const [selectedHorizon, setSelectedHorizon] = useState('Short-Term (1-3 years)');
  const [timeframe, setTimeframe] = useState('5 Years');

  const [comparedProperties, setComparedProperties] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [priceTrends, setPriceTrends] = useState({
    current: 0,
    last5Years: 0,
    data: {
      '5': [],
      '10': [],
      '20': []
    }
  });

  // Fetch available cities on mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get('/api/analytics/cities');
        setAvailableCities(response.data);
        if (response.data.length > 0) {
          setSelectedCity(response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };
    fetchCities();
  }, []);

  // Fetch available locations when city changes
  useEffect(() => {
    const fetchLocations = async () => {
      if (!selectedCity) return;
      try {
        const response = await axios.get('/api/analytics/locations', {
          params: { city: selectedCity }
        });
        if (response.data && Array.isArray(response.data)) {
          setAvailableLocations(response.data);
        } else {
          setAvailableLocations([]);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        setAvailableLocations([]);
      }
    };
    fetchLocations();
  }, [selectedCity]);

  // Fetch historical price trends data
  useEffect(() => {
    const fetchHistoricalPriceTrends = async () => {
      if (!selectedCity) return;
      try {
        setLoading(true);
        const response = await axios.get('/api/analytics/historical-price-trends', {
          params: { 
            years: timeframe.split(' ')[0],
            city: selectedCity,
            location: availableLocations[0] || null
          }
        });
        const data = response.data;

        if (data && data.length > 0) {
          const locationData = data[0]; // Use first location
          const chartData = locationData.data.map(item => ({
            year: item.year,
            price: Math.round(item.price)
          }));

          setPriceTrends(prev => ({
            ...prev,
            data: {
              ...prev.data,
              [timeframe.split(' ')[0]]: chartData
            }
          }));

          // Calculate current and last 5 years growth
          if (chartData.length >= 2) {
            const latest = chartData[chartData.length - 1].price;
            const oldest = chartData[0].price;
            const growth = oldest > 0 ? ((latest - oldest) / oldest) * 100 : 0;

            setPriceTrends(prev => ({
              ...prev,
              current: Math.round(growth),
              last5Years: Math.round(growth)
            }));
          }
          
          // Update available locations from trends data
          const locations = [...new Set(data.map(item => item.location).filter(Boolean))];
          if (locations.length > 0) {
            // Merge with existing locations, avoiding duplicates
            setAvailableLocations(prev => {
              const combined = [...new Set([...prev, ...locations])];
              return combined;
            });
          }
        } else {
          // No data available
          setPriceTrends(prev => ({
            ...prev,
            data: {
              ...prev.data,
              [timeframe.split(' ')[0]]: []
            },
            current: 0,
            last5Years: 0
          }));
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching historical price trends:', error);
        setPriceTrends(prev => ({
          ...prev,
          data: {
            ...prev.data,
            [timeframe.split(' ')[0]]: []
          },
          current: 0,
          last5Years: 0
        }));
        setLoading(false);
      }
    };

    fetchHistoricalPriceTrends();
  }, [timeframe, selectedCity, availableLocations]);

  const [roiForecast, setRoiForecast] = useState({
    current: 0,
    projectedCAGR: 0,
    data: []
  });

  const [rentalYield, setRentalYield] = useState({
    average: 0,
    change: 0,
    data: []
  });

  const [riskFactors, setRiskFactors] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState({
    totalProperties: 0,
    avgPrice: 0,
    totalValue: 0,
    avgPricePerSqFt: 0,
    propertiesByType: {},
    topLocations: []
  });

  // Fetch ROI forecast
  useEffect(() => {
    const fetchRoiForecast = async () => {
      if (!selectedCity) return;
      try {
        const response = await axios.get('/api/analytics/roi-forecast', {
          params: { city: selectedCity }
        });
        setRoiForecast(response.data);
      } catch (error) {
        console.error('Error fetching ROI forecast:', error);
      }
    };
    fetchRoiForecast();
  }, [selectedCity]);

  // Fetch rental yield
  useEffect(() => {
    const fetchRentalYield = async () => {
      if (!selectedCity) return;
      try {
        const response = await axios.get('/api/analytics/rental-yield', {
          params: { city: selectedCity }
        });
        setRentalYield(response.data);
      } catch (error) {
        console.error('Error fetching rental yield:', error);
      }
    };
    fetchRentalYield();
  }, [selectedCity]);

  // Fetch risk factors
  useEffect(() => {
    const fetchRiskFactors = async () => {
      if (!selectedCity) return;
      try {
        const response = await axios.get('/api/analytics/risk-factors', {
          params: { city: selectedCity }
        });
        setRiskFactors(response.data);
      } catch (error) {
        console.error('Error fetching risk factors:', error);
      }
    };
    fetchRiskFactors();
  }, [selectedCity]);

  // Fetch recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!selectedCity) return;
      try {
        const response = await axios.get('/api/analytics/recommendations', {
          params: {
            city: selectedCity,
            budgetMin: budgetRange[0],
            budgetMax: budgetRange[1],
            propertyType: selectedPropertyType,
            riskLevel: selectedRiskLevel
          }
        });
        setRecommendations(response.data);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    };
    fetchRecommendations();
  }, [selectedCity, budgetRange, selectedPropertyType, selectedRiskLevel]);

  // Fetch summary statistics
  useEffect(() => {
    const fetchSummary = async () => {
      if (!selectedCity) return;
      try {
        const response = await axios.get('/api/analytics/summary', {
          params: { city: selectedCity }
        });
        setSummary(response.data);
      } catch (error) {
        console.error('Error fetching summary:', error);
      }
    };
    fetchSummary();
  }, [selectedCity]);

  const getRiskColor = (level) => {
    switch (level) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      case 'Stable': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCombinedChartData = () => {
    const timeframeKey = timeframe.split(' ')[0];
    
    if (comparedProperties.length > 0) {
      const years = comparedProperties[0].data[timeframeKey]?.map(item => item.year) || [];
      return years.map(year => {
        const dataPoint = { year };
        comparedProperties.forEach(property => {
          const propertyData = property.data[timeframeKey]?.find(item => item.year === year);
          if (propertyData) {
            dataPoint[property.name] = propertyData.price;
          }
        });
        return dataPoint;
      });
    }
    
    // Return single location data if no comparisons
    if (priceTrends.data[timeframeKey] && priceTrends.data[timeframeKey].length > 0) {
      return priceTrends.data[timeframeKey];
    }
    
    return [];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Dashboard</h1>
          <p className="text-gray-600 text-lg">
            Analyze property investments with interactive widgets and visualizations
          </p>
        </div>

        {/* Summary Statistics */}
        {selectedCity && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Properties</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalProperties.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🏠</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average Price</p>
                  <p className="text-2xl font-bold text-gray-900">₹{summary.avgPrice.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Price per Sqft</p>
                  <p className="text-2xl font-bold text-gray-900">₹{summary.avgPricePerSqFt.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📐</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Market Value</p>
                  <p className="text-2xl font-bold text-gray-900">₹{(summary.totalValue / 1000000).toFixed(1)}M</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters & Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters & Controls</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select City/Region</label>
              <select 
                value={selectedCity} 
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={availableCities.length === 0}
              >
                <option value="">Select a city...</option>
                {availableCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range (Max)</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="range" 
                  min="0" 
                  max="100000000" 
                  step="500000"
                  value={budgetRange[1]}
                  onChange={(e) => setBudgetRange([budgetRange[0], parseInt(e.target.value)])}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600">₹{budgetRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="mt-6 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Property Type</h4>
              <div className="flex flex-wrap gap-2">
                {['All', 'Residential', 'Commercial', 'Mixed-Use'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedPropertyType(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedPropertyType === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Risk Level</h4>
              <div className="flex flex-wrap gap-2">
                {['All Risk', 'Low Risk', 'Medium Risk', 'High Risk'].map((risk) => (
                  <button
                    key={risk}
                    onClick={() => setSelectedRiskLevel(risk)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedRiskLevel === risk
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {risk}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Investment Strategy</h4>
              <div className="flex space-x-2">
                {['Capital Appreciation', 'Rental Income', 'Balanced'].map((strategy) => (
                  <button
                    key={strategy}
                    onClick={() => setSelectedStrategy(strategy)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedStrategy === strategy
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {strategy}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Investment Horizon</h4>
              <div className="flex space-x-2">
                {['Short-Term (1-3 years)', 'Mid-Term (3-5 years)', 'Long-Term (5+ years)'].map((horizon) => (
                  <button
                    key={horizon}
                    onClick={() => setSelectedHorizon(horizon)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedHorizon === horizon
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {horizon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Historical Price Trends */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Historical Price Trends</h3>
            <div className="flex space-x-2">
              {['City', 'Region', 'Property Type'].map((filter) => (
                <button key={filter} className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  {filter}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center mb-6">
            <div className="text-4xl font-bold text-gray-900 mr-4">
              {priceTrends.current > 0 ? '+' : ''}{priceTrends.current}%
            </div>
            <div className={`text-sm ${priceTrends.last5Years >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Last {timeframe} {priceTrends.last5Years >= 0 ? '+' : ''}{priceTrends.last5Years}%
            </div>
          </div>
          
          <div className="h-64 bg-white rounded-lg border mb-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Loading price trends...</p>
              </div>
            ) : priceTrends.data[timeframe.split(' ')[0]]?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getCombinedChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Price']} />
                  <Legend />
                  {comparedProperties.length > 0 ? (
                    comparedProperties.map((property) => (
                      <Line
                        key={property.id}
                        type="monotone"
                        dataKey={property.name}
                        stroke={property.color}
                        strokeWidth={2}
                        name={property.name}
                      />
                    ))
                  ) : (
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name="Average Price"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No data available. Please select a city.</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {['5 Years', '10 Years', '20 Years'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeframe === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  if (comparedProperties.length > 0) {
                    setComparedProperties(comparedProperties.slice(0, -1));
                  }
                }}
                disabled={comparedProperties.length === 0}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  comparedProperties.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                - Remove City
              </button>
              <button
                onClick={async () => {
                  if (!selectedCity) {
                    alert('Please select a city first');
                    return;
                  }
                  
                  // Fetch locations if we don't have them
                  let locationsToUse = availableLocations;
                  if (locationsToUse.length === 0) {
                    try {
                      const locationsResponse = await axios.get('/api/analytics/locations', {
                        params: { city: selectedCity }
                      });
                      if (locationsResponse.data && Array.isArray(locationsResponse.data) && locationsResponse.data.length > 0) {
                        locationsToUse = locationsResponse.data;
                        setAvailableLocations(locationsToUse);
                      } else {
                        // Try to get locations from historical trends
                        const trendsResponse = await axios.get('/api/analytics/historical-price-trends', {
                          params: { 
                            years: timeframe.split(' ')[0],
                            city: selectedCity
                          }
                        });
                        if (trendsResponse.data && trendsResponse.data.length > 0) {
                          locationsToUse = [...new Set(trendsResponse.data.map(item => item.location).filter(Boolean))];
                          setAvailableLocations(locationsToUse);
                        }
                      }
                    } catch (error) {
                      console.error('Error fetching locations:', error);
                      alert('Unable to load locations. Please try again.');
                      return;
                    }
                  }
                  
                  if (locationsToUse.length === 0) {
                    alert('No locations available for this city');
                    return;
                  }
                  
                  const nextLocation = locationsToUse.find(loc =>
                    !comparedProperties.some(cp => cp.name === loc)
                  );
                  
                  if (!nextLocation) {
                    alert('All available locations have been added');
                    return;
                  }
                  
                  try {
                    const response = await axios.get('/api/analytics/historical-price-trends', {
                      params: { 
                        years: timeframe.split(' ')[0],
                        city: selectedCity,
                        location: nextLocation
                      }
                    });
                    const data = response.data;
                    
                    if (data && data.length > 0) {
                      const locationData = data.find(loc => loc.location === nextLocation) || data[0];
                      const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];
                      const newProperty = {
                        id: Date.now(),
                        name: nextLocation,
                        color: colors[comparedProperties.length % colors.length],
                        data: {
                          [timeframe.split(' ')[0]]: locationData.data.map(item => ({
                            year: item.year,
                            price: item.price
                          }))
                        }
                      };
                      setComparedProperties([...comparedProperties, newProperty]);
                    } else {
                      alert('No data available for this location');
                    }
                  } catch (error) {
                    console.error('Error fetching location data:', error);
                    alert('Error loading location data. Please try again.');
                  }
                }}
                disabled={comparedProperties.length >= 5 || !selectedCity}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  comparedProperties.length >= 5 || !selectedCity
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
                title={!selectedCity ? 'Please select a city first' : comparedProperties.length >= 5 ? 'Maximum 5 locations can be compared' : 'Add a location to compare'}
              >
                + Add Location {availableLocations.length > 0 && `(${availableLocations.length} available)`}
              </button>
            </div>
          </div>
        </div>

        {/* ROI Forecast */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ROI Forecast</h3>
          
          <div className="flex items-center mb-6">
            <div className="text-4xl font-bold text-gray-900 mr-4">{roiForecast.current}%</div>
            <div className="text-sm text-green-600">Projected CAGR +{roiForecast.projectedCAGR}%</div>
          </div>
          
          <div className="h-48 bg-white rounded-lg border">
            {roiForecast.data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roiForecast.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, 'ROI']} />
                  <Legend />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No ROI data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Rental Yield Distribution */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rental Yield Distribution</h3>
          
          <div className="flex items-center mb-6">
            <div className="text-4xl font-bold text-gray-900 mr-4">{rentalYield.average}%</div>
            <div className="text-sm text-green-600">Average Yield +{rentalYield.change}%</div>
          </div>
          
          <div className="h-48 bg-white rounded-lg border mb-4">
            {rentalYield.data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rentalYield.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="neighborhood" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, 'Yield']} />
                  <Legend />
                  <Bar dataKey="value" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No rental yield data available</p>
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            {['Residential', 'Commercial'].map((type) => (
              <button
                key={type}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  type === 'Residential'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Risk Dashboard */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Dashboard</h3>
          {riskFactors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {riskFactors.map((risk, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">{risk.name}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(risk.level)}`}>
                    {risk.level}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No risk data available. Please select a city.</p>
            </div>
          )}
        </div>

        {/* Investment Hotspots */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Hotspots</h3>
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">
              Interactive Map: {selectedCity ? `${selectedCity} Investment Hotspots` : 'Select a city to view hotspots'}
            </p>
          </div>
        </div>

        {/* Top Recommendations */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Recommendations</h3>
          {recommendations.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendations.map((property) => (
                  <div key={property.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={selectedProperties.some(p => p.id === property.id)}
                        onChange={() => {
                          const isSelected = selectedProperties.some(p => p.id === property.id);
                          if (isSelected) {
                            setSelectedProperties(selectedProperties.filter(p => p.id !== property.id));
                          } else if (selectedProperties.length < 3) {
                            setSelectedProperties([...selectedProperties, property]);
                          }
                        }}
                        className="mr-2"
                      />
                      <h4 className="font-semibold text-gray-900">{property.title || property.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{property.locationName || property.areaName || property.neighborhood}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Current Price:</span>
                        <span className="font-semibold text-gray-900">₹{(property.price || property.currentPrice || 0).toLocaleString()}</span>
                      </div>
                      {property.priceTrend && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Price Trend:</span>
                          <span className="font-semibold text-green-600">{property.priceTrend}</span>
                        </div>
                      )}
                      {property.predictedGrowth && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Predicted Growth:</span>
                          <span className="font-semibold text-blue-600">{property.predictedGrowth}%</span>
                        </div>
                      )}
                      {property.rentalYield && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Rental Yield:</span>
                          <span className="font-semibold text-purple-600">{property.rentalYield}%</span>
                        </div>
                      )}
                      {property.riskLevel && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Risk Level:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(property.riskLevel)}`}>
                            {property.riskLevel}
                          </span>
                        </div>
                      )}
                      {property.paybackPeriod && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Payback Period:</span>
                          <span className="font-semibold text-gray-900">{property.paybackPeriod} years</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => navigate('/compare', { state: { selectedProperties } })}
                  disabled={selectedProperties.length === 0}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    selectedProperties.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Compare Selected ({selectedProperties.length})
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No recommendations available. Please select a city and adjust filters.</p>
            </div>
          )}
        </div>

        {/* Extra Features */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Extra Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600">📊</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">City Comparison</h4>
                <p className="text-sm text-gray-600">Compare city trends side-by-side</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600">😊</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Market Sentiment</h4>
                <p className="text-sm text-gray-600">Overall market sentiment index</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600">💰</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Affordability Index</h4>
                <p className="text-sm text-gray-600">Affordability index for different areas</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600">↔️</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Liquidity Score</h4>
                <p className="text-sm text-gray-600">Property liquidity score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Alerts */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Alerts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600">🔔</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">ROI Alerts</h4>
                <p className="text-sm text-gray-600">Set alerts for ROI thresholds</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600">🔔</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Price Drop Alerts</h4>
                <p className="text-sm text-gray-600">Set alerts for price drops</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;