import sys
import json
import pandas as pd

try:
    from prophet import Prophet
except ImportError:
    Prophet = None
    import warnings
    warnings.warn('Prophet not installed. Will use ARIMA fallback.')
    from statsmodels.tsa.arima.model import ARIMA

# Read input from stdin
input_data = sys.stdin.read()
params = json.loads(input_data)
data = params['data']
periods = params.get('periods', 5)

# Prepare DataFrame
df = pd.DataFrame(data)
df['date'] = pd.to_datetime(df['date'])
df = df.sort_values('date')

# Prophet expects columns 'ds' and 'y'
df_prophet = df.rename(columns={'date': 'ds', 'value': 'y'})[['ds', 'y']]

forecast_result = []

if Prophet is not None:
    # Use Prophet
    m = Prophet()
    m.fit(df_prophet)
    future = m.make_future_dataframe(periods=periods, freq='D')
    forecast = m.predict(future)
    # Only return the forecasted periods
    forecast_tail = forecast.tail(periods)
    for _, row in forecast_tail.iterrows():
        forecast_result.append({'date': row['ds'].strftime('%Y-%m-%d'), 'value': float(row['yhat'])})
else:
    # Fallback: ARIMA
    df_arima = df.set_index('date').asfreq('D')
    df_arima['value'] = df_arima['value'].interpolate()
    model = ARIMA(df_arima['value'], order=(1,1,1))
    model_fit = model.fit()
    forecast = model_fit.forecast(steps=periods)
    last_date = df_arima.index[-1]
    for i, val in enumerate(forecast):
        next_date = last_date + pd.Timedelta(days=i+1)
        forecast_result.append({'date': next_date.strftime('%Y-%m-%d'), 'value': float(val)})

print(json.dumps(forecast_result)) 