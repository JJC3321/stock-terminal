import { useState } from 'react';

const SearchBar = ({ onSearch }) => {
    const [symbol, setSymbol] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(symbol.toUpperCase());
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="Enter stock symbol (e.g., AAPL)"
                style={{
                    padding: '8px',
                    marginRight: '8px',
                    fontSize: '16px'
                }}
            />
            <button 
                type="submit"
                style={{
                    padding: '8px 16px',
                    fontSize: '16px',
                    cursor: 'pointer'
                }}
            >
                Search
            </button>
        </form>
    );
};

export default SearchBar; 