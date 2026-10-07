import React from 'react';

interface GeaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const GeaLogo: React.FC<GeaLogoProps> = ({ 
  className = '', 
  size = 'md',
  showText = true 
}) => {
  const sizeMap = {
    sm: { h: 32, w: showText ? 100 : 36 },
    md: { h: 42, w: showText ? 130 : 46 },
    lg: { h: 56, w: showText ? 175 : 62 },
    xl: { h: 72, w: showText ? 220 : 80 }
  };

  const dim = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg 
        viewBox="0 0 300 240" 
        height={dim.h}
        width={dim.w ? (showText ? undefined : dim.h) : undefined}
        style={{ height: `${dim.h}px`, width: 'auto' }}
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-2xs"
      >
        <defs>
          {/* Shading for left face of pyramid */}
          <linearGradient id="pyrLeftGrad" x1="40" y1="180" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8A826F" />
            <stop offset="60%" stopColor="#A8A18F" />
            <stop offset="100%" stopColor="#C4BDB0" />
          </linearGradient>

          {/* Shading for right face of pyramid */}
          <linearGradient id="pyrRightGrad" x1="100" y1="90" x2="160" y2="190" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F5F2E8" />
            <stop offset="50%" stopColor="#DFDAC9" />
            <stop offset="100%" stopColor="#BDB6A4" />
          </linearGradient>

          {/* Blue Orbit Gradient */}
          <linearGradient id="blueOrbit" x1="20" y1="120" x2="110" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#003D73" />
            <stop offset="50%" stopColor="#005696" />
            <stop offset="100%" stopColor="#0072BA" />
          </linearGradient>

          {/* Green Orbit Gradient */}
          <linearGradient id="greenOrbit" x1="70" y1="80" x2="135" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#007532" />
            <stop offset="50%" stopColor="#008A3B" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>

          {/* Red Orbit Gradient */}
          <linearGradient id="redOrbit" x1="40" y1="190" x2="145" y2="155" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C00438" />
            <stop offset="50%" stopColor="#E20649" />
            <stop offset="100%" stopColor="#F43F5E" />
          </linearGradient>
        </defs>

        {/* 1. BACK PORTION OF BLUE ORBIT (behind the pyramid) */}
        <path
          d="M 28 140 C 22 130, 40 108, 78 102 C 86 100, 94 100, 102 102"
          stroke="url(#blueOrbit)"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* 2. BACK PORTION OF GREEN ORBIT (behind pyramid apex) */}
        <path
          d="M 65 92 C 78 84, 98 84, 114 88"
          stroke="url(#greenOrbit)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* 3. PYRAMID BASE & 3D FACES */}
        {/* Left Shaded Face */}
        <polygon
          points="80,88 28,172 74,180"
          fill="url(#pyrLeftGrad)"
        />

        {/* Right Lit Face */}
        <polygon
          points="80,88 74,180 144,166"
          fill="url(#pyrRightGrad)"
        />

        {/* Pyramid Edge Highlight */}
        <line
          x1="80"
          y1="88"
          x2="74"
          y2="180"
          stroke="#FAF7EF"
          strokeWidth="1.2"
          opacity="0.7"
        />

        {/* 4. FOREGROUND BLUE ORBIT (wraps in front of pyramid left side) */}
        <path
          d="M 22 144 C 18 136, 26 122, 45 116 C 68 108, 92 118, 108 130"
          stroke="url(#blueOrbit)"
          strokeWidth="6.5"
          strokeLinecap="round"
        />

        {/* 5. FOREGROUND GREEN ORBIT (sweeps over right side) */}
        <path
          d="M 72 90 C 92 84, 118 84, 130 94 C 138 102, 134 116, 116 124 C 98 132, 70 128, 62 126"
          stroke="url(#greenOrbit)"
          strokeWidth="6.5"
          strokeLinecap="round"
        />

        {/* 6. FOREGROUND RED ORBIT (sweeps around bottom right) */}
        <path
          d="M 45 178 C 55 186, 80 190, 110 178 C 132 168, 142 150, 136 138 C 132 130, 118 126, 106 130"
          stroke="url(#redOrbit)"
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* 7. TYPOGRAPHY: "GEA" and "Perú" */}
        {showText && (
          <g transform="translate(152, 74)">
            {/* GEA */}
            <text
              x="0"
              y="68"
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              fontSize="78"
              fontWeight="900"
              letterSpacing="-2px"
              fill="#004B87"
            >
              GEA
            </text>

            {/* Perú */}
            <text
              x="12"
              y="98"
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              fontSize="28"
              fontWeight="600"
              letterSpacing="2px"
              fill="#004B87"
            >
              Perú
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
