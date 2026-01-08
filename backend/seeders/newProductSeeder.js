import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected:', mongoose.connection.host);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@digitaldudes.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    let admin = await User.findOne({ email: adminEmail });
    
    if (!admin) {
      admin = await User.create({
        name: 'Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isActive: true,
        emailVerified: true
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    await Product.deleteMany({});
    console.log('Cleared existing products');

    const sampleProducts = [
      {
        name: 'Netflix Premium Subscription',
        ottType: 'Netflix',
        description: 'Stream unlimited movies and TV shows in stunning 4K quality. Watch on multiple devices simultaneously.',
        image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400',
        status: 'active',
        stockQuantity: 100,
        profileTypes: [
          {
            name: 'Shared',
            description: 'Share with friends and family',
            screenCount: 4,
            quality: '4K',
            pricingOptions: [
              { duration: { value: 1, unit: 'month' }, price: 299, originalPrice: 399 },
              { duration: { value: 3, unit: 'months' }, price: 799, originalPrice: 1197 },
              { duration: { value: 6, unit: 'months' }, price: 1499, originalPrice: 2394 },
              { duration: { value: 12, unit: 'months' }, price: 2799, originalPrice: 4788 }
            ]
          },
          {
            name: 'Private',
            description: 'Personal account for you only',
            screenCount: 1,
            quality: '4K',
            pricingOptions: [
              { duration: { value: 1.5, unit: 'month' }, price: 499, originalPrice: 599 },
              { duration: { value: 3, unit: 'months' }, price: 1299, originalPrice: 1797 },
              { duration: { value: 6, unit: 'months' }, price: 2399, originalPrice: 3594 },
              { duration: { value: 12, unit: 'months' }, price: 4499, originalPrice: 7188 }
            ]
          }
        ]
      },
      {
        name: 'Prime Video Subscription',
        ottType: 'Prime Video',
        description: 'Enjoy exclusive Amazon Originals, movies, and TV shows with Prime Video.',
        image: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=400',
        status: 'active',
        stockQuantity: 150,
        profileTypes: [
          {
            name: 'Shared',
            description: 'Multiple profiles supported',
            screenCount: 3,
            quality: 'FHD',
            pricingOptions: [
              { duration: { value: 1, unit: 'month' }, price: 199, originalPrice: 299 },
              { duration: { value: 3, unit: 'months' }, price: 549, originalPrice: 897 },
              { duration: { value: 6, unit: 'months' }, price: 999, originalPrice: 1794 },
              { duration: { value: 12, unit: 'months' }, price: 1899, originalPrice: 3588 }
            ]
          },
          {
            name: 'Private',
            description: 'Your personal streaming account',
            screenCount: 1,
            quality: 'FHD',
            pricingOptions: [
              { duration: { value: 1, unit: 'month' }, price: 349, originalPrice: 449 },
              { duration: { value: 3, unit: 'months' }, price: 949, originalPrice: 1347 },
              { duration: { value: 6, unit: 'months' }, price: 1799, originalPrice: 2694 },
              { duration: { value: 12, unit: 'months' }, price: 3399, originalPrice: 5388 }
            ]
          }
        ]
      },
      {
        name: 'Disney+ Hotstar VIP',
        ottType: 'Disney+',
        description: 'Watch Disney, Marvel, Star Wars, and exclusive sports content.',
        image: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400',
        status: 'active',
        stockQuantity: 80,
        profileTypes: [
          {
            name: 'Shared',
            description: 'Family sharing enabled',
            screenCount: 4,
            quality: 'FHD',
            pricingOptions: [
              { duration: { value: 1, unit: 'month' }, price: 149, originalPrice: 199 },
              { duration: { value: 3, unit: 'months' }, price: 399, originalPrice: 597 },
              { duration: { value: 6, unit: 'months' }, price: 749, originalPrice: 1194 },
              { duration: { value: 12, unit: 'months' }, price: 1399, originalPrice: 2388 }
            ]
          }
        ]
      },
      {
        name: 'Spotify Premium',
        ottType: 'Spotify',
        description: 'Ad-free music streaming with offline downloads and unlimited skips.',
        image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=400',
        status: 'active',
        stockQuantity: 200,
        profileTypes: [
          {
            name: 'Individual',
            description: 'For one person',
            screenCount: 1,
            quality: 'HD',
            pricingOptions: [
              { duration: { value: 1, unit: 'month' }, price: 119, originalPrice: 149 },
              { duration: { value: 3, unit: 'months' }, price: 329, originalPrice: 447 },
              { duration: { value: 6, unit: 'months' }, price: 629, originalPrice: 894 },
              { duration: { value: 12, unit: 'months' }, price: 1199, originalPrice: 1788 }
            ]
          },
          {
            name: 'Family',
            description: 'Up to 6 accounts',
            screenCount: 6,
            quality: 'HD',
            pricingOptions: [
              { duration: { value: 1, unit: 'month' }, price: 179, originalPrice: 229 },
              { duration: { value: 3, unit: 'months' }, price: 499, originalPrice: 687 },
              { duration: { value: 6, unit: 'months' }, price: 949, originalPrice: 1374 },
              { duration: { value: 12, unit: 'months' }, price: 1799, originalPrice: 2748 }
            ]
          }
        ]
      }
    ];

    await Product.insertMany(sampleProducts);
    console.log('Sample products created successfully');

    console.log('\n=== Seeding completed successfully ===');
    console.log(`Admin Email: ${adminEmail}`);
    console.log(`Admin Password: ${adminPassword}`);
    console.log(`Products Created: ${sampleProducts.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
