// Script to fix requiresOwnAccount field in production database
// This connects directly to production MongoDB and updates all products

import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Production MongoDB connection string
const PRODUCTION_MONGODB_URI = process.env.PRODUCTION_MONGODB_URI || process.env.MONGODB_URI;

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

async function fixProductionDatabase() {
  try {
    console.log('Connecting to production database...');
    await mongoose.connect(PRODUCTION_MONGODB_URI);
    console.log('✅ Connected to production database');

    const products = await Product.find({});
    console.log(`\nFound ${products.length} products in production database`);

    let updatedCount = 0;

    for (const product of products) {
      let needsUpdate = false;
      
      if (product.profileTypes && Array.isArray(product.profileTypes)) {
        product.profileTypes = product.profileTypes.map(profile => {
          if (profile.requiresOwnAccount === undefined || profile.requiresOwnAccount === null) {
            needsUpdate = true;
            return {
              ...profile.toObject ? profile.toObject() : profile,
              requiresOwnAccount: false
            };
          }
          return profile;
        });

        if (needsUpdate) {
          await Product.updateOne(
            { _id: product._id },
            { $set: { profileTypes: product.profileTypes } }
          );
          updatedCount++;
          console.log(`✅ Updated: ${product.name} (${product._id})`);
        } else {
          console.log(`⏭️  Skipped: ${product.name} (already has requiresOwnAccount field)`);
        }
      }
    }

    console.log(`\n✅ Migration completed!`);
    console.log(`Total products: ${products.length}`);
    console.log(`Products updated: ${updatedCount}`);
    console.log(`Products skipped: ${products.length - updatedCount}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixProductionDatabase();
