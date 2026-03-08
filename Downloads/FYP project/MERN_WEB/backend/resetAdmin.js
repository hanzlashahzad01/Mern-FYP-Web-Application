const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './config.env' });

const resetAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const email = 'hanzla@gmail.com';
        const newPassword = 'admin123';

        let user = await User.findOne({ email });

        if (!user) {
            console.log('User not found, creating new admin...');
            user = new User({
                name: 'Hanzla Admin',
                email: email,
                password: newPassword,
                role: 'admin',
                isActive: true,
                isEmailVerified: true
            });
        } else {
            console.log('User found, updating password...');
            user.password = newPassword;
            // Ensure other fields are correct just in case
            user.role = 'admin';
            user.isActive = true;
        }

        await user.save();
        console.log(`✅ Admin password reset to: ${newPassword}`);

        // Verify it
        const updatedUser = await User.findOne({ email }).select('+password');
        console.log('Is Active:', updatedUser.isActive);
        console.log('Role:', updatedUser.role);
        console.log('Hashed Password:', updatedUser.password);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

resetAdmin();
