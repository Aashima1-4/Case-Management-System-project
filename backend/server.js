const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/configs/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());


// Route files (API v1)
const authRoutes = require('./src/api/v1/routes/authRoutes');
const caseRoutes = require('./src/api/v1/routes/caseRoutes');

// Mount routers with versioning
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/cases', caseRoutes);

const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    // server.close(() => process.exit(1));
});
