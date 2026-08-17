import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [message, setMessage] = useState<string>('Loading...');

  useEffect(() => {
    // Backend API endpoint එකට request එකක් යැවීම
    axios.get('http://localhost:8080/api/test')
      .then((response) => {
        setMessage(response.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setMessage('Backend Connection Failed!');
      });
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
      <h1>LMS Project - Phase 01 Test</h1>
      <p>Backend Response: <strong>{message}</strong></p>
    </div>
  );
}

export default App;