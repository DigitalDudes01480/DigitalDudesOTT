import Product from '../models/Product.js';

export const getAllProducts = async (req, res) => {
  try {
    const { ottType, status, minPrice, maxPrice, sort, category } = req.query;

    let query = {};

    if (category) {
      query.category = category;
    }

    if (ottType) {
      query.ottType = ottType;
    }

    if (status) {
      query.status = status;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = {};
    if (sort === 'price_asc') {
      sortOption.price = 1;
    } else if (sort === 'price_desc') {
      sortOption.price = -1;
    } else if (sort === 'newest') {
      sortOption.createdAt = -1;
    } else {
      sortOption.createdAt = -1;
    }

    const products = await Product.find(query).populate('category').sort(sortOption);

    // Ensure all products have accountType field in profileTypes (for backward compatibility)
    const productsWithAccountType = products.map(product => {
      const productObj = product.toObject();
      if (productObj.profileTypes) {
        productObj.profileTypes = productObj.profileTypes.map(profile => ({
          ...profile,
          accountType: profile.accountType || 'own'
        }));
      }
      return productObj;
    });

    res.status(200).json({
      success: true,
      count: productsWithAccountType.length,
      products: productsWithAccountType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Ensure accountType field exists in profileTypes (for backward compatibility)
    const productObj = product.toObject();
    if (productObj.profileTypes) {
      productObj.profileTypes = productObj.profileTypes.map(profile => ({
        ...profile,
        accountType: profile.accountType || 'own'
      }));
    }

    res.status(200).json({
      success: true,
      product: productObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };
    
    // Parse profileTypes if it's a string
    if (typeof productData.profileTypes === 'string') {
      productData.profileTypes = JSON.parse(productData.profileTypes);
    }
    
    // Ensure requiresOwnAccount and accountType fields are set in profileTypes
    if (productData.profileTypes && Array.isArray(productData.profileTypes)) {
      productData.profileTypes = productData.profileTypes.map(profile => ({
        ...profile,
        requiresOwnAccount: profile.requiresOwnAccount === true || profile.requiresOwnAccount === 'true',
        accountType: profile.accountType || 'own'
      }));
    }
    
    // Handle image upload
    if (req.file) {
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'Image file size should be less than 5MB'
        });
      }
      
      if (process.env.NODE_ENV === 'production') {
        // Store as base64 in production
        productData.imageData = {
          data: req.file.buffer.toString('base64'),
          contentType: req.file.mimetype,
          filename: req.file.originalname
        };
      } else {
        productData.image = `/uploads/products/${req.file.filename}`;
      }
    } else if (productData.imageUrl) {
      // Use external image URL if provided
      productData.image = productData.imageUrl;
    } else if (productData.existingImage) {
      productData.image = productData.existingImage;
      delete productData.existingImage;
    } else {
      // Set default placeholder image if no image provided
      productData.image = 'https://via.placeholder.com/400x250?text=Product+Image';
    }
    
    // Clean up imageUrl field if it exists
    delete productData.imageUrl;

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    console.log('=== UPDATE PRODUCT BACKEND ===');
    console.log('Received req.body:', JSON.stringify(req.body, null, 2));
    
    const updateData = { ...req.body };
    
    // Parse profileTypes if it's a string
    if (typeof updateData.profileTypes === 'string') {
      console.log('Parsing profileTypes from string:', updateData.profileTypes);
      updateData.profileTypes = JSON.parse(updateData.profileTypes);
    }
    
    console.log('Parsed profileTypes:', JSON.stringify(updateData.profileTypes, null, 2));
    
    // Ensure requiresOwnAccount and accountType fields are preserved in profileTypes
    if (updateData.profileTypes && Array.isArray(updateData.profileTypes)) {
      updateData.profileTypes = updateData.profileTypes.map(profile => {
        console.log('Processing profile:', profile.name, 'accountType:', profile.accountType);
        return {
          ...profile,
          requiresOwnAccount: profile.requiresOwnAccount === true || profile.requiresOwnAccount === 'true',
          // Preserve accountType exactly as sent, don't apply default
          accountType: profile.accountType
        };
      });
    }
    
    console.log('Final profileTypes to save:', JSON.stringify(updateData.profileTypes, null, 2));
    
    // Remove _id from profileTypes to ensure proper update (Mongoose subdocument issue)
    if (updateData.profileTypes && Array.isArray(updateData.profileTypes)) {
      updateData.profileTypes = updateData.profileTypes.map(profile => {
        const { _id, ...profileWithoutId } = profile;
        return profileWithoutId;
      });
      console.log('ProfileTypes after removing _id:', JSON.stringify(updateData.profileTypes, null, 2));
    }
    
    // Handle image upload
    if (req.file) {
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'Image file size should be less than 5MB'
        });
      }
      
      if (process.env.NODE_ENV === 'production') {
        // Store as base64 in production
        updateData.imageData = {
          data: req.file.buffer.toString('base64'),
          contentType: req.file.mimetype,
          filename: req.file.originalname
        };
      } else {
        updateData.image = `/uploads/products/${req.file.filename}`;
      }
    } else if (updateData.imageUrl) {
      // Use external image URL if provided
      updateData.image = updateData.imageUrl;
    } else if (updateData.existingImage) {
      updateData.image = updateData.existingImage;
      delete updateData.existingImage;
    }
    // If no new image and no existing image, keep the current image (don't update it)
    if (!req.file && !updateData.imageUrl && !updateData.existingImage) {
      delete updateData.image;
    }
    
    // Clean up imageUrl field if it exists
    delete updateData.imageUrl;

    // Use find + save instead of findByIdAndUpdate to ensure nested arrays update properly
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update all fields
    Object.keys(updateData).forEach(key => {
      product[key] = updateData[key];
    });

    console.log('Product before save:', JSON.stringify(product.profileTypes, null, 2));
    
    // Save to database
    await product.save();
    
    console.log('Product after save:', JSON.stringify(product.profileTypes, null, 2));

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getOTTTypes = async (req, res) => {
  try {
    const ottTypes = await Product.distinct('ottType');

    res.status(200).json({
      success: true,
      ottTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
