import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const DASHBOARD_VIEWS_FILE = 'dashboard_views.json';
const ALERTS_FILE = 'alerts.json';
const HYPERLOCAL_DATA_FILE = 'public/data/hyperlocal-data.json';

// Load hyperlocal data
function loadHyperlocalData() {
  try {
    if (fs.existsSync(HYPERLOCAL_DATA_FILE)) {
      const data = fs.readFileSync(HYPERLOCAL_DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading hyperlocal data:', error);
  }
  return [];
}

// Save hyperlocal data
function saveHyperlocalData(data) {
  try {
    fs.writeFileSync(HYPERLOCAL_DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving hyperlocal data:', error);
    return false;
  }
}

// API endpoint to get hyperlocal data
app.get('/api/hyperlocal-data', (req, res) => {
  try {
    const data = loadHyperlocalData();
    
    // Add real-time timestamp
    const updatedData = data.map(location => ({
      ...location,
      timestamp: new Date().toISOString(),
      // Simulate slight variations for real-time feel
      sales: Math.floor(location.sales * (0.95 + Math.random() * 0.1)),
      conversions: Math.floor(location.conversions * (0.95 + Math.random() * 0.1)),
      impressions: Math.floor(location.impressions * (0.95 + Math.random() * 0.1))
    }));
    
    console.log(`📍 Serving hyperlocal data for ${updatedData.length} locations`);
    res.json(updatedData);
  } catch (error) {
    console.error('Error fetching hyperlocal data:', error);
    res.status(500).json({ error: 'Failed to fetch hyperlocal data' });
  }
});

// API endpoint to update specific location data
app.patch('/api/hyperlocal-data/:pincode', (req, res) => {
  try {
    const { pincode } = req.params;
    const updates = req.body;
    
    const data = loadHyperlocalData();
    const locationIndex = data.findIndex(loc => loc.pincode === pincode);
    
    if (locationIndex === -1) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    // Update the location data
    data[locationIndex] = {
      ...data[locationIndex],
      ...updates,
      timestamp: new Date().toISOString()
    };
    
    if (saveHyperlocalData(data)) {
      console.log(`📍 Updated data for ${pincode}: ${Object.keys(updates).join(', ')}`);
      res.json({ success: true, data: data[locationIndex] });
    } else {
      res.status(500).json({ error: 'Failed to save data' });
    }
  } catch (error) {
    console.error('Error updating hyperlocal data:', error);
    res.status(500).json({ error: 'Failed to update hyperlocal data' });
  }
});

// API endpoint to add new location
app.post('/api/hyperlocal-data', (req, res) => {
  try {
    const newLocation = req.body;
    
    if (!newLocation.pincode || !newLocation.neighborhood) {
      return res.status(400).json({ error: 'PIN code and neighborhood are required' });
    }
    
    const data = loadHyperlocalData();
    
    // Check if location already exists
    const existingLocation = data.find(loc => loc.pincode === newLocation.pincode);
    if (existingLocation) {
      return res.status(409).json({ error: 'Location already exists' });
    }
    
    // Add timestamp and default values
    const locationData = {
      ...newLocation,
      timestamp: new Date().toISOString(),
      sales: newLocation.sales || 0,
      impressions: newLocation.impressions || 0,
      conversions: newLocation.conversions || 0,
      conversionRate: newLocation.conversionRate || 0,
      avgOrderValue: newLocation.avgOrderValue || 0,
      productsSold: newLocation.productsSold || 0,
      topProducts: newLocation.topProducts || [],
      demographics: newLocation.demographics || [],
      timeOfDay: newLocation.timeOfDay || []
    };
    
    data.push(locationData);
    
    if (saveHyperlocalData(data)) {
      console.log(`📍 Added new location: ${newLocation.neighborhood} (${newLocation.pincode})`);
      res.status(201).json({ success: true, data: locationData });
    } else {
      res.status(500).json({ error: 'Failed to save data' });
    }
  } catch (error) {
    console.error('Error adding hyperlocal data:', error);
    res.status(500).json({ error: 'Failed to add hyperlocal data' });
  }
});

// Example: Calculate average, sum, count, unique, group by
app.post('/api/analyze', (req, res) => {
  const { data, question } = req.body;
  if (!data || !Array.isArray(data) || data.length === 0) {
    return res.json({ answer: 'No data provided.' });
  }

  // Average
  const avgMatch = question.match(/average of ([\w\s]+)/i);
  if (avgMatch) {
    const col = avgMatch[1].trim();
    const nums = data.map(row => Number(row[col])).filter(x => !isNaN(x));
    if (nums.length === 0) return res.json({ answer: `No numeric data found in column "${col}".` });
    const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
    return res.json({ answer: `The average of ${col} is ${avg}.` });
  }

  // Sum
  const sumMatch = question.match(/sum of ([\w\s]+)/i);
  if (sumMatch) {
    const col = sumMatch[1].trim();
    const nums = data.map(row => Number(row[col])).filter(x => !isNaN(x));
    if (nums.length === 0) return res.json({ answer: `No numeric data found in column "${col}".` });
    const sum = nums.reduce((a, b) => a + b, 0);
    return res.json({ answer: `The sum of ${col} is ${sum}.` });
  }

  // Count unique
  const uniqueMatch = question.match(/unique values? in column ([\w\s]+)/i);
  if (uniqueMatch) {
    const col = uniqueMatch[1].trim();
    const unique = [...new Set(data.map(row => row[col]))];
    return res.json({ answer: `Unique values in column "${col}": ${unique.join(', ')}` });
  }

  // Fallback
  return res.json({ answer: 'Sorry, I can only answer average, sum, and unique value questions for now.' });
});

// Forecast endpoint: expects { data: [{date, value}], periods: number }
app.post('/api/forecast', (req, res) => {
  const { data, periods } = req.body;
  if (!data || !Array.isArray(data) || data.length < 2) {
    return res.status(400).json({ error: 'Not enough data for forecasting.' });
  }
  const py = spawn('python', ['forecast.py']);
  let result = '';
  let error = '';
  py.stdin.write(JSON.stringify({ data, periods: periods || 5 }));
  py.stdin.end();
  py.stdout.on('data', d => { result += d.toString(); });
  py.stderr.on('data', d => { error += d.toString(); });
  py.on('close', code => {
    if (code !== 0 || error) {
      return res.status(500).json({ error: error || 'Python script error.' });
    }
    try {
      const forecast = JSON.parse(result);
      res.json({ forecast });
    } catch (e) {
      res.status(500).json({ error: 'Failed to parse forecast result.' });
    }
  });
});

// Save dashboard view
app.post('/api/save-dashboard', (req, res) => {
  const view = req.body;
  let views = [];
  if (fs.existsSync(DASHBOARD_VIEWS_FILE)) {
    try {
      views = JSON.parse(fs.readFileSync(DASHBOARD_VIEWS_FILE, 'utf-8'));
    } catch {}
  }
  views.push({ ...view, savedAt: new Date().toISOString() });
  fs.writeFileSync(DASHBOARD_VIEWS_FILE, JSON.stringify(views, null, 2));
  res.json({ success: true });
});

// Load latest dashboard view
app.get('/api/load-dashboard', (req, res) => {
  if (!fs.existsSync(DASHBOARD_VIEWS_FILE)) {
    return res.json({ view: null });
  }
  try {
    const views = JSON.parse(fs.readFileSync(DASHBOARD_VIEWS_FILE, 'utf-8'));
    const latest = views.length > 0 ? views[views.length - 1] : null;
    res.json({ view: latest });
  } catch {
    res.status(500).json({ error: 'Failed to load dashboard views.' });
  }
});

// Save alert
app.post('/api/alerts', (req, res) => {
  const alert = req.body;
  let alerts = [];
  if (fs.existsSync(ALERTS_FILE)) {
    try {
      alerts = JSON.parse(fs.readFileSync(ALERTS_FILE, 'utf-8'));
    } catch {}
  }
  alerts.push({ ...alert, savedAt: new Date().toISOString() });
  fs.writeFileSync(ALERTS_FILE, JSON.stringify(alerts, null, 2));
  // TODO: Add email/SMS notification integration here if needed
  res.json({ success: true });
});

// Get all alerts
app.get('/api/alerts', (req, res) => {
  if (!fs.existsSync(ALERTS_FILE)) {
    return res.json({ alerts: [] });
  }
  try {
    const alerts = JSON.parse(fs.readFileSync(ALERTS_FILE, 'utf-8'));
    res.json({ alerts });
  } catch {
    res.status(500).json({ error: 'Failed to load alerts.' });
  }
});

app.listen(3001, () => console.log('Backend running on http://localhost:3001')); 