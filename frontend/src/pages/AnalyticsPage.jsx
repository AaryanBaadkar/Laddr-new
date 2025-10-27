import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AnalyticsPage = () => {
  const [selectedCity, setSelectedCity] = useState('San Francisco');
  const [budgetRange, setBudgetRange] = useState([0, 1000000]);
  const [selectedPropertyType, setSelectedPropertyType] = useState('Residential');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('Low Risk');
  const [selectedStrategy, setSelectedStrategy] = useState('Capital Appreciation');
  const [selectedHorizon, setSelectedHorizon] = useState('Short-Term (1-3 years)');
  const [timeframe, setTimeframe] = useState('5 Years');
  
  const [priceTrends, setPriceTrends] = useState({
    current: 8.5,
    last5Years: 1.2,
    data: [
      { year: 2019, price: 100000 },
      { year: 2020, price: 120000 },
      { year: 2021, price: 150000 },
      { year: 2022, price: 180000 },
      { year: 2023, price: 200000 }
    ]
  });

  const [roiForecast, setRoiForecast] = useState({
    current: 12.3,
    projectedCAGR: 2.1,
    data: [
      { period: '1 Year', value: 8.5 },
      { period: '3 Years', value: 10.2 },
      { period: '5 Years', value: 12.3 },
      { period: '10 Years', value: 15.8 }
    ]
  });

  const [rentalYield, setRentalYield] = useState({
    average: 6.8,
    change: 0.5,
    data: [
      { neighborhood: 'Neighborhood A', value: 7.2 },
      { neighborhood: 'Neighborhood B', value: 6.8 },
      { neighborhood: 'Neighborhood C', value: 6.5 },
      { neighborhood: 'Neighborhood D', value: 6.1 }
    ]
  });

  const [riskFactors, setRiskFactors] = useState([
    { name: 'Flood Risk', level: 'Low' },
    { name: 'Crime/Safety', level: 'Medium' },
    { name: 'Market Volatility', level: 'High' },
    { name: 'Economic Stability', level: 'Stable' }
  ]);

  const [recommendations, setRecommendations] = useState([
    { id: 1, name: 'Property A', neighborhood: 'Neighborhood X', image: '/api/placeholder/300/200' },
    { id: 2, name: 'Property B', neighborhood: 'Neighborhood Y', image: '/api/placeholder/300/200' },
    { id: 3, name: 'Property C', neighborhood: 'Neighborhood Z', image: '/api/placeholder/300/200' }
  ]);

  const getRiskColor = (level) => {
    switch (level) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      case 'Stable': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
              >
                <option value="San Francisco">San Francisco</option>
                <option value="New York">New York</option>
                <option value="Los Angeles">Los Angeles</option>
                <option value="Chicago">Chicago</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="range" 
                  min="0" 
                  max="2000000" 
                  step="50000"
                  value={budgetRange[1]}
                  onChange={(e) => setBudgetRange([budgetRange[0], parseInt(e.target.value)])}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600">${budgetRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="mt-6 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Property Type</h4>
              <div className="flex space-x-2">
                {['Residential', 'Commercial', 'Mixed-Use'].map((type) => (
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
              <div className="flex space-x-2">
                {['Low Risk', 'Medium Risk', 'High Risk'].map((risk) => (
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
            <div className="text-4xl font-bold text-gray-900 mr-4">+{priceTrends.current}%</div>
            <div className="text-sm text-green-600">Last 5 Years +{priceTrends.last5Years}%</div>
          </div>
          
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <p className="text-gray-500">Line Graph: Price Trends 2019-2023</p>
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
              {['Compare City A', 'Compare City B', 'Compare City C'].map((city) => (
                <button key={city} className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  {city}
                </button>
              ))}
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
          
          <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Bar Chart: ROI Forecast by Period</p>
          </div>
        </div>

        {/* Rental Yield Distribution */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rental Yield Distribution</h3>
          
          <div className="flex items-center mb-6">
            <div className="text-4xl font-bold text-gray-900 mr-4">{rentalYield.average}%</div>
            <div className="text-sm text-green-600">Average Yield +{rentalYield.change}%</div>
          </div>
          
          <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <p className="text-gray-500">Bar Chart: Rental Yield by Neighborhood</p>
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
        </div>

        {/* Investment Hotspots */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Hotspots</h3>
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Interactive Map: San Francisco Investment Hotspots</p>
          </div>
        </div>

        {/* Top Recommendations */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((property) => (
              <div key={property.id} className="text-center">
                <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500">Property Image</span>
                </div>
                <h4 className="font-semibold text-gray-900">{property.name}</h4>
                <p className="text-sm text-gray-600">{property.neighborhood}</p>
              </div>
            ))}
          </div>
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