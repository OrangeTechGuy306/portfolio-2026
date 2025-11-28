const database = require('../config/database');
const logger = require('../config/logger');

class Portfolio {
  constructor(data = {}) {
    this.id = data.id;
    this.title = data.title;
    this.slug = data.slug;
    this.category = data.category;
    this.description = data.description;
    this.longDescription = data.longDescription;
    this.image = data.image;
    this.technologies = data.technologies || [];
    this.liveUrl = data.liveUrl;
    this.githubUrl = data.githubUrl;
    this.featured = data.featured || false;
    this.status = data.status || 'draft';
    this.sortOrder = data.sortOrder || 0;
    this.views = data.views || 0;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS portfolio (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        long_description TEXT,
        image VARCHAR(500),
        technologies JSON,
        live_url VARCHAR(500),
        github_url VARCHAR(500),
        featured BOOLEAN DEFAULT false,
        status ENUM('draft', 'published') DEFAULT 'draft',
        sort_order INT DEFAULT 0,
        views INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_category (category),
        INDEX idx_status (status),
        INDEX idx_featured (featured),
        INDEX idx_sort_order (sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    try {
      await database.query(sql);
      logger.info('Portfolio table created successfully');
    } catch (error) {
      logger.error('Error creating portfolio table:', error);
      throw error;
    }
  }

  generateSlug() {
    if (!this.title) return '';
    return this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  async save() {
    try {
      if (!this.slug) {
        this.slug = this.generateSlug();
      }

      const technologiesJson = JSON.stringify(this.technologies);

      if (this.id) {
        // Update existing portfolio
        const sql = `
          UPDATE portfolio
          SET title = ?, slug = ?, category = ?, description = ?, long_description = ?,
              image = ?, technologies = ?, live_url = ?, github_url = ?, featured = ?,
              status = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;
        const params = [
          this.title,
          this.slug,
          this.category,
          this.description,
          this.longDescription || null,
          this.image || null,
          technologiesJson,
          this.liveUrl || null,
          this.githubUrl || null,
          this.featured || false,
          this.status || 'draft',
          this.sortOrder || 0,
          this.id
        ];
        await database.query(sql, params);
        return this;
      } else {
        // Create new portfolio
        const sql = `
          INSERT INTO portfolio (title, slug, category, description, long_description, image,
                               technologies, live_url, github_url, featured, status, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
          this.title,
          this.slug,
          this.category,
          this.description,
          this.longDescription || null,
          this.image || null,
          technologiesJson,
          this.liveUrl || null,
          this.githubUrl || null,
          this.featured || false,
          this.status || 'draft',
          this.sortOrder || 0
        ];
        const result = await database.query(sql, params);
        this.id = result.insertId;
        return this;
      }
    } catch (error) {
      logger.error('Error saving portfolio:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const sql = 'SELECT * FROM portfolio WHERE id = ?';
      const rows = await database.query(sql, [id]);
      return rows.length > 0 ? new Portfolio(this.mapDbToModel(rows[0])) : null;
    } catch (error) {
      logger.error('Error finding portfolio by ID:', error);
      throw error;
    }
  }

  static async findBySlug(slug) {
    try {
      const sql = 'SELECT * FROM portfolio WHERE slug = ?';
      const rows = await database.query(sql, [slug]);
      return rows.length > 0 ? new Portfolio(this.mapDbToModel(rows[0])) : null;
    } catch (error) {
      logger.error('Error finding portfolio by slug:', error);
      throw error;
    }
  }

  static async findAll(options = {}) {
    try {
      let sql = 'SELECT * FROM portfolio WHERE 1=1';
      const params = [];

      if (options.status) {
        sql += ' AND status = ?';
        params.push(options.status);
      }

      if (options.category) {
        sql += ' AND category = ?';
        params.push(options.category);
      }

      if (options.featured !== undefined) {
        sql += ' AND featured = ?';
        params.push(options.featured);
      }

      if (options.search) {
        sql += ' AND (title LIKE ? OR description LIKE ?)';
        const searchTerm = `%${options.search}%`;
        params.push(searchTerm, searchTerm);
      }

      sql += ' ORDER BY ';
      if (options.orderBy === 'views') {
        sql += 'views DESC, ';
      } else if (options.orderBy === 'title') {
        sql += 'title ASC, ';
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
      return rows.map(row => new Portfolio(this.mapDbToModel(row)));
    } catch (error) {
      logger.error('Error finding all portfolio items:', error);
      throw error;
    }
  }

  async incrementViews() {
    try {
      const sql = 'UPDATE portfolio SET views = views + 1 WHERE id = ?';
      await database.query(sql, [this.id]);
      this.views += 1;
    } catch (error) {
      logger.error('Error incrementing portfolio views:', error);
      throw error;
    }
  }

  async delete() {
    try {
      const sql = 'DELETE FROM portfolio WHERE id = ?';
      await database.query(sql, [this.id]);
    } catch (error) {
      logger.error('Error deleting portfolio:', error);
      throw error;
    }
  }

  static async getCategories() {
    try {
      const sql = 'SELECT DISTINCT category FROM portfolio WHERE status = "published" ORDER BY category';
      const rows = await database.query(sql);
      return rows.map(row => row.category);
    } catch (error) {
      logger.error('Error getting portfolio categories:', error);
      throw error;
    }
  }

  static mapDbToModel(dbRow) {
    return {
      id: dbRow.id,
      title: dbRow.title,
      slug: dbRow.slug,
      category: dbRow.category,
      description: dbRow.description,
      longDescription: dbRow.long_description,
      image: dbRow.image,
      technologies: dbRow.technologies ? JSON.parse(dbRow.technologies) : [],
      liveUrl: dbRow.live_url,
      githubUrl: dbRow.github_url,
      featured: dbRow.featured,
      status: dbRow.status,
      sortOrder: dbRow.sort_order,
      views: dbRow.views,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at,
    };
  }
}

module.exports = Portfolio;
