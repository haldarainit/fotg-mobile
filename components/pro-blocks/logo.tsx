import Image from "next/image";
import React from "react";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ width = 120, height = 32, className = "" }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/logo.png"
        alt="FOTG mobile logo"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
      <span className="font-semibold text-foreground">FOTG mobile</span>
    </div>
  );
};
