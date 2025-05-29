const axios = require('axios');

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

async function getCityPhotoUrl(city, country) {
  console.log('UNSPLASH_ACCESS_KEY:', UNSPLASH_ACCESS_KEY ? UNSPLASH_ACCESS_KEY.slice(0, 4) + '...' : 'NOT SET');
  if (!UNSPLASH_ACCESS_KEY) {
    console.error('UNSPLASH_ACCESS_KEY is not set in .env');
    return null;
  }
  if (!city || !country) {
    console.error('City and country are required parameters. Received:', { city, country });
    return null;
  }
  const query = `${city} ${country}`;
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_ACCESS_KEY}&orientation=landscape&per_page=1`;
  try {
    const response = await axios.get(url);
    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0].urls.regular;
    }
    return null;
  } catch (error) {
    console.error('Error fetching Unsplash photo:', error.message);
    return null;
  }
}

module.exports = { getCityPhotoUrl }; 