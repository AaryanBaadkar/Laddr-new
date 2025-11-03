const fs = require('fs');
const path = require('path');
const { getPropertiesFromCsv } = require('./utils/propertyCsv');

async function populatePriceHistory() {
  try {
    console.log('Reading properties from CSV...');

    // Get all properties from CSV
    const properties = await getPropertiesFromCsv();
    const validProperties = properties.filter(p => p.price && p.price > 0);

    console.log(`Found ${validProperties.length} properties with valid prices`);

    const propertiesWithHistory = [];

    for (const property of validProperties) {
      const currentPrice = property.price;
      const priceHistory = [];

      // Generate prices for the past 5 years (2019-2023)
      for (let year = 2019; year <= 2023; year++) {
        // Generate random variation between -20% to +20%
        const variation = (Math.random() - 0.5) * 0.4; // -0.2 to +0.2
        const historicalPrice = Math.max(1, Math.round(currentPrice * (1 + variation))); // Ensure > 0

        // Create date for the middle of the year
        const date = new Date(year, 5, 15); // June 15th of each year

        priceHistory.push({
          price: historicalPrice,
          date: date.toISOString(),
          source: 'generated'
        });
      }

      // Add priceHistory to the property
      const propertyWithHistory = {
        ...property,
        priceHistory: priceHistory
      };

      propertiesWithHistory.push(propertyWithHistory);

      console.log(`Generated price history for property ${property.id}`);
    }

    // Write to JSON file
    const outputPath = path.join(__dirname, '../../properties_with_history.json');
    fs.writeFileSync(outputPath, JSON.stringify(propertiesWithHistory, null, 2));

    console.log(`Price history population completed. Data saved to ${outputPath}`);
    console.log(`Processed ${propertiesWithHistory.length} properties`);
  } catch (error) {
    console.error('Error populating price history:', error);
  }
}

// Run the script
populatePriceHistory();
