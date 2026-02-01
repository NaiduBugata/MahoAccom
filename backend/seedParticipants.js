// Seed Test Participants for Mahotsav System
// Creates sample participants with various payment statuses

require('dotenv').config();
const mongoose = require('mongoose');
const Participant = require('./models/Participant');
const connectDB = require('./config/database');

const testParticipants = [
  {
    mhid: 'MH001',
    name: 'Rahul Sharma',
    gender: 'Boys',
    contactNumber: '9876543210',
    email: 'rahul@example.com',
    paymentStatus: 'Paid'
  },
  {
    mhid: 'MH002',
    name: 'Priya Patel',
    gender: 'Girls',
    contactNumber: '9876543211',
    email: 'priya@example.com',
    paymentStatus: 'Paid'
  },
  {
    mhid: 'MH003',
    name: 'Amit Kumar',
    gender: 'Boys',
    contactNumber: '9876543212',
    email: 'amit@example.com',
    paymentStatus: 'Unpaid'
  },
  {
    mhid: 'MH004',
    name: 'Sneha Gupta',
    gender: 'Girls',
    contactNumber: '9876543213',
    email: 'sneha@example.com',
    paymentStatus: 'Unpaid'
  },
  {
    mhid: 'MH005',
    name: 'Vikram Singh',
    gender: 'Boys',
    contactNumber: '9876543214',
    email: 'vikram@example.com',
    paymentStatus: 'Paid'
  },
  {
    mhid: 'MH006',
    name: 'Anjali Verma',
    gender: 'Girls',
    contactNumber: '9876543215',
    email: 'anjali@example.com',
    paymentStatus: 'Paid'
  }
];

async function seedParticipants() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ MongoDB Connected');

    // Clear existing participants
    await Participant.deleteMany({});
    console.log('🗑️  Cleared existing participants');

    // Insert test participants
    await Participant.insertMany(testParticipants);
    console.log(`✅ Created ${testParticipants.length} test participants`);

    // Display summary
    const paid = testParticipants.filter(p => p.paymentStatus === 'Paid').length;
    const unpaid = testParticipants.filter(p => p.paymentStatus === 'Unpaid').length;
    const boys = testParticipants.filter(p => p.gender === 'Boys').length;
    const girls = testParticipants.filter(p => p.gender === 'Girls').length;

    console.log('\n📊 Participant Summary:');
    console.log(`   Total: ${testParticipants.length} participants`);
    console.log(`   Paid: ${paid} | Unpaid: ${unpaid}`);
    console.log(`   Boys: ${boys} | Girls: ${girls}`);

    console.log('\n📝 Test Participants:');
    testParticipants.forEach(p => {
      console.log(`   ${p.mhid} - ${p.name} (${p.gender}, ${p.paymentStatus})`);
    });

    console.log('\n✅ Test participants seeded successfully!');
    console.log('💡 Use these MHIDs to test the system:');
    console.log('   MH001, MH002 (Paid - ready for allocation)');
    console.log('   MH003, MH004 (Unpaid - payment required)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding participants:', error);
    process.exit(1);
  }
}

seedParticipants();
