const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const Property = require('../models/Property');
const { parseBoolean, parseNumber, parseAmenities } = require('../utils/propertyCsv');
require('dotenv').config();

async function importProperties() {
  const shouldConnect = mongoose.connection.readyState !== 1;
  let imported = 0;
  let errors = 0;
  try {
    if (shouldConnect) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB connected (importer)');
    }

    console.log('Starting property import...');

    await Property.deleteMany({});
    console.log('Cleared existing properties');

    const results = [];
    const csvPath = path.join(__dirname, '../../properties.csv');

    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('error', (err) => reject(err))
        .on('end', () => resolve());
    });

    console.log(`Found ${results.length} properties in CSV`);

    for (const row of results) {
      try {
        // Read latitude and longitude from CSV
        const lat = parseNumber(row.latitude) || parseNumber(row.Latitude);
        const lng = parseNumber(row.Longitude) || parseNumber(row.longitude);
        const coordinates = { 
          lat: lat || null, 
          lng: lng || null 
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
              locality: row.Locality,
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

    console.log('Import completed!');
    console.log(`Successfully imported: ${imported} properties`);
    console.log(`Errors: ${errors} properties`);
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  } finally {
    if (shouldConnect) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed (importer)');
    }
  }
  return { imported, errors };
}

// Allow running as a script: only execute when called directly
if (require.main === module) {
  importProperties();
}

module.exports = { importProperties };


