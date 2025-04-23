import db from '../config/db.js';

/**
 * Migration to add reset password fields to users table
 */
const migrate = async () => {
  try {
    console.log('Starting migration: Adding reset password fields to users table');
    
    // Check if resetPasswordToken column already exists
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'resetPasswordToken'
    `);
    
    if (columns.length === 0) {
      console.log('Adding resetPasswordToken and resetPasswordExpire columns to users table');
      
      // Add resetPasswordToken column
      await db.query(`
        ALTER TABLE users 
        ADD COLUMN resetPasswordToken VARCHAR(255) NULL,
        ADD COLUMN resetPasswordExpire DATETIME NULL
      `);
      
      console.log('Reset password fields added successfully');
    } else {
      console.log('Reset password fields already exist, skipping migration');
    }
    
    return true;
  } catch (error) {
    console.error('Migration failed:', error.message);
    return false;
  }
};

// Run the migration
migrate()
  .then(result => {
    console.log('Migration completed with result:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration error:', error);
    process.exit(1);
  });
