const mongoose = require('mongoose');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const Property = require('../models/Property');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Function to parse boolean values from CSV
const parseBoolean = (value) => {
  if (value === '1' || value === 'Y' || value === 'true') return true;
  if (value === '0' || value === 'N' || value === 'false') return false;
  return false;
};

// Function to parse number values
const parseNumber = (value) => {
  if (!value || value === 'NA' || value === '') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

// Function to parse amenities from CSV columns
const parseAmenities = (row) => {
  const amenities = [];
  const amenityColumns = [
    'Power Back Up', 'Lift', 'Rain Water Harvesting', 'Club House', 'Swimming Pool',
    'Gymnasium', 'Park', 'Parking', 'Security', 'Water Storage', 'Private Terrace/Garden',
    'Vaastu Compliant', 'Service/Goods Lift', 'Air Conditioned', 'Visitor Parking',
    'Intercom Facility', 'Maintenance Staff', 'Waste Disposal', 'Laundry Service',
    'Internet/Wi-Fi Connectivity', 'DTH Television Facility', 'RO Water System',
    'Banquet Hall', 'Bar/Lounge', 'Cafeteria/Food Court', 'Conference Room',
    'Piped Gas', 'Jogging and Strolling Track', 'Outdoor Tennis Courts'
  ];
  
  amenityColumns.forEach(column => {
    if (row[column] === '1' || row[column] === 'Y') {
      amenities.push(column);
    }
  });
  
  return amenities;
};

async function importProperties() {
  try {
    console.log('Starting property import...');
    
    // Clear existing properties
    await Property.deleteMany({});
    console.log('Cleared existing properties');
    
    const results = [];
    const csvPath = path.join(__dirname, '../../properties.csv');
    
    // Read CSV file
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        console.log(`Found ${results.length} properties in CSV`);
        
        let imported = 0;
        let errors = 0;
        
        for (const row of results) {
          try {
            // Extract coordinates (you may need to add these to your CSV or use a geocoding service)
            const coordinates = {
              lat: null, // Add latitude if available in CSV
              lng: null  // Add longitude if available in CSV
            };
            
            const property = new Property({
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
            });
            
            await property.save();
            imported++;
            
            if (imported % 100 === 0) {
              console.log(`Imported ${imported} properties...`);
            }
            
          } catch (error) {
            console.error(`Error importing property ${row.ID}:`, error.message);
            errors++;
          }
        }
        
        console.log(`Import completed!`);
        console.log(`Successfully imported: ${imported} properties`);
        console.log(`Errors: ${errors} properties`);
        
        mongoose.connection.close();
      });
      
  } catch (error) {
    console.error('Import failed:', error);
    mongoose.connection.close();
  }
}

// Run the import
importProperties();


