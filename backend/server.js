const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
require('dotenv').config();
require('./config/passport');

const app = express();
const { importProperties } = require('./scripts/importProperties');
const Property = require('./models/Property');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('MongoDB connected');
  try {
    const propertiesCount = await Property.countDocuments();
    if (propertiesCount === 0) {
      console.log('No properties found. Importing from properties.csv...');
      await importProperties();
    } else {
      console.log(`Properties collection has ${propertiesCount} documents. Skipping import.`);
    }
  } catch (e) {
    console.error('Failed to check/import properties:', e.message);
  }
})
.catch(err => console.log(err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/inquiries', require('./routes/inquiries'));
app.use('/api/analytics', require('./routes/analytics'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
