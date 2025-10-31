import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const ExplorePage = () => {
  const [properties, setProperties] = useState([]);
  const [mapBounds, setMapBounds] = useState(null);
  const locationHook = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(locationHook.search);
  const search = params.get('search') || '';
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [areaOverview, setAreaOverview] = useState({
    averagePrice: 450000,
    rentalYield: 4.5,
    roi: 8.2
  });
  const [safetyRisk, setSafetyRisk] = useState({
    crimeIndex: 'Low',
    floodRisk: 'Low',
    marketStability: 'High'
  });
  const [lifestyle, setLifestyle] = useState({
    school: '2.3 km',
    hospital: '3 km',
    transport: 'Good',
    shopping: 'Excellent'
  });
  const [investmentSummary, setInvestmentSummary] = useState({
    rating: 4.5,
    reviews: 120,
    pros: 'High rental demand, excellent schools.',
    cons: 'Slightly higher property taxes.'
  });

  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapBounds, search]);

  const fetchProperties = async () => {
    try {
      const params = mapBounds ? {
        north: mapBounds.getNorth(),
        south: mapBounds.getSouth(),
        east: mapBounds.getEast(),
        west: mapBounds.getWest()
      } : {};
      if (search) {
        params.search = search;
      }
      const response = await axios.get('http://localhost:5000/api/properties', { params });
      setProperties(response.data);
    } catch (err) {
      console.error('Error fetching properties:', err);
    }
  };

  const handleMapMove = (event) => {
    setMapBounds(event.target.getBounds());
  };

  const handleViewDetails = (propertyId) => {
    window.location.href = `/property/${propertyId}`;
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Sidebar - Map */}
      <div className="w-2/3 relative">
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-white rounded-lg shadow-lg p-4 w-80">
            <div className="relative">
              <form onSubmit={(e) => {
                e.preventDefault();
                const value = e.currentTarget.searchBox.value.trim();
                if (value.length === 0) {
                  navigate('/explore');
                } else {
                  navigate(`/explore?search=${encodeURIComponent(value)}`);
                }
              }}>
                <input
                  name="searchBox"
                  defaultValue={search}
                  type="text"
                  placeholder="Search for a city, area, location..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </form>
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <MapContainer
          center={[19.0760, 72.8777]}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          onMoveend={handleMapMove}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {properties.map(property => (
            <Marker
              key={property._id}
              position={[property.coordinates?.lat || 19.0760, property.coordinates?.lng || 72.8777]}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-sm">{property.title || 'Property'}</h3>
                  <p className="text-xs text-gray-600">{property.locationName || 'Location'}</p>
                  <p className="text-sm font-bold text-blue-600">₹{property.price?.toLocaleString() || 'N/A'}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Map Controls */}
        <div className="absolute bottom-4 right-4 z-10">
          <div className="bg-white rounded-lg shadow-lg p-2 space-y-2">
            <button className="block w-8 h-8 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center">
              <span className="text-lg">+</span>
            </button>
            <button className="block w-8 h-8 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center">
              <span className="text-lg">-</span>
            </button>
            <button className="block w-8 h-8 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Information Panels */}
      <div className="w-1/3 overflow-y-auto bg-white">
        <div className="p-6 space-y-6">
          {/* Area Overview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Area Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Average Price:</span>
                <span className="font-semibold">${areaOverview.averagePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rental Yield:</span>
                <span className="font-semibold">{areaOverview.rentalYield}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ROI:</span>
                <span className="font-semibold">{areaOverview.roi}%</span>
              </div>
            </div>
          </div>

          {/* Safety & Risk */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Safety & Risk</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Crime Index:</span>
                <span className="font-semibold text-green-600">{safetyRisk.crimeIndex}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Flood Risk:</span>
                <span className="font-semibold text-green-600">{safetyRisk.floodRisk}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Market Stability Score:</span>
                <span className="font-semibold text-green-600">{safetyRisk.marketStability}</span>
              </div>
            </div>
          </div>

          {/* Lifestyle */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lifestyle</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Nearby School:</span>
                <span className="font-semibold">{lifestyle.school}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hospital:</span>
                <span className="font-semibold">{lifestyle.hospital}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transport:</span>
                <span className="font-semibold text-green-600">{lifestyle.transport}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shopping:</span>
                <span className="font-semibold text-green-600">{lifestyle.shopping}</span>
              </div>
            </div>
          </div>

          {/* Investment Summary */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Summary</h3>
            <div className="flex items-center mb-3">
              <span className="text-2xl font-bold text-gray-900 mr-2">{investmentSummary.rating}</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(investmentSummary.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-2">{investmentSummary.reviews} reviews</span>
            </div>

            {/* Review Distribution */}
            <div className="space-y-2 mb-4">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center">
                  <span className="text-sm text-gray-600 w-8">{stars} stars</span>
                  <div className="flex-1 mx-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${stars === 5 ? 40 : stars === 4 ? 30 : stars === 3 ? 15 : stars === 2 ? 10 : 5}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">
                    {stars === 5 ? 40 : stars === 4 ? 30 : stars === 3 ? 15 : stars === 2 ? 10 : 5}%
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-4">
              <div>
                <span className="text-sm font-medium text-green-600">Pros: </span>
                <span className="text-sm text-gray-600">{investmentSummary.pros}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-red-600">Cons: </span>
                <span className="text-sm text-gray-600">{investmentSummary.cons}</span>
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Save Insights
            </button>
          </div>
        </div>

        {/* Featured Properties */}
        <div className="border-t border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Properties</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-16 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500 text-xs">Image</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Charming 3-Bedroom Home in Lakeside</h4>
                <p className="text-sm text-gray-600">3 beds · 2 baths · 1,800 sq ft</p>
                <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-20 h-16 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500 text-xs">Image</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Renovated 2-Bedroom Condo in Downtown</h4>
                <p className="text-sm text-gray-600">2 beds · 1 bath · 1,200 sq ft</p>
                <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Top Investment Picks */}
        <div className="border-t border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Investment Picks</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="w-full h-24 bg-gray-200 rounded mb-2 flex items-center justify-center">
                <span className="text-gray-500 text-xs">Image</span>
              </div>
              <h4 className="text-sm font-semibold text-gray-900">3-Bedroom Home in Lakeside</h4>
              <p className="text-xs text-gray-600">$450,000 · 8.2% ROI</p>
            </div>
            
            <div className="text-center">
              <div className="w-full h-24 bg-gray-200 rounded mb-2 flex items-center justify-center">
                <span className="text-gray-500 text-xs">Image</span>
              </div>
              <h4 className="text-sm font-semibold text-gray-900">2-Bedroom Condo in Downtown</h4>
              <p className="text-xs text-gray-600">$300,000 · 7.5% ROI</p>
            </div>
          </div>

          <div className="flex space-x-2">
            <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors">
              Save Picks
            </button>
            <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-50 transition-colors">
              Export Insights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;