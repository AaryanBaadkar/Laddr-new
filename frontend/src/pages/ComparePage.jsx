import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ComparePage = () => {
  const [properties, setProperties] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimerRef = useRef(null);

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

  // Search properties function
  const searchProperties = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get('http://localhost:5000/api/properties', {
        params: { search: query }
      });
      setSearchResults(response.data.slice(0, 10)); // Limit to 10 results
    } catch (err) {
      console.error('Error searching properties:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change with debouncing
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      searchProperties(query);
    }, 300);
  };

  // Add property to comparison
  const addPropertyToComparison = (property) => {
    if (properties.length < 3 && !properties.find(p => p._id === property._id)) {
      setProperties([...properties, property]);
      setShowSearchModal(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Compute dynamic highlights based on selected properties
  const getDynamicHighlights = () => {
    if (properties.length === 0) return null;

    // Find property with highest projected return (ROI)
    const bestROIProperty = properties.reduce((best, current) => {
      const currentROI = current.projectedReturn || 0;
      const bestROI = best.projectedReturn || 0;
      return currentROI > bestROI ? current : best;
    });

    // Find property with highest rental yield
    const bestYieldProperty = properties.reduce((best, current) => {
      const currentYield = current.rentalYield || 0;
      const bestYield = best.rentalYield || 0;
      return currentYield > bestYield ? current : best;
    });

    // Recommendation based on highest ROI (assuming ROI indicates long-term growth)
    const recommendedProperty = bestROIProperty;

    return {
      bestROI: {
        name: bestROIProperty.projectName || bestROIProperty.title || 'Property',
        value: bestROIProperty.projectedReturn ? `${bestROIProperty.projectedReturn}%` : 'N/A'
      },
      bestYield: {
        name: bestYieldProperty.projectName || bestYieldProperty.title || 'Property',
        value: bestYieldProperty.rentalYield ? `${bestYieldProperty.rentalYield}%` : 'N/A'
      },
      recommendation: {
        name: recommendedProperty.projectName || recommendedProperty.title || 'Property'
      }
    };
  };

  const highlights = getDynamicHighlights();

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

        {/* Add Property Button */}
        <div className="mb-8 flex justify-start items-center">
          <button
            onClick={() => {
              if (properties.length < 3) {
                setShowSearchModal(true);
              }
            }}
            disabled={properties.length >= 3}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-colors ${
              properties.length >= 3
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            +
          </button>
          <button
            onClick={() => {
              if (properties.length > 0) {
                setProperties(properties.slice(0, -1));
              }
            }}
            disabled={properties.length === 0}
            className={`ml-4 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-colors ${
              properties.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            -
          </button>
          <div className="ml-4 flex items-center">
            <p className="text-gray-700">
              Add up to 3 properties to compare ({properties.length}/3 added)
            </p>
          </div>
        </div>

        {/* Search Modal */}
        {showSearchModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Search Properties</h3>
                  <button
                    onClick={() => setShowSearchModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search for properties..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {isSearching && (
                    <div className="mt-2 text-sm text-gray-500">Searching...</div>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((property) => (
                        <div
                          key={property._id}
                          onClick={() => addPropertyToComparison(property)}
                          className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {property.projectName || property.title || 'Property'}
                            </h4>
                            {property.price && (
                              <span className="text-lg font-bold text-blue-600">
                                ₹{property.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            {property.areaName || property.locationName || 'Area'}
                            {property.locality && `, ${property.locality}`}
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                            {property.bedrooms && <span>{property.bedrooms} Beds</span>}
                            {property.bathrooms && <span>{property.bathrooms} Baths</span>}
                            {property.carpetArea && (
                              <span>{property.carpetArea} {property.carpetAreaUnit || 'sqft'}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery && !isSearching ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h4>
                      <p className="text-gray-600">
                        Try searching with different keywords like city, area, or property type.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Search Properties</h4>
                      <p className="text-gray-600">
                        Start typing to search for properties to compare.
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowSearchModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Investment Metrics Comparison */}
        {properties.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Investment Metrics Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Metrics</th>
                      {properties.map((property) => (
                        <th key={property._id || property.id} className="text-left py-3 px-4 font-medium text-gray-900">{property.projectName || property.title || 'Property'}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-3 px-4 font-medium text-gray-900">Current Price</td>
                      {properties.map((property) => (
                        <td key={property._id || property.id} className="py-3 px-4 text-gray-900">₹{property.price?.toLocaleString() || 'N/A'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-gray-900">Location</td>
                      {properties.map((property) => (
                        <td key={property._id || property.id} className="py-3 px-4 text-gray-900">{property.areaName || property.locationName || 'N/A'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-gray-900">Property Type</td>
                      {properties.map((property) => (
                        <td key={property._id || property.id} className="py-3 px-4 text-gray-900">{property.propertyType || 'N/A'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-gray-900">Bedrooms</td>
                      {properties.map((property) => (
                        <td key={property._id || property.id} className="py-3 px-4 text-gray-900">{property.bedrooms || 'N/A'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-gray-900">Carpet Area</td>
                      {properties.map((property) => (
                        <td key={property._id || property.id} className="py-3 px-4 text-gray-900">{property.carpetArea ? `${property.carpetArea} ${property.carpetAreaUnit || 'sqft'}` : 'N/A'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-gray-900">Status</td>
                      {properties.map((property) => (
                        <td key={property._id || property.id} className="py-3 px-4 text-gray-900">{property.status || 'N/A'}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Metrics Comparison</h3>
              <p className="text-gray-600">No properties are added for comparison.</p>
            </div>
          </div>
        )}

        {/* Investment Highlights */}
        {properties.length > 0 && highlights ? (
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
                {highlights.bestROI.name} offers the highest projected 5-year return at {highlights.bestROI.value}, making it ideal for long-term growth investors.
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
                {highlights.bestYield.name} provides the strongest rental yield at {highlights.bestYield.value}, perfect for investors seeking immediate cash flow.
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
                {highlights.recommendation.name} has the best long-term growth potential with balanced risk and yield metrics.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Highlights</h3>
              <p className="text-gray-600">No properties are added for comparison.</p>
            </div>
          </div>
        )}

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