import { useEffect, useState } from 'react';

const Snowfall = () => {
  const [snowflakes, setSnowflakes] = useState([]);

  useEffect(() => {
    const flakes = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: Math.random() * 5 + 3, // Slower, more realistic fall
      opacity: Math.random() * 0.8 + 0.3,
      size: Math.random() * 6 + 1, // Varying sizes
      delay: Math.random() * 8,
      drift: (Math.random() - 0.5) * 100, // Horizontal drift
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${flake.left}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            animation: `snowfall ${flake.animationDuration}s linear infinite`,
            animationDelay: `${flake.delay}s`,
            boxShadow: `0 0 ${flake.size * 2}px rgba(255, 255, 255, 0.8)`,
            filter: 'blur(0.5px)',
            transform: `translateX(${flake.drift}px)`,
          }}
        />
      ))}
    </div>
  );
};

export default Snowfall;
