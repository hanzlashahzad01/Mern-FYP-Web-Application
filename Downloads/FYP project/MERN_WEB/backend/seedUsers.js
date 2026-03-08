const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./models/User')
require('dotenv').config({ path: './config.env' })

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'hanzla@gmail.com' })
    
    if (existingAdmin) {
      console.log('👑 Admin user already exists')
    } else {
      // Create admin user with your real credentials
      const adminUser = new User({
        name: 'Hanzla Admin',
        email: 'hanzla@gmail.com',
        password: 'admin123',
        role: 'admin',
        isEmailVerified: true,
        isActive: true
      })
      await adminUser.save()
      console.log('👑 Admin user created successfully')
    }

    console.log('\n🎉 Database setup completed!')
    console.log('\n📋 Admin Login Credentials:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('👑 ADMIN:')
    console.log('   Email: hanzla@gmail.com')
    console.log('   Password: admin123')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n💡 Other users (vendors/customers) can sign up through the registration form!')

    process.exit(0)
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

seedUsers()
