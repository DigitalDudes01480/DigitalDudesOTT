import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';

export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      userUsageLimit,
      validFrom,
      validUntil,
      isActive,
      applicableProducts,
      applicableCategories,
      excludedProducts
    } = req.body;

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      maxDiscountAmount: maxDiscountAmount || null,
      usageLimit: usageLimit || null,
      userUsageLimit: userUsageLimit || 1,
      validFrom,
      validUntil,
      isActive: isActive !== undefined ? isActive : true,
      applicableProducts: applicableProducts || [],
      applicableCategories: applicableCategories || [],
      excludedProducts: excludedProducts || [],
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllCoupons = async (req, res) => {
  try {
    const { isActive, search } = req.query;

    let query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const coupons = await Coupon.find(query)
      .populate('applicableProducts', 'name ottType')
      .populate('applicableCategories', 'name')
      .populate('excludedProducts', 'name ottType')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: coupons.length,
      coupons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('applicableProducts', 'name ottType image')
      .populate('applicableCategories', 'name')
      .populate('excludedProducts', 'name ottType')
      .populate('createdBy', 'name email')
      .populate('usedBy.user', 'name email');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.status(200).json({
      success: true,
      coupon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const {
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      userUsageLimit,
      validFrom,
      validUntil,
      isActive,
      applicableProducts,
      applicableCategories,
      excludedProducts
    } = req.body;

    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    if (description) coupon.description = description;
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (minOrderAmount !== undefined) coupon.minOrderAmount = minOrderAmount;
    if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = maxDiscountAmount;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (userUsageLimit !== undefined) coupon.userUsageLimit = userUsageLimit;
    if (validFrom) coupon.validFrom = validFrom;
    if (validUntil) coupon.validUntil = validUntil;
    if (isActive !== undefined) coupon.isActive = isActive;
    if (applicableProducts) coupon.applicableProducts = applicableProducts;
    if (applicableCategories) coupon.applicableCategories = applicableCategories;
    if (excludedProducts) coupon.excludedProducts = excludedProducts;

    await coupon.save();

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      coupon
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    await coupon.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount, products } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() })
      .populate('applicableProducts')
      .populate('applicableCategories')
      .populate('excludedProducts');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This coupon is no longer active'
      });
    }

    const now = new Date();
    if (now < coupon.validFrom) {
      return res.status(400).json({
        success: false,
        message: `This coupon is valid from ${coupon.validFrom.toLocaleDateString()}`
      });
    }

    if (now > coupon.validUntil) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has expired'
      });
    }

    if (coupon.hasReachedLimit()) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has reached its usage limit'
      });
    }

    if (coupon.hasUserReachedLimit(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You have already used this coupon the maximum number of times'
      });
    }

    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required to use this coupon`
      });
    }

    // Check product applicability
    if (coupon.applicableProducts.length > 0 && products && products.length > 0) {
      const applicableProductIds = coupon.applicableProducts.map(p => p._id.toString());
      const hasApplicableProduct = products.some(p => applicableProductIds.includes(p.toString()));
      
      if (!hasApplicableProduct) {
        return res.status(400).json({
          success: false,
          message: 'This coupon is not applicable to the products in your cart'
        });
      }
    }

    // Check excluded products
    if (coupon.excludedProducts.length > 0 && products && products.length > 0) {
      const excludedProductIds = coupon.excludedProducts.map(p => p._id.toString());
      const hasExcludedProduct = products.some(p => excludedProductIds.includes(p.toString()));
      
      if (hasExcludedProduct) {
        return res.status(400).json({
          success: false,
          message: 'This coupon cannot be applied to some products in your cart'
        });
      }
    }

    const discount = coupon.calculateDiscount(orderAmount);

    res.status(200).json({
      success: true,
      message: 'Coupon is valid',
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount,
        finalAmount: orderAmount - discount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const applyCoupon = async (req, res) => {
  try {
    const { code, orderId } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    const order = await Order.findById(orderId);

    if (!coupon || !order) {
      return res.status(404).json({
        success: false,
        message: 'Coupon or order not found'
      });
    }

    // Update usage count
    coupon.usageCount += 1;
    
    const userUsageIndex = coupon.usedBy.findIndex(
      u => u.user.toString() === req.user._id.toString()
    );
    
    if (userUsageIndex > -1) {
      coupon.usedBy[userUsageIndex].usageCount += 1;
    } else {
      coupon.usedBy.push({
        user: req.user._id,
        usageCount: 1
      });
    }

    await coupon.save();

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getCouponStats = async (req, res) => {
  try {
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ isActive: true });
    const expiredCoupons = await Coupon.countDocuments({ validUntil: { $lt: new Date() } });
    
    const mostUsedCoupons = await Coupon.find()
      .sort('-usageCount')
      .limit(5)
      .select('code description usageCount discountType discountValue');

    res.status(200).json({
      success: true,
      stats: {
        totalCoupons,
        activeCoupons,
        expiredCoupons,
        mostUsedCoupons
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
