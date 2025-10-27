import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ComparePage = () => {
  const [properties, setProperties] = useState([
    {
      id: 1,
      title: 'Oceanview Villa',
      location: 'Palm Jumeirah, Dubai',
      price: 1250000,
      area: 2850,
      type: 'Villa',
      image: '/api/placeholder/300/200',
      highlight: 'Best ROI',
      highlightColor: 'purple',
      currentPrice: 1250000,
      priceTrend: '+8.5% annually',
      predictedGrowth: 52.4,
      rentalYield: 5.8,
      riskScore: 2.4,
      riskLevel: 'Low',
      paybackPeriod: 17.2,
      maintenanceCost: 15600
    },
    {
      id: 2,
      title: 'Downtown Heights',
      location: 'Downtown, Dubai',
      price: 875000,
      area: 1450,
      type: 'Apartment',
      image: '/api/placeholder/300/200',
      highlight: 'Best Yield',
      highlightColor: 'blue',
      currentPrice: 875000,
      priceTrend: '+6.2% annually',
      predictedGrowth: 38.7,
      rentalYield: 7.2,
      riskScore: 3.7,
      riskLevel: 'Medium',
      paybackPeriod: 13.9,
      maintenanceCost: 7850
    },
    {
      id: 3,
      title: 'Business Bay Tower',
      location: 'Business Bay, Dubai',
      price: 1950000,
      area: 3200,
      type: 'Commercial',
      image: '/api/placeholder/300/200',
      highlight: null,
      highlightColor: null,
      currentPrice: 1950000,
      priceTrend: '+4.8% annually',
      predictedGrowth: 26.5,
      rentalYield: 6.1,
      riskScore: 4.8,
      riskLevel: 'Medium-High',
      paybackPeriod: 16.4,
      maintenanceCost: 26400
    }
  ]);

  const getRiskColor = (level) => {
    switch (level) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Medium-High': return 'bg-orange-100 text-orange-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHighlightColor = (color) => {
    switch (color) {
      case 'purple': return 'bg-purple-100 text-purple-800';
      case 'blue': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Villa': return 'bg-blue-100 text-blue-800';
      case 'Apartment': return 'bg-purple-100 text-purple-800';
      case 'Commercial': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Comparison</h1>
          <p className="text-gray-600 text-lg">
            Compare investment details and metrics for these properties
          </p>
        </div>

        {/* Property Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="relative">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Property Image</span>
                </div>
                {property.highlight && (
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-medium ${getHighlightColor(property.highlightColor)}`}>
                    {property.highlight}
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{property.title}</h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <span className="mr-1">📍</span>
                  <span className="text-sm">{property.location}</span>
                </div>
                <p className="text-xl font-bold text-gray-900 mb-1">${property.price.toLocaleString()}</p>
                <p className="text-sm font-medium text-gray-900 mb-3">{property.area.toLocaleString()} sq ft</p>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(property.type)}`}>
                    {property.type}
                  </span>
                  <button className="text-purple-600 hover:text-purple-800">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Investment Metrics Comparison */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Investment Metrics Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Metrics</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Oceanview Villa</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Downtown Heights</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Business Bay Tower</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-900">Current Price</td>
                    <td className="py-3 px-4 text-gray-900">${properties[0].currentPrice.toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-900">${properties[1].currentPrice.toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-900">${properties[2].currentPrice.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-900">Historical Price Trend</td>
                    <td className="py-3 px-4 text-gray-900">{properties[0].priceTrend}</td>
                    <td className="py-3 px-4 text-gray-900">{properties[1].priceTrend}</td>
                    <td className="py-3 px-4 text-gray-900">{properties[2].priceTrend}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-900">Predicted Growth (5-year ROI)</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-purple-600">{properties[0].predictedGrowth}%</span>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{properties[1].predictedGrowth}%</td>
                    <td className="py-3 px-4 text-gray-900">{properties[2].predictedGrowth}%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-900">Rental Yield %</td>
                    <td className="py-3 px-4 text-gray-900">{properties[0].rentalYield}%</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-purple-600">{properties[1].rentalYield}%</span>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{properties[2].rentalYield}%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-900">Risk Score</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(properties[0].riskLevel)}`}>
                        {properties[0].riskLevel} ({properties[0].riskScore})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(properties[1].riskLevel)}`}>
                        {properties[1].riskLevel} ({properties[1].riskScore})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(properties[2].riskLevel)}`}>
                        {properties[2].riskLevel} ({properties[2].riskScore})
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-900">Payback Period</td>
                    <td className="py-3 px-4 text-gray-900">{properties[0].paybackPeriod} years</td>
                    <td className="py-3 px-4 text-gray-900">{properties[1].paybackPeriod} years</td>
                    <td className="py-3 px-4 text-gray-900">{properties[2].paybackPeriod} years</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-900">Maintenance Cost Estimate</td>
                    <td className="py-3 px-4 text-gray-900">${properties[0].maintenanceCost.toLocaleString()}/year</td>
                    <td className="py-3 px-4 text-gray-900">${properties[1].maintenanceCost.toLocaleString()}/year</td>
                    <td className="py-3 px-4 text-gray-900">${properties[2].maintenanceCost.toLocaleString()}/year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Investment Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Best ROI</h4>
            </div>
            <p className="text-gray-600">
              Oceanview Villa offers the highest projected 5-year return at 52.4%, making it ideal for long-term growth investors.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Best Yield</h4>
            </div>
            <p className="text-gray-600">
              Downtown Heights provides the strongest rental yield at 7.2%, perfect for investors seeking immediate cash flow.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Our Recommendation</h4>
            </div>
            <p className="text-gray-600">
              Oceanview Villa has the best long-term growth potential with balanced risk and yield metrics.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
            Save to watchlist
          </button>
          <button className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
            Share Comparison
          </button>
          <button className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
            Request Consultation
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComparePage;