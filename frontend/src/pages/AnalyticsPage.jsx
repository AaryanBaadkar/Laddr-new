import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/analytics');
      setAnalyticsData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  if (!analyticsData) {
    return <div className="text-center py-8">No analytics data available</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Average Price per sq ft</h3>
            <p className="text-3xl font-bold text-blue-600">
              ₹{analyticsData.avgPricePerSqft?.toFixed(2) || 'N/A'}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Total Properties</h3>
            <p className="text-3xl font-bold text-green-600">
              {analyticsData.totalProperties || 0}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Average Property Price</h3>
            <p className="text-3xl font-bold text-purple-600">
              ₹{(analyticsData.avgPrice / 100000).toFixed(1) || 'N/A'}L
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Price Trends by Location</h3>
            <div className="space-y-4">
              {analyticsData.priceByLocation?.slice(0, 10).map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-700">{item._id}</span>
                  <span className="font-semibold">₹{item.avgPrice.toLocaleString()}</span>
                </div>
              )) || <p>No location data available</p>}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Property Type Distribution</h3>
            <div className="space-y-4">
              {analyticsData.propertyTypes?.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-700">{item._id}</span>
                  <span className="font-semibold">{item.count} properties</span>
                </div>
              )) || <p>No property type data available</p>}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Price Range Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analyticsData.priceRanges?.map((range, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{range._id}</p>
                <p className="text-2xl font-bold text-blue-600">{range.count}</p>
              </div>
            )) || <p>No price range data available</p>}
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Neighborhood Rankings</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Location</th>
                  <th className="text-left py-2">Avg Price/sqft</th>
                  <th className="text-left py-2">Properties</th>
                  <th className="text-left py-2">Ranking</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.locationRankings?.map((location, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{location.location}</td>
                    <td className="py-2">₹{location.avgPricePerSqft.toFixed(2)}</td>
                    <td className="py-2">{location.propertyCount}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        index < 3 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        #{index + 1}
                      </span>
                    </td>
                  </tr>
                )) || <tr><td colSpan="4" className="text-center py-4">No ranking data available</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
