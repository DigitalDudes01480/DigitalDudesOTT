import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const MONGODB_URI = 'mongodb+srv://digitaldudes18_db_user:4jeyXrAXrqXTMizs@cluster0.zgql3hs.mongodb.net/digital-dudes?retryWrites=true&w=majority&appName=Cluster0';

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      phone: String,
      role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
      isActive: { type: Boolean, default: true },
      isEmailVerified: { type: Boolean, default: false }
    }, { timestamps: true }));

    // Check if admin exists
    const adminExists = await User.findOne({ email: 'digitaldudes18@gmail.com' });

    if (adminExists) {
      console.log('Admin user already exists');
      console.log('Email:', adminExists.email);
      console.log('Role:', adminExists.role);
    } else {
      // Hash password
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash('Prajjwal@123', salt);

      // Create admin user
      const admin = await User.create({
        name: 'Digital Dudes Admin',
        email: 'digitaldudes18@gmail.com',
        password: hashedPassword,
        phone: '9876543210',
        role: 'admin',
        isActive: true,
        isEmailVerified: true
      });

      console.log('✅ Admin user created successfully!');
      console.log('Email:', admin.email);
      console.log('Password: Prajjwal@123');
      console.log('Role:', admin.role);
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdmin();
