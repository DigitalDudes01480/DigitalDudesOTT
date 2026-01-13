const SkeletonCard = () => {
  return (
    <div className="card h-full flex flex-col animate-pulse">
      <div className="relative overflow-hidden rounded-xl mb-4 bg-gray-200 dark:bg-gray-700 h-64"></div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2 w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2 w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 w-5/6"></div>
      <div className="flex items-center justify-between mt-auto">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-24"></div>
        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
