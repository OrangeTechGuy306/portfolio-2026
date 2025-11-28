require('dotenv').config();
const fs = require('fs');
const path = require('path');
const database = require('../../config/database');
const logger = require('../../config/logger');

class MigrationRunner {
  constructor() {
    this.migrationsDir = __dirname;
    this.migrationTableName = 'migrations';
  }

  async init() {
    try {
      await database.connect();
      await this.createMigrationsTable();
    } catch (error) {
      logger.error('Failed to initialize migration runner:', error);
      throw error;
    }
  }

  async createMigrationsTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS ${this.migrationTableName} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_filename (filename)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await database.query(sql);
    logger.info('Migration tracking table ready');
  }

  async getExecutedMigrations() {
    try {
      const result = await database.query(
        `SELECT filename FROM ${this.migrationTableName} ORDER BY executed_at`
      );
      return result.map(row => row.filename);
    } catch (error) {
      logger.error('Failed to get executed migrations:', error);
      return [];
    }
  }

  async markMigrationAsExecuted(filename) {
    await database.query(
      `INSERT INTO ${this.migrationTableName} (filename) VALUES (?)`,
      [filename]
    );
  }

  async removeMigrationRecord(filename) {
    await database.query(
      `DELETE FROM ${this.migrationTableName} WHERE filename = ?`,
      [filename]
    );
  }

  getMigrationFiles() {
    const files = fs.readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.js') && file !== 'migrate.js')
      .sort();
    
    return files;
  }

  async runMigrations() {
    try {
      await this.init();
      
      const migrationFiles = this.getMigrationFiles();
      const executedMigrations = await this.getExecutedMigrations();
      
      const pendingMigrations = migrationFiles.filter(
        file => !executedMigrations.includes(file)
      );

      if (pendingMigrations.length === 0) {
        logger.info('No pending migrations found');
        return;
      }

      logger.info(`Found ${pendingMigrations.length} pending migration(s)`);

      for (const migrationFile of pendingMigrations) {
        logger.info(`Running migration: ${migrationFile}`);
        
        try {
          const migrationPath = path.join(this.migrationsDir, migrationFile);
          const Migration = require(migrationPath);
          
          if (typeof Migration.up === 'function') {
            await Migration.up();
            await this.markMigrationAsExecuted(migrationFile);
            logger.info(`✓ Migration completed: ${migrationFile}`);
          } else {
            logger.warn(`⚠ Migration ${migrationFile} does not have an 'up' method`);
          }
        } catch (error) {
          logger.error(`✗ Migration failed: ${migrationFile}`, error);
          throw error;
        }
      }

      logger.info('All migrations completed successfully!');
    } catch (error) {
      logger.error('Migration process failed:', error);
      throw error;
    }
  }

  async rollbackLastMigration() {
    try {
      await this.init();
      
      const executedMigrations = await this.getExecutedMigrations();
      
      if (executedMigrations.length === 0) {
        logger.info('No migrations to rollback');
        return;
      }

      const lastMigration = executedMigrations[executedMigrations.length - 1];
      logger.info(`Rolling back migration: ${lastMigration}`);

      try {
        const migrationPath = path.join(this.migrationsDir, lastMigration);
        const Migration = require(migrationPath);
        
        if (typeof Migration.down === 'function') {
          await Migration.down();
          await this.removeMigrationRecord(lastMigration);
          logger.info(`✓ Rollback completed: ${lastMigration}`);
        } else {
          logger.warn(`⚠ Migration ${lastMigration} does not have a 'down' method`);
        }
      } catch (error) {
        logger.error(`✗ Rollback failed: ${lastMigration}`, error);
        throw error;
      }
    } catch (error) {
      logger.error('Rollback process failed:', error);
      throw error;
    }
  }

  async getMigrationStatus() {
    try {
      await this.init();
      
      const migrationFiles = this.getMigrationFiles();
      const executedMigrations = await this.getExecutedMigrations();
      
      logger.info('Migration Status:');
      logger.info('================');
      
      if (migrationFiles.length === 0) {
        logger.info('No migration files found');
        return;
      }

      migrationFiles.forEach(file => {
        const isExecuted = executedMigrations.includes(file);
        const status = isExecuted ? '✓ EXECUTED' : '✗ PENDING';
        logger.info(`${status} - ${file}`);
      });

      const pendingCount = migrationFiles.length - executedMigrations.length;
      logger.info('================');
      logger.info(`Total migrations: ${migrationFiles.length}`);
      logger.info(`Executed: ${executedMigrations.length}`);
      logger.info(`Pending: ${pendingCount}`);
    } catch (error) {
      logger.error('Failed to get migration status:', error);
      throw error;
    }
  }

  async reset() {
    try {
      await this.init();
      
      const executedMigrations = await this.getExecutedMigrations();
      
      if (executedMigrations.length === 0) {
        logger.info('No migrations to reset');
        return;
      }

      logger.info('Resetting all migrations...');
      
      // Rollback all migrations in reverse order
      for (let i = executedMigrations.length - 1; i >= 0; i--) {
        const migrationFile = executedMigrations[i];
        logger.info(`Rolling back: ${migrationFile}`);
        
        try {
          const migrationPath = path.join(this.migrationsDir, migrationFile);
          const Migration = require(migrationPath);
          
          if (typeof Migration.down === 'function') {
            await Migration.down();
            await this.removeMigrationRecord(migrationFile);
            logger.info(`✓ Rolled back: ${migrationFile}`);
          }
        } catch (error) {
          logger.error(`✗ Failed to rollback: ${migrationFile}`, error);
          throw error;
        }
      }

      logger.info('All migrations reset successfully!');
    } catch (error) {
      logger.error('Reset process failed:', error);
      throw error;
    }
  }
}

// CLI execution
if (require.main === module) {
  const runner = new MigrationRunner();
  const command = process.argv[2];
  
  switch (command) {
    case 'up':
    case 'migrate':
      runner.runMigrations()
        .then(() => {
          logger.info('Migration process completed!');
          process.exit(0);
        })
        .catch((error) => {
          logger.error('Migration process failed:', error);
          process.exit(1);
        });
      break;
      
    case 'down':
    case 'rollback':
      runner.rollbackLastMigration()
        .then(() => {
          logger.info('Rollback process completed!');
          process.exit(0);
        })
        .catch((error) => {
          logger.error('Rollback process failed:', error);
          process.exit(1);
        });
      break;
      
    case 'status':
      runner.getMigrationStatus()
        .then(() => {
          process.exit(0);
        })
        .catch((error) => {
          logger.error('Status check failed:', error);
          process.exit(1);
        });
      break;
      
    case 'reset':
      runner.reset()
        .then(() => {
          logger.info('Reset process completed!');
          process.exit(0);
        })
        .catch((error) => {
          logger.error('Reset process failed:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage: node migrate.js [command]');
      console.log('Commands:');
      console.log('  up, migrate  - Run pending migrations');
      console.log('  down, rollback - Rollback last migration');
      console.log('  status       - Show migration status');
      console.log('  reset        - Rollback all migrations');
      process.exit(1);
  }
}

module.exports = MigrationRunner;
