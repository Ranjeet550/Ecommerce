import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Run all migration files in the migrations directory
 */
const runMigrations = async () => {
  try {
    console.log('Starting migrations...');
    
    // Get all migration files
    const files = fs.readdirSync(__dirname)
      .filter(file => file.endsWith('.js') && file !== 'run-migrations.js');
    
    console.log(`Found ${files.length} migration files to run`);
    
    // Run each migration file
    for (const file of files) {
      console.log(`Running migration: ${file}`);
      
      // Import and run the migration
      const migrationPath = path.join(__dirname, file);
      await import(migrationPath);
      
      console.log(`Completed migration: ${file}`);
    }
    
    console.log('All migrations completed successfully');
    return true;
  } catch (error) {
    console.error('Error running migrations:', error);
    return false;
  }
};

// Run migrations
runMigrations()
  .then(result => {
    console.log('Migration process completed with result:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration process error:', error);
    process.exit(1);
  });
