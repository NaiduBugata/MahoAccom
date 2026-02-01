// Create Initial Users for Mahotsav System
// Run this script to create ADMIN and COORDINATOR users

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/database');

async function createInitialUsers() {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database');

    // Check if users already exist
    const existingAdmin = await User.findOne({ role: 'ADMIN' });
    const existingCoordinator = await User.findOne({ role: 'COORDINATOR' });

    // Create ADMIN user
    if (!existingAdmin) {
      const admin = new User({
        username: 'admin',
        password: 'admin123', // Change this password!
        role: 'ADMIN',
        name: 'Admin User'
      });
      await admin.save();
      console.log('✓ ADMIN user created');
      console.log('  Username: admin');
      console.log('  Password: admin123 (CHANGE THIS!)');
    } else {
      console.log('! ADMIN user already exists');
    }

    // Create COORDINATOR user
    if (!existingCoordinator) {
      const coordinator = new User({
        username: 'coordinator',
        password: 'coord123', // Change this password!
        role: 'COORDINATOR',
        name: 'Coordinator User'
      });
      await coordinator.save();
      console.log('✓ COORDINATOR user created');
      console.log('  Username: coordinator');
      console.log('  Password: coord123 (CHANGE THIS!)');
    } else {
      console.log('! COORDINATOR user already exists');
    }

    console.log('\n✅ Initial users setup complete!');
    console.log('\n⚠️  IMPORTANT: Change the default passwords before using in production!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating users:', error.message);
    process.exit(1);
  }
}

createInitialUsers();
