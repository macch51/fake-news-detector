const axios = require('axios');
const { newsApiKey } = require('../config/apiKeys');
const { guardianApiKey } = require('../config/apiKeys');

exports.getNews = async (req, res) => {
    const query = req.query.q
    //Calculate the date 7 days ago from today
    const date = new Date();
    const oneWeekAgo = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);
    const formattedDate = oneWeekAgo.toISOString().split('T')[0];
    try {
        const response = await axios.get(`https://newsapi.org/v2/everything?q=${query}&from=${formattedDate}&apiKey=${newsApiKey}`);
        res.json(response.data.articles);
    } catch (error) {
        console.log(error)
        res.status(500).send('Error fetching news');
    }
};


/*
exports.checkNews = async (req, res) => {
    const { articleText } = req.body;
    if (!articleText) {
        return res.status(400).json({ error: 'Article text is required' });
    }

    try {
        const keywords = extractKeywords(articleText);

        const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(keywords)}&from=${getLastWeekDate()}&apiKey=${newsApiKey}`;
        const newsApiResponse = await axios.get(newsApiUrl);

        const guardianApiUrl = `https://content.guardianapis.com/search?q=${encodeURIComponent(keywords)}&from-date=${getLastWeekDate()}&api-key=${guardianApiKey}`;
        console.log(guardianApiUrl)
        const guardianApiResponse = await axios.get(guardianApiUrl);

        const allResults = [...newsApiResponse.data.articles, ...guardianApiResponse.data.response.results];

        res.status(200).json({ results: allResults });
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Error fetching news' });
    }
};*/

exports.checkNews = async (req, res) => {
    const { articleText } = req.body;
    if (!articleText) {
        return res.status(400).json({ error: 'Article text is required' });
    }
    try {
        const keywords = extractKeywords(articleText);

        const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(keywords)}&from=${getLastWeekDate()}&apiKey=${newsApiKey}`;
        const guardianApiUrl = `https://content.guardianapis.com/search?q=${encodeURIComponent(keywords)}&from-date=${getLastWeekDate()}&api-key=${guardianApiKey}`;
        
      const newsApiResponse = await axios.get(newsApiUrl);
      const guardianResponse = await axios.get(guardianApiUrl);
      
      // Process both responses
      const guardianArticles = processGuardianResponse(guardianResponse.data);
      const newsApiArticles = processNewsApiResponse(newsApiResponse.data);
      
      // Combine the articles
      const combinedArticles = [...guardianArticles, ...newsApiArticles];
  
      // Display or process the combined articles
      console.log(JSON.stringify({ results: combinedArticles }, null, 2));
      res.status(200).json({ results: combinedArticles });

    } catch (error) {
      console.error('Error fetching news:', error);
    }
  }
  
function processGuardianResponse(data) {
    if (data && data.response && data.response.status === 'ok') {
      const articles = data.response.results.map(article => {
        return {
          title: article.webTitle,
          url: article.webUrl,
          publishedAt: article.webPublicationDate
        };
      });
      return articles;
    } else {
      return [];
    }
  }

  function processNewsApiResponse(data) {
    if (data && data.status === 'ok') {
      const articles = data.articles.map(article => {
        return {
          title: article.title,
          url: article.url,
          publishedAt: article.publishedAt
        };
      });
      return articles;
    } else {
      return [];
    }
  }

function extractKeywords(text) {
    // Remove all special characters (except letters and spaces)
    const cleanedText = text.replace(/[^\w\s]/gi, ''); // Removes non-word characters
    // Split the text into individual words
    const words = cleanedText.split(/\s+/);
    
    // Return an array of the words
    return words;
  }
function getLastWeekDate() {
    const today = new Date();
    const lastWeek = new Date(today.setDate(today.getDate() - 7));
    return lastWeek.toISOString().split('T')[0];
}