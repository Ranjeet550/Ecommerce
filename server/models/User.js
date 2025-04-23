import db from '../config/db.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

class User {
  // Find user by ID
  static async findById(id) {
    try {
      const [users] = await db.query(
        'SELECT id, fullName, email, phoneNumber, address, city, state, pincode, role FROM users WHERE id = ?',
        [id]
      );
      return users.length ? users[0] : null;
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      return users.length ? users[0] : null;
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  // Create new user
  static async create(userData) {
    try {
      const { fullName, email, password, role, phoneNumber, address, city, state, pincode } = userData;

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert user
      const [result] = await db.query(
        'INSERT INTO users (fullName, email, password, role, phoneNumber, address, city, state, pincode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [fullName, email, hashedPassword, role || 'user', phoneNumber || null, address || null, city || null, state || null, pincode || null]
      );

      return result.insertId;
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  // Update user profile
  static async updateProfile(id, userData) {
    try {
      const { fullName, phoneNumber, address, city, state, pincode } = userData;

      await db.query(
        'UPDATE users SET fullName = ?, phoneNumber = ?, address = ?, city = ?, state = ?, pincode = ? WHERE id = ?',
        [fullName, phoneNumber, address, city, state, pincode, id]
      );

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating user profile: ${error.message}`);
    }
  }

  // Change password
  static async changePassword(id, newPassword) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
      return true;
    } catch (error) {
      throw new Error(`Error changing password: ${error.message}`);
    }
  }

  // Compare password
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Find all users
  static async findAll() {
    try {
      const [users] = await db.query(
        'SELECT id, fullName, email, phoneNumber, address, city, state, pincode, role, createdAt, updatedAt FROM users ORDER BY id DESC'
      );
      return users;
    } catch (error) {
      throw new Error(`Error finding all users: ${error.message}`);
    }
  }

  // Update user (admin)
  static async update(id, userData) {
    try {
      const { fullName, email, password, role, phoneNumber, address, city, state, pincode } = userData;

      // If password is provided, it should already be hashed
      if (password) {
        await db.query(
          'UPDATE users SET fullName = ?, email = ?, password = ?, role = ?, phoneNumber = ?, address = ?, city = ?, state = ?, pincode = ? WHERE id = ?',
          [fullName, email, password, role, phoneNumber, address, city, state, pincode, id]
        );
      } else {
        await db.query(
          'UPDATE users SET fullName = ?, email = ?, role = ?, phoneNumber = ?, address = ?, city = ?, state = ?, pincode = ? WHERE id = ?',
          [fullName, email, role, phoneNumber, address, city, state, pincode, id]
        );
      }

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  // Delete user
  static async delete(id) {
    try {
      await db.query('DELETE FROM users WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  // Count admin users
  static async countAdmins() {
    try {
      const [result] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = ?', ['admin']);
      return result[0].count;
    } catch (error) {
      throw new Error(`Error counting admin users: ${error.message}`);
    }
  }

  // Get total count of users
  static async getTotalCount() {
    try {
      const [result] = await db.query('SELECT COUNT(*) as count FROM users');
      return result;
    } catch (error) {
      throw new Error(`Error getting total user count: ${error.message}`);
    }
  }

  // Generate password reset token
  static async generatePasswordResetToken(email) {
    try {
      // Find user by email
      const user = await this.findByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate token
      const resetToken = crypto.randomBytes(32).toString('hex');

      // Hash token
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      // Set token expiry (default: 60 minutes)
      const tokenExpiry = new Date();
      tokenExpiry.setMinutes(
        tokenExpiry.getMinutes() +
        (parseInt(process.env.PASSWORD_RESET_EXPIRE) || 60)
      );

      // Save token to database
      await db.query(
        'UPDATE users SET resetPasswordToken = ?, resetPasswordExpire = ? WHERE id = ?',
        [hashedToken, tokenExpiry, user.id]
      );

      return {
        resetToken,
        user
      };
    } catch (error) {
      throw new Error(`Error generating password reset token: ${error.message}`);
    }
  }

  // Reset password with token
  static async resetPassword(resetToken, newPassword) {
    try {
      // Hash the token from the URL
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      // Find user with the token and check if token is still valid
      const [users] = await db.query(
        'SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpire > ?',
        [hashedToken, new Date()]
      );

      if (!users.length) {
        throw new Error('Invalid or expired token');
      }

      const user = users[0];

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update user's password and clear reset token fields
      await db.query(
        'UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpire = NULL WHERE id = ?',
        [hashedPassword, user.id]
      );

      return await this.findById(user.id);
    } catch (error) {
      throw new Error(`Error resetting password: ${error.message}`);
    }
  }
}

export default User;
