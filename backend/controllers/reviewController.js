import Product from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Add a review to a product
export const addReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;

  // Validate rating
  if (rating < 1 || rating > 5) {
    throw new ApiError(400, 'Rating must be between 1 and 5');
  }

  // Validate comment
  if (!comment || comment.trim().length < 10) {
    throw new ApiError(400, 'Comment must be at least 10 characters long');
  }

  // Find the product
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Check if user has already reviewed this product
  const existingReview = product.reviews.find(
    review => review.user.toString() === userId.toString()
  );

  if (existingReview) {
    throw new ApiError(400, 'You have already reviewed this product');
  }

  // Add the review
  product.reviews.push({
    user: userId,
    rating,
    comment: comment.trim()
  });

  // Calculate average rating
  const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
  product.averageRating = totalRating / product.reviews.length;
  product.reviewCount = product.reviews.length;

  await product.save();

  // Populate user info for the response
  await product.populate({
    path: 'reviews.user',
    select: 'name email'
  });

  res.status(201).json(
    new ApiResponse(201, 'Review added successfully', {
      review: product.reviews[product.reviews.length - 1],
      averageRating: product.averageRating,
      reviewCount: product.reviewCount
    })
  );
});

// Get all reviews for a product
export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const product = await Product.findById(productId)
    .populate({
      path: 'reviews.user',
      select: 'name email'
    })
    .select('reviews averageRating reviewCount');

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Sort reviews by newest first
  const sortedReviews = product.reviews.sort((a, b) => b.createdAt - a.createdAt);

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedReviews = sortedReviews.slice(startIndex, endIndex);

  res.status(200).json(
    new ApiResponse(200, 'Reviews retrieved successfully', {
      reviews: paginatedReviews,
      averageRating: product.averageRating,
      reviewCount: product.reviewCount,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(sortedReviews.length / limit),
        totalReviews: sortedReviews.length
      }
    })
  );
});

// Update a review
export const updateReview = asyncHandler(async (req, res) => {
  const { productId, reviewId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;

  // Validate rating
  if (rating < 1 || rating > 5) {
    throw new ApiError(400, 'Rating must be between 1 and 5');
  }

  // Validate comment
  if (!comment || comment.trim().length < 10) {
    throw new ApiError(400, 'Comment must be at least 10 characters long');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Find the review
  const review = product.reviews.id(reviewId);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  // Check if user owns the review
  if (review.user.toString() !== userId.toString()) {
    throw new ApiError(403, 'You can only update your own review');
  }

  // Update the review
  review.rating = rating;
  review.comment = comment.trim();

  // Recalculate average rating
  const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
  product.averageRating = totalRating / product.reviews.length;

  await product.save();

  await product.populate({
    path: 'reviews.user',
    select: 'name email'
  });

  res.status(200).json(
    new ApiResponse(200, 'Review updated successfully', {
      review,
      averageRating: product.averageRating,
      reviewCount: product.reviewCount
    })
  );
});

// Delete a review
export const deleteReview = asyncHandler(async (req, res) => {
  const { productId, reviewId } = req.params;
  const userId = req.user._id;

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Find the review
  const review = product.reviews.id(reviewId);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  // Check if user owns the review or is admin
  if (review.user.toString() !== userId.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only delete your own review');
  }

  // Remove the review
  product.reviews.pull(reviewId);

  // Recalculate average rating
  if (product.reviews.length > 0) {
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.averageRating = totalRating / product.reviews.length;
  } else {
    product.averageRating = 0;
  }
  product.reviewCount = product.reviews.length;

  await product.save();

  res.status(200).json(
    new ApiResponse(200, 'Review deleted successfully', {
      averageRating: product.averageRating,
      reviewCount: product.reviewCount
    })
  );
});
