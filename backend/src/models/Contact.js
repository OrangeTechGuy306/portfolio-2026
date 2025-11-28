const database = require('../config/database');
const logger = require('../config/logger');

class Contact {
  constructor(data = {}) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.subject = data.subject;
    this.message = data.message;
    this.status = data.status || 'unread';
    this.ipAddress = data.ipAddress;
    this.userAgent = data.userAgent;
    this.replied = data.replied || false;
    this.replyMessage = data.replyMessage;
    this.repliedAt = data.repliedAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('unread', 'read', 'replied', 'archived') DEFAULT 'unread',
        ip_address VARCHAR(45),
        user_agent TEXT,
        replied BOOLEAN DEFAULT false,
        reply_message TEXT,
        replied_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at),
        INDEX idx_replied (replied)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    try {
      await database.query(sql);
      logger.info('Contact messages table created successfully');
    } catch (error) {
      logger.error('Error creating contact messages table:', error);
      throw error;
    }
  }

  async save() {
    try {
      if (this.id) {
        // Update existing contact message
        const sql = `
          UPDATE contact_messages
          SET name = ?, email = ?, subject = ?, message = ?, status = ?,
              replied = ?, reply_message = ?, replied_at = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;
        const params = [
          this.name,
          this.email,
          this.subject,
          this.message,
          this.status || 'unread',
          this.replied || false,
          this.replyMessage || null,
          this.repliedAt || null,
          this.id
        ];
        await database.query(sql, params);
        return this;
      } else {
        // Create new contact message
        const sql = `
          INSERT INTO contact_messages (name, email, subject, message, status, ip_address, user_agent)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
          this.name,
          this.email,
          this.subject,
          this.message,
          this.status || 'unread',
          this.ipAddress || null,
          this.userAgent || null
        ];
        const result = await database.query(sql, params);
        this.id = result.insertId;
        return this;
      }
    } catch (error) {
      logger.error('Error saving contact message:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const sql = 'SELECT * FROM contact_messages WHERE id = ?';
      const rows = await database.query(sql, [id]);
      return rows.length > 0 ? new Contact(this.mapDbToModel(rows[0])) : null;
    } catch (error) {
      logger.error('Error finding contact message by ID:', error);
      throw error;
    }
  }

  static async findAll(options = {}) {
    try {
      let sql = 'SELECT * FROM contact_messages WHERE 1=1';
      const params = [];

      if (options.status) {
        sql += ' AND status = ?';
        params.push(options.status);
      }

      if (options.replied !== undefined) {
        sql += ' AND replied = ?';
        params.push(options.replied);
      }

      if (options.email) {
        sql += ' AND email LIKE ?';
        params.push(`%${options.email}%`);
      }

      if (options.search) {
        sql += ' AND (name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)';
        const searchTerm = `%${options.search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (options.dateFrom) {
        sql += ' AND created_at >= ?';
        params.push(options.dateFrom);
      }

      if (options.dateTo) {
        sql += ' AND created_at <= ?';
        params.push(options.dateTo);
      }

      sql += ' ORDER BY ';
      if (options.orderBy === 'name') {
        sql += 'name ASC, ';
      } else if (options.orderBy === 'email') {
        sql += 'email ASC, ';
      } else if (options.orderBy === 'status') {
        sql += 'status ASC, ';
      }
      sql += 'created_at DESC';

      if (options.limit) {
        sql += ' LIMIT ?';
        params.push(parseInt(options.limit));
        
        if (options.offset) {
          sql += ' OFFSET ?';
          params.push(parseInt(options.offset));
        }
      }

      const rows = await database.query(sql, params);
      return rows.map(row => new Contact(this.mapDbToModel(row)));
    } catch (error) {
      logger.error('Error finding all contact messages:', error);
      throw error;
    }
  }

  async markAsRead() {
    try {
      this.status = 'read';
      const sql = 'UPDATE contact_messages SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      await database.query(sql, [this.status, this.id]);
    } catch (error) {
      logger.error('Error marking contact message as read:', error);
      throw error;
    }
  }

  async markAsReplied(replyMessage) {
    try {
      this.status = 'replied';
      this.replied = true;
      this.replyMessage = replyMessage;
      this.repliedAt = new Date();
      
      const sql = `
        UPDATE contact_messages 
        SET status = ?, replied = ?, reply_message = ?, replied_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      await database.query(sql, [this.status, this.replied, this.replyMessage, this.id]);
    } catch (error) {
      logger.error('Error marking contact message as replied:', error);
      throw error;
    }
  }

  async archive() {
    try {
      this.status = 'archived';
      const sql = 'UPDATE contact_messages SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      await database.query(sql, [this.status, this.id]);
    } catch (error) {
      logger.error('Error archiving contact message:', error);
      throw error;
    }
  }

  async delete() {
    try {
      const sql = 'DELETE FROM contact_messages WHERE id = ?';
      await database.query(sql, [this.id]);
    } catch (error) {
      logger.error('Error deleting contact message:', error);
      throw error;
    }
  }

  static async getStats() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'unread' THEN 1 ELSE 0 END) as unread,
          SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) as read,
          SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) as replied,
          SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) as archived,
          SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today,
          SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as this_week,
          SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as this_month
        FROM contact_messages
      `;
      const rows = await database.query(sql);
      return rows[0];
    } catch (error) {
      logger.error('Error getting contact message stats:', error);
      throw error;
    }
  }

  static mapDbToModel(dbRow) {
    return {
      id: dbRow.id,
      name: dbRow.name,
      email: dbRow.email,
      subject: dbRow.subject,
      message: dbRow.message,
      status: dbRow.status,
      ipAddress: dbRow.ip_address,
      userAgent: dbRow.user_agent,
      replied: dbRow.replied,
      replyMessage: dbRow.reply_message,
      repliedAt: dbRow.replied_at,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at,
    };
  }
}

module.exports = Contact;
