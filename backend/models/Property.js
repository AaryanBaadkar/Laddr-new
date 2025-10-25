const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  propertyType: { type: String, enum: ['Apartment', 'Villa', 'Independent House', 'Plot', 'Commercial'], required: true },
  price: { type: Number, required: true },
  carpetArea: { type: Number, required: true },
  coveredArea: { type: Number },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number },
  furnishingType: { type: String, enum: ['Unfurnished', 'Semi', 'Furnished'], required: true },
  locationName: { type: String, required: true },
  city: { type: String, default: 'Mumbai' },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  amenities: [{ type: String }],
  developer: { type: String },
  floor: { type: String },
  society: { type: String },
  powerBackup: { type: Boolean, default: false },
  parking: { type: Boolean, default: false },
  nearestAmenities: {
    school: { distance: Number, name: String },
    hospital: { distance: Number, name: String },
    transit: { distance: Number, name: String }
  },
  floodRisk: { type: Number, default: 0 }, // 0-10 scale
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
