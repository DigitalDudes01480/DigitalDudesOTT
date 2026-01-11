import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  displayOrder: {
    type: Number,
    default: 0,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  icon: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for sorting by display order
categorySchema.index({ displayOrder: 1 });

const Category = mongoose.model('Category', categorySchema);

export default Category;
