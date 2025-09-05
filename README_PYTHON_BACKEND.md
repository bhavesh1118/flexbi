# FlexBI Python Backend

This is the Python backend for the FlexBI Analytics Platform, converted from the original Node.js implementation. It provides all the same functionality with improved performance and easier deployment.

## Features

- 🚀 **FastAPI Framework** - High-performance async API framework
- 📊 **Data Analysis** - Natural language queries for data analysis
- 🔮 **Forecasting** - Time series forecasting with Prophet/ARIMA
- 🗺️ **Hyperlocal Analytics** - Location-based data management
- 📱 **Dashboard Management** - Save and load dashboard configurations
- 🔔 **Alerts System** - Custom alerts with notifications
- 📚 **Auto-Documentation** - Interactive API docs at `/docs`

## Requirements

- Python 3.8 or higher
- pip (Python package installer)

## Quick Start

### Option 1: Automated Setup (Recommended)

**Windows:**
```bash
# Run the batch file
start-python-server.bat

# Or for development mode with auto-reload
start-python-dev.bat
```

**PowerShell:**
```powershell
# Run the PowerShell script
.\start-python-server.ps1
```

### Option 2: Manual Setup

1. **Create virtual environment:**
```bash
python -m venv venv
```

2. **Activate virtual environment:**

Windows:
```bash
venv\Scripts\activate
```

Linux/Mac:
```bash
source venv/bin/activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Start the server:**
```bash
python server.py
```

### Option 3: Using Setup Script

```bash
python setup_python_backend.py
python server.py
```

## Development Mode

For development with auto-reload:
```bash
uvicorn server:app --host 0.0.0.0 --port 3001 --reload
```

## API Endpoints

### Health Check
- `GET /` - Server health check

### Hyperlocal Data
- `GET /api/hyperlocal-data` - Get all hyperlocal data with real-time variations
- `POST /api/hyperlocal-data` - Add new location data
- `PATCH /api/hyperlocal-data/{pincode}` - Update specific location data

### Data Analysis
- `POST /api/analyze` - Natural language data analysis queries

### Forecasting
- `POST /api/forecast` - Generate time series forecasts

### Dashboard Management
- `GET /api/load-dashboard` - Load latest dashboard configuration
- `POST /api/save-dashboard` - Save dashboard configuration

### Alerts
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create new alert

## API Documentation

Once the server is running, visit:
- **Interactive API Docs**: http://localhost:3001/docs
- **ReDoc Documentation**: http://localhost:3001/redoc

## Data Analysis Capabilities

The `/api/analyze` endpoint supports natural language queries:

- **Averages**: "What is the average of sales?"
- **Sums**: "What is the sum of revenue?"
- **Unique Values**: "Show unique values in column category"

## Forecasting

The forecasting endpoint uses:
1. **Prophet** (preferred) - Facebook's time series forecasting tool
2. **ARIMA** (fallback) - Traditional statistical forecasting

Input format:
```json
{
  "data": [
    {"date": "2024-01-01", "value": 100},
    {"date": "2024-01-02", "value": 120}
  ],
  "periods": 5
}
```

## File Structure

```
├── server.py                 # Main FastAPI application
├── forecast.py              # Forecasting script (unchanged)
├── requirements.txt         # Python dependencies
├── setup_python_backend.py # Setup script
├── start-python-server.bat # Windows batch startup
├── start-python-server.ps1 # PowerShell startup
├── start-python-dev.bat    # Development mode startup
└── README_PYTHON_BACKEND.md # This file
```

## Dependencies

- **FastAPI**: Modern, fast web framework
- **Uvicorn**: ASGI server for FastAPI
- **Pydantic**: Data validation using Python type annotations
- **Pandas**: Data manipulation and analysis
- **Prophet**: Time series forecasting (optional)
- **Statsmodels**: Statistical models (fallback for forecasting)

## Differences from Node.js Version

### Improvements
- ✅ **Better Performance**: Async/await support with FastAPI
- ✅ **Type Safety**: Full type hints with Pydantic models
- ✅ **Auto Documentation**: Built-in Swagger/OpenAPI docs
- ✅ **Better Error Handling**: Structured error responses
- ✅ **Input Validation**: Automatic request validation

### Compatibility
- ✅ **Same API Endpoints**: All original endpoints preserved
- ✅ **Same Response Format**: JSON responses identical
- ✅ **Same Functionality**: All features maintained
- ✅ **Same Port**: Runs on port 3001 by default

## Troubleshooting

### Common Issues

1. **Python not found**
   - Install Python 3.8+ from https://python.org
   - Ensure Python is in your PATH

2. **Prophet installation fails**
   - The system will automatically fall back to statsmodels
   - For Prophet support on Windows, you may need Visual Studio Build Tools

3. **Port 3001 already in use**
   - Change the port in `server.py`: `uvicorn.run(app, host="0.0.0.0", port=3002)`
   - Or kill the existing process

4. **Virtual environment issues**
   - Delete the `venv` folder and run setup again
   - Ensure you have sufficient permissions

### Performance Tips

1. **Use development mode** only during development
2. **Use virtual environments** to avoid dependency conflicts
3. **Monitor memory usage** for large datasets
4. **Use appropriate forecasting periods** (not too large)

## Migration from Node.js

If you're migrating from the Node.js backend:

1. **Stop the Node.js server** (`server.js`)
2. **Start the Python server** using any of the methods above
3. **Update frontend** if necessary (should work without changes)
4. **Test all endpoints** to ensure compatibility

The Python backend is designed to be a drop-in replacement for the Node.js version.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the FlexBI Analytics Platform.
