const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL is missing. Copy backend/.env.example to backend/.env and set your database URL.');
  process.exit(1);
}

const isLocalHost =
  /localhost|127\.0\.0\.1/i.test(connectionString) ||
  process.env.DB_SSL === 'false';

const pool = new Pool({
  connectionString,
  ssl: isLocalHost ? false : { rejectUnauthorized: false },
  connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT_MS) || 30000,
  idleTimeoutMillis: 30000,
  max: Number(process.env.DB_POOL_MAX) || 10,
  keepAlive: true,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message || err);
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const printConnectionHelp = () => {
  console.error(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  DATABASE CONNECTION FAILED (local development)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your PC cannot reach the PostgreSQL server in time.

✅ RECOMMENDED — use local PostgreSQL:

  1. Install PostgreSQL for Windows
  2. Create database:  CREATE DATABASE shopsweet;
  3. In backend/.env set:

     DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/shopsweet
     DB_SSL=false
     PORT=3002

  4. Restart: npm run dev

Alternative — Render External URL (if port 5432 is not blocked):

  Render Dashboard → PostgreSQL → Connect → External Database URL
  (Do NOT use Internal URL for local dev)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
};

/** Verify DB is reachable; retries help with Render cold starts. */
const verifyConnection = async (retries = Number(process.env.DB_CONNECT_RETRIES) || 5) => {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('✅ PostgreSQL connected');
      return;
    } catch (err) {
      lastError = err;
      const retryable =
        err.code === 'ETIMEDOUT' ||
        err.code === 'ECONNREFUSED' ||
        err.code === 'ENOTFOUND' ||
        /connection timeout|Connection terminated/i.test(err.message || '');

      if (!retryable || attempt === retries) {
        break;
      }

      const waitMs = 2000 * attempt;
      console.warn(`Database connect attempt ${attempt}/${retries} failed — retrying in ${waitMs / 1000}s...`);
      await sleep(waitMs);
    }
  }

  console.error('❌ PostgreSQL Error:', lastError?.message || lastError);
  if (!isLocalHost) {
    printConnectionHelp();
  }
  throw lastError;
};

module.exports = pool;
module.exports.verifyConnection = verifyConnection;
