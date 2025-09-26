
// Environment variable validation
export function validateEnvironment() {
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
  
  // Validate DATABASE_URL format for Neon
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl.includes('neon.tech') && !dbUrl.includes('postgresql://')) {
    console.warn('DATABASE_URL may not be a valid Neon connection string');
  }
  
  console.log('Environment variables validated successfully');
}
