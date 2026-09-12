import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

export interface DatabaseAdapter {
  query(text: string, params?: any[]): Promise<QueryResult<any>>;
  isMock(): boolean;
  initSchema(): Promise<void>;
  resetMockData?(): void;
}

// In-memory mock database for testing and offline development
class MockDatabase implements DatabaseAdapter {
  private users: Map<string, any> = new Map();

  isMock(): boolean {
    return true;
  }

  resetMockData(): void {
    this.users.clear();
  }

  async initSchema(): Promise<void> {
    // In-memory schema initialized
  }

  async query(text: string, params: any[] = []): Promise<QueryResult<any>> {
    const normalized = text.replace(/\s+/g, ' ').trim().toLowerCase();

    // SELECT user by email
    if (normalized.includes('select') && normalized.includes('from users') && normalized.includes('where lower(email) = lower($1)')) {
      const email = String(params[0]).toLowerCase();
      const user = Array.from(this.users.values()).find(
        (u) => u.email.toLowerCase() === email
      );
      return {
        rows: user ? [{ ...user }] : [],
        command: 'SELECT',
        rowCount: user ? 1 : 0,
        oid: 0,
        fields: [],
      };
    }

    // SELECT user by id
    if (normalized.includes('select') && normalized.includes('from users') && normalized.includes('where id = $1')) {
      const id = String(params[0]);
      const user = this.users.get(id);
      return {
        rows: user ? [{ ...user }] : [],
        command: 'SELECT',
        rowCount: user ? 1 : 0,
        oid: 0,
        fields: [],
      };
    }

    // SELECT user by google_id
    if (normalized.includes('select') && normalized.includes('from users') && normalized.includes('where google_id = $1')) {
      const googleId = String(params[0]);
      const user = Array.from(this.users.values()).find(
        (u) => u.google_id === googleId
      );
      return {
        rows: user ? [{ ...user }] : [],
        command: 'SELECT',
        rowCount: user ? 1 : 0,
        oid: 0,
        fields: [],
      };
    }

    // INSERT INTO users
    if (normalized.includes('insert into users')) {
      // params: [name, email, password_hash, google_id, provider, email_verified]
      const [name, email, password_hash, google_id, provider, email_verified] = params;

      // Check unique email constraint
      const existing = Array.from(this.users.values()).find(
        (u) => u.email.toLowerCase() === String(email).toLowerCase()
      );
      if (existing) {
        const error: any = new Error('duplicate key value violates unique constraint "users_email_key"');
        error.code = '23505';
        throw error;
      }

      const id = crypto.randomUUID();
      const now = new Date();
      const newUser = {
        id,
        name,
        email,
        password_hash: password_hash || null,
        google_id: google_id || null,
        provider: provider || 'local',
        email_verified: Boolean(email_verified),
        created_at: now,
        updated_at: now,
      };

      this.users.set(id, newUser);
      return {
        rows: [{ ...newUser }],
        command: 'INSERT',
        rowCount: 1,
        oid: 0,
        fields: [],
      };
    }

    // UPDATE users (e.g., link google_id or update profile)
    if (normalized.includes('update users set google_id = $1') && normalized.includes('where id = $2')) {
      const [googleId, id] = params;
      const user = this.users.get(id);
      if (user) {
        user.google_id = googleId;
        user.provider = 'google';
        user.updated_at = new Date();
        this.users.set(id, user);
        return {
          rows: [{ ...user }],
          command: 'UPDATE',
          rowCount: 1,
          oid: 0,
          fields: [],
        };
      }
    }

    // UPDATE users password_hash
    if (normalized.includes('update users set password_hash = $1') && normalized.includes('where lower(email) = lower($2)')) {
      const [passwordHash, email] = params;
      const user = Array.from(this.users.values()).find(
        (u) => u.email.toLowerCase() === String(email).toLowerCase()
      );
      if (user) {
        user.password_hash = passwordHash;
        user.updated_at = new Date();
        this.users.set(user.id, user);
        return {
          rows: [{ ...user }],
          command: 'UPDATE',
          rowCount: 1,
          oid: 0,
          fields: [],
        };
      }
    }

    return {
      rows: [],
      command: 'UNKNOWN',
      rowCount: 0,
      oid: 0,
      fields: [],
    };
  }
}

// PostgreSQL adapter for Neon database
class PostgresDatabase implements DatabaseAdapter {
  private pool: Pool;

  constructor(connectionString: string) {
    // Clean query parameters to avoid driver alias warnings
    const cleanUrl = connectionString.split('?')[0];
    this.pool = new Pool({
      connectionString: cleanUrl,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }

  isMock(): boolean {
    return false;
  }

  async initSchema(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NULL,
          google_id VARCHAR(255) UNIQUE NULL,
          provider VARCHAR(50) NOT NULL DEFAULT 'local',
          email_verified BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
      CREATE INDEX IF NOT EXISTS idx_users_google_id ON users (google_id);
    `;
    await this.pool.query(createTableQuery);
  }

  async query(text: string, params?: any[]): Promise<QueryResult<any>> {
    return this.pool.query(text, params);
  }
}

// Setup active database adapter
const isTestEnv = process.env.NODE_ENV === 'test';
const dbUrl = process.env.DATABASE_URL;

let db: DatabaseAdapter;

if (isTestEnv || !dbUrl || dbUrl.includes('mock') || dbUrl === 'postgres://user:pass@localhost:5432/db') {
  db = new MockDatabase();
} else {
  try {
    db = new PostgresDatabase(dbUrl);
  } catch (err) {
    console.warn('Failed to initialize PostgreSQL pool, falling back to mock adapter:', err);
    db = new MockDatabase();
  }
}

export { db };
