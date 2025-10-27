# Real Estate Platform - Mumbai Properties

A comprehensive real estate platform built with React frontend and Node.js backend, featuring interactive maps, property comparison, and analytics.

## Features

- 🗺️ Interactive map with property markers
- 🏠 Property search and filtering
- 📊 Analytics dashboard with price trends
- 🔍 Property comparison tool
- 📱 Responsive design
- 🔐 User authentication (Local & Google OAuth)
- 📧 Inquiry system with email notifications
- 👨‍💼 Admin dashboard

## Tech Stack

### Frontend
- React 19.2.0
- TailwindCSS 3.4.0
- React Router DOM
- React Leaflet (Maps)
- Axios (HTTP client)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Passport.js (Authentication)
- JWT (JSON Web Tokens)
- Nodemailer (Email notifications)

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd Laddr-new
```

### 2. Install dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 3. Environment Configuration

Create a `.env` file in the backend directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/real-estate

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=5000

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Configuration (optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@yourcompany.com
```

### 4. Database Setup

#### Start MongoDB
Make sure MongoDB is running on your system:
```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas connection string in .env
```

#### Import Properties Data
```bash
cd backend
npm run import
```

This will import all properties from the `properties.csv` file into MongoDB.

### 5. Start the Application

#### Start Backend Server
```bash
cd backend
npm run dev
# Server will start on http://localhost:5000
```

#### Start Frontend Development Server
```bash
cd frontend
npm start
# Frontend will start on http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/me` - Get current user

### Properties
- `GET /api/properties` - Get all properties (with optional bounds filtering)
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create property (admin only)
- `PUT /api/properties/:id` - Update property (admin only)
- `DELETE /api/properties/:id` - Delete property (admin only)
- `POST /api/properties/import-csv` - Import properties from CSV (admin only)

### Inquiries
- `POST /api/inquiries` - Create inquiry
- `GET /api/inquiries` - Get all inquiries (admin only)

### Analytics
- `GET /api/analytics/price-trends` - Get price trends by locality
- `GET /api/analytics/neighborhoods` - Get neighborhood rankings

## Data Structure

The application uses a comprehensive property schema that includes:

- Basic property information (title, type, price, area)
- Location details (city, area, landmarks)
- Property features (bedrooms, bathrooms, amenities)
- Infrastructure details (power backup, parking, security)
- Legal information (ownership type, RERA compliance)
- Additional amenities and facilities

## CSV Import

The `properties.csv` file contains comprehensive property data with the following key fields:
- Property details (ID, type, price, area)
- Location information
- Amenities and features
- Legal and ownership details
- Infrastructure facilities

## Development

### Adding New Features
1. Create new routes in the backend
2. Update the frontend components
3. Add corresponding API calls
4. Update the database schema if needed

### Database Schema Updates
If you modify the Property model, you may need to:
1. Update the import script
2. Re-import the CSV data
3. Update frontend components to handle new fields

## Troubleshooting

### Common Issues

1. **PostCSS/TailwindCSS Error**
   - Fixed by updating to TailwindCSS v3.4.0
   - Updated PostCSS configuration

2. **MongoDB Connection Issues**
   - Ensure MongoDB is running
   - Check connection string in .env
   - Verify database permissions

3. **Leaflet Map Issues**
   - Ensure proper CSS imports
   - Check marker icon configurations

4. **Authentication Issues**
   - Verify JWT secret in .env
   - Check Google OAuth credentials
   - Ensure proper token handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please create an issue in the repository.


