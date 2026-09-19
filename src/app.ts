import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app: Express = express();

// Allowed CORS origins for development & production
const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:3000',
];

if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in development
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Public directory for static frontend assets
const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir));

// Clean page routes
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/login', (req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'login.html'));
});

app.get('/signup', (req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'signup.html'));
});

app.get('/dashboard', (req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'dashboard.html'));
});

app.get('/forgot-password', (req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'forgot-password.html'));
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'floodwatch-auth-api' });
});

// Neon DB Historical Floods endpoint for Dashboard Table
app.get('/api/historical-floods', async (req: Request, res: Response) => {
  try {
    const { state, limit } = req.query;
    let sql = 'SELECT id, uei, state, districts, start_date, end_date, duration_days, main_cause, human_fatality, human_injured, human_displaced, extent_of_damage, event_source, year FROM historical_flood_events';
    const params: any[] = [];
    if (state && typeof state === 'string' && state.trim() !== '') {
      sql += ' WHERE LOWER(state) LIKE LOWER($1)';
      params.push(`%${state.trim()}%`);
    }
    sql += ' ORDER BY year DESC, id DESC LIMIT ' + Math.min(parseInt(limit as string) || 100, 200);
    const { db } = await import('./config/db');
    const result = await db.query(sql, params);
    res.json({
      success: true,
      total: result.rows.length,
      data: result.rows
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Database query failed' });
  }
});

// Neon DB District Metrics endpoint
app.get('/api/district-metrics', async (req: Request, res: Response) => {
  try {
    const { state } = req.query;
    let sql = 'SELECT id, district_name, state_name, dfsi, percent_flooded_area, human_fatality, population, total_dams_count, total_gross_storage_capacity_mcm, flood_risk_category, flood_severity_score_100 FROM district_flood_metrics';
    const params: any[] = [];
    if (state && typeof state === 'string' && state.trim() !== '') {
      sql += ' WHERE LOWER(state_name) = LOWER($1)';
      params.push(state.trim());
    }
    sql += ' ORDER BY flood_severity_score_100 DESC LIMIT 100';
    const { db } = await import('./config/db');
    const result = await db.query(sql, params);
    res.json({
      success: true,
      total: result.rows.length,
      data: result.rows
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Database query failed' });
  }
});

// Authentication routes
app.use('/api/auth', authRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found.',
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again.',
  });
});

export default app;
