const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex justify-center items-center">
      <div className="relative">
        <div className={`${sizeClasses[size]} border-gray-200 dark:border-gray-700 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin`}></div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500/20 to-secondary-500/20 blur-sm"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
