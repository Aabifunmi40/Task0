require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

console.log('Starting server...');
console.log('Environment variables:', {
  PORT: process.env.PORT,
  USER_EMAIL: process.env.USER_EMAIL,
  USER_NAME: process.env.USER_NAME,
  USER_STACK: process.env.USER_STACK
});

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per IP
});
app.use(limiter);

// Personal info from environment variables
const MY_EMAIL = process.env.USER_EMAIL;
const MY_NAME = process.env.USER_NAME;
const MY_STACK = process.env.USER_STACK;

// Validate environment variables
if (!MY_EMAIL || !MY_NAME || !MY_STACK || !process.env.PORT) {
  console.error('Missing environment variables. Please set USER_EMAIL, USER_NAME, USER_STACK, and PORT in .env');
  process.exit(1);
}

// GET /me endpoint
app.get('/me', async (req, res) => {
  console.log('Handling /me request...');
  // Generate current timestamp in UTC in ISO 8601 format
  const utcTimestamp = new Date().toISOString();
  
  // Default cat fact for API failure
  let catFact = 'Cats are mysterious creatures... (Fallback fact due to API issue)';
  
  // Fetch cat fact
  try {
    console.log('Fetching cat fact...');
    const catResponse = await axios.get('https://catfact.ninja/fact', {
      timeout: 5000
    });
    
    catFact = catResponse.data.fact;
    console.log('Successfully fetched cat fact:', catFact);
  } catch (error) {
    console.error('Error fetching cat fact:', error.message);
  }
  
  // Build response
  const response = {
    status: 'success',
    user: {
      email: MY_EMAIL,
      name: MY_NAME,
      stack: MY_STACK
    },
    timestamp: utcTimestamp,
    fact: catFact
  };
  
  // Send JSON response
  console.log('Sending response:', response);
  res.status(200).json(response);
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});