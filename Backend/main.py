import yfinance as yf
from fastapi import FastAPI, HTTPException, Query
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/api/stock/{symbol}")
def get_stock_historical(symbol: str, period: str = Query("1D")):
    try:
        ticker = yf.Ticker(symbol)
        
        # Define period and interval mappings
        period_mappings = {
            "1D": ("1d", "1m"),
            "5D": ("5d", "15m"),
            "1M": ("1mo", "1h"),
            "6M": ("6mo", "1d"),
            "YTD": ("ytd", "1d"),
            "1Y": ("1y", "1d"),
            "5Y": ("5y", "1wk"),
            "MAX": ("max", "1mo")
        }
        
        if period not in period_mappings:
            raise HTTPException(status_code=400, detail="Invalid period")
            
        period_val, interval = period_mappings[period]
        stock_historical = ticker.history(period=period_val, interval=interval)
        
        if stock_historical.empty:
            raise HTTPException(status_code=404, detail=f"No data found for symbol {symbol}")
        
        # Format dates based on the period
        if period == "1D":
            # Filter to show only hour marks
            dates = []
            prices = []
            for timestamp, row in stock_historical.iterrows():  # Only keep data points at the start of each hour
                    dates.append(timestamp.strftime('%H:%M'))
                    prices.append(row['Close'])
        elif period == "5D":
            # Filter to show daily marks
            dates = []
            prices = []
            for timestamp, row in stock_historical.iterrows():
                    dates.append(timestamp.strftime('%m/%d'))
                    prices.append(row['Close'])
        elif period == "1M":
            # Filter to show marks every 5 days
            dates = []
            prices = []
            last_date = None
            for timestamp, row in stock_historical.iterrows():
                    dates.append(timestamp.strftime('%m/%d'))
                    prices.append(row['Close'])
        elif period in ["6M", "YTD", "1Y"]:
            # Filter to show monthly marks with shorter format
            dates = []
            prices = []
            for timestamp, row in stock_historical.iterrows():
                    dates.append(timestamp.strftime('%b'))  # Just month name (e.g., "Jan")
                    prices.append(row['Close'])
        elif period in ["5Y", "MAX"]:
            # Filter to show yearly marks
            dates = []
            prices = []
            current_year = None
            for timestamp, row in stock_historical.iterrows():
                    dates.append(str(timestamp))  # Just the year
                    prices.append(row['Close'])
        else:
            dates = stock_historical.index.strftime('%Y-%m-%d').tolist()
            prices = stock_historical['Close'].tolist()
            
        return {
            "dates": dates,
            "prices": prices,
            "symbol": symbol
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching data for {symbol}: {str(e)}")

@app.get("/api/stock/{symbol}/current-price")
def get_current_price(symbol: str):
    try:
        ticker = yf.Ticker(symbol)
        current_price = ticker.info['regularMarketPrice']
        return {"price": current_price}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching current price for {symbol}: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
