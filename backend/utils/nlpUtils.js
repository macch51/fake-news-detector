const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

function getSimilarityScore(pastedNews, verifiedNews) {
    const pastedTokens = tokenizer.tokenize(pastedNews);
    const verifiedTokens = tokenizer.tokenize(verifiedNews);

    // Calculate similarity using Jaro-Winkler Distance
    const distance = natural.JaroWinklerDistance(pastedTokens.join(' '), verifiedTokens.join(' '));
    return distance; // Score between 0 (no similarity) to 1 (exact match)
}

module.exports = { getSimilarityScore };