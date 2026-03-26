import React from "react";
import { Heart } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeMap = { sm: 28, md: 34, lg: 42 };
const textSizes = { sm: "text-sm", md: "text-lg", lg: "text-xl" };

const Logo = ({ size = "md", showText = true, className = "" }: LogoProps) => {
  const iconSize = sizeMap[size];
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="rounded-xl flex items-center justify-center shadow-elegant"
        style={{
          width: iconSize,
          height: iconSize,
          background: 'var(--gradient-hero)',
        }}
      >
        <Heart
          className="text-white fill-current"
          style={{ width: iconSize * 0.5, height: iconSize * 0.5 }}
        />
      </div>
      {showText && (
        <div className="flex items-center gap-1.5">
          <span className={`font-bold ${textSizes[size]} tracking-tight text-foreground`}>
            LoveQuest
          </span>
          <Heart className="w-4 h-4 text-primary fill-current" />
        </div>
      )}
    </div>
  );
};

export default Logo;
