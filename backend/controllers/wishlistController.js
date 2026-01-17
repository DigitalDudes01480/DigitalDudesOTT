import User from '../models/User.js';
import Product from '../models/Product.js';

// Add product to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find user and add to wishlist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if product is already in wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Product is already in your wishlist'
      });
    }

    // Add to wishlist
    user.wishlist.push(productId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist successfully',
      data: {
        wishlist: user.wishlist,
        wishlistCount: user.wishlist.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Remove product from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Find user and remove from wishlist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if product is in wishlist
    if (!user.wishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Product is not in your wishlist'
      });
    }

    // Remove from wishlist
    user.wishlist.pull(productId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist successfully',
      data: {
        wishlist: user.wishlist,
        wishlistCount: user.wishlist.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user's wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    // Find user with populated wishlist
    const user = await User.findById(userId)
      .populate({
        path: 'wishlist',
        select: 'name description image ottType profileTypes status category'
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedWishlist = user.wishlist.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      message: 'Wishlist retrieved successfully',
      data: {
        products: paginatedWishlist,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(user.wishlist.length / limit),
          totalProducts: user.wishlist.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Check if product is in user's wishlist
export const checkWishlistStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // If user is not authenticated, return false
    if (!req.user) {
      return res.status(200).json({
        success: true,
        message: 'Wishlist status checked successfully',
        data: {
          isInWishlist: false,
          wishlistCount: 0
        }
      });
    }

    const userId = req.user._id;
    const user = await User.findById(userId).select('wishlist');
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Wishlist status checked successfully',
        data: {
          isInWishlist: false,
          wishlistCount: 0
        }
      });
    }

    const isInWishlist = user.wishlist.includes(productId);

    res.status(200).json({
      success: true,
      message: 'Wishlist status checked successfully',
      data: {
        isInWishlist,
        wishlistCount: user.wishlist.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Clear entire wishlist
export const clearWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.wishlist = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Wishlist cleared successfully',
      data: {
        wishlist: [],
        wishlistCount: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
