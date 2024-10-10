import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [articleText, setArticleText] = useState('');  // Store the pasted news text
  const [loading, setLoading] = useState(false);  // Loader state
  const [results, setResults] = useState([]);  // Store the results from backend
  const [error, setError] = useState('');  // Store any error

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults([]);

    try {
      // Post the article text to the backend API
      const response = await axios.post('http://localhost:3000/api/check-news', { articleText });
      console.log(response.data.results)
      setResults(response.data.results);
    } catch (err) {
      setError('Error fetching news. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Paste a News Article</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Paste the news article here..."
          value={articleText}
          onChange={(e) => setArticleText(e.target.value)}
          rows={10}
          cols={50}
          required
        />
        <br />
        <button type="submit" disabled={loading}>
          {loading ? 'Checking...' : 'Check News'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {results.length > 0 && (
        <div>
          <h2>Results:</h2>
          <ul>
            {results.map((result, index) => (
              <li key={index}>
                <a href={result.url} target="_blank" rel="noopener noreferrer">
                  {result.title} - {result.publishedAt}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;