import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Function to create database if it doesn't exist
const createDatabaseIfNotExists = async () => {
  try {
    // Skip database creation if using managed database services
    if (process.env.DATABASE_URL) {
      console.log('Using Render database - skipping database creation');
      return true;
    }

    // Skip database creation if using JawsDB on Heroku
    if (process.env.JAWSDB_URL) {
      console.log('Using JawsDB - skipping database creation');
      return true;
    }

    console.log('Creating database if it doesn\'t exist...');
    console.log(`DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`DB_USER: ${process.env.DB_USER || 'root'}`);
    console.log(`DB_NAME: ${process.env.DB_NAME || 'grocery_ecommerce'}`);

    // Create a connection without specifying a database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Dell'
    });
    console.log('Initial connection created successfully');

    // Create the database if it doesn't exist
    const dbName = process.env.DB_NAME || 'grocery_ecommerce';
    console.log(`Executing query: CREATE DATABASE IF NOT EXISTS ${dbName}`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`Database ${dbName} created or already exists`);

    // Close the connection
    await connection.end();
    console.log('Initial connection closed');
    return true;
  } catch (error) {
    console.error('Failed to create database:', error.message);
    console.error('Error details:', error);
    return false;
  }
};

// Create a connection pool
const createPool = () => {
  // Check if DATABASE_URL exists (Render database)
  if (process.env.DATABASE_URL) {
    console.log('Using Render database connection URL');
    return mysql.createPool(process.env.DATABASE_URL);
  }

  // Check if JAWSDB_URL exists (Heroku JawsDB add-on)
  if (process.env.JAWSDB_URL) {
    console.log('Using JawsDB connection URL');
    return mysql.createPool(process.env.JAWSDB_URL);
  }

  // Use regular connection parameters
  return mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Dell',
    database: process.env.DB_NAME || 'grocery_ecommerce',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
};

// Initialize pool after ensuring database exists
let pool;

// Test database connection
const testConnection = async () => {
  try {
    console.log('Testing database connection...');

    // First ensure the database exists
    console.log('Ensuring database exists...');
    const dbCreated = await createDatabaseIfNotExists();
    if (!dbCreated) {
      console.error('Database creation failed');
      return false;
    }

    // Create the pool if it doesn't exist
    if (!pool) {
      console.log('Creating connection pool...');
      pool = createPool();
    } else {
      console.log('Using existing connection pool');
    }

    // Test the connection
    console.log('Getting connection from pool...');
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();
    console.log('Connection released back to pool');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.error('Error details:', error);
    return false;
  }
};

// Initialize pool
pool = createPool();

// Helper function to execute queries with better error handling
const executeQuery = async (sql, params = []) => {
  try {
    console.log(`Executing query: ${sql}`);
    console.log('Query parameters:', params);

    const [results] = await pool.query(sql, params);
    console.log(`Query executed successfully, returned ${results.length} rows`);
    return [results, null];
  } catch (error) {
    console.error('Query execution error:', error.message);
    console.error('Error details:', error);
    return [null, error];
  }
};

export default pool;
export { testConnection, executeQuery };
