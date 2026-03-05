import React from 'react';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "w-8 h-8" }: LogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Square Border */}
        <rect x="5" y="5" width="90" height="90" stroke="#00A896" strokeWidth="8" rx="4" />
        
        {/* J Shape */}
        <path 
          d="M30 30V60C30 65.5228 25.5228 70 20 70" 
          stroke="#00A896" 
          strokeWidth="8" 
          strokeLinecap="round" 
        />
        
        {/* X Shape (Crossing lines) */}
        <path 
          d="M45 40L65 70" 
          stroke="#F27D26" 
          strokeWidth="8" 
          strokeLinecap="round" 
        />
        <path 
          d="M65 40L45 70" 
          stroke="#F27D26" 
          strokeWidth="8" 
          strokeLinecap="round" 
        />
        
        {/* 4 Shape */}
        <path 
          d="M75 30V70M75 50H85V70" 
          stroke="#00A896" 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M75 30L65 50H75" 
          stroke="#00A896" 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
