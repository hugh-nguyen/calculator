import React, { useState } from 'react';
import './App.css';

function App() {
  const [operation, setOperation] = useState('add');
  const [firstNumber, setFirstNumber] = useState('');
  const [secondNumber, setSecondNumber] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

  const calculate = (event) => {
    event.preventDefault(); // Prevent the form from refreshing the page
    setError(''); // Clear previous errors

    // Validate input
    if (firstNumber === '' || secondNumber === '') {
      setError('Please fill in both numbers.');
      return;
    }

    // Encode the parameters to be included in the URL
    const params = new URLSearchParams({
      operation,
      first: firstNumber,
      second: secondNumber,
    });

    // Fetch request to the backend
    console.log(`${backendUrl}/api/calculate`)
    fetch(`${backendUrl}/api/calculate?${params}`)
      .then(response => response.json())
      .then(data => {
        if (data.status && data.status !== 200) {
          // Handle any responses that are not status 200 OK
          setError(data.message || 'An error occurred');
        } else {
          // Set the result state if the response is OK
          setResult(data);
        }
      })
      .catch((fetchError) => {
        setError(`Error: ${fetchError.message}`);
      });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>Calculator</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={calculate}>
          <div>
            <label>First Number:</label>
            <input
              type="number"
              value={firstNumber}
              onChange={(e) => setFirstNumber(e.target.value)}
            />
          </div>
          <div>
            <label>Second Number:</label>
            <input
              type="number"
              value={secondNumber}
              onChange={(e) => setSecondNumber(e.target.value)}
            />
          </div>
          <div>
            <label>Operation:</label>
            <select value={operation} onChange={(e) => setOperation(e.target.value)}>
              <option value="add">Add</option>
              <option value="subtract">Subtract</option>
              <option value="multiply">Multiply</option>
              <option value="divide">Divide</option>
            </select>
          </div>
          <button type="submit">Calculate</button>
        </form>
        {result !== null && (
          <p className="result">Result: {result}</p>
        )}
      </header>
    </div>
  );
}

export default App;
