import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data.content);
      } else {
        setError(data.error || 'An unknown error occurred.');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h1>Vercel Voyage CTF</h1>
      <p>Enter a URL to fetch its content. Can you find the hidden flag?</p>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL (e.g., https://example.com)"
          style={{ width: '70%', padding: '10px', marginRight: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          required
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '10px 15px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? 'Fetching...' : 'Fetch URL'}
        </button>
      </form>

      {error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', border: '1px solid red', borderRadius: '4px', backgroundColor: '#ffecec' }}>
          Error: {error}
        </div>
      )}

      {result && (
        <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '4px', backgroundColor: '#f9f9f9', whiteSpace: 'pre-wrap', maxHeight: '400px', overflowY: 'auto' }}>
          <h2>Result:</h2>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}
