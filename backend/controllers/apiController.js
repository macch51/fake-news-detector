const axios = require('axios');
require('dotenv').config(); // Load environment variables

const { newsApiKey, guardianApiKey } = require('../config/apiKeys');
const { getSimilarityScore } = require('../utils/nlpUtils');

// Extract keywords by removing special characters
function extractKeywords(newsText) {
  if (!newsText || typeof newsText !== 'string') {
    throw new Error('Invalid news text'); // Ensure newsText is a valid string
  }

  const cleanedText = newsText.replace(/[^\w\s]/gi, ''); // Removes special characters
  const keywordsArray = cleanedText.split(/\s+/); // Split into words
  return keywordsArray.slice(0, 5).join(' '); // Return first 5 words
}

// Get the date of last week
function getLastWeekDate() {
  const date = new Date();
  date.setDate(date.getDate() - 7); // Go back 7 days
  return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
}

// Fetch fact-checking results from Google Fact-Check Tools API
async function getFactCheckResults(keywords) {
  const googleApiKey = process.env.GOOGLE_API_KEY; // Load from .env
  const factCheckUrl = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(keywords)}&key=${googleApiKey}`;

  try {
    const response = await axios.get(factCheckUrl);
    return response.data.claims || [];
  } catch (error) {
    console.error('Error fetching fact-check results:', error.message);
    return [];
  }
}

// Fetch articles from The Guardian API
async function getGuardianArticles(keywords) {
  const guardianApiUrl = `https://content.guardianapis.com/search?q=${encodeURIComponent(keywords)}&from-date=${getLastWeekDate()}&api-key=${guardianApiKey}`;

  try {
    const response = await axios.get(guardianApiUrl);
    return processGuardianResponse(response.data); // Use the processing function here
  } catch (error) {
    console.error('Error fetching Guardian articles:', error.message);
    return [];
  }
}

// Fetch articles from NewsAPI
async function getNewsApiArticles(keywords) {
  const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(keywords)}&from=${getLastWeekDate()}&apiKey=${newsApiKey}`;

  try {
    const response = await axios.get(newsApiUrl);
    return processNewsApiResponse(response.data); // Use the processing function here
  } catch (error) {
    console.error('Error fetching NewsAPI articles:', error.message);
    return [];
  }
}

// Main function to check if the news is fake or real
exports.checkNews = async (req, res) => {
  const { articleText } = req.body;

  if (!articleText || typeof articleText !== 'string') {
    return res.status(400).json({ error: 'Article text is required and must be a string' });
  }
  try {
    // Extract keywords
    const keywords = extractKeywords(articleText);

    // Fetch results from multiple sources
    const [factCheckResults, guardianArticles, newsApiArticles] = await Promise.all([
      getFactCheckResults(keywords),
      getGuardianArticles(keywords),
      getNewsApiArticles(keywords),
    ]);

    // Combine all articles for easier processing
    const allArticles = [
      ...factCheckResults.map(result => ({
        title: result.claimReview.title,
        date: result.claimReview.date,
        url: result.claimReview.url,
        source: 'Fact-Check',
        similarityScore: getSimilarityScore(articleText, result.claimReview.title),
      })),
      ...guardianArticles.map(article => ({
        title: article.title,
        url: article.url,
        date: article.date,
        source: 'The Guardian',
        similarityScore: getSimilarityScore(articleText, article.title),
      })),
      ...newsApiArticles.map(article => ({
        title: article.title,
        url: article.url,
        date: article.date,
        source: 'NewsAPI',
        similarityScore: getSimilarityScore(articleText, article.title),
      })),
    ];
    // Check if there's a total match (similarity score close to 1)
    const exactMatch = allArticles.find(article => article.similarityScore >= 0.95);

    if (exactMatch) {
      // Return only the exact match if found
      return res.json({
        isFake: false,
        exactMatch,
      });
    } else {
      // If no exact match, return the top 4 results sorted by similarity score
      const topResults = allArticles
        .sort((a, b) => b.similarityScore - a.similarityScore) // Sort by similarity score in descending order
        .slice(0, 4); // Get top 4 results

      // Determine if news is likely fake based on absence of fact-check results
      const isFake = topResults.length === 0;
      return res.json({
        isFake: isFake,
        topResults,
      });
    }
  } catch (error) {
    console.error('Error checking news:', error.message);
    res.status(500).json({ error: 'An error occurred while checking the news' });
  }
};

// Process responses from The Guardian API
function processGuardianResponse(data) {
  if (data && data.response && data.response.status === 'ok') {
    return data.response.results.map(article => ({
      title: article.webTitle,
      url: article.webUrl,
      publishedAt: article.webPublicationDate,
    }));
  }
  return [];
}

// Process responses from NewsAPI
function processNewsApiResponse(data) {
  if (data && data.status === 'ok') {
    return data.articles.map(article => ({
      title: article.title,
      url: article.url,
      publishedAt: article.publishedAt,
    }));
  }
  return [];
}