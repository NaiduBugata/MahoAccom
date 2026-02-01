// Seed data script - Initialize rooms for Mahotsav events
// Run this script once to populate the database with initial room data
// IMPORTANT: Rooms are pre-created by Admin - Boys and Girls have separate rooms

require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('./models/Room');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Sample room data - Customize based on your event requirements
// DOMAIN RULE: Boy and Girl MUST have separate rooms - never mix genders
const sampleRooms = [
  // Boy rooms
  { roomNumber: 101, gender: 'Boy', totalCapacity: 50, occupiedCount: 0, block: 'A Block', floor: '1st Floor' },
  { roomNumber: 102, gender: 'Boy', totalCapacity: 50, occupiedCount: 0, block: 'A Block', floor: '1st Floor' },
  { roomNumber: 103, gender: 'Boy', totalCapacity: 50, occupiedCount: 0, block: 'A Block', floor: '1st Floor' },
  { roomNumber: 104, gender: 'Boy', totalCapacity: 50, occupiedCount: 0, block: 'A Block', floor: '1st Floor' },
  { roomNumber: 105, gender: 'Boy', totalCapacity: 50, occupiedCount: 0, block: 'A Block', floor: '2nd Floor' },
  { roomNumber: 106, gender: 'Boy', totalCapacity: 40, occupiedCount: 0, block: 'A Block', floor: '2nd Floor' },
  { roomNumber: 107, gender: 'Boy', totalCapacity: 40, occupiedCount: 0, block: 'A Block', floor: '2nd Floor' },
  { roomNumber: 108, gender: 'Boy', totalCapacity: 40, occupiedCount: 0, block: 'A Block', floor: '2nd Floor' },
  
  // Girl rooms
  { roomNumber: 201, gender: 'Girl', totalCapacity: 50, occupiedCount: 0, block: 'H Block', floor: '1st Floor' },
  { roomNumber: 202, gender: 'Girl', totalCapacity: 50, occupiedCount: 0, block: 'H Block', floor: '1st Floor' },
  { roomNumber: 203, gender: 'Girl', totalCapacity: 50, occupiedCount: 0, block: 'H Block', floor: '1st Floor' },
  { roomNumber: 204, gender: 'Girl', totalCapacity: 50, occupiedCount: 0, block: 'H Block', floor: '1st Floor' },
  { roomNumber: 205, gender: 'Girl', totalCapacity: 50, occupiedCount: 0, block: 'H Block', floor: '2nd Floor' },
  { roomNumber: 206, gender: 'Girl', totalCapacity: 40, occupiedCount: 0, block: 'H Block', floor: '2nd Floor' },
  { roomNumber: 207, gender: 'Girl', totalCapacity: 40, occupiedCount: 0, block: 'H Block', floor: '2nd Floor' },
  { roomNumber: 208, gender: 'Girl', totalCapacity: 40, occupiedCount: 0, block: 'H Block', floor: '2nd Floor' },
];

const seedRooms = async () => {
  try {
    await connectDB();

    // Clear existing rooms
    await Room.deleteMany({});
    console.log('🗑️  Cleared existing rooms');

    // Insert new rooms
    const createdRooms = await Room.insertMany(sampleRooms);
    console.log(`✅ Created ${createdRooms.length} rooms successfully`);

    // Display summary
    console.log('\n📊 Room Summary:');
    const boyRooms = createdRooms.filter(r => r.gender === 'Boy');
    const girlRooms = createdRooms.filter(r => r.gender === 'Girl');

    console.log(`   Boy: ${boyRooms.length} rooms (${boyRooms.reduce((acc, r) => acc + r.totalCapacity, 0)} total capacity)`);
    console.log(`   Girl: ${girlRooms.length} rooms (${girlRooms.reduce((acc, r) => acc + r.totalCapacity, 0)} total capacity)`);
    
    console.log('\n📝 Boy Rooms:');
    boyRooms.forEach(r => {
      console.log(`   Room ${r.roomNumber}: Capacity ${r.totalCapacity}, Occupied ${r.occupiedCount}`);
    });
    
    console.log('\n📝 Girl Rooms:');
    girlRooms.forEach(r => {
      console.log(`   Room ${r.roomNumber}: Capacity ${r.totalCapacity}, Occupied ${r.occupiedCount}`);
    });

    console.log('\n✅ Database seeded successfully!');
    console.log('🔒 DOMAIN RULE ENFORCED: Boy and Girl have separate rooms');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedRooms();
