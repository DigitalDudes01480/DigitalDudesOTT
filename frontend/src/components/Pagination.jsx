const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;

  const goTo = (page) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  const buildPages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set([1, totalPages]);
    for (let p = currentPage - 2; p <= currentPage + 2; p++) {
      if (p >= 1 && p <= totalPages) pages.add(p);
    }

    return Array.from(pages).sort((a, b) => a - b);
  };

  const pages = buildPages();

  return (
    <div className="flex items-center justify-center pt-4">
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm dark:text-gray-300 disabled:opacity-50"
        >
          Prev
        </button>

        {pages.map((page, idx) => {
          const prev = pages[idx - 1];
          const showEllipsis = prev && page - prev > 1;

          return (
            <div key={page} className="flex items-center space-x-2">
              {showEllipsis && <span className="px-1 text-gray-400">...</span>}
              <button
                type="button"
                onClick={() => goTo(page)}
                className={`w-9 h-9 rounded-lg text-sm border transition ${
                  page === currentPage
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm dark:text-gray-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
