import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ComparePage = () => {
  const [properties, setProperties] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);

  useEffect(() => {
    // Load properties from localStorage or API
    const savedProperties = JSON.parse(localStorage.getItem('comparisonProperties') || '[]');
    if (savedProperties.length > 0) {
      fetchComparisonData(savedProperties);
    }
  }, []);

  const fetchComparisonData = async (propertyIds) => {
    try {
      const promises = propertyIds.map(id => axios.get(`http://localhost:5000/api/properties/${id}`));
      const responses = await Promise.all(promises);
      const props = responses.map(res => res.data);
      setProperties(props);
      generateComparisonData(props);
    } catch (err) {
      console.error('Error fetching properties for comparison:', err);
    }
  };

  const generateComparisonData = (props) => {
    const data = [
      { label: 'Title', values: props.map(p => p.title) },
      { label: 'Price (₹)', values: props.map(p => p.price.toLocaleString()) },
      { label: 'Price per sq ft', values: props.map(p => (p.price / p.carpetArea).toFixed(2)) },
      { label: 'Carpet Area (sqft)', values: props.map(p => p.carpetArea) },
      { label: 'Covered Area (sqft)', values: props.map(p => p.coveredArea) },
      { label: 'Bedrooms', values: props.map(p => p.bedrooms) },
      { label: 'Bathrooms', values: props.map(p => p.bathrooms) },
      { label: 'Furnishing', values: props.map(p => p.furnishingType) },
      { label: 'Location', values: props.map(p => p.locationName) },
      { label: 'Developer', values: props.map(p => p.developer) },
      { label: 'Floor', values: props.map(p => p.floor) },
      { label: 'Society', values: props.map(p => p.society) },
      { label: 'Power Backup', values: props.map(p => p.powerBackup ? 'Yes' : 'No') },
      { label: 'Parking', values: props.map(p => p.parking ? 'Yes' : 'No') },
      { label: 'Amenities', values: props.map(p => p.amenities.join(', ')) },
    ];
    setComparisonData(data);
  };

  const getBestValue = (row, index) => {
    if (row.label === 'Price (₹)' || row.label === 'Price per sq ft') {
      const values = row.values.map(v => parseFloat(v.replace(/,/g, '')));
      const minIndex = values.indexOf(Math.min(...values));
      return minIndex === index ? 'bg-green-100' : '';
    }
    return '';
  };

  if (properties.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Properties to Compare</h2>
          <p className="text-gray-600 mb-4">Add properties to your comparison list from the explore page.</p>
          <a href="/explore" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Explore Properties
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Property Comparison</h1>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feature
                </th>
                {properties.map((property, index) => (
                  <th key={property._id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property {index + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {comparisonData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.label}
                  </td>
                  {row.values.map((value, colIndex) => (
                    <td key={colIndex} className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${getBestValue(row, colIndex)}`}>
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {properties.map((property, index) => (
            <div key={property._id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Property {index + 1}</h3>
              <img
                src="/placeholder-property.jpg"
                alt={property.title}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
              <p className="font-bold text-blue-600">₹{property.price.toLocaleString()}</p>
              <p className="text-sm text-gray-600">{property.locationName}</p>
              <p className="text-sm text-gray-600">{property.carpetArea} sqft | {property.bedrooms} BHK</p>
              <a
                href={`/property/${property._id}`}
                className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                View Details
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComparePage;
