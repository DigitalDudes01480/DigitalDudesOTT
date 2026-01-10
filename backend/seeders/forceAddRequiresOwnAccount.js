import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/database.js';

dotenv.config();

const forceAddRequiresOwnAccount = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    // Use direct MongoDB operations to ensure the field is added
    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');

    const products = await productsCollection.find({}).toArray();
    console.log(`Found ${products.length} products`);

    let updatedCount = 0;

    for (const product of products) {
      if (product.profileTypes && Array.isArray(product.profileTypes)) {
        const updatedProfileTypes = product.profileTypes.map(profile => {
          // Force add requiresOwnAccount if it doesn't exist
          if (!profile.hasOwnProperty('requiresOwnAccount')) {
            return { ...profile, requiresOwnAccount: false };
          }
          return profile;
        });

        // Update the product with new profileTypes
        await productsCollection.updateOne(
          { _id: product._id },
          { $set: { profileTypes: updatedProfileTypes } }
        );

        updatedCount++;
        console.log(`✅ Updated: ${product.name}`);
      }
    }

    console.log(`\n✅ Migration completed!`);
    console.log(`Total products: ${products.length}`);
    console.log(`Products updated: ${updatedCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

forceAddRequiresOwnAccount();
