// naver-proxy.js
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();

// Enable CORS for all routes
app.use(cors());

// API proxy for Naver Shopping
app.get('/api/naver-shopping', async (req, res) => {
  const { query, display = 9, start = 1 } = req.query;
  console.log(`Proxy received query: ${query}, display: ${display}, start: ${start}`); // Log received query

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  // Check if API keys are loaded
  if (!process.env.NAVER_CLIENT_ID || !process.env.NAVER_CLIENT_SECRET) {
    console.error('Naver API credentials are not set in .env file.');
    return res.status(500).json({ error: 'Server configuration error: API credentials missing.' });
  }

  try {
    const response = await axios.get('https://openapi.naver.com/v1/search/shop.json', {
      params: { 
        query, 
        display,
        start
      },
      headers: {
        'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET,
      },
    });
    console.log('Data received from Naver API:', response.data); // Log data from Naver
    res.json(response.data);
  } catch (error) {
    console.error('Error calling Naver API:', error.response ? error.response.data : error.message);
    res.status(error.response ? error.response.status : 500).json({ error: 'Failed to fetch data from Naver API.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Naver Shopping proxy server running on http://localhost:${PORT}`);
});
