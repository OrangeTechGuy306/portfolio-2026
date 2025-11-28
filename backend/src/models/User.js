const database = require('../config/database');
const bcrypt = require('bcryptjs');
const logger = require('../config/logger');

class User {
  constructor(data = {}) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || 'admin';
    this.avatar = data.avatar;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.lastLogin = data.lastLogin;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'super_admin') DEFAULT 'admin',
        avatar VARCHAR(500),
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    try {
      await database.query(sql);
      logger.info('Users table created successfully');
    } catch (error) {
      logger.error('Error creating users table:', error);
      throw error;
    }
  }

  async save() {
    try {
      if (this.password) {
        this.password = await bcrypt.hash(this.password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
      }

      if (this.id) {
        // Update existing user
        const sql = `
          UPDATE users
          SET name = ?, email = ?, role = ?, avatar = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;
        const params = [
          this.name,
          this.email,
          this.role,
          this.avatar || null,
          this.isActive !== undefined ? this.isActive : true,
          this.id
        ];
        await database.query(sql, params);
        return this;
      } else {
        // Create new user
        const sql = `
          INSERT INTO users (name, email, password, role, avatar, is_active)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [
          this.name,
          this.email,
          this.password,
          this.role || 'admin',
          this.avatar || null,
          this.isActive !== undefined ? this.isActive : true
        ];
        const result = await database.query(sql, params);
        this.id = result.insertId;
        return this;
      }
    } catch (error) {
      logger.error('Error saving user:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const sql = 'SELECT * FROM users WHERE id = ? AND is_active = true';
      const rows = await database.query(sql, [id]);
      return rows.length > 0 ? new User(this.mapDbToModel(rows[0])) : null;
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const sql = 'SELECT * FROM users WHERE email = ? AND is_active = true';
      const rows = await database.query(sql, [email]);
      return rows.length > 0 ? new User(this.mapDbToModel(rows[0])) : null;
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  static async findAll(options = {}) {
    try {
      let sql = 'SELECT * FROM users WHERE is_active = true';
      const params = [];

      if (options.role) {
        sql += ' AND role = ?';
        params.push(options.role);
      }

      sql += ' ORDER BY created_at DESC';

      if (options.limit) {
        sql += ' LIMIT ?';
        params.push(parseInt(options.limit));
      }

      const rows = await database.query(sql, params);
      return rows.map(row => new User(this.mapDbToModel(row)));
    } catch (error) {
      logger.error('Error finding all users:', error);
      throw error;
    }
  }

  async updateLastLogin() {
    try {
      const sql = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
      await database.query(sql, [this.id]);
      this.lastLogin = new Date();
    } catch (error) {
      logger.error('Error updating last login:', error);
      throw error;
    }
  }

  async comparePassword(candidatePassword) {
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
      logger.error('Error comparing password:', error);
      throw error;
    }
  }

  async delete() {
    try {
      // Soft delete
      const sql = 'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      await database.query(sql, [this.id]);
      this.isActive = false;
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  static mapDbToModel(dbRow) {
    return {
      id: dbRow.id,
      name: dbRow.name,
      email: dbRow.email,
      password: dbRow.password,
      role: dbRow.role,
      avatar: dbRow.avatar,
      isActive: dbRow.is_active,
      lastLogin: dbRow.last_login,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at,
    };
  }

  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}

module.exports = User;
