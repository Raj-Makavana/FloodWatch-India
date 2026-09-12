import app from './app';
import { db } from './config/db';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    console.log('[Database] Checking schema migrations...');
    await db.initSchema();
    console.log('[Database] Schema ready.');

    app.listen(PORT, () => {
      console.log(`[Server] FloodWatch Authentication Server running on port ${PORT}`);
      console.log(`[Server] API endpoints available at http://localhost:${PORT}/api/auth`);
    });
  } catch (err) {
    console.error('[Server] Fatal startup error:', err);
    process.exit(1);
  }
}

bootstrap();
