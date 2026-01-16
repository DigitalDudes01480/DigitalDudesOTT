import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ShopBanner = ({ banners = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Auto-advance every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, banners.length]);

  if (!banners || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    setIsAutoPlaying(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
    setIsAutoPlaying(false);
  };

  return (
    <div className="relative w-full h-full">
      {/* Instagram Story-like Banner */}
      <div className="relative w-full h-[600px] rounded-2xl overflow-hidden shadow-2xl group">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          <img
            src={currentBanner.image || '/placeholder-banner.jpg'}
            alt={currentBanner.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
        </div>

        {/* Progress Indicators (Story-style) */}
        <div className="absolute top-4 left-4 right-4 flex gap-1 z-20">
          {banners.map((_, index) => (
            <div
              key={index}
              className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className={`h-full bg-white transition-all duration-300 ${
                  index === currentIndex ? 'w-full' : index < currentIndex ? 'w-full' : 'w-0'
                }`}
              ></div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
          <div className="space-y-3">
            {currentBanner.badge && (
              <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-xs font-bold rounded-full shadow-lg">
                {currentBanner.badge}
              </span>
            )}
            <h3 className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg">
              {currentBanner.title}
            </h3>
            {currentBanner.description && (
              <p className="text-sm sm:text-base text-white/90 drop-shadow-md max-w-md">
                {currentBanner.description}
              </p>
            )}
            {currentBanner.link && (
              <a
                href={currentBanner.link}
                className="inline-block mt-3 px-6 py-3 bg-white text-primary-600 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                {currentBanner.buttonText || 'Shop Now'}
              </a>
            )}
          </div>
        </div>

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </>
        )}

        {/* Tap Areas for Mobile (Story-style) */}
        {banners.length > 1 && (
          <div className="absolute inset-0 flex z-10 lg:hidden">
            <button
              onClick={handlePrevious}
              className="flex-1"
              aria-label="Previous banner"
            />
            <button
              onClick={handleNext}
              className="flex-1"
              aria-label="Next banner"
            />
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {banners.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {banners.map((banner, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsAutoPlaying(false);
              }}
              className={`flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-primary-500 shadow-lg scale-105'
                  : 'border-gray-300 dark:border-gray-600 opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={banner.image || '/placeholder-banner.jpg'}
                alt={`Banner ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopBanner;
