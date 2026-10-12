import { db } from '../config/db';
import { User } from '../types';

export class UserService {
  private schemaChecked = false;

  async ensureProfileColumns(): Promise<void> {
    if (this.schemaChecked) return;
    try {
      await db.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(100);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS district VARCHAR(100);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS organization VARCHAR(255);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
      `);
      this.schemaChecked = true;
    } catch (e) {
      // In mock DB or read-only, safely ignore
      this.schemaChecked = true;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    await this.ensureProfileColumns();
    const query = `
      SELECT id, name, email, password_hash, google_id, provider, email_verified, phone, state, district, organization, bio, avatar_url, created_at, updated_at
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `;
    try {
      const result = await db.query(query, [email.trim()]);
      return result.rows[0] || null;
    } catch {
      // Fallback in case columns do not exist yet
      const fallback = `SELECT id, name, email, password_hash, google_id, provider, email_verified, created_at, updated_at FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`;
      const result = await db.query(fallback, [email.trim()]);
      return result.rows[0] || null;
    }
  }

  async findById(id: string): Promise<User | null> {
    await this.ensureProfileColumns();
    const query = `
      SELECT id, name, email, password_hash, google_id, provider, email_verified, phone, state, district, organization, bio, avatar_url, created_at, updated_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `;
    try {
      const result = await db.query(query, [id]);
      return result.rows[0] || null;
    } catch {
      const fallback = `SELECT id, name, email, password_hash, google_id, provider, email_verified, created_at, updated_at FROM users WHERE id = $1 LIMIT 1`;
      const result = await db.query(fallback, [id]);
      return result.rows[0] || null;
    }
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    await this.ensureProfileColumns();
    const query = `
      SELECT id, name, email, password_hash, google_id, provider, email_verified, phone, state, district, organization, bio, avatar_url, created_at, updated_at
      FROM users
      WHERE google_id = $1
      LIMIT 1
    `;
    try {
      const result = await db.query(query, [googleId]);
      return result.rows[0] || null;
    } catch {
      const fallback = `SELECT id, name, email, password_hash, google_id, provider, email_verified, created_at, updated_at FROM users WHERE google_id = $1 LIMIT 1`;
      const result = await db.query(fallback, [googleId]);
      return result.rows[0] || null;
    }
  }

  async createUser(data: {
    name: string;
    email: string;
    password_hash?: string | null;
    google_id?: string | null;
    provider?: 'local' | 'google';
    email_verified?: boolean;
    phone?: string;
    state?: string;
    district?: string;
    organization?: string;
  }): Promise<User> {
    await this.ensureProfileColumns();
    try {
      const query = `
        INSERT INTO users (name, email, password_hash, google_id, provider, email_verified, phone, state, district, organization)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, name, email, password_hash, google_id, provider, email_verified, phone, state, district, organization, bio, avatar_url, created_at, updated_at
      `;
      const params = [
        data.name.trim(),
        data.email.trim().toLowerCase(),
        data.password_hash || null,
        data.google_id || null,
        data.provider || 'local',
        data.email_verified || false,
        data.phone || null,
        data.state || null,
        data.district || null,
        data.organization || null,
      ];
      const result = await db.query(query, params);
      return result.rows[0];
    } catch {
      const basicQuery = `
        INSERT INTO users (name, email, password_hash, google_id, provider, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, email, password_hash, google_id, provider, email_verified, created_at, updated_at
      `;
      const result = await db.query(basicQuery, [
        data.name.trim(),
        data.email.trim().toLowerCase(),
        data.password_hash || null,
        data.google_id || null,
        data.provider || 'local',
        data.email_verified || false,
      ]);
      return result.rows[0];
    }
  }

  async linkGoogleAccount(userId: string, googleId: string): Promise<User> {
    const query = `
      UPDATE users
      SET google_id = $1, provider = 'google', updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, email, password_hash, google_id, provider, email_verified, created_at, updated_at
    `;
    const result = await db.query(query, [googleId, userId]);
    return result.rows[0];
  }

  async updatePasswordByEmail(email: string, passwordHash: string): Promise<User> {
    const query = `
      UPDATE users
      SET password_hash = $1, updated_at = NOW()
      WHERE LOWER(email) = LOWER($2)
      RETURNING id, name, email, password_hash, google_id, provider, email_verified, created_at, updated_at
    `;
    const result = await db.query(query, [passwordHash, email.trim()]);
    return result.rows[0];
  }

  async updateProfile(userId: string, data: {
    name?: string;
    phone?: string | null;
    state?: string | null;
    district?: string | null;
    organization?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
  }): Promise<User> {
    await this.ensureProfileColumns();
    
    // Dynamic update builder
    const fields: string[] = ['updated_at = NOW()'];
    const params: any[] = [];
    let pIdx = 1;

    if (data.name !== undefined && data.name.trim() !== '') {
      fields.push(`name = $${pIdx++}`);
      params.push(data.name.trim());
    }
    if (data.phone !== undefined) {
      fields.push(`phone = $${pIdx++}`);
      params.push(data.phone ? data.phone.trim() : null);
    }
    if (data.state !== undefined) {
      fields.push(`state = $${pIdx++}`);
      params.push(data.state ? data.state.trim() : null);
    }
    if (data.district !== undefined) {
      fields.push(`district = $${pIdx++}`);
      params.push(data.district ? data.district.trim() : null);
    }
    if (data.organization !== undefined) {
      fields.push(`organization = $${pIdx++}`);
      params.push(data.organization ? data.organization.trim() : null);
    }
    if (data.bio !== undefined) {
      fields.push(`bio = $${pIdx++}`);
      params.push(data.bio ? data.bio.trim() : null);
    }
    if (data.avatar_url !== undefined) {
      fields.push(`avatar_url = $${pIdx++}`);
      params.push(data.avatar_url ? data.avatar_url.trim() : null);
    }

    params.push(userId);
    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${pIdx}
      RETURNING id, name, email, password_hash, google_id, provider, email_verified, phone, state, district, organization, bio, avatar_url, created_at, updated_at
    `;

    try {
      const result = await db.query(query, params);
      return result.rows[0];
    } catch (err: any) {
      // Fallback if specific column fails
      console.warn('Profile update with extra columns failed, updating basic info:', err.message);
      const fallbackQuery = `
        UPDATE users
        SET name = COALESCE($1, name), updated_at = NOW()
        WHERE id = $2
        RETURNING id, name, email, password_hash, google_id, provider, email_verified, created_at, updated_at
      `;
      const fallbackRes = await db.query(fallbackQuery, [data.name?.trim() || null, userId]);
      return fallbackRes.rows[0];
    }
  }
}

export const userService = new UserService();
