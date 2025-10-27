import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState({ name: 'ABC' });
  const [metrics, setMetrics] = useState({
    propertiesSaved: 24,
    averageROI: 7.2,
    rentalYield: 5.8,
    riskIndex: 'Low'
  });
  const [portfolio, setPortfolio] = useState({
    name: 'Oakwood Apartments',
    purchaseDate: 'March 2021',
    purchasePrice: 425000,
    currentValue: 503625,
    ytdGrowth: 18.5,
    target: 700000
  });
  const [recentActivity, setRecentActivity] = useState([
    { type: 'watchlist', property: '3-bedroom flat in Kensington', time: '2 hours ago' },
    { type: 'compare', property: '2 houses in Manchester area', time: 'Yesterday' },
    { type: 'roi', property: 'Brighton property +0.8%', time: '2 days ago' }
  ]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'watchlist': return '🔖';
      case 'compare': return '⚖️';
      case 'roi': return '📈';
      default: return '📋';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Laddr</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                💡 Consider properties in Mumbai for better ROI
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}
          </h2>
          <p className="text-gray-600 text-lg">
            Your portfolio is performing well this month.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Properties Saved</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.propertiesSaved}</p>
              </div>
              <div className="text-2xl">🏠</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average ROI</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.averageROI}%</p>
              </div>
              <div className="text-2xl">📈</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rental Yield Average</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.rentalYield}%</p>
              </div>
              <div className="text-2xl">📊</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Risk Index</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.riskIndex}</p>
              </div>
              <div className="text-2xl">📊</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Price Trends */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Price Trends</h3>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-800">View details</a>
            </div>
            <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
              <p className="text-gray-500">Candlestick Chart</p>
            </div>
          </div>

          {/* ROI Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">ROI Distribution</h3>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-800">View details</a>
            </div>
            <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
              <p className="text-gray-500">Histogram Chart</p>
            </div>
          </div>

          {/* Rental Yield Split */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Rental Yield Split</h3>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-800">View details</a>
            </div>
            <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
              <p className="text-gray-500">Pie Chart</p>
            </div>
          </div>
        </div>

        {/* Portfolio and Map Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Property Portfolio */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Property Portfolio</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900">{portfolio.name}</h4>
                <p className="text-sm text-gray-600">
                  Purchased: {portfolio.purchaseDate} • ${portfolio.purchasePrice.toLocaleString()}
                </p>
                <p className="font-semibold text-gray-900 mt-2">
                  Current Value: ${portfolio.currentValue.toLocaleString()}
                </p>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${(portfolio.currentValue / portfolio.target) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">Target: ${portfolio.target.toLocaleString()}</span>
                    <span className="text-sm text-green-600 font-semibold">
                      +{portfolio.ytdGrowth}% YTD
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Property Hotspots */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Property Hotspots</h3>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-800">View full map</a>
            </div>
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
              <p className="text-gray-500">Interactive Map with Hotspots</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800">View all</a>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">{getActivityIcon(activity.type)}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.type === 'watchlist' && 'Added to watchlist:'}
                    {activity.type === 'compare' && 'Compared properties:'}
                    {activity.type === 'roi' && 'ROI increase alert:'}
                  </p>
                  <p className="text-sm text-gray-600">{activity.property}</p>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;