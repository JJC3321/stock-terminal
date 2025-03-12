import './App.css';
import { useState, useEffect } from 'react';
import StockChart from './components/StockChart';
import SearchBar from './components/SearchBar';
import TimeSelector from './components/TimeSelector';
import axios from 'axios'; // Import axios for fetching data

function App() {
  const [currentSymbol, setCurrentSymbol] = useState('AAPL');
  const [timePeriod, setTimePeriod] = useState('1D');
  const [price, setPrice] = useState(null); // State for current price

  const handleSearch = (symbol) => {
    setCurrentSymbol(symbol);
  };

  const handleTimeChange = (period) => {
    setTimePeriod(period);
  };

  // Fetch current price whenever the currentSymbol changes
  useEffect(() => {
    const fetchCurrentPrice = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/stock/${currentSymbol}/current-price`); // Adjust the API endpoint as needed
        setPrice(response.data.price); // Assuming the API returns an object with a price property
      } catch (error) {
        console.error('Error fetching current price:', error);
        setPrice(null); // Reset price on error
      }
    };

    fetchCurrentPrice();
  }, [currentSymbol]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>{currentSymbol} {price !== null ? `$${price.toFixed(2)}` : 'Loading...'}</h1>
        <SearchBar onSearch={handleSearch} />
        <TimeSelector onTimeChange={handleTimeChange} selectedPeriod={timePeriod} />
        <StockChart symbol={currentSymbol} period={timePeriod} />
      </header>
    </div>
  );
}

export default App;
