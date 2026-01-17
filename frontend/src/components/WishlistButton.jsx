import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { wishlistAPI } from '../utils/api';
import useAuthStore from '../store/useAuthStore';
import { toast } from 'react-hot-toast';

const WishlistButton = ({ productId, size = 'md', showText = false }) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      checkWishlistStatus();
    } else {
      setIsInWishlist(false);
    }
  }, [productId, isAuthenticated]);

  const checkWishlistStatus = async () => {
    try {
      const response = await wishlistAPI.checkWishlistStatus(productId);
      setIsInWishlist(response.data.isInWishlist);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      setIsInWishlist(false);
    }
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    setLoading(true);
    try {
      if (isInWishlist) {
        await wishlistAPI.removeFromWishlist(productId);
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await wishlistAPI.addToWishlist(productId);
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error(error.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      className={`
        ${buttonSizeClasses[size]}
        rounded-full transition-all duration-200
        ${isInWishlist 
          ? 'bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30' 
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        flex items-center justify-center
        ${showText ? 'space-x-2' : ''}
      `}
      title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart 
        className={`${sizeClasses[size]} ${isInWishlist ? 'fill-current' : ''}`}
      />
      {showText && (
        <span className="text-sm">
          {isInWishlist ? 'Remove' : 'Wishlist'}
        </span>
      )}
    </button>
  );
};

export default WishlistButton;
