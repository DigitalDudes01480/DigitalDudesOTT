const Logo = ({ className = "h-12" }) => {
  return (
    <>
      <img 
        src="/images/logo.png" 
        alt="Digital Dudes Logo" 
        className={className}
        onError={(e) => {
          console.error('Logo failed to load:', e.target.src);
          // Fallback to text if image fails to load
          e.target.style.display = 'none';
          if (e.target.nextSibling) {
            e.target.nextSibling.style.display = 'block';
          }
        }}
        onLoad={() => {
          console.log('Logo loaded successfully');
        }}
      />
      <div 
        className={`${className} flex items-center justify-center bg-gradient-to-r from-primary-500 to-purple-600 text-white font-bold rounded-lg`}
        style={{ display: 'none' }}
      >
        DD
      </div>
    </>
  );
};

export default Logo;
