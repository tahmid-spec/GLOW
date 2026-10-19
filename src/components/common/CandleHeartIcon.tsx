import React from 'react';

interface CandleHeartIconProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const CandleHeartIcon: React.FC<CandleHeartIconProps> = ({
  className = '',
  size = 48,
  glow = true
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {glow && (
        <div 
          className="absolute -inset-2 bg-gradient-to-tr from-[#BBA2FF]/30 to-[#F5A8D0]/30 rounded-full blur-xl animate-pulse"
          style={{ width: size * 1.5, height: size * 1.5 }}
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="candleHeartGrad" x1="20" y1="20" x2="80" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F5A8D0" />
            <stop offset="0.5" stopColor="#BBA2FF" />
            <stop offset="1" stopColor="#79E6DF" />
          </linearGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Delicate handwritten style heart stroke */}
        <path
          d="M 50 82 
             C 47 79, 18 56, 18 36 
             C 18 22, 29 16, 40 18 
             C 46 19, 49 23, 50 26 
             C 51 23, 54 19, 60 18 
             C 71 16, 82 22, 82 36 
             C 82 56, 53 79, 50 82 Z"
          stroke="url(#candleHeartGrad)"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#softGlow)"
        />

        {/* Little whimsical flame/sparkle dot inside */}
        <circle cx="50" cy="42" r="3" fill="#FFE28A" className="animate-ping" style={{ animationDuration: '3s' }} />
        <circle cx="50" cy="42" r="2.5" fill="#FFE28A" />
      </svg>
    </div>
  );
};
