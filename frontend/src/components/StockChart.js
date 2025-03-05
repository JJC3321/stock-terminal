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
    Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const StockChart = ({ symbol, period }) => {
    const { chartData, loading, error } = useStockChart(symbol, period);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `$${context.parsed.y.toFixed(2)}`;
                    }
                }
            },
            legend: {
                display: false // Hide the legend since we only have one line
            }
        },
        hover: {
            mode: 'index',
            intersect: false
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!chartData) return <div>No data available</div>;

    return (
        <div style={{ width: '800px', height: '400px' }}>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default StockChart; 