import mongoose from 'mongoose';

const pricingOptionSchema = new mongoose.Schema({
  duration: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['month', 'months', 'year'],
      default: 'month'
    }
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const profileTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  screenCount: {
    type: Number,
    default: 1
  },
  quality: {
    type: String,
    enum: ['SD', 'HD', 'FHD', '4K', 'UHD'],
    default: 'HD'
  },
  pricingOptions: [pricingOptionSchema]
}, { _id: true });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true
  },
  ottType: {
    type: String,
    required: [true, 'Please specify OTT platform type'],
    enum: ['Netflix', 'Prime Video', 'Disney+', 'Spotify', 'YouTube Premium', 'HBO Max', 'Apple TV+', 'Hulu', 'Paramount+', 'Other']
  },
  profileTypes: {
    type: [profileTypeSchema],
    required: [true, 'Please add at least one profile type'],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Product must have at least one profile type'
    }
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  features: [{
    type: String
  }],
  image: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'disabled'],
    default: 'active'
  },
  stockQuantity: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    enum: ['OTT Platform', 'Music & Entertainment', 'AI Tools & Productivity', 'Dating Services', 'Others'],
    default: 'OTT Platform'
  }
}, {
  timestamps: true
});

productSchema.index({ ottType: 1, status: 1 });

productSchema.virtual('minPrice').get(function() {
  if (!this.profileTypes || this.profileTypes.length === 0) return 0;
  
  let minPrice = Infinity;
  this.profileTypes.forEach(profile => {
    profile.pricingOptions.forEach(option => {
      if (option.price < minPrice) {
        minPrice = option.price;
      }
    });
  });
  
  return minPrice === Infinity ? 0 : minPrice;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

export default Product;
