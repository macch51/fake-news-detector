const axios = require('axios');
const cheerio = require('cheerio');

exports.scrapeWebsite = async (req, res) => {
    const { url } = req.body;
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Scrape articles, adjust this for your target site
        const articles = [];
        $('h2').each((index, element) => {
            articles.push($(element).text());
        });

        res.json({ articles });
    } catch (error) {
        res.status(500).send('Error scraping site');
    }
};