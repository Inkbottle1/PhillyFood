import 'dotenv/config';                 // Loads environment variables from .env into process.env
import pkg from 'pg';                   // Imports the 'pg' (node-postgres) library
const { Pool } = pkg;                   // Extracts the Pool class used to manage DB connections

const pool = new Pool({                 // Creates a new PostgreSQL connection pool
  connectionString: process.env.DATABASE_URL, // Uses the Neon connection string from .env
  ssl: { rejectUnauthorized: false }    // Enables SSL (required by Neon) without strict CA check
});

pool.connect()                          // Opens one test connection to check DB availability
  .then(client => {
    console.log('Connected to Neon PostgreSQL'); // Logs success if connection works
    client.release();                    // Returns the test client back to the pool
  })
  .catch(err => {
    console.error('PostgreSQL connection error:', err); // Logs error if connection fails
    process.exit(1);                      // Stops the app if database cannot be reached
  });

export default pool;                     // Exports the pool so other files can run queries
