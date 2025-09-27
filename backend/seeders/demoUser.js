const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createDemoUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Check if demo user already exists
    const existingDemoUser = await User.findOne({ email: 'demo@example.com' });
    
    if (existingDemoUser) {
      console.log('Demo user already exists!');
      return;
    }

    // Create demo user
    const demoUser = new User({
      name: 'Demo Farmer',
      email: 'demo@example.com',
      phone: '9876543210',
      password: 'demo123',
      location: {
        latitude: 28.6139, // Delhi coordinates
        longitude: 77.2090,
        address: 'New Delhi, India'
      },
      role: 'farmer',
      isActive: true
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    demoUser.password = await bcrypt.hash(demoUser.password, salt);

    // Save demo user
    await demoUser.save();
    console.log('Demo user created successfully!');
    console.log('Email: demo@example.com');
    console.log('Password: demo123');

    // Create admin user if it doesn't exist
    const existingAdmin = await User.findOne({ email: 'admin@cropai.com' });
    
    if (!existingAdmin) {
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@cropai.com',
        phone: '9999999999',
        password: 'admin123',
        location: {
          latitude: 28.6139,
          longitude: 77.2090,
          address: 'New Delhi, India'
        },
        role: 'admin',
        isActive: true
      });

      // Hash admin password
      adminUser.password = await bcrypt.hash(adminUser.password, salt);
      await adminUser.save();
      console.log('Admin user created successfully!');
      console.log('Email: admin@cropai.com');
      console.log('Password: admin123');
    }

  } catch (error) {
    console.error('Error creating demo user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seeder
createDemoUser();
