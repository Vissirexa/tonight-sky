import React from 'react';

interface Star {
  size: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  opacity: number;
  delay: number;
}

export const StarryBackground: React.FC = () => {
  // Generate stars for each corner
  const topLeftStars: Star[] = [
    { size: 2, top: '20px', left: '30px', opacity: 0.7, delay: 0 },
    { size: 1.5, top: '60px', left: '20px', opacity: 0.5, delay: 0.5 },
    { size: 1, top: '100px', left: '50px', opacity: 0.4, delay: 1 },
    { size: 2.5, top: '40px', left: '80px', opacity: 0.8, delay: 1.5 },
  ];

  const topRightStars: Star[] = [
    { size: 2, top: '30px', right: '40px', opacity: 0.6, delay: 0.3 },
    { size: 1.5, top: '70px', right: '25px', opacity: 0.5, delay: 0.8 },
    { size: 1, top: '50px', right: '70px', opacity: 0.4, delay: 1.3 },
    { size: 2.5, top: '100px', right: '50px', opacity: 0.7, delay: 1.8 },
  ];

  const bottomLeftStars: Star[] = [
    { size: 2, bottom: '40px', left: '25px', opacity: 0.6, delay: 0.2 },
    { size: 1.5, bottom: '80px', left: '45px', opacity: 0.5, delay: 0.7 },
    { size: 1, bottom: '60px', left: '15px', opacity: 0.4, delay: 1.2 },
    { size: 2.5, bottom: '100px', left: '60px', opacity: 0.8, delay: 1.7 },
  ];

  const bottomRightStars: Star[] = [
    { size: 2, bottom: '30px', right: '35px', opacity: 0.7, delay: 0.4 },
    { size: 1.5, bottom: '70px', right: '20px', opacity: 0.5, delay: 0.9 },
    { size: 1, bottom: '50px', right: '60px', opacity: 0.4, delay: 1.4 },
    { size: 2.5, bottom: '90px', right: '45px', opacity: 0.8, delay: 1.9 },
  ];

  // Add more sparse stars across the page
  const sparseStars: Star[] = [
    // Top section
    { size: 1, top: '15%', left: '20%', opacity: 0.3, delay: 2 },
    { size: 1.5, top: '8%', left: '35%', opacity: 0.4, delay: 2.3 },
    { size: 1, top: '12%', left: '65%', opacity: 0.3, delay: 2.6 },
    { size: 1.5, top: '18%', left: '85%', opacity: 0.5, delay: 2.9 },

    // Middle section
    { size: 1, top: '35%', left: '10%', opacity: 0.3, delay: 3.2 },
    { size: 1, top: '40%', left: '25%', opacity: 0.4, delay: 3.5 },
    { size: 1.5, top: '45%', left: '50%', opacity: 0.3, delay: 3.8 },
    { size: 1, top: '38%', left: '75%', opacity: 0.4, delay: 4.1 },
    { size: 1, top: '42%', left: '90%', opacity: 0.3, delay: 4.4 },

    // Lower middle section
    { size: 1.5, top: '60%', left: '15%', opacity: 0.4, delay: 4.7 },
    { size: 1, top: '65%', left: '30%', opacity: 0.3, delay: 5 },
    { size: 1, top: '58%', left: '55%', opacity: 0.3, delay: 5.3 },
    { size: 1.5, top: '68%', left: '70%', opacity: 0.4, delay: 5.6 },
    { size: 1, top: '62%', left: '88%', opacity: 0.3, delay: 5.9 },

    // Lower section
    { size: 1, top: '80%', left: '18%', opacity: 0.3, delay: 6.2 },
    { size: 1, top: '85%', left: '42%', opacity: 0.4, delay: 6.5 },
    { size: 1.5, top: '82%', left: '60%', opacity: 0.3, delay: 6.8 },
    { size: 1, top: '88%', left: '80%', opacity: 0.3, delay: 7.1 },
  ];

  const allStars = [...topLeftStars, ...topRightStars, ...bottomLeftStars, ...bottomRightStars, ...sparseStars];

  return (
    <>
      <style>{`
        @keyframes twinkle {
          0%, 100% {
            opacity: var(--star-opacity);
            transform: scale(1);
          }
          50% {
            opacity: calc(var(--star-opacity) * 0.3);
            transform: scale(0.8);
          }
        }

        .star {
          position: absolute;
          background: radial-gradient(circle, rgba(56, 189, 248, 1) 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%);
          border-radius: 50%;
          pointer-events: none;
          animation: twinkle 3s ease-in-out infinite;
          z-index: 1;
        }

        .star::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 200%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.6), transparent);
        }

        .star::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(90deg);
          width: 200%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.6), transparent);
        }

        @media (max-width: 768px) {
          .star {
            transform: scale(0.7);
          }
        }
      `}</style>

      {allStars.map((star, index) => (
        <div
          key={index}
          className="star"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            top: star.top,
            left: star.left,
            right: star.right,
            bottom: star.bottom,
            '--star-opacity': star.opacity,
            animationDelay: `${star.delay}s`,
          } as React.CSSProperties & { '--star-opacity': number }}
        />
      ))}
    </>
  );
};
