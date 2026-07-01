import React from 'react';

interface PoisLogoProps {
  className?: string;
  showText?: boolean;
}

export const PoisLogo: React.FC<PoisLogoProps> = ({ className = "w-10 h-10", showText = false }) => {
  return (
    <div className={`flex flex-col items-center justify-center shrink-0 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Stylized outer clockwise ring with opening on bottom-left */}
        <path
          d="M 18,65 A 36,36 0 1,1 56,82"
          stroke="#C5003E"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Left slanted band (crimson `#C5003E`) representing stem of the 'P' */}
        <polygon
          points="23,64 43,43 58,43 38,64"
          fill="#C5003E"
        />
        {/* Right slanted band - Top (crimson `#C5003E`) */}
        <polygon
          points="47,28 68,28 82,42 61,42"
          fill="#C5003E"
        />
        {/* Right slanted band - Bottom (burgundy `#8E002B`) */}
        <polygon
          points="61,42 82,42 68,56 47,56"
          fill="#8E002B"
        />
      </svg>
      {showText && (
        <span className="mt-2 text-xs font-black tracking-widest text-[#C5003E] font-sans">
          POIS
        </span>
      )}
    </div>
  );
};
