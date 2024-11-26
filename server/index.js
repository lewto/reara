import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const __dirname = dirname(fileURLToPath(import.meta.url));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'greatrace-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Mock data for development
const mockResults = [
  {
    position: '1st Place',
    driverName: 'Max Verstappen',
    trackName: 'Daytona International Speedway',
    date: new Date().toLocaleDateString(),
    lapTime: '1:43.567',
    carName: 'Red Bull Racing RB19',
    seriesName: 'FORMULA 1 WORLD CHAMPIONSHIP'
  }
];

// API Routes
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    req.session.isAuthenticated = true;
    res.json({ success: true });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
});

app.get('/api/recent-races', (req, res) => {
  if (!req.session.isAuthenticated) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(mockResults);
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});