const database = require('../config/database');
const logger = require('../config/logger');

class Blog {
  constructor(data = {}) {
    this.id = data.id;
    this.title = data.title;
    this.slug = data.slug;
    this.excerpt = data.excerpt;
    this.content = data.content;
    this.image = data.image;
    this.category = data.category;
    this.tags = data.tags || [];
    this.status = data.status || 'draft';
    this.readTime = data.readTime;
    this.views = data.views || 0;
    this.publishDate = data.publishDate;
    this.authorId = data.authorId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static async createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS blog (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        excerpt TEXT,
        content LONGTEXT NOT NULL,
        image VARCHAR(500),
        category VARCHAR(100),
        tags JSON,
        status ENUM('draft', 'published') DEFAULT 'draft',
        read_time VARCHAR(20),
        views INT DEFAULT 0,
        publish_date TIMESTAMP NULL,
        author_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_category (category),
        INDEX idx_status (status),
        INDEX idx_publish_date (publish_date),
        INDEX idx_author (author_id),
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    try {
      await database.query(sql);
      logger.info('Blog table created successfully');
    } catch (error) {
      logger.error('Error creating blog table:', error);
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

  calculateReadTime() {
    if (!this.content) return '1 min read';
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  }

  async save() {
    try {
      if (!this.slug) {
        this.slug = this.generateSlug();
      }
      
      if (!this.readTime) {
        this.readTime = this.calculateReadTime();
      }

      const tagsJson = JSON.stringify(this.tags);

      if (this.id) {
        // Update existing blog post
        const sql = `
          UPDATE blog
          SET title = ?, slug = ?, excerpt = ?, content = ?, image = ?, category = ?,
              tags = ?, status = ?, read_time = ?, publish_date = ?, author_id = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;
        const params = [
          this.title,
          this.slug,
          this.excerpt || null,
          this.content,
          this.image || null,
          this.category || null,
          tagsJson,
          this.status || 'draft',
          this.readTime || null,
          this.publishDate || null,
          this.authorId || null,
          this.id
        ];
        await database.query(sql, params);
        return this;
      } else {
        // Create new blog post
        const sql = `
          INSERT INTO blog (title, slug, excerpt, content, image, category, tags,
                           status, read_time, publish_date, author_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
          this.title,
          this.slug,
          this.excerpt || null,
          this.content,
          this.image || null,
          this.category || null,
          tagsJson,
          this.status || 'draft',
          this.readTime || null,
          this.publishDate || null,
          this.authorId || null
        ];
        const result = await database.query(sql, params);
        this.id = result.insertId;
        return this;
      }
    } catch (error) {
      logger.error('Error saving blog post:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const sql = `
        SELECT b.*, u.name as author_name, u.email as author_email
        FROM blog b
        LEFT JOIN users u ON b.author_id = u.id
        WHERE b.id = ?
      `;
      const rows = await database.query(sql, [id]);
      return rows.length > 0 ? new Blog(this.mapDbToModel(rows[0])) : null;
    } catch (error) {
      logger.error('Error finding blog post by ID:', error);
      throw error;
    }
  }

  static async findBySlug(slug) {
    try {
      const sql = `
        SELECT b.*, u.name as author_name, u.email as author_email
        FROM blog b
        LEFT JOIN users u ON b.author_id = u.id
        WHERE b.slug = ?
      `;
      const rows = await database.query(sql, [slug]);
      return rows.length > 0 ? new Blog(this.mapDbToModel(rows[0])) : null;
    } catch (error) {
      logger.error('Error finding blog post by slug:', error);
      throw error;
    }
  }

  static async findAll(options = {}) {
    try {
      let sql = `
        SELECT b.*, u.name as author_name, u.email as author_email
        FROM blog b
        LEFT JOIN users u ON b.author_id = u.id
        WHERE 1=1
      `;
      const params = [];

      if (options.status) {
        sql += ' AND b.status = ?';
        params.push(options.status);
      }

      if (options.category) {
        sql += ' AND b.category = ?';
        params.push(options.category);
      }

      if (options.tag) {
        sql += ' AND JSON_CONTAINS(b.tags, ?)';
        params.push(JSON.stringify(options.tag));
      }

      if (options.search) {
        sql += ' AND (b.title LIKE ? OR b.excerpt LIKE ? OR b.content LIKE ?)';
        const searchTerm = `%${options.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      sql += ' ORDER BY ';
      if (options.orderBy === 'views') {
        sql += 'b.views DESC, ';
      } else if (options.orderBy === 'title') {
        sql += 'b.title ASC, ';
      }
      sql += 'b.publish_date DESC, b.created_at DESC';

      if (options.limit) {
        sql += ' LIMIT ?';
        params.push(parseInt(options.limit));
        
        if (options.offset) {
          sql += ' OFFSET ?';
          params.push(parseInt(options.offset));
        }
      }

      const rows = await database.query(sql, params);
      return rows.map(row => new Blog(this.mapDbToModel(row)));
    } catch (error) {
      logger.error('Error finding all blog posts:', error);
      throw error;
    }
  }

  async incrementViews() {
    try {
      const sql = 'UPDATE blog SET views = views + 1 WHERE id = ?';
      await database.query(sql, [this.id]);
      this.views += 1;
    } catch (error) {
      logger.error('Error incrementing blog views:', error);
      throw error;
    }
  }

  async delete() {
    try {
      const sql = 'DELETE FROM blog WHERE id = ?';
      await database.query(sql, [this.id]);
    } catch (error) {
      logger.error('Error deleting blog post:', error);
      throw error;
    }
  }

  static async getCategories() {
    try {
      const sql = 'SELECT DISTINCT category FROM blog WHERE status = "published" AND category IS NOT NULL ORDER BY category';
      const rows = await database.query(sql);
      return rows.map(row => row.category);
    } catch (error) {
      logger.error('Error getting blog categories:', error);
      throw error;
    }
  }

  static async getTags() {
    try {
      const sql = 'SELECT tags FROM blog WHERE status = "published" AND tags IS NOT NULL';
      const rows = await database.query(sql);
      
      const allTags = new Set();
      rows.forEach(row => {
        if (row.tags) {
          const tags = JSON.parse(row.tags);
          tags.forEach(tag => allTags.add(tag));
        }
      });
      
      return Array.from(allTags).sort();
    } catch (error) {
      logger.error('Error getting blog tags:', error);
      throw error;
    }
  }

  static mapDbToModel(dbRow) {
    const mapped = {
      id: dbRow.id,
      title: dbRow.title,
      slug: dbRow.slug,
      excerpt: dbRow.excerpt,
      content: dbRow.content,
      image: dbRow.image,
      category: dbRow.category,
      tags: dbRow.tags ? JSON.parse(dbRow.tags) : [],
      status: dbRow.status,
      readTime: dbRow.read_time,
      views: dbRow.views,
      publishDate: dbRow.publish_date,
      authorId: dbRow.author_id,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at,
    };

    // Add author info if available
    if (dbRow.author_name) {
      mapped.author = {
        name: dbRow.author_name,
        email: dbRow.author_email,
      };
    }

    return mapped;
  }
}

module.exports = Blog;
