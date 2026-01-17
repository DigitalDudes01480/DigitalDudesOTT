import { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, Edit, Trash2, User } from 'lucide-react';
import { reviewAPI } from '../utils/api';
import { useAuthStore } from '../store/useAuthStore';
import LoadingSpinner from './LoadingSpinner';

const ProductReviews = ({ productId, onReviewAdded }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchReviews();
  }, [productId, currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewAPI.getProductReviews(productId, {
        page: currentPage,
        limit: 5
      });
      
      setReviews(response.data.reviews);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await reviewAPI.deleteReview(productId, reviewId);
      setReviews(reviews.filter(review => review._id !== reviewId));
      if (onReviewAdded) onReviewAdded();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="py-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div
          key={review._id}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {review.user?.name || 'Anonymous User'}
                </h4>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    {renderStars(review.rating)}
                  </div>
                  <span>•</span>
                  <span>{formatDate(review.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Edit/Delete buttons for own reviews */}
            {isAuthenticated && user && review.user?._id === user._id && (
              <div className="flex items-center space-x-2">
                <button
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit review"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteReview(review._id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {review.comment}
          </p>

          {/* Helpful buttons (can be implemented later) */}
          <div className="flex items-center space-x-4 mt-4">
            <button className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <ThumbsUp className="w-4 h-4" />
              <span>Helpful</span>
            </button>
            <button className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <ThumbsDown className="w-4 h-4" />
              <span>Not Helpful</span>
            </button>
          </div>
        </div>
      ))}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
