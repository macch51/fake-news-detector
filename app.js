require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const app = express();
const apiRoutes = require('./routes/apiRoutes'); // Ensure the correct path is used

// Middleware for parsing JSON requests
app.use(express.json()); 

// Use the routes defined in apiRoutes.js
app.use('/api', apiRoutes); // Ensure apiRoutes is correctly mounted

// Define a simple route for testing
app.get('/', (req, res) => {
  res.send('Welcome to Fake News Detector API');
});

// Error handling middleware (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});