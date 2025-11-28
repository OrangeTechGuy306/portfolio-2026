/**
 * Database Initialization Script
 * 
 * This script creates a default admin user if one doesn't exist.
 * Run with: npx tsx scripts/init-db.ts
 */

import mongoose from 'mongoose';
import User from '../lib/models/User';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';

async function initDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin user exists
    const adminEmail = 'admin@portfolio.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      console.log(`   Email: ${adminEmail}`);
    } else {
      // Create default admin user
      const admin = new User({
        name: 'Admin',
        email: adminEmail,
        password: 'admin123', // Will be hashed automatically
        role: 'super_admin',
        isActive: true,
      });

      await admin.save();

      console.log('✅ Default admin user created successfully!');
      console.log('   Email: admin@portfolio.com');
      console.log('   Password: admin123');
      console.log('   ⚠️  IMPORTANT: Change this password after first login!');
    }

    // Display database stats
    const stats = {
      users: await User.countDocuments(),
    };

    console.log('\n📊 Database Statistics:');
    console.log(`   Users: ${stats.users}`);

    console.log('\n✨ Database initialization complete!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the initialization
initDatabase();

