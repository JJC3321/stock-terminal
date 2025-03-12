import React, { useRef, useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useStockChart } from '../hooks/chart';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const StockChart = ({ symbol, period }) => {
    const { chartData, loading, error } = useStockChart(symbol, period);
    const chartRef = useRef(null);
    const [dragStart, setDragStart] = useState(null);
    const [dragEnd, setDragEnd] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [percentageChange, setPercentageChange] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [startPrice, setStartPrice] = useState(null);
    const [endPrice, setEndPrice] = useState(null);

    // Reset drag state when chart data changes
    useEffect(() => {
        setDragStart(null);
        setDragEnd(null);
        setIsDragging(false);
        setPercentageChange(null);
        setStartPrice(null);
        setEndPrice(null);
        calculatePercentageChange(null, null);
    }, [chartData]);

    const calculatePercentageChange = (startIndex, endIndex) => {
        if (!chartData || !chartData.datasets || chartData.datasets.length === 0) return null;
        if (startIndex === null || endIndex === null || startIndex === endIndex) return null;
        
        const prices = chartData.datasets[0].data;
        const startValue = prices[startIndex];
        const endValue = prices[endIndex];
        
        setStartPrice(startValue);
        setEndPrice(endValue);
        
        return ((endValue - startValue) / startValue * 100).toFixed(2);
    };

    const handleMouseDown = (event) => {
        if (!chartRef.current) return;
        
        const chart = chartRef.current;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const xAxis = chart.scales.x;
        const index = Math.round(xAxis.getValueForPixel(x));
        
        if (index >= 0 && index < chartData.labels.length) {
            setDragStart(index);
            setDragEnd(index);
            setIsDragging(true);
            setTooltipPosition({ x, y });
        }
    };

    const handleMouseMove = (event) => {
        if (!isDragging || !chartRef.current) return;
        
        const chart = chartRef.current;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const xAxis = chart.scales.x;
        const index = Math.round(xAxis.getValueForPixel(x));
        
        if (index >= 0 && index < chartData.labels.length) {
            setDragEnd(index);
            setTooltipPosition({ x, y: Math.min(y, 100) }); // Keep tooltip near top of chart
        }
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
            // Keep tooltip visible after drag ends
        }
    };

    const handleMouseLeave = () => {
        if (isDragging) {
            setIsDragging(false);
            // Keep tooltip visible after drag ends
        }
    };

    useEffect(() => {
        if (dragStart !== null && dragEnd !== null) {
            const change = calculatePercentageChange(dragStart, dragEnd);
            setPercentageChange(change);
        }
    }, [dragStart, dragEnd]);

    // Function to format x-axis labels
    const formatXAxisLabels = (labels) => {
        if (period === "5Y" || period === "MAX") {
            return labels.map(label => new Date(label).getFullYear()); // Return only the year
        }
        return labels; // Return original labels for other periods
    };

    // Prepare chart data with formatted x-axis labels
    const getChartDataWithHighlight = () => {
        if (!chartData || !chartData.datasets || chartData.datasets.length === 0) return chartData;

        const newChartData = { ...chartData };
        newChartData.labels = formatXAxisLabels(chartData.labels); // Format x-axis labels
        newChartData.datasets = [...chartData.datasets];
        
        return newChartData;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        scales: {
            x: {
                ticks: {
                    font: {
                        weight: 'bold',
                        size: 14,
                    },
                    autoSkip: true,
                    maxTicksLimit: 8,
                },
                title: {
                    display: false,
                },
            },
            y: {
                ticks: {
                    font: {
                        weight: 'bold',
                        size: 14,
                    },
                },
                title: {
                    display: false,
                },
            },
        },
        plugins: {
            tooltip: {
                enabled: !isDragging && !percentageChange,
                callbacks: {
                    label: function(context) {
                        return `$${context.parsed.y.toFixed(2)}`;
                    }
                }
            },
            legend: {
                display: false
            }
        },
        hover: {
            mode: 'index',
            intersect: false
        }
    };

    if (loading) return (
        <div style={{ width: '800px', height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <p>Loading chart data...</p>
        </div>
    );

    if (error) return (
        <div style={{ width: '800px', height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <p style={{ color: 'red' }}>Error loading chart data</p>
            <p>{error.message || error}</p>
            <button 
                onClick={() => window.location.reload()}
                style={{
                    padding: '8px 16px',
                    marginTop: '10px',
                    cursor: 'pointer',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px'
                }}
            >
                Retry
            </button>
        </div>
    );

    if (!chartData || !chartData.datasets || chartData.datasets.length === 0) return (
        <div style={{ width: '800px', height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <p>No data available for {symbol}</p>
        </div>
    );

    const chartDataWithHighlight = getChartDataWithHighlight();
    const startDate = dragStart !== null ? chartData.labels[dragStart] : null;
    const endDate = dragEnd !== null ? chartData.labels[dragEnd] : null;

    return (
        <div style={{ width: '800px', height: '400px', position: 'relative' }}>
            <div
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                style={{ height: '100%', width: '100%' }}
            >
                <Line ref={chartRef} data={chartDataWithHighlight} options={options} />
            </div>
            
            {percentageChange !== null && startPrice !== null && endPrice !== null && (
                <div style={{
                    position: 'absolute',
                    top: tooltipPosition.y,
                    left: tooltipPosition.x,
                    transform: 'translate(-50%, -120%)',
                    padding: '8px 12px',
                    backgroundColor: 'white',
                    color: 'black',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    zIndex: 10,
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '13px',
                    minWidth: '200px'
                }}>
                    <div style={{ 
                        color: parseFloat(percentageChange) >= 0 ? 'green' : 'red',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        marginBottom: '3px'
                    }}>
                        {parseFloat(percentageChange) >= 0 ? '+' : ''}{percentageChange}%
                    </div>
                    <div>${startPrice.toFixed(2)} - ${endPrice.toFixed(2)}</div>
                    <div style={{ 
                        fontSize: '12px', 
                        color: '#666',
                        marginTop: '3px' 
                    }}>
                        {formatDate(startDate)} - {formatDate(endDate)}
                    </div>
                    <div style={{ 
                        fontSize: '11px', 
                        color: '#888',
                        marginTop: '5px' 
                    }}>
                        Volume: {Math.floor(Math.random() * 100000)}-{Math.floor(Math.random() * 100000 + 100000)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockChart;