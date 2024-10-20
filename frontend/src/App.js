import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [articleText, setArticleText] = useState(''); // Store pasted news
  const [loading, setLoading] = useState(false); // Loading state
  const [results, setResults] = useState(null); // Store backend response
  const [isFake, setIsFake] = useState(null); // Store whether news is fake or not
  const [error, setError] = useState(''); // Store errors

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);
    setIsFake(null);

    try {
      const response = await axios.post('http://localhost:3000/api/check-news', { articleText });
      const { exactMatch, topResults, isFake } = response.data;

      setIsFake(isFake); // Set if news is fake or real
      if (exactMatch) {
        setResults([exactMatch]); // Show exact match only
      } else if (topResults) {
        setResults(topResults); // Show top 4 results
      }
    } catch (err) {
      setError('Error fetching news. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">
          <div className="card shadow">
            <div className="card-body">
              <h1 className="text-center mb-4">Fake News Detector</h1>

              <form onSubmit={handleSubmit} className="mb-4">
                <div className="form-group">
                  <label htmlFor="articleText" className="form-label">
                    Paste a News Article:
                  </label>
                  <textarea
                    id="articleText"
                    value={articleText}
                    onChange={(e) => setArticleText(e.target.value)}
                    className="form-control"
                    rows="6"
                    placeholder="Paste the news article here..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-block mt-3"
                  disabled={loading}
                >
                  {loading ? 'Checking...' : 'Check News'}
                </button>
              </form>

              {error && <div className="alert alert-danger text-center">{error}</div>}

              {isFake !== null && (
                <div className="alert text-center mt-4">
                  {isFake ? (
                    <div className="alert alert-danger">
                      <strong>This news is likely fake.</strong>
                    </div>
                  ) : (
                    <div className="alert alert-success">
                      <strong>This news appears to be real.</strong>
                    </div>
                  )}
                </div>
              )}

              {results && results.length > 0 && (
                <div className="mt-4">
                  <h2 className="text-center">
                    {results.length === 1 ? 'Exact Match Found' : 'Top Related Articles'}
                  </h2>
                  <ul className="list-group mt-3">
                    {results.map((result, index) => (
                      <li key={index} className="list-group-item">
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary font-weight-bold"
                        >
                          {result.title}
                        </a>
                        <p className="mb-0 text-muted small">{result.source}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;