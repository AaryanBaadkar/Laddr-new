const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const parseBoolean = (value) => {
  if (value === '1' || value === 'Y' || value === 'true') return true;
  if (value === '0' || value === 'N' || value === 'false') return false;
  return false;
};

const parseNumber = (value) => {
  if (!value || value === 'NA' || value === '') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

const amenityColumns = [
  'Power Back Up', 'Lift', 'Rain Water Harvesting', 'Club House', 'Swimming Pool',
  'Gymnasium', 'Park', 'Parking', 'Security', 'Water Storage', 'Private Terrace/Garden',
  'Vaastu Compliant', 'Service/Goods Lift', 'Air Conditioned', 'Visitor Parking',
  'Intercom Facility', 'Maintenance Staff', 'Waste Disposal', 'Laundry Service',
  'Internet/Wi-Fi Connectivity', 'DTH Television Facility', 'RO Water System',
  'Banquet Hall', 'Bar/Lounge', 'Cafeteria/Food Court', 'Conference Room',
  'Piped Gas', 'Jogging and Strolling Track', 'Outdoor Tennis Courts'
];

const parseAmenities = (row) => {
  const amenities = [];
  amenityColumns.forEach((col) => {
    if (row[col] === '1' || row[col] === 'Y') amenities.push(col);
  });
  return amenities;
};

const mapRowToProperty = (row) => {
  const coordinates = { lat: null, lng: null };
  return {
    id: row.ID,
    title: row.Property || `${row.bedroom} BHK Flat`,
    projectName: row['Project Name'],
    developer: row.Developer,

    propertyType: row['Type of Property'],
    bedrooms: parseNumber(row.bedroom),
    bathrooms: parseNumber(row.Bathroom),
    carpetArea: parseNumber(row['Carpet Area']),
    coveredArea: parseNumber(row['Covered Area']),
    carpetAreaUnit: row['Unit of Carpet Area'],
    coveredAreaUnit: row['covArea Unit'],

    location: row.Location,
    areaName: row['Area Name'],
    city: row.City,
    landmark: row.Landmark,

    price: parseNumber(row.Price),
    priceEnglish: row['Price (English)'],
    sqftPrice: parseNumber(row['sqft Price ']),
    bookingAmount: parseNumber(row['Booking Amount']),

    possessionStatus: row['Possession Status'],
    availabilityStartsFrom: row['Availability Starts From'],
    floorNo: row['Floor No'],
    floors: parseNumber(row.floors),
    floorData: row['Floor Data'],

    ownershipType: row['Ownership Type'],
    furnishedType: row['furnished Type'],
    commercial: row.Commercial,
    approvedAuthorityName: row['Approved Authority Name'],
    rera: row.Rera,

    amenities: parseAmenities(row),
    flooringType: row['Flooring Type'],
    facing: row.Facing,
    amenitiesFacing: row['Amenities Facing'],

    electricityStatus: row['Electricity Status'],
    waterStatus: row['Water Status'],
    maintenanceType: row['Maintenance Type'],
    maintenanceCharges: parseNumber(row['Maintenance Charges']),

    powerBackup: parseBoolean(row['Power Back Up']),
    lift: parseBoolean(row.Lift),
    parking: parseBoolean(row.Parking),
    security: parseBoolean(row.Security),
    waterStorage: parseBoolean(row['Water Storage']),
    swimmingPool: parseBoolean(row['Swimming Pool']),
    gymnasium: parseBoolean(row.Gymnasium),
    park: parseBoolean(row.Park),
    clubHouse: parseBoolean(row['Club House']),
    rainWaterHarvesting: parseBoolean(row['Rain Water Harvesting']),

    coordinates,

    unitsAvailable: parseNumber(row['Units Available']),
    society: row.Society,
    transactionType: row['Transaction Type'],
    propertyUniqueness: row['Property Uniqueness'],
    tenantsPreference: row['Tenants Preference'],
    luxuryFlat: row['Luxury Flat'],
    isPrimeLocationProperty: row.isPrimeLocationProperty,
    isLuxuryServiceProvided: row.isLuxuryServiceProvided,
    propertyLifespan: row['Property Lifespan'],
    balconies: parseNumber(row.balconies),
    nriPref: row['NRI Pref'],
    landArea: parseNumber(row['Land Area / Covered Area']),
    landAreaUnit: row['Land Area Unit'],
    pantryType: row['Pantry Type'],

    dataReferredFrom: row['Data Referred From'],

    // Legacy fields
    locationName: row['Area Name'],
    furnishingType: row['furnished Type']
  };
};

const readCsvAll = async () => {
  const csvPath = path.join(__dirname, '../../properties.csv');
  const results = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('error', reject)
      .on('end', resolve);
  });
  return results;
};

const findByCsvId = async (csvId) => {
  const rows = await readCsvAll();
  const row = rows.find((r) => (r.ID || '').toString() === csvId.toString());
  if (!row) return null;
  return mapRowToProperty(row);
};

module.exports = {
  parseBoolean,
  parseNumber,
  parseAmenities,
  mapRowToProperty,
  readCsvAll,
  findByCsvId,
};


