require('dotenv').config();
const database = require('../../config/database');
const logger = require('../../config/logger');

class Migration {
  static async up() {
    try {
      await database.connect();
      logger.info('Starting database migration...');

      // Create users table
      await this.createUsersTable();
      
      // Create portfolio table
      await this.createPortfolioTable();
      
      // Create experience table
      await this.createExperienceTable();
      
      // Create blog table
      await this.createBlogTable();
      
      // Create contact_messages table
      await this.createContactMessagesTable();
      
      // Create testimonials table
      await this.createTestimonialsTable();

      logger.info('Database migration completed successfully!');
    } catch (error) {
      logger.error('Migration failed:', error);
      throw error;
    }
  }

  static async createUsersTable() {
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
    
    await database.query(sql);
    logger.info('✓ Users table created');
  }

  static async createPortfolioTable() {
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
    
    await database.query(sql);
    logger.info('✓ Portfolio table created');
  }

  static async createExperienceTable() {
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
    
    await database.query(sql);
    logger.info('✓ Experience table created');
  }

  static async createBlogTable() {
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
    
    await database.query(sql);
    logger.info('✓ Blog table created');
  }

  static async createContactMessagesTable() {
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
    
    await database.query(sql);
    logger.info('✓ Contact messages table created');
  }

  static async createTestimonialsTable() {
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
    
    await database.query(sql);
    logger.info('✓ Testimonials table created');
  }

  static async down() {
    try {
      await database.connect();
      logger.info('Starting database rollback...');

      // Drop tables in reverse order (to handle foreign key constraints)
      const tables = [
        'blog',
        'testimonials', 
        'contact_messages',
        'experience',
        'portfolio',
        'users'
      ];

      for (const table of tables) {
        await database.query(`DROP TABLE IF EXISTS ${table}`);
        logger.info(`✓ Dropped table: ${table}`);
      }

      logger.info('Database rollback completed!');
    } catch (error) {
      logger.error('Rollback failed:', error);
      throw error;
    }
  }

  static async status() {
    try {
      await database.connect();
      
      const tables = [
        'users',
        'portfolio', 
        'experience',
        'blog',
        'contact_messages',
        'testimonials'
      ];

      logger.info('Checking database table status...');
      
      for (const table of tables) {
        try {
          const result = await database.query(`SHOW TABLES LIKE '${table}'`);
          const exists = result.length > 0;
          logger.info(`${exists ? '✓' : '✗'} Table '${table}': ${exists ? 'EXISTS' : 'NOT FOUND'}`);
        } catch (error) {
          logger.error(`✗ Error checking table '${table}':`, error.message);
        }
      }
    } catch (error) {
      logger.error('Status check failed:', error);
      throw error;
    }
  }
}

// CLI execution
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'up':
      Migration.up()
        .then(() => {
          logger.info('Migration completed successfully!');
          process.exit(0);
        })
        .catch((error) => {
          logger.error('Migration failed:', error);
          process.exit(1);
        });
      break;
      
    case 'down':
      Migration.down()
        .then(() => {
          logger.info('Rollback completed successfully!');
          process.exit(0);
        })
        .catch((error) => {
          logger.error('Rollback failed:', error);
          process.exit(1);
        });
      break;
      
    case 'status':
      Migration.status()
        .then(() => {
          process.exit(0);
        })
        .catch((error) => {
          logger.error('Status check failed:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage: node 001_create_tables.js [up|down|status]');
      console.log('  up     - Run migration (create tables)');
      console.log('  down   - Rollback migration (drop tables)');
      console.log('  status - Check table status');
      process.exit(1);
  }
}

module.exports = Migration;
