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

    // Helper to create or update a user deterministically
    const ensureUser = async ({ username, password, role, name }) => {
      const uname = String(username).toLowerCase().trim();
      let user = await User.findOne({ username: uname });
      if (!user) {
        user = new User({ username: uname, password, role, name });
        await user.save();
        console.log(`✓ ${role} user created`);
        console.log(`  Username: ${uname}`);
      } else {
        // Update password and name if provided
        user.password = password;
        if (name) user.name = name;
        user.role = role;
        await user.save();
        console.log(`✓ ${role} user updated`);
        console.log(`  Username: ${uname}`);
      }
    };

    // Ensure requested ADMIN user (from user instructions)
    await ensureUser({
      username: 'AdminAccomodation',
      password: 'Accomahotsav2K26',
      role: 'ADMIN',
      name: 'Accommodation Admin'
    });

    // Ensure ADMIN: adminuser / accomadminuseR
    await ensureUser({
      username: 'adminuser',
      password: 'accomadminuseR',
      role: 'ADMIN',
      name: 'Admin User'
    });

    // Also ensure baseline accounts (optional)
    await ensureUser({
      username: 'admin',
      password: 'admin123',
      role: 'ADMIN',
      name: 'Admin User'
    });

    // Ensure requested COORDINATOR user
    await ensureUser({
      username: 'AccomCoordinator',
      password: 'AccomCoord@2026',
      role: 'COORDINATOR',
      name: 'Accommodation Coordinator'
    });

    // Ensure COORDINATOR: eventuser / eventuseraccoM
    await ensureUser({
      username: 'eventuser',
      password: 'eventuseraccoM',
      role: 'COORDINATOR',
      name: 'Event Coordinator'
    });

    await ensureUser({
      username: 'coordinator',
      password: 'coord123',
      role: 'COORDINATOR',
      name: 'Coordinator User'
    });

    console.log('\n✅ Initial users setup complete!');
    console.log('\n⚠️  IMPORTANT: Change the default passwords before using in production!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating users:', error.message);
    process.exit(1);
  }
}

createInitialUsers();
