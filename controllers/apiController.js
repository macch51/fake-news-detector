const axios = require('axios');
const { newsApiKey } = require('../config/apiKeys');

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