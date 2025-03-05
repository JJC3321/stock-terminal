import './App.css';
import { useState } from 'react';
import StockChart from './components/StockChart';
import SearchBar from './components/SearchBar';
import TimeSelector from './components/TimeSelector';

function App() {
  const [currentSymbol, setCurrentSymbol] = useState('AAPL');
  const [timePeriod, setTimePeriod] = useState('1D');

  const handleSearch = (symbol) => {
    setCurrentSymbol(symbol);
  };

  const handleTimeChange = (period) => {
    setTimePeriod(period);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>{currentSymbol}</h1>
        <SearchBar onSearch={handleSearch} />
        <TimeSelector onTimeChange={handleTimeChange} selectedPeriod={timePeriod} />
        <StockChart symbol={currentSymbol} period={timePeriod} />
      </header>
    </div>
  );
}

export default App;
