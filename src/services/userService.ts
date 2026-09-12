import { db } from '../config/db';
import { User } from '../types';

export class UserService {
  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, name, email, password_hash, google_id, provider, email_verified, created_at, updated_at
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `;
    const result = await db.query(query, [email.trim()]);
    return result.rows[0] || null;
  }

  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, name, email, password_hash, google_id, provider, email_verified, created_at, updated_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const query = `
      SELECT id, name, email, password_hash, google_id, provider, email_verified, created_at, updated_at
      FROM users
      WHERE google_id = $1
      LIMIT 1
    `;
    const result = await db.query(query, [googleId]);
    return result.rows[0] || null;
  }

  async createUser(data: {
    name: string;
    email: string;
    password_hash?: string | null;
    google_id?: string | null;
    provider?: 'local' | 'google';
    email_verified?: boolean;
  }): Promise<User> {
    const query = `
      INSERT INTO users (name, email, password_hash, google_id, provider, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, password_hash, google_id, provider, email_verified, created_at, updated_at
    `;
    const params = [
      data.name.trim(),
      data.email.trim().toLowerCase(),
      data.password_hash || null,
      data.google_id || null,
      data.provider || 'local',
      data.email_verified || false,
    ];
    const result = await db.query(query, params);
    return result.rows[0];
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
}

export const userService = new UserService();
