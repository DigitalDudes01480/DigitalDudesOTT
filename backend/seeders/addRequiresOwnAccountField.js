import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import connectDB from '../config/database.js';

dotenv.config();

const addRequiresOwnAccountField = async () => {
  try {
    await connectDB();

    console.log('Starting migration to add requiresOwnAccount field...');

    // Update all products to ensure profileTypes have requiresOwnAccount field
    const products = await Product.find({});
    
    let updatedCount = 0;
    
    for (const product of products) {
      let needsUpdate = false;
      
      const updatedProfileTypes = product.profileTypes.map(profile => {
        if (profile.requiresOwnAccount === undefined || profile.requiresOwnAccount === null) {
          needsUpdate = true;
          return {
            ...profile.toObject(),
            requiresOwnAccount: false
          };
        }
        return profile;
      });
      
      if (needsUpdate) {
        product.profileTypes = updatedProfileTypes;
        await product.save();
        updatedCount++;
        console.log(`Updated product: ${product.name}`);
      }
    }

    console.log(`\nMigration completed!`);
    console.log(`Total products checked: ${products.length}`);
    console.log(`Products updated: ${updatedCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
};

addRequiresOwnAccountField();
