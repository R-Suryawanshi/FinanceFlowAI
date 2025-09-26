
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { users } from "@shared/schema";
import ws from "ws";

// Configure Neon for serverless
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create connection pool for Neon with proper SSL configuration
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const db = drizzle(pool, { schema: { users } });

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Test the connection first
    const client = await pool.connect();
    console.log("Database connection established successfully");
    
    // Create users table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    // Create default admin user if it doesn't exist
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    
    await client.query(`
      INSERT INTO users (username, email, password, name, role, is_active)
      VALUES ('admin', 'admin@gmail.com', $1, 'Administrator', 'admin', true)
      ON CONFLICT (email) DO NOTHING;
    `, [hashedPassword]);
    
    client.release();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}
