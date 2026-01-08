import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import connectDB from '../config/database.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });

    if (adminExists) {
      console.log('Admin user already exists');
    } else {
      await User.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@digitaldudes.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@123',
        role: 'admin',
        isActive: true,
        isEmailVerified: true
      });
      console.log('Admin user created successfully');
    }

    const productCount = await Product.countDocuments();

    if (productCount === 0) {
      const sampleProducts = [
        {
          name: 'Netflix Premium - 1 Month',
          ottType: 'Netflix',
          duration: { value: 1, unit: 'month' },
          price: 15.99,
          originalPrice: 19.99,
          description: 'Netflix Premium subscription with 4K Ultra HD streaming and 4 screens',
          features: ['4K Ultra HD', '4 Screens', 'Download on 6 devices', 'Unlimited movies & TV shows'],
          status: 'active',
          stockQuantity: 50,
          screenCount: 4,
          quality: '4K',
          image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500'
        },
        {
          name: 'Netflix Premium - 3 Months',
          ottType: 'Netflix',
          duration: { value: 3, unit: 'months' },
          price: 42.99,
          originalPrice: 59.99,
          description: 'Netflix Premium subscription for 3 months with 4K streaming',
          features: ['4K Ultra HD', '4 Screens', 'Download on 6 devices', 'Unlimited content'],
          status: 'active',
          stockQuantity: 30,
          screenCount: 4,
          quality: '4K',
          image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500'
        },
        {
          name: 'Prime Video - 1 Month',
          ottType: 'Prime Video',
          duration: { value: 1, unit: 'month' },
          price: 8.99,
          originalPrice: 12.99,
          description: 'Amazon Prime Video subscription with thousands of movies and TV shows',
          features: ['HD Streaming', '3 Screens', 'Download content', 'Amazon Originals'],
          status: 'active',
          stockQuantity: 40,
          screenCount: 3,
          quality: 'HD',
          image: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=500'
        },
        {
          name: 'Disney+ - 1 Month',
          ottType: 'Disney+',
          duration: { value: 1, unit: 'month' },
          price: 7.99,
          originalPrice: 10.99,
          description: 'Disney+ with Marvel, Star Wars, Pixar, and National Geographic',
          features: ['4K UHD', '4 Screens', 'Download unlimited', 'All Disney content'],
          status: 'active',
          stockQuantity: 35,
          screenCount: 4,
          quality: '4K',
          image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500'
        },
        {
          name: 'Spotify Premium - 1 Month',
          ottType: 'Spotify',
          duration: { value: 1, unit: 'month' },
          price: 9.99,
          originalPrice: 12.99,
          description: 'Spotify Premium - Ad-free music streaming',
          features: ['Ad-free music', 'Offline download', 'High quality audio', 'Unlimited skips'],
          status: 'active',
          stockQuantity: 60,
          screenCount: 1,
          quality: 'HD',
          image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=500'
        },
        {
          name: 'YouTube Premium - 1 Month',
          ottType: 'YouTube Premium',
          duration: { value: 1, unit: 'month' },
          price: 11.99,
          originalPrice: 14.99,
          description: 'YouTube Premium with ad-free videos and YouTube Music',
          features: ['Ad-free videos', 'Background play', 'YouTube Music Premium', 'Download videos'],
          status: 'active',
          stockQuantity: 45,
          screenCount: 1,
          quality: '4K',
          image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=500'
        },
        {
          name: 'HBO Max - 1 Month',
          ottType: 'HBO Max',
          duration: { value: 1, unit: 'month' },
          price: 14.99,
          originalPrice: 17.99,
          description: 'HBO Max with all HBO content plus exclusive Max Originals',
          features: ['4K streaming', '3 Screens', 'Download content', 'HBO Originals'],
          status: 'active',
          stockQuantity: 25,
          screenCount: 3,
          quality: '4K',
          image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=500'
        },
        {
          name: 'Apple TV+ - 3 Months',
          ottType: 'Apple TV+',
          duration: { value: 3, unit: 'months' },
          price: 19.99,
          originalPrice: 26.99,
          description: 'Apple TV+ with award-winning Apple Originals',
          features: ['4K HDR', '6 Screens', 'Download offline', 'Apple Originals'],
          status: 'active',
          stockQuantity: 20,
          screenCount: 6,
          quality: '4K',
          image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=500'
        }
      ];

      await Product.insertMany(sampleProducts);
      console.log('Sample products created successfully');
    } else {
      console.log('Products already exist in database');
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedAdmin();
