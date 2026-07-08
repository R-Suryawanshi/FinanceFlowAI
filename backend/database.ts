
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config();
import { 
  users, 
  serviceTypes, 
  userProfiles, 
  userServices, 
  emiSchedule, 
  payments, 
  documents, 
  goldRates, 
  interestRates, 
  notifications 
} from "@shared/schema";
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

export const db = drizzle(pool, { 
  schema: { 
    users, 
    serviceTypes, 
    userProfiles, 
    userServices, 
    emiSchedule, 
    payments, 
    documents, 
    goldRates, 
    interestRates, 
    notifications 
  } 
});

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Test the connection first
    const client = await pool.connect();
    console.log("Database connection established successfully");
    
    // Create users table
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

    // Create service_types table
    await client.query(`
      CREATE TABLE IF NOT EXISTS service_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        description TEXT,
        base_interest_rate DECIMAL(5,2),
        min_amount DECIMAL(12,2),
        max_amount DECIMAL(12,2),
        min_tenure INTEGER,
        max_tenure INTEGER,
        processing_fee DECIMAL(5,2),
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create user_profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        phone_number TEXT,
        date_of_birth TIMESTAMP,
        gender TEXT,
        marital_status TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        pincode TEXT,
        occupation TEXT,
        company_name TEXT,
        monthly_income DECIMAL(12,2),
        credit_score INTEGER,
        pan_number TEXT,
        aadhar_number TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create user_services table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_services (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        service_type_id UUID NOT NULL REFERENCES service_types(id),
        application_number TEXT NOT NULL UNIQUE,
        amount DECIMAL(12,2) NOT NULL,
        tenure INTEGER NOT NULL,
        interest_rate DECIMAL(5,2) NOT NULL,
        emi DECIMAL(12,2),
        processing_fee DECIMAL(12,2),
        status TEXT NOT NULL DEFAULT 'pending',
        purpose TEXT,
        collateral TEXT,
        guarantor TEXT,
        application_date TIMESTAMP NOT NULL DEFAULT NOW(),
        approval_date TIMESTAMP,
        disbursal_date TIMESTAMP,
        maturity_date TIMESTAMP,
        last_payment_date TIMESTAMP,
        outstanding_amount DECIMAL(12,2),
        total_paid_amount DECIMAL(12,2) DEFAULT 0,
        notes TEXT,
        documents JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create emi_schedule table
    await client.query(`
      CREATE TABLE IF NOT EXISTS emi_schedule (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_service_id UUID NOT NULL REFERENCES user_services(id),
        emi_number INTEGER NOT NULL,
        due_date TIMESTAMP NOT NULL,
        emi_amount DECIMAL(12,2) NOT NULL,
        principal_amount DECIMAL(12,2) NOT NULL,
        interest_amount DECIMAL(12,2) NOT NULL,
        outstanding_balance DECIMAL(12,2) NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        paid_date TIMESTAMP,
        paid_amount DECIMAL(12,2),
        late_fee DECIMAL(12,2) DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create payments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_service_id UUID NOT NULL REFERENCES user_services(id),
        emi_schedule_id UUID REFERENCES emi_schedule(id),
        payment_reference TEXT NOT NULL UNIQUE,
        amount DECIMAL(12,2) NOT NULL,
        payment_method TEXT NOT NULL,
        payment_date TIMESTAMP NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        transaction_id TEXT,
        bank_reference TEXT,
        remarks TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create documents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        user_service_id UUID REFERENCES user_services(id),
        document_type TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_url TEXT NOT NULL,
        file_size INTEGER,
        mime_type TEXT,
        verification_status TEXT DEFAULT 'pending',
        verified_by UUID REFERENCES users(id),
        verification_date TIMESTAMP,
        verification_notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create gold_rates table
    await client.query(`
      CREATE TABLE IF NOT EXISTS gold_rates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        date TIMESTAMP NOT NULL,
        gold_purity TEXT NOT NULL,
        rate_per_gram DECIMAL(8,2) NOT NULL,
        city TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create interest_rates table
    await client.query(`
      CREATE TABLE IF NOT EXISTS interest_rates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        service_type_id UUID NOT NULL REFERENCES service_types(id),
        min_amount DECIMAL(12,2),
        max_amount DECIMAL(12,2),
        min_tenure INTEGER,
        max_tenure INTEGER,
        interest_rate DECIMAL(5,2) NOT NULL,
        effective_date TIMESTAMP NOT NULL,
        expiry_date TIMESTAMP,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT false,
        action_url TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
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

    // Insert default service types
    await client.query(`
      INSERT INTO service_types (name, display_name, description, base_interest_rate, min_amount, max_amount, min_tenure, max_tenure, processing_fee)
      VALUES 
        ('home-loan', 'Home Loan', 'Loans for purchasing or constructing residential properties', 8.50, 500000, 50000000, 60, 360, 0.50),
        ('car-loan', 'Car Loan', 'Loans for purchasing new or used vehicles', 9.50, 100000, 5000000, 12, 84, 1.00),
        ('personal-loan', 'Personal Loan', 'Unsecured loans for personal needs', 11.00, 25000, 5000000, 6, 60, 2.00),
        ('gold-loan', 'Gold Loan', 'Loans against gold jewelry and ornaments', 12.00, 10000, 2000000, 6, 36, 0.50),
        ('business-loan', 'Business Loan', 'Loans for business expansion and working capital', 10.50, 100000, 10000000, 12, 120, 1.50),
        ('education-loan', 'Education Loan', 'Loans for higher education and skill development', 9.00, 50000, 2000000, 12, 180, 0.00)
      ON CONFLICT (name) DO NOTHING;
    `);

    // Insert sample gold rates
    await client.query(`
      INSERT INTO gold_rates (date, gold_purity, rate_per_gram, city)
      VALUES 
        (NOW(), '22K', 6240.00, 'Mumbai'),
        (NOW(), '24K', 6810.00, 'Mumbai'),
        (NOW(), '22K', 6220.00, 'Delhi'),
        (NOW(), '24K', 6790.00, 'Delhi')
      ON CONFLICT DO NOTHING;
    `);

    // Insert sample interest rates
    const serviceTypesResult = await client.query(`SELECT id, name FROM service_types`);
    for (const serviceType of serviceTypesResult.rows) {
      await client.query(`
        INSERT INTO interest_rates (service_type_id, min_amount, max_amount, min_tenure, max_tenure, interest_rate, effective_date, is_active)
        VALUES ($1, 0, 999999999, 0, 999, 
          CASE 
            WHEN $2 = 'home-loan' THEN 8.50
            WHEN $2 = 'car-loan' THEN 9.50
            WHEN $2 = 'personal-loan' THEN 11.00
            WHEN $2 = 'gold-loan' THEN 12.00
            WHEN $2 = 'business-loan' THEN 10.50
            WHEN $2 = 'education-loan' THEN 9.00
            ELSE 10.00
          END,
          NOW(), true)
        ON CONFLICT DO NOTHING;
      `, [serviceType.id, serviceType.name]);
    }
    
    client.release();
    console.log("Database initialized successfully with all tables and seed data");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}
