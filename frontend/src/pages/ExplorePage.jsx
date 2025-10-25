import React, { useState, useEffect } from 'react';
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

const PropertyCard = ({ property, onViewDetails }) => (
  <div className="bg-white p-4 rounded-lg shadow-md mb-4">
    <h3 className="font-semibold text-lg">{property.title}</h3>
    <p className="text-gray-600">{property.locationName}</p>
    <p className="text-blue-600 font-bold">₹{property.price.toLocaleString()}</p>
    <p className="text-sm text-gray-500">
      {property.carpetArea} sqft | {property.bedrooms} BHK | {property.furnishingType}
    </p>
    <button
      onClick={() => onViewDetails(property._id)}
      className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      View Details
    </button>
  </div>
);

const MapController = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds);
    }
  }, [bounds, map]);
  return null;
};

const ExplorePage = () => {
  const [properties, setProperties] = useState([]);
  const [mapBounds, setMapBounds] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, [mapBounds]);

  const fetchProperties = async () => {
    try {
      const params = mapBounds ? {
        north: mapBounds.getNorth(),
        south: mapBounds.getSouth(),
        east: mapBounds.getEast(),
        west: mapBounds.getWest()
      } : {};
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
    // Navigate to property details page
    window.location.href = `/property/${propertyId}`;
  };

  return (
    <div className="h-screen flex">
      <div className="w-1/3 p-4 overflow-y-auto bg-gray-100">
        <h2 className="text-2xl font-bold mb-4">Properties ({properties.length})</h2>
        {properties.map(property => (
          <PropertyCard
            key={property._id}
            property={property}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>
      <div className="w-2/3">
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
              position={[property.coordinates.lat, property.coordinates.lng]}
            >
              <Popup>
                <div>
                  <h3 className="font-semibold">{property.title}</h3>
                  <p>₹{property.price.toLocaleString()}</p>
                  <button
                    onClick={() => handleViewDetails(property._id)}
                    className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
          {mapBounds && <MapController bounds={mapBounds} />}
        </MapContainer>
      </div>
    </div>
  );
};

export default ExplorePage;
