const TimeSelector = ({ onTimeChange, selectedPeriod }) => {
    const periods = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y', 'MAX'];

    return (
        <div style={{ margin: '20px 0' }}>
            {periods.map((period) => (
                <button
                    key={period}
                    onClick={() => onTimeChange(period)}
                    style={{
                        margin: '0 5px',
                        padding: '8px 16px',
                        backgroundColor: selectedPeriod === period ? '#4CAF50' : '#f0f0f0',
                        color: selectedPeriod === period ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    {period}
                </button>
            ))}
        </div>
    );
};

export default TimeSelector; 