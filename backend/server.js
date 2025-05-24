import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { ADZUNA_CONFIG } from './config/adzuna.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Adzuna API base URL
const ADZUNA_BASE_URL = 'http://api.adzuna.com/v1/api/jobs/gb/search/1';

// Jobs endpoint
app.get('/api/jobs', async (req, res) => {
  try {
    // Get parameters from request query
    const { what = 'developer', where = 'new york' } = req.query;

    // Basic test parameters
    const params = {
      app_id: ADZUNA_CONFIG.APP_ID,
      app_key: ADZUNA_CONFIG.API_KEY,
      results_per_page: 20,
      what,
      where
    };

    // Log the full URL for debugging
    const fullUrl = `${ADZUNA_BASE_URL}?${new URLSearchParams(params).toString()}`;
    console.log('Making request to Adzuna API:', fullUrl);

    // Make request to Adzuna API
    const response = await axios({
      method: 'get',
      url: ADZUNA_BASE_URL,
      params: params,
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log('Adzuna API response status:', response.status);
    console.log('Response data:', response.data);

    // Return the response data
    res.json(response.data);
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });

    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch jobs',
      details: error.response?.data || error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 