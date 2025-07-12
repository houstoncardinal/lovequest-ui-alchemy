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
        {/* Background with enhanced gradient */}
        <circle cx="16" cy="16" r="16" fill="url(#emeraldGradient)" />
        
        {/* Outer ring for premium feel */}
        <circle cx="16" cy="16" r="15" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        
        {/* Inner glow ring */}
        <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        
        {/* Refined stylized 'J' with better proportions */}
        <path
          d="M11 8v9c0 2.21 1.79 4 4 4s4-1.79 4-4V8"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Elegant heart accent with better positioning */}
        <path
          d="M16 19.5c-1.1-1.1-1.8-2.2-1.8-3.2 0-1.1 0.7-1.8 1.8-1.8s1.8 0.7 1.8 1.8c0 1-0.7 2.1-1.8 3.2z"
          fill="#ffffff"
          fillOpacity="0.9"
        />
        
        {/* Subtle decorative elements */}
        <circle cx="16" cy="8" r="1" fill="rgba(255,255,255,0.3)" />
        <circle cx="16" cy="24" r="0.8" fill="rgba(255,255,255,0.2)" />
        
        <defs>
          <linearGradient id="emeraldGradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#10b981" />
            <stop offset="0.4" stopColor="#059669" />
            <stop offset="0.8" stopColor="#047857" />
            <stop offset="1" stopColor="#065f46" />
          </linearGradient>
        </defs>
      </svg>
      
      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-bold ${textSizes[size]} tracking-tight leading-none`}
            style={{
              color: "#111827",
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              letterSpacing: '-0.025em',
              fontWeight: '700',
            }}
          >
            <span style={{ color: "#059669" }}>J</span>aan
          </span>
          <span
            className="text-xs font-medium tracking-wide"
            style={{
              color: "#6b7280",
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontSize: '0.65rem',
            }}
          >
            Premium Dating
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo; 