import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/database.js';

dotenv.config();

const fixNullRequiresOwnAccount = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');

    const products = await productsCollection.find({}).toArray();
    console.log(`Found ${products.length} products`);

    let updatedCount = 0;

    for (const product of products) {
      if (product.profileTypes && Array.isArray(product.profileTypes)) {
        let needsUpdate = false;
        
        const updatedProfileTypes = product.profileTypes.map(profile => {
          // Convert null or undefined to false
          if (profile.requiresOwnAccount === null || profile.requiresOwnAccount === undefined) {
            needsUpdate = true;
            return { ...profile, requiresOwnAccount: false };
          }
          return profile;
        });

        if (needsUpdate) {
          await productsCollection.updateOne(
            { _id: product._id },
            { $set: { profileTypes: updatedProfileTypes } }
          );

          updatedCount++;
          console.log(`✅ Fixed: ${product.name} - Set null requiresOwnAccount to false`);
        } else {
          console.log(`⏭️  Skipped: ${product.name} - Already has valid requiresOwnAccount values`);
        }
      }
    }

    console.log(`\n✅ Migration completed!`);
    console.log(`Total products: ${products.length}`);
    console.log(`Products fixed: ${updatedCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixNullRequiresOwnAccount();
