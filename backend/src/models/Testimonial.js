const database = require('../config/database');
const logger = require('../config/logger');

class Testimonial {
  constructor(data = {}) {
    this.id = data.id;
    this.name = data.name;
    this.position = data.position;
    this.company = data.company;
    this.content = data.content;
    this.rating = data.rating || 5;
    this.avatar = data.avatar;
    this.featured = data.featured || false;
    this.status = data.status || 'pending';
    this.projectType = data.projectType;
    this.sortOrder = data.sortOrder || 0;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        position VARCHAR(255),
        company VARCHAR(255),
        content TEXT NOT NULL,
        rating INT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
        avatar VARCHAR(500),
        featured BOOLEAN DEFAULT false,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        project_type VARCHAR(100),
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_featured (featured),
        INDEX idx_rating (rating),
        INDEX idx_sort_order (sort_order),
        INDEX idx_company (company)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    try {
      await database.query(sql);
      logger.info('Testimonials table created successfully');
    } catch (error) {
      logger.error('Error creating testimonials table:', error);
      throw error;
    }
  }

  async save() {
    try {
      if (this.id) {
        // Update existing testimonial
        const sql = `
          UPDATE testimonials
          SET name = ?, position = ?, company = ?, content = ?, rating = ?,
              avatar = ?, featured = ?, status = ?, project_type = ?, sort_order = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;
        const params = [
          this.name,
          this.position || null,
          this.company || null,
          this.content,
          this.rating || 5,
          this.avatar || null,
          this.featured || false,
          this.status || 'pending',
          this.projectType || null,
          this.sortOrder || 0,
          this.id
        ];
        await database.query(sql, params);
        return this;
      } else {
        // Create new testimonial
        const sql = `
          INSERT INTO testimonials (name, position, company, content, rating, avatar,
                                  featured, status, project_type, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
          this.name,
          this.position || null,
          this.company || null,
          this.content,
          this.rating || 5,
          this.avatar || null,
          this.featured || false,
          this.status || 'pending',
          this.projectType || null,
          this.sortOrder || 0
        ];
        const result = await database.query(sql, params);
        this.id = result.insertId;
        return this;
      }
    } catch (error) {
      logger.error('Error saving testimonial:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const sql = 'SELECT * FROM testimonials WHERE id = ?';
      const rows = await database.query(sql, [id]);
      return rows.length > 0 ? new Testimonial(this.mapDbToModel(rows[0])) : null;
    } catch (error) {
      logger.error('Error finding testimonial by ID:', error);
      throw error;
    }
  }

  static async findAll(options = {}) {
    try {
      let sql = 'SELECT * FROM testimonials WHERE 1=1';
      const params = [];

      if (options.status) {
        sql += ' AND status = ?';
        params.push(options.status);
      }

      if (options.featured !== undefined) {
        sql += ' AND featured = ?';
        params.push(options.featured);
      }

      if (options.rating) {
        sql += ' AND rating >= ?';
        params.push(parseInt(options.rating));
      }

      if (options.company) {
        sql += ' AND company LIKE ?';
        params.push(`%${options.company}%`);
      }

      if (options.projectType) {
        sql += ' AND project_type = ?';
        params.push(options.projectType);
      }

      if (options.search) {
        sql += ' AND (name LIKE ? OR company LIKE ? OR content LIKE ?)';
        const searchTerm = `%${options.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      sql += ' ORDER BY ';
      if (options.orderBy === 'rating') {
        sql += 'rating DESC, ';
      } else if (options.orderBy === 'name') {
        sql += 'name ASC, ';
      } else if (options.orderBy === 'company') {
        sql += 'company ASC, ';
      }
      sql += 'sort_order ASC, created_at DESC';

      if (options.limit) {
        sql += ' LIMIT ?';
        params.push(parseInt(options.limit));
        
        if (options.offset) {
          sql += ' OFFSET ?';
          params.push(parseInt(options.offset));
        }
      }

      const rows = await database.query(sql, params);
      return rows.map(row => new Testimonial(this.mapDbToModel(row)));
    } catch (error) {
      logger.error('Error finding all testimonials:', error);
      throw error;
    }
  }

  async approve() {
    try {
      this.status = 'approved';
      const sql = 'UPDATE testimonials SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      await database.query(sql, [this.status, this.id]);
    } catch (error) {
      logger.error('Error approving testimonial:', error);
      throw error;
    }
  }

  async reject() {
    try {
      this.status = 'rejected';
      const sql = 'UPDATE testimonials SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      await database.query(sql, [this.status, this.id]);
    } catch (error) {
      logger.error('Error rejecting testimonial:', error);
      throw error;
    }
  }

  async toggleFeatured() {
    try {
      this.featured = !this.featured;
      const sql = 'UPDATE testimonials SET featured = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      await database.query(sql, [this.featured, this.id]);
    } catch (error) {
      logger.error('Error toggling testimonial featured status:', error);
      throw error;
    }
  }

  async delete() {
    try {
      const sql = 'DELETE FROM testimonials WHERE id = ?';
      await database.query(sql, [this.id]);
    } catch (error) {
      logger.error('Error deleting testimonial:', error);
      throw error;
    }
  }

  static async getStats() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
          SUM(CASE WHEN featured = true THEN 1 ELSE 0 END) as featured,
          AVG(rating) as average_rating,
          COUNT(DISTINCT company) as unique_companies
        FROM testimonials
      `;
      const rows = await database.query(sql);
      return rows[0];
    } catch (error) {
      logger.error('Error getting testimonial stats:', error);
      throw error;
    }
  }

  static async getCompanies() {
    try {
      const sql = 'SELECT DISTINCT company FROM testimonials WHERE company IS NOT NULL ORDER BY company';
      const rows = await database.query(sql);
      return rows.map(row => row.company);
    } catch (error) {
      logger.error('Error getting testimonial companies:', error);
      throw error;
    }
  }

  static async getProjectTypes() {
    try {
      const sql = 'SELECT DISTINCT project_type FROM testimonials WHERE project_type IS NOT NULL ORDER BY project_type';
      const rows = await database.query(sql);
      return rows.map(row => row.project_type);
    } catch (error) {
      logger.error('Error getting project types:', error);
      throw error;
    }
  }

  static mapDbToModel(dbRow) {
    return {
      id: dbRow.id,
      name: dbRow.name,
      position: dbRow.position,
      company: dbRow.company,
      content: dbRow.content,
      rating: dbRow.rating,
      avatar: dbRow.avatar,
      featured: dbRow.featured,
      status: dbRow.status,
      projectType: dbRow.project_type,
      sortOrder: dbRow.sort_order,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at,
    };
  }
}

module.exports = Testimonial;
