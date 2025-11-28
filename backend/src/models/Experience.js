const database = require('../config/database');
const logger = require('../config/logger');

class Experience {
  constructor(data = {}) {
    this.id = data.id;
    this.title = data.title;
    this.company = data.company;
    this.location = data.location;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.current = data.current || false;
    this.description = data.description;
    this.achievements = data.achievements || [];
    this.technologies = data.technologies || [];
    this.type = data.type || 'full-time';
    this.sortOrder = data.sortOrder || 0;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS experience (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        start_date DATE NOT NULL,
        end_date DATE NULL,
        current BOOLEAN DEFAULT false,
        description TEXT,
        achievements JSON,
        technologies JSON,
        type ENUM('full-time', 'part-time', 'contract', 'freelance', 'internship') DEFAULT 'full-time',
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_company (company),
        INDEX idx_current (current),
        INDEX idx_type (type),
        INDEX idx_sort_order (sort_order),
        INDEX idx_start_date (start_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    try {
      await database.query(sql);
      logger.info('Experience table created successfully');
    } catch (error) {
      logger.error('Error creating experience table:', error);
      throw error;
    }
  }

  async save() {
    try {
      const achievementsJson = JSON.stringify(this.achievements);
      const technologiesJson = JSON.stringify(this.technologies);

      if (this.id) {
        // Update existing experience
        const sql = `
          UPDATE experience
          SET title = ?, company = ?, location = ?, start_date = ?, end_date = ?,
              current = ?, description = ?, achievements = ?, technologies = ?,
              type = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;
        const params = [
          this.title,
          this.company,
          this.location || null,
          this.startDate,
          this.endDate || null,
          this.current || false,
          this.description || null,
          achievementsJson,
          technologiesJson,
          this.type || 'full-time',
          this.sortOrder || 0,
          this.id
        ];
        await database.query(sql, params);
        return this;
      } else {
        // Create new experience
        const sql = `
          INSERT INTO experience (title, company, location, start_date, end_date, current,
                                description, achievements, technologies, type, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
          this.title,
          this.company,
          this.location || null,
          this.startDate,
          this.endDate || null,
          this.current || false,
          this.description || null,
          achievementsJson,
          technologiesJson,
          this.type || 'full-time',
          this.sortOrder || 0
        ];
        const result = await database.query(sql, params);
        this.id = result.insertId;
        return this;
      }
    } catch (error) {
      logger.error('Error saving experience:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const sql = 'SELECT * FROM experience WHERE id = ?';
      const rows = await database.query(sql, [id]);
      return rows.length > 0 ? new Experience(this.mapDbToModel(rows[0])) : null;
    } catch (error) {
      logger.error('Error finding experience by ID:', error);
      throw error;
    }
  }

  static async findAll(options = {}) {
    try {
      let sql = 'SELECT * FROM experience WHERE 1=1';
      const params = [];

      if (options.type) {
        sql += ' AND type = ?';
        params.push(options.type);
      }

      if (options.current !== undefined) {
        sql += ' AND current = ?';
        params.push(options.current);
      }

      if (options.company) {
        sql += ' AND company LIKE ?';
        params.push(`%${options.company}%`);
      }

      sql += ' ORDER BY ';
      if (options.orderBy === 'company') {
        sql += 'company ASC, ';
      } else if (options.orderBy === 'date') {
        sql += 'start_date DESC, ';
      }
      sql += 'sort_order ASC, start_date DESC';

      if (options.limit) {
        sql += ' LIMIT ?';
        params.push(parseInt(options.limit));
        
        if (options.offset) {
          sql += ' OFFSET ?';
          params.push(parseInt(options.offset));
        }
      }

      const rows = await database.query(sql, params);
      return rows.map(row => new Experience(this.mapDbToModel(row)));
    } catch (error) {
      logger.error('Error finding all experience:', error);
      throw error;
    }
  }

  async delete() {
    try {
      const sql = 'DELETE FROM experience WHERE id = ?';
      await database.query(sql, [this.id]);
    } catch (error) {
      logger.error('Error deleting experience:', error);
      throw error;
    }
  }

  static async getCompanies() {
    try {
      const sql = 'SELECT DISTINCT company FROM experience ORDER BY company';
      const rows = await database.query(sql);
      return rows.map(row => row.company);
    } catch (error) {
      logger.error('Error getting companies:', error);
      throw error;
    }
  }

  static async getTechnologies() {
    try {
      const sql = 'SELECT technologies FROM experience WHERE technologies IS NOT NULL';
      const rows = await database.query(sql);
      
      const allTechnologies = new Set();
      rows.forEach(row => {
        if (row.technologies) {
          const techs = JSON.parse(row.technologies);
          techs.forEach(tech => allTechnologies.add(tech));
        }
      });
      
      return Array.from(allTechnologies).sort();
    } catch (error) {
      logger.error('Error getting technologies:', error);
      throw error;
    }
  }

  getPeriod() {
    const startYear = new Date(this.startDate).getFullYear();
    if (this.current) {
      return `${startYear} - Present`;
    }
    const endYear = this.endDate ? new Date(this.endDate).getFullYear() : startYear;
    return startYear === endYear ? `${startYear}` : `${startYear} - ${endYear}`;
  }

  static mapDbToModel(dbRow) {
    return {
      id: dbRow.id,
      title: dbRow.title,
      company: dbRow.company,
      location: dbRow.location,
      startDate: dbRow.start_date,
      endDate: dbRow.end_date,
      current: dbRow.current,
      description: dbRow.description,
      achievements: dbRow.achievements ? JSON.parse(dbRow.achievements) : [],
      technologies: dbRow.technologies ? JSON.parse(dbRow.technologies) : [],
      type: dbRow.type,
      sortOrder: dbRow.sort_order,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at,
    };
  }
}

module.exports = Experience;
