const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  // Basic Information
  id: { type: String, unique: true },
  title: { type: String },
  projectName: { type: String },
  developer: { type: String },
  
  // Property Details
  propertyType: { type: String },
  bedrooms: { type: Number },
  bathrooms: { type: Number },
  carpetArea: { type: Number },
  coveredArea: { type: Number },
  carpetAreaUnit: { type: String },
  coveredAreaUnit: { type: String },
  
  // Location
  location: { type: String },
  areaName: { type: String },
  city: { type: String },
  landmark: { type: String },
  
  // Pricing
  price: { type: Number },
  priceEnglish: { type: String },
  sqftPrice: { type: Number },
  bookingAmount: { type: Number },
  
  // Property Status
  possessionStatus: { type: String },
  availabilityStartsFrom: { type: String },
  floorNo: { type: String },
  floors: { type: Number },
  floorData: { type: String },
  
  // Ownership & Legal
  ownershipType: { type: String },
  furnishedType: { type: String },
  commercial: { type: String },
  approvedAuthorityName: { type: String },
  rera: { type: String },
  
  // Amenities & Features
  amenities: [{ type: String }],
  flooringType: { type: String },
  facing: { type: String },
  amenitiesFacing: { type: String },
  
  // Utilities
  electricityStatus: { type: String },
  waterStatus: { type: String },
  maintenanceType: { type: String },
  maintenanceCharges: { type: Number },
  
  // Infrastructure
  powerBackup: { type: Boolean, default: false },
  lift: { type: Boolean, default: false },
  parking: { type: Boolean, default: false },
  security: { type: Boolean, default: false },
  waterStorage: { type: Boolean, default: false },
  
  // Additional Features
  swimmingPool: { type: Boolean, default: false },
  gymnasium: { type: Boolean, default: false },
  park: { type: Boolean, default: false },
  clubHouse: { type: Boolean, default: false },
  rainWaterHarvesting: { type: Boolean, default: false },
  
  // Coordinates for mapping
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  
  // Additional data
  unitsAvailable: { type: Number },
  society: { type: String },
  transactionType: { type: String },
  propertyUniqueness: { type: String },
  tenantsPreference: { type: String },
  luxuryFlat: { type: String },
  isPrimeLocationProperty: { type: String },
  isLuxuryServiceProvided: { type: String },
  propertyLifespan: { type: String },
  balconies: { type: Number },
  nriPref: { type: String },
  landArea: { type: Number },
  landAreaUnit: { type: String },
  pantryType: { type: String },
  
  // Data source
  dataReferredFrom: { type: String },
  
  // Legacy fields for compatibility
  locationName: { type: String },
  furnishingType: { type: String },
  
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
