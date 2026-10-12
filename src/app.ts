import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/authRoutes';
import { alertNotificationService, FloodAlertData } from './services/alertNotificationService';

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

app.get('/map', (req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'map.html'));
});

app.get('/my-location', (req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'my-location.html'));
});

app.get('/ml-predictor', (req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'ml-predictor.html'));
});

app.get('/historical-db', (req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'historical-db.html'));
});

app.get('/trends', (req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'trends.html'));
});

app.get('/relief-centers', (req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'relief-centers.html'));
});

app.get('/national-alerts', (req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'national-alerts.html'));
});

app.get('/profile', (req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'profile.html'));
});

app.get('/faq', (req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'faq.html'));
});

app.get('/faqs', (req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'faq.html'));
});

app.get('/forgot-password', (req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'forgot-password.html'));
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'floodwatch-auth-api' });
});

// 2024-2026 Recent Documented Historical Flood Events Dataset
const RECENT_HISTORICAL_FLOODS = [
  {
    id: 99001,
    uei: 'UEI-NDMA-FL-2026-0012',
    state: 'Assam',
    districts: 'Cachar, Karimganj, Hailakandi',
    start_date: '2026-04-10',
    end_date: '2026-04-18',
    duration_days: '8',
    main_cause: 'Heavy Monsoon Rain & River Overtopping',
    human_fatality: 4,
    human_injured: 12,
    human_displaced: 35000,
    extent_of_damage: 'Extensive crop inundation in Barak valley, 4 embankments breached',
    event_source: 'NDMA & ASDMA Telemetry',
    year: 2026
  },
  {
    id: 99002,
    uei: 'UEI-NDMA-FL-2026-0008',
    state: 'Maharashtra',
    districts: 'Ratnagiri, Sindhudurg, Raigad',
    start_date: '2026-03-24',
    end_date: '2026-03-28',
    duration_days: '4',
    main_cause: 'Pre-Monsoon Depressions & Flash Inundation',
    human_fatality: 2,
    human_injured: 5,
    human_displaced: 8200,
    extent_of_damage: 'Vashishti and Jagbudi rivers surge, low-lying coastal flooding',
    event_source: 'CWC & SDMA Maharashtra',
    year: 2026
  },
  {
    id: 99003,
    uei: 'UEI-NDMA-FL-2025-0412',
    state: 'Himachal Pradesh',
    districts: 'Mandi, Kullu, Shimla',
    start_date: '2025-08-01',
    end_date: '2025-08-09',
    duration_days: '8',
    main_cause: 'Cloudburst & Flash Floods',
    human_fatality: 18,
    human_injured: 42,
    human_displaced: 12000,
    extent_of_damage: 'Samej khad cloudburst, bridge damages along Beas tributaries',
    event_source: 'IMD & State Disaster Authority',
    year: 2025
  },
  {
    id: 99004,
    uei: 'UEI-NDMA-FL-2025-0389',
    state: 'Assam',
    districts: 'Kaziranga, Nagaon, Morigaon, Dhubri',
    start_date: '2025-07-12',
    end_date: '2025-07-28',
    duration_days: '16',
    main_cause: 'Heavy Monsoon Rain & River Overtopping',
    human_fatality: 24,
    human_injured: 88,
    human_displaced: 210000,
    extent_of_damage: 'Brahmaputra crossed danger level by 1.8m, Kaziranga 70% inundated',
    event_source: 'CWC & IMD Mausam',
    year: 2025
  },
  {
    id: 99005,
    uei: 'UEI-NDMA-FL-2025-0310',
    state: 'Gujarat',
    districts: 'Surat, Navsari, Valsad',
    start_date: '2025-07-22',
    end_date: '2025-07-27',
    duration_days: '5',
    main_cause: 'Dam Release & Heavy Rainfall',
    human_fatality: 7,
    human_injured: 19,
    human_displaced: 45000,
    extent_of_damage: 'Ukai dam discharge 2.5 lakh cusecs, Tapi river basin inundation',
    event_source: 'Gujarat SDMA & CWC',
    year: 2025
  },
  {
    id: 99006,
    uei: 'UEI-NDMA-FL-2024-0891',
    state: 'Kerala',
    districts: 'Wayanad, Kozhikode',
    start_date: '2024-07-30',
    end_date: '2024-08-06',
    duration_days: '7',
    main_cause: 'Cloudburst, Extreme Monsoon & Mudflow',
    human_fatality: 420,
    human_injured: 397,
    human_displaced: 9800,
    extent_of_damage: 'Chooralmala and Mundakkai complete catchment collapse & river surge',
    event_source: 'NDRF & KSDMA Official Record',
    year: 2024
  },
  {
    id: 99007,
    uei: 'UEI-NDMA-FL-2024-0842',
    state: 'Gujarat',
    districts: 'Vadodara, Jamnagar, Devbhumi Dwarka, Morbi',
    start_date: '2024-08-26',
    end_date: '2024-09-02',
    duration_days: '7',
    main_cause: 'Deep Depression & River Overtopping',
    human_fatality: 38,
    human_injured: 65,
    human_displaced: 52000,
    extent_of_damage: 'Vishwamitri river overflowed above 37 ft, urban submergence in Vadodara',
    event_source: 'IMD & Gujarat Relief Commissioner',
    year: 2024
  },
  {
    id: 99008,
    uei: 'UEI-NDMA-FL-2024-0873',
    state: 'Andhra Pradesh',
    districts: 'Vijayawada, Krishna, Guntur',
    start_date: '2024-08-31',
    end_date: '2024-09-07',
    duration_days: '7',
    main_cause: 'Budameru Rivulet Breach & Dam Release',
    human_fatality: 32,
    human_injured: 110,
    human_displaced: 275000,
    extent_of_damage: 'Prakasam Barrage record 11.43 lakh cusecs discharge, Vijayawada city flooded',
    event_source: 'APSDMA & CWC Live Gauge',
    year: 2024
  },
  {
    id: 99009,
    uei: 'UEI-NDMA-FL-2024-0811',
    state: 'Tripura',
    districts: 'Gomati, South Tripura, Dhalai, Sepahijala',
    start_date: '2024-08-19',
    end_date: '2024-08-25',
    duration_days: '6',
    main_cause: 'Heavy Monsoon Rain & Dumbur Dam Spill',
    human_fatality: 26,
    human_injured: 40,
    human_displaced: 65000,
    extent_of_damage: 'Severe flooding across Gomati and Howrah river basins',
    event_source: 'Tripura SDMA & NDRF',
    year: 2024
  },
  {
    id: 99010,
    uei: 'UEI-NDMA-FL-2024-0715',
    state: 'Bihar',
    districts: 'Supaul, Madhubani, Darbhanga, West Champaran',
    start_date: '2024-09-28',
    end_date: '2024-10-06',
    duration_days: '8',
    main_cause: 'Kosi & Gandak Barrage Record Discharge',
    human_fatality: 15,
    human_injured: 30,
    human_displaced: 160000,
    extent_of_damage: 'Birpur barrage record 6.61 lakh cusecs flow, multiple embankment breaches',
    event_source: 'Bihar WRD & CWC',
    year: 2024
  }
];

// Neon DB Historical Floods endpoint for Dashboard Table with Full Multi-Filter Support
app.get('/api/historical-floods', async (req: Request, res: Response) => {
  try {
    const { state, district, year, cause, search, limit } = req.query;
    let sql = 'SELECT id, uei, state, districts, start_date, end_date, duration_days, main_cause, human_fatality, human_injured, human_displaced, extent_of_damage, event_source, year FROM historical_flood_events';
    const whereClauses: string[] = [];
    const params: any[] = [];
    let pIdx = 1;

    if (state && typeof state === 'string' && state.trim() !== '') {
      whereClauses.push(`LOWER(state) LIKE LOWER($${pIdx++})`);
      params.push(`%${state.trim()}%`);
    }

    if (district && typeof district === 'string' && district.trim() !== '') {
      whereClauses.push(`LOWER(districts) LIKE LOWER($${pIdx++})`);
      params.push(`%${district.trim()}%`);
    }

    if (year && typeof year === 'string' && year.trim() !== '' && year !== 'all') {
      whereClauses.push(`year = $${pIdx++}`);
      params.push(parseInt(year.trim()));
    }

    if (cause && typeof cause === 'string' && cause.trim() !== '' && cause !== 'all') {
      whereClauses.push(`LOWER(main_cause) LIKE LOWER($${pIdx++})`);
      params.push(`%${cause.trim()}%`);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      whereClauses.push(`(LOWER(state) LIKE LOWER($${pIdx}) OR LOWER(districts) LIKE LOWER($${pIdx}) OR LOWER(main_cause) LIKE LOWER($${pIdx}))`);
      params.push(`%${search.trim()}%`);
      pIdx++;
    }

    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }

    sql += ' ORDER BY year DESC, id DESC LIMIT ' + Math.min(parseInt(limit as string) || 200, 500);

    let rows: any[] = [];
    try {
      const { db } = await import('./config/db');
      const result = await db.query(sql, params);
      rows = result.rows || [];
    } catch (dbErr) {
      console.warn('Neon DB query error, falling back to local dataset:', dbErr);
    }

    // Blend recent 2024-2026 records if not already present
    const existingUeis = new Set(rows.map(r => r.uei));
    const matchedRecent = RECENT_HISTORICAL_FLOODS.filter(r => {
      if (existingUeis.has(r.uei)) return false;
      if (state && typeof state === 'string' && state.trim() !== '' && !r.state.toLowerCase().includes(state.trim().toLowerCase())) return false;
      if (district && typeof district === 'string' && district.trim() !== '' && !r.districts.toLowerCase().includes(district.trim().toLowerCase())) return false;
      if (year && typeof year === 'string' && year.trim() !== '' && year !== 'all' && r.year !== parseInt(year.trim())) return false;
      if (cause && typeof cause === 'string' && cause.trim() !== '' && cause !== 'all' && !r.main_cause.toLowerCase().includes(cause.trim().toLowerCase())) return false;
      if (search && typeof search === 'string' && search.trim() !== '') {
        const s = search.trim().toLowerCase();
        if (!r.state.toLowerCase().includes(s) && !r.districts.toLowerCase().includes(s) && !r.main_cause.toLowerCase().includes(s)) return false;
      }
      return true;
    });

    const combined = [...matchedRecent, ...rows].sort((a, b) => (b.year || 0) - (a.year || 0) || (b.id || 0) - (a.id || 0));

    res.json({
      success: true,
      total: combined.length,
      data: combined
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

// ── In-Memory Alert Subscription & Dispatched History Store ──
const DISPATCHED_ALERTS_LOG: any[] = [];
const SUBSCRIBED_ALERT_USERS: Map<string, any> = new Map();

// Automated Flood Alert Dispatch Endpoint (Email Alert System)
app.post('/api/alerts/dispatch', async (req: Request, res: Response) => {
  try {
    const { email, name, alertData } = req.body;

    if (!alertData || !alertData.location) {
      return res.status(400).json({
        success: false,
        message: 'Missing alertData (location, risk probability, rainfall required).'
      });
    }

    const payload: FloodAlertData = {
      location: alertData.location,
      state: alertData.state || 'Monitored Region',
      district: alertData.district,
      probability: alertData.probability || 0,
      riskLevel: alertData.riskLevel || (alertData.probability >= 70 ? 'HIGH' : (alertData.probability >= 40 ? 'MEDIUM' : 'NORMAL')),
      rainfall: alertData.rainfall || '0.0',
      riverFlow: alertData.riverFlow || 'Active Catchment Flow',
      soilMoisture: alertData.soilMoisture || '0.32',
      temp: alertData.temp || '28.5°C',
      imdAdvisory: alertData.imdAdvisory || 'Official hydrological monitoring active.',
      gpsCoordinates: alertData.gpsCoordinates,
      triggeredAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };

    const targetEmail = email || process.env.DEFAULT_ALERT_EMAIL || 'user@floodwatch.org';
    const dispatchResult = await alertNotificationService.dispatchAutomatedAlert({
      email: targetEmail,
      name: name || 'Command Center Officer',
      alertData: payload
    });

    const record = {
      ...dispatchResult,
      location: payload.location,
      probability: payload.probability,
      riskLevel: payload.riskLevel,
      rainfall: payload.rainfall,
      riverFlow: payload.riverFlow
    };

    DISPATCHED_ALERTS_LOG.unshift(record);
    if (DISPATCHED_ALERTS_LOG.length > 50) DISPATCHED_ALERTS_LOG.pop();

    res.json({
      success: true,
      message: `Automated flood alert email dispatched successfully to ${targetEmail}`,
      result: record
    });
  } catch (err: any) {
    console.error('Alert dispatch error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to dispatch alert notifications.'
    });
  }
});

// Alert Subscription Endpoint
app.post('/api/alerts/subscribe', (req: Request, res: Response) => {
  try {
    const { email, name, state, district, threshold = 50 } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an Email address for automated alerts.' });
    }

    const key = email.toLowerCase().trim();
    const subRecord = {
      id: `SUB-${Date.now().toString().slice(-6)}`,
      email,
      name: name || 'Resident Officer',
      state: state || 'All India',
      district: district || 'All Districts',
      threshold: Number(threshold) || 50,
      active: true,
      subscribedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    };

    SUBSCRIBED_ALERT_USERS.set(key, subRecord);

    res.json({
      success: true,
      message: `Successfully configured automated Email alerts for threshold >= ${threshold}%`,
      subscription: subRecord
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Subscription failed' });
  }
});

// Dispatched Alerts History Endpoint
app.get('/api/alerts/history', (req: Request, res: Response) => {
  res.json({
    success: true,
    total: DISPATCHED_ALERTS_LOG.length,
    history: DISPATCHED_ALERTS_LOG
  });
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
