import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 40,
};

const textSizes = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg"
};

const Logo = ({ size = "md", showText = true, className = "" }: LogoProps) => {
  const iconSize = sizeMap[size];
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="rounded-xl shadow-sm"
      >
        {/* Background with luxury gradient */}
        <circle cx="16" cy="16" r="16" fill="url(#luxuryGradient)" />
        
        {/* Outer ring for premium feel */}
        <circle cx="16" cy="16" r="15" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        
        {/* Inner glow ring */}
        <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        
        {/* Beautiful heart design */}
        <path
          d="M16 23.5c-5-4.5-8-7.5-8-11 0-2.5 2-4.5 4.5-4.5 1.5 0 2.8 0.8 3.5 2 0.7-1.2 2-2 3.5-2 2.5 0 4.5 2 4.5 4.5 0 3.5-3 6.5-8 11z"
          fill="#ffffff"
          fillOpacity="0.95"
        />
        
        {/* Subtle sparkle accents */}
        <circle cx="12" cy="11" r="1" fill="rgba(255,255,255,0.4)" />
        <circle cx="20" cy="13" r="0.8" fill="rgba(255,255,255,0.3)" />
        <circle cx="18" cy="9" r="0.6" fill="rgba(255,255,255,0.5)" />
        
        <defs>
          <linearGradient id="luxuryGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ec4899" />
            <stop offset="0.3" stopColor="#f97316" />
            <stop offset="0.7" stopColor="#dc2626" />
            <stop offset="1" stopColor="#be185d" />
          </linearGradient>
        </defs>
      </svg>
      
      {showText && (
        <div className="flex items-center gap-2">
          <span
            className={`font-bold ${textSizes[size]} tracking-tight leading-none`}
            style={{
              color: "#111827",
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              letterSpacing: '-0.025em',
              fontWeight: '700',
            }}
          >
            LoveQuest
          </span>
          <svg width="20" height="18" viewBox="0 0 20 18" fill="none" className="ml-1">
            <path
              d="M10 17c-4.5-4-7-6.5-7-9.5 0-2.2 1.8-4 4-4 1.3 0 2.5 0.7 3 1.8C10.5 4.2 11.7 3.5 13 3.5c2.2 0 4 1.8 4 4 0 3-2.5 5.5-7 9.5z"
              fill="url(#heartGradient)"
            />
            <defs>
              <linearGradient id="heartGradient" x1="0" y1="0" x2="20" y2="18" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ec4899" />
                <stop offset="1" stopColor="#dc2626" />
              </linearGradient>
            </defs>
          </svg>
          <span
            className="text-xs font-medium tracking-wide ml-2"
            style={{
              color: "#6b7280",
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontSize: '0.65rem',
            }}
          >
            Luxury Dating
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo; 