import 'dotenv/config';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// For development, provide a fallback if DATABASE_URL is not set
const databaseUrl = process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/dev';

if (!process.env.DATABASE_URL) {
  console.warn(`
⚠️  DATABASE_URL is not set! Using fallback URL for development.
   
To set up a real database:
1. Create a free database at https://neon.tech or https://railway.app
2. Copy the connection string to your .env file as DATABASE_URL
3. Run: npm run db:push

For now, the app will try to connect to: ${databaseUrl}
`);
}

let pool: Pool;
let db: ReturnType<typeof drizzle>;

try {
  pool = new Pool({ connectionString: databaseUrl });
  db = drizzle({ client: pool, schema });
} catch (error) {
  console.error('Database connection failed:', error);
  console.log(`
💡 To fix this:
1. Set up a PostgreSQL database (https://neon.tech for free)
2. Add DATABASE_URL to your .env file
3. Run: npm run db:push
`);
  process.exit(1);
}

export { pool, db };