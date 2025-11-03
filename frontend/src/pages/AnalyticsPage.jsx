import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AnalyticsPage = () => {
  const navigate = useNavigate();

  const [selectedCity, setSelectedCity] = useState('San Francisco');
  const [selectedPropertyType, setSelectedPropertyType] = useState('Residential');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('Low Risk');
  const [selectedStrategy, setSelectedStrategy] = useState('Capital Appreciation');
  const [selectedHorizon, setSelectedHorizon] = useState('Short-Term (1-3 years)');
  const [timeframe, setTimeframe] = useState('5 Years');

  const [comparedProperties, setComparedProperties] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);

  const [priceTrends, setPriceTrends] = useState({
    current: 0,
    last5Years: 0,
    data: {
      '5': [],
      '10': [],
      '20': []
    }
  });

  // Fetch historical price trends data from backend API
  useEffect(() => {
    const fetchHistoricalPriceTrends = async () => {
      try {
        const years = parseInt(timeframe.split(' ')[0]);
        const response = await axios.get(`/api/analytics/historical-price-trends?years=${years}`);
        const trendsData = response.data;

        // Transform data to match expected structure: { location: [{year, price}] }
        const aggregatedData = {};
        trendsData.forEach(trend => {
          aggregatedData[trend.location] = trend.data.map(item => ({
            year: item.year,
            price: Math.round(item.price)
          }));
        });

        setAvailableLocations(Object.keys(aggregatedData));

        if (Object.keys(aggregatedData).length > 0) {
          const firstLocation = Object.keys(aggregatedData)[0];
          const chartData = aggregatedData[firstLocation];

          setPriceTrends(prev => ({
            ...prev,
            data: {
              ...prev.data,
              [years.toString()]: chartData
            }
          }));

          // Calculate current and last 5 years growth
          if (chartData.length >= 2) {
            const latest = chartData[chartData.length - 1].price;
            const oldest = chartData[0].price;
            const growth = ((latest - oldest) / oldest) * 100;

            setPriceTrends(prev => ({
              ...prev,
              current: Math.round(growth),
              last5Years: Math.round(growth)
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching historical price trends:', error);
      }
    };

    fetchHistoricalPriceTrends();
  }, [timeframe]);

  // Real data states
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [amenitiesAnalysis, setAmenitiesAnalysis] = useState({ popularAmenities: [], keyAmenitiesImpact: {} });
  const [possessionStatus, setPossessionStatus] = useState([]);
  const [bedroomAnalysis, setBedroomAnalysis] = useState([]);
  const [areaPriceCorrelation, setAreaPriceCorrelation] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [budgetRange, setBudgetRange] = useState([0, 100000000]); // Default to 0 to 1 crore

  // Fetch real analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const [
          propertyTypesRes,
          developersRes,
          amenitiesRes,
          possessionRes,
          bedroomRes,
          areaPriceRes,
          neighborhoodsRes,
          recommendationsRes
        ] = await Promise.all([
          axios.get('/api/analytics/property-types'),
          axios.get('/api/analytics/developers'),
          axios.get('/api/analytics/amenities-analysis'),
          axios.get('/api/analytics/possession-status'),
          axios.get('/api/analytics/bedroom-analysis'),
          axios.get('/api/analytics/area-price-correlation'),
          axios.get('/api/analytics/neighborhoods'),
          axios.get('/api/analytics/recommendations')
        ]);

        setPropertyTypes(propertyTypesRes.data);
        setDevelopers(developersRes.data);
        setAmenitiesAnalysis(amenitiesRes.data);
        setPossessionStatus(possessionRes.data);
        setBedroomAnalysis(bedroomRes.data);
        setAreaPriceCorrelation(areaPriceRes.data);
        setNeighborhoods(neighborhoodsRes.data);
        setRecommendations(recommendationsRes.data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      }
    };

    fetchAnalyticsData();
  }, []);

  // Filter recommendations based on location and budget
  useEffect(() => {
    let filtered = recommendations;

    if (selectedLocation) {
      filtered = filtered.filter(rec => rec.location === selectedLocation);
    }

    filtered = filtered.filter(rec =>
      rec.currentPrice >= budgetRange[0] && rec.currentPrice <= budgetRange[1]
    );

    // Sort by predicted growth (ROI) and take top 3
    filtered = filtered
      .sort((a, b) => (b.predictedGrowth || 0) - (a.predictedGrowth || 0))
      .slice(0, 3);

    setFilteredRecommendations(filtered);
  }, [recommendations, selectedLocation, budgetRange]);

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
    if (comparedProperties.length === 0) return [];
    const timeframeKey = timeframe.split(' ')[0];
    const years = comparedProperties[0].data[timeframeKey].map(item => item.year);
    return years.map(year => {
      const dataPoint = { year };
      comparedProperties.forEach(property => {
        const propertyData = property.data[timeframeKey].find(item => item.year === year);
        if (propertyData) {
          dataPoint[property.name] = propertyData.price;
        }
      });
      return dataPoint;
    });
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
            <div className="text-4xl font-bold text-gray-900 mr-4">+{priceTrends.current}%</div>
            <div className="text-sm text-green-600">Last 5 Years +{priceTrends.last5Years}%</div>
          </div>

          <div className="h-64 bg-white rounded-lg border mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getCombinedChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Price']} />
                <Legend />
                {comparedProperties.map((property) => (
                  <Line
                    key={property.id}
                    type="monotone"
                    dataKey={property.name}
                    stroke={property.color}
                    strokeWidth={2}
                    name={property.name}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
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
                  if (availableLocations.length > 0) {
                    const nextLocation = availableLocations.find(loc =>
                      !comparedProperties.some(cp => cp.name === loc)
                    );
                    if (nextLocation) {
                      try {
                        const years = parseInt(timeframe.split(' ')[0]);
                        const response = await axios.get(`/api/analytics/historical-price-trends?years=${years}&location=${encodeURIComponent(nextLocation)}`);
                        const locationData = response.data.find(item => item.location === nextLocation);

                        if (locationData) {
                          const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];
                          const newProperty = {
                            id: Date.now(),
                            name: nextLocation,
                            color: colors[comparedProperties.length % colors.length],
                            data: { [years.toString()]: locationData.data.map(item => ({ year: item.year, price: Math.round(item.price) })) }
                          };
                          setComparedProperties([...comparedProperties, newProperty]);
                        }
                      } catch (error) {
                        console.error('Error fetching data for new location:', error);
                      }
                    }
                  }
                }}
                disabled={comparedProperties.length >= 5}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  availableLocations.length === 0 || comparedProperties.length >= 5
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                + Add City
              </button>
            </div>
          </div>
        </div>

        {/* Top Recommendations */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Recommendations</h3>
            <button
              onClick={() => {
                if (selectedProperties.length > 0) {
                  navigate('/compare', { state: { selectedProperties } });
                }
              }}
              disabled={selectedProperties.length === 0}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedProperties.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              Compare Selected ({selectedProperties.length})
            </button>
          </div>
          <div className="space-y-4">
            {filteredRecommendations.map((property) => (
              <div key={property._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={selectedProperties.some(p => p._id === property._id)}
                        onChange={(e) => {
                          if (e.target.checked && selectedProperties.length < 3) {
                            setSelectedProperties([...selectedProperties, property]);
                          } else {
                            setSelectedProperties(selectedProperties.filter(p => p._id !== property._id));
                          }
                        }}
                        disabled={!selectedProperties.some(p => p._id === property._id) && selectedProperties.length >= 3}
                        className="mr-3"
                      />
                      <h4 className="text-lg font-semibold text-gray-900">{property.title || 'Property'}</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Price:</span> ₹{property.currentPrice?.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span> {property.location}
                      </div>
                      <div>
                        <span className="font-medium">ROI:</span> {property.predictedGrowth?.toFixed(1)}%
                      </div>
                      <div>
                        <span className="font-medium">Yield:</span> {property.rentalYield?.toFixed(1)}%
                      </div>
                      <div>
                        <span className="font-medium">Risk:</span>
                        <span className={`ml-1 px-2 py-1 rounded-full text-xs ${getRiskColor(property.riskLevel)}`}>
                          {property.riskLevel}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Type:</span> {property.propertyType}
                      </div>
                      <div>
                        <span className="font-medium">Area:</span> {property.carpetArea} sqft
                      </div>
                      <div>
                        <span className="font-medium">Bedrooms:</span> {property.bedrooms}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {selectedProperties.length >= 3 && (
            <p className="text-sm text-gray-500 mt-4">Maximum 3 properties can be selected for comparison.</p>
          )}
        </div>

        {/* Property Type Distribution */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Property Type Distribution</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
              + Add Chart
            </button>
          </div>
          <div className="h-64 bg-white rounded-lg border mb-4">
            {propertyTypes.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={propertyTypes.map((type, index) => ({
                      name: type._id,
                      value: type.count,
                      fill: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#8B5CF6'][index % 6]
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {propertyTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#8B5CF6'][index % 6]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} properties`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Loading property type data...
              </div>
            )}
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {propertyTypes.slice(0, 3).map((type, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900">{type._id}</h4>
                <p className="text-sm text-gray-600">{type.count} properties</p>
                <p className="text-sm text-green-600">Avg: ₹{type.avgPrice?.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Developer Analysis */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Developers</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
              + Add Chart
            </button>
          </div>
          <div className="h-64 bg-white rounded-lg border mb-4">
            {developers.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={developers.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value?.toLocaleString()}`, 'Avg Price']} />
                  <Bar dataKey="avgPrice" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Loading developer data...
              </div>
            )}
          </div>
          <div className="space-y-4">
            {developers.slice(0, 5).map((developer, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900">{developer._id}</h4>
                  <p className="text-sm text-gray-600">{developer.propertyCount} properties</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{developer.avgPrice?.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total: ₹{developer.totalValue?.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities Impact */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Amenities Impact on Pricing</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
              + Add Chart
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {amenitiesAnalysis.popularAmenities?.slice(0, 4).map((amenity, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900">{amenity._id}</h4>
                <p className="text-sm text-gray-600">{amenity.count} properties</p>
                <p className="text-sm text-green-600">₹{amenity.avgPrice?.toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 mb-4">Key Amenities Price Impact</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h5 className="font-medium text-gray-900">With Lift</h5>
                <p className="text-lg font-bold text-green-600">₹{amenitiesAnalysis.keyAmenitiesImpact?.avgPriceWithLift?.toLocaleString()}</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-gray-900">With Parking</h5>
                <p className="text-lg font-bold text-blue-600">₹{amenitiesAnalysis.keyAmenitiesImpact?.avgPriceWithParking?.toLocaleString()}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <h5 className="font-medium text-gray-900">With Security</h5>
                <p className="text-lg font-bold text-purple-600">₹{amenitiesAnalysis.keyAmenitiesImpact?.avgPriceWithSecurity?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Possession Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Possession Status Analysis</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
              + Add Chart
            </button>
          </div>
          <div className="h-48 bg-white rounded-lg border mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={possessionStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Count']} />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {possessionStatus.slice(0, 2).map((status, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900">{status._id}</h4>
                <p className="text-sm text-gray-600">{status.count} properties</p>
                <p className="text-sm text-green-600">Avg: ₹{status.avgPrice?.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bedroom Analysis */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Bedroom Distribution & Pricing</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
              + Add Chart
            </button>
          </div>
          <div className="h-48 bg-white rounded-lg border mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bedroomAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value?.toLocaleString()}`, 'Avg Price']} />
                <Bar dataKey="avgPrice" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bedroomAnalysis.map((bedroom, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-900">{bedroom._id} BHK</h5>
                <p className="text-sm text-gray-600">{bedroom.count} units</p>
                <p className="text-sm font-semibold text-green-600">₹{bedroom.avgPrice?.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Area vs Price Correlation */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Area vs Price Correlation</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
              + Add Chart
            </button>
          </div>
          <div className="h-48 bg-white rounded-lg border">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaPriceCorrelation}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value?.toLocaleString()}`, 'Avg Price']} />
                <Bar dataKey="avgPrice" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-600 mt-2">Price correlation across different carpet area ranges</p>
        </div>

        {/* Neighborhood Rankings */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Neighborhoods by Amenities</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
              + Add Chart
            </button>
          </div>
          <div className="space-y-3">
            {neighborhoods.slice(0, 8).map((neighborhood, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{neighborhood.locationName}</h4>
                  <p className="text-sm text-gray-600">{neighborhood.propertyCount} properties</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{neighborhood.avgPrice?.toLocaleString()}</p>
                  <p className="text-sm text-blue-600">Amenity Score: {neighborhood.amenitiesScore}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Future Enhancements */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Future Enhancements</h3>
          <p className="text-gray-600 mb-4">
            The following advanced features are planned for future development and are yet to be integrated into the current system:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Advanced Analytics</h4>
              <p className="text-sm text-blue-700">Machine learning-driven price predictions and market trend analysis.</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Real-time Data Integration</h4>
              <p className="text-sm text-green-700">Live property listings and market data from multiple sources.</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Portfolio Management</h4>
              <p className="text-sm text-purple-700">Comprehensive investment portfolio tracking and optimization tools.</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">AI-Powered Recommendations</h4>
              <p className="text-sm text-orange-700">Personalized investment suggestions based on user preferences and risk profile.</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <h4 className="font-semibold text-indigo-900 mb-2">City Comparison</h4>
              <p className="text-sm text-indigo-700">Compare city trends side-by-side for comprehensive market analysis.</p>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg">
              <h4 className="font-semibold text-pink-900 mb-2">Market Sentiment</h4>
              <p className="text-sm text-pink-700">Overall market sentiment index for investment decision making.</p>
            </div>
            <div className="p-4 bg-teal-50 rounded-lg">
              <h4 className="font-semibold text-teal-900 mb-2">Affordability Index</h4>
              <p className="text-sm text-teal-700">Affordability index for different areas to guide budget planning.</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">Liquidity Score</h4>
              <p className="text-sm text-yellow-700">Property liquidity score to assess ease of buying and selling.</p>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default AnalyticsPage;
