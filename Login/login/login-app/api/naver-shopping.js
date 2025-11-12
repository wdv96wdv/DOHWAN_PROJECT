
import axios from 'axios';

// Vercel will automatically load environment variables.
// dotenv.config() is not needed in this context.

// Helper to apply CORS middleware
const allowCors = (fn) => async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  // Allow requests from any origin. For better security, you might want to restrict this
  // to your frontend's domain in production.
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS requests for pre-flight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Call the actual handler
  return await fn(req, res);
};

const handler = async (req, res) => {
  // Vercel automatically parses the query string.
  const { query, display = 9, start = 1 } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  // Check for Naver API credentials in environment variables
  if (!process.env.NAVER_CLIENT_ID || !process.env.NAVER_CLIENT_SECRET) {
    console.error('Naver API credentials are not set in environment variables.');
    return res.status(500).json({ error: 'Server configuration error: API credentials missing.' });
  }

  try {
    // Make the request to the Naver Shopping API
    const response = await axios.get('https://openapi.naver.com/v1/search/shop.json', {
      params: { query, display, start },
      headers: {
        'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET,
      },
    });
    
    // Send the successful response back to the client
    res.status(200).json(response.data);
  } catch (error) {
    // Log the error for debugging
    console.error('Error calling Naver API:', error.response ? error.response.data : error.message);
    
    // Send an error response back to the client
    res.status(error.response ? error.response.status : 500).json({ error: 'Failed to fetch data from Naver API.' });
  }
};

// Export the wrapped handler
export default allowCors(handler);
