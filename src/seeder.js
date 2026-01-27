import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('DB Connected...'))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });

const importData = async () => {
    try {
        // 1. Create the Admin User Object
        // Manually setting isVerified: true so we don't need to email verify
        const adminUser = {
            name: 'Super Admin',
            email: 'admin@example.com',
            password: 'adminpassword123',
            role: 'admin',
            isVerified: true
        };

        // 2. Check if admin already exists to avoid duplicates
        const exists = await User.findOne({ email: adminUser.email });
        if (exists) {
            console.log('Admin already exists!');
            process.exit();
        }

        // 3. Create the user
        // We use User.create() which triggers the pre('save') hook to hash the password
        await User.create(adminUser);

        console.log('Admin User Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();