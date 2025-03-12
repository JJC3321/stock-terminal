import { useState, useEffect } from 'react';
import axios from 'axios';

export const useStockChart = (symbol, period) => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStockData = async () => {
            try {
                const response = await axios.get(
                    `http://127.0.0.1:8000/api/stock/${symbol}/?period=${period}`
                );
                
                const data = response.data;
                
                setChartData({
                    labels: data.dates,
                    datasets: [
                        {
                            label: `${symbol} Stock Price`,
                            data: data.prices,
                            fill: false,
                            borderColor: '#4CAF50',
                            tension: 0.1,
                            pointRadius: 0,
                            borderWidth: 2
                        }
                    ]
                });
                
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        if (symbol) {
            fetchStockData();
        }
    }, [symbol, period]);

    return { chartData, loading, error};
};
