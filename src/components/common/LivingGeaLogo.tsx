import React from 'react';

interface LivingGeaLogoProps {
  className?: string;
  mousePos?: { x: number; y: number };
  isHovered?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showText?: boolean;
  showSlogan?: boolean;
  opacityLevel?: 'subtle' | 'medium' | 'vivid';
}

export const LivingGeaLogo: React.FC<LivingGeaLogoProps> = ({
  className = '',
  mousePos = { x: 0, y: 0 },
  isHovered = false,
  size = 'hero',
  showText = true,
  showSlogan = true,
  opacityLevel = 'subtle'
}) => {
  // Dimensions map
  const scaleMap = {
    sm: 'scale-50 origin-center',
    md: 'scale-75 origin-center',
    lg: 'scale-100 origin-center',
    hero: 'scale-105 xl:scale-115'
  };

  const opacityMap = {
    subtle: isHovered ? 'opacity-65' : 'opacity-25',
    medium: isHovered ? 'opacity-85' : 'opacity-45',
    vivid: isHovered ? 'opacity-100' : 'opacity-75'
  };

  return (
    <div 
      className={`relative select-none flex flex-col items-center justify-center transition-all duration-700 ease-out group ${scaleMap[size]} ${opacityMap[opacityLevel]} ${className}`}
      style={{
        transform: `perspective(1000px) rotateY(${mousePos.x * 24}deg) rotateX(${-mousePos.y * 24}deg) translate3d(${mousePos.x * 35}px, ${mousePos.y * 35}px, 40px)`,
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Dynamic Ambient Glow Behind SVG */}
      <div 
        className={`absolute -inset-10 rounded-full bg-radial from-[#00A3FF]/30 via-[#004B87]/15 to-transparent blur-3xl pointer-events-none transition-all duration-700 ${
          isHovered ? 'opacity-95 scale-125 filter brightness-130' : 'opacity-40 scale-100'
        }`}
        style={{
          transform: `translate3d(${mousePos.x * -20}px, ${mousePos.y * -20}px, -20px)`
        }}
      />

      {/* Pure Vector SVG Logo (Emblem + GEA + PERÚ) */}
      <div className="relative flex items-center justify-center transition-transform duration-700 animate-float-gentle">
        <svg 
          viewBox={showText ? "0 0 460 220" : "0 0 220 200"} 
          className={`${showText ? "w-[440px] xl:w-[500px]" : "w-[120px] h-[100px]"} h-auto overflow-visible transition-all duration-700 ${
            isHovered 
              ? 'filter drop-shadow-[0_0_40px_rgba(56,189,248,0.75)]' 
              : 'filter drop-shadow-[0_0_20px_rgba(0,163,255,0.45)]'
          }`}
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Shading gradients for folded 3D triangle ribbon */}
            <linearGradient id="geaWhiteGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>

            <linearGradient id="geaFoldShadow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#CBD5E1" />
              <stop offset="50%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>

            <linearGradient id="geaCyanGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#0284C7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.8" />
            </linearGradient>

            {/* Shimmer sweep animation gradient */}
            <linearGradient id="shimmerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.75)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            {/* Neon Glow Filter */}
            <filter id="neonPulse" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ================================================================= */}
          {/* 1. EMBLEM: 3D PYRAMID WITH 3 STEP BARS & FOLDED WEDGE             */}
          {/* ================================================================= */}
          <g className="transition-transform duration-500 hover:scale-102">
            
            {/* Outer Triangle Ribbon Frame (White stylized triangle) */}
            <path
              d="M 115 28 
                 L 46 138 
                 C 40 148, 48 160, 60 160 
                 L 190 160 
                 C 200 160, 204 148, 196 142 
                 L 130 92 
                 C 124 88, 118 84, 114 74 
                 L 115 28 Z"
              fill="url(#geaWhiteGlow)"
              className="transition-colors duration-500"
            />

            {/* Left Folded Shaded Facet for 3D depth */}
            <path
              d="M 115 28 
                 L 78 142 
                 C 74 150, 78 158, 86 160 
                 L 58 158 
                 C 48 156, 44 146, 50 138 
                 L 115 28 Z"
              fill="url(#geaFoldShadow)"
              opacity="0.85"
            />

            {/* Internal 3 Rounded Horizontal Ladder / Stair Bars */}
            {/* Bar 1 (Top Bar - Short) */}
            <rect
              x="92"
              y="70"
              width="36"
              height="15"
              rx="7.5"
              fill="#FFFFFF"
              className={`transition-all duration-500 ${isHovered ? 'fill-sky-100 filter drop-shadow-[0_0_8px_#38BDF8]' : ''}`}
              style={{
                transform: `translateX(${isHovered ? 2 : 0}px)`
              }}
            />
            {/* Subtle shadow underside of Bar 1 */}
            <path
              d="M 94 82 L 126 82 C 127 82, 128 83, 128 84 C 128 85, 124 86, 120 86 L 94 86 Z"
              fill="#94A3B8"
              opacity="0.6"
            />

            {/* Bar 2 (Middle Bar - Medium) */}
            <rect
              x="82"
              y="94"
              width="56"
              height="16"
              rx="8"
              fill="#FFFFFF"
              className={`transition-all duration-500 ${isHovered ? 'fill-sky-100 filter drop-shadow-[0_0_8px_#38BDF8]' : ''}`}
              style={{
                transform: `translateX(${isHovered ? 4 : 0}px)`
              }}
            />
            {/* Subtle shadow underside of Bar 2 */}
            <path
              d="M 84 107 L 136 107 C 137 107, 138 108, 138 109 C 138 110, 134 111, 130 111 L 84 111 Z"
              fill="#94A3B8"
              opacity="0.6"
            />

            {/* Bar 3 (Bottom Bar - Longest) */}
            <rect
              x="72"
              y="119"
              width="78"
              height="17"
              rx="8.5"
              fill="#FFFFFF"
              className={`transition-all duration-500 ${isHovered ? 'fill-sky-100 filter drop-shadow-[0_0_8px_#38BDF8]' : ''}`}
              style={{
                transform: `translateX(${isHovered ? 6 : 0}px)`
              }}
            />
            {/* Subtle shadow underside of Bar 3 */}
            <path
              d="M 74 133 L 148 133 C 149 133, 150 134, 150 135 C 150 136, 146 137, 140 137 L 74 137 Z"
              fill="#94A3B8"
              opacity="0.6"
            />

            {/* Elegant Lower Swoosh Wing */}
            <path
              d="M 82 152 
                 L 182 152 
                 C 190 152, 194 144, 186 140 
                 L 134 116 
                 L 118 134 
                 C 106 146, 94 150, 82 152 Z"
              fill="#FFFFFF"
              opacity="0.95"
            />
          </g>

          {/* ================================================================= */}
          {/* 2. TYPOGRAPHY: "GEA" IN BOLD ROUNDED ARCHITECTURAL LETTERFORMS   */}
          {/* ================================================================= */}
          {showText && (
            <>
              <g className="transition-all duration-700">
                
                {/* LETTER 'G' */}
                <path
                  d="M 272 82 
                     C 264 68, 248 58, 230 58 
                     C 202 58, 184 80, 184 110 
                     C 184 140, 202 162, 232 162 
                     C 252 162, 268 152, 276 136 
                     L 276 112 
                     L 236 112 
                     L 236 128 
                     L 258 128 
                     C 254 138, 244 146, 232 146 
                     C 214 146, 202 130, 202 110 
                     C 202 90, 214 74, 230 74 
                     C 242 74, 252 80, 258 90 
                     L 272 82 Z"
                  fill="url(#geaWhiteGlow)"
                  className={`transition-all duration-500 ${isHovered ? 'filter drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]' : ''}`}
                />

                {/* LETTER 'E' */}
                <path
                  d="M 292 62 
                     L 292 158 
                     L 348 158 
                     L 348 142 
                     L 310 142 
                     L 310 118 
                     L 342 118 
                     L 342 102 
                     L 310 102 
                     L 310 78 
                     L 346 78 
                     L 346 62 
                     L 292 62 Z"
                  fill="url(#geaWhiteGlow)"
                  className={`transition-all duration-500 ${isHovered ? 'filter drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]' : ''}`}
                />

                {/* LETTER 'A' */}
                <path
                  d="M 384 62 
                     C 378 62, 372 66, 368 74 
                     L 344 158 
                     L 362 158 
                     L 370 130 
                     L 404 130 
                     L 412 158 
                     L 430 158 
                     L 404 74 
                     C 400 66, 394 62, 388 62 
                     L 384 62 Z 
                     M 386 86 
                     L 399 116 
                     L 374 116 
                     L 386 86 Z"
                  fill="url(#geaWhiteGlow)"
                  className={`transition-all duration-500 ${isHovered ? 'filter drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]' : ''}`}
                />
              </g>

              {/* 3. SUBTITLE: "P E R Ú" TRACKED LETTERING */}
              <text
                x="326"
                y="190"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="18"
                fontWeight="700"
                letterSpacing="0.45em"
                fontFamily="'Plus Jakarta Sans', sans-serif"
                className={`transition-all duration-500 ${isHovered ? 'fill-sky-100 filter drop-shadow-[0_0_10px_#38BDF8]' : 'opacity-90'}`}
              >
                PERÚ
              </text>
            </>
          )}
        </svg>
      </div>

      {/* ===================================================================== */}
      {/* 4. SLOGAN: "GEA PIENSA EN TI" (Vector / HTML Typography)             */}
      {/* ===================================================================== */}
      {showText && showSlogan && (
        <div 
          className="mt-3 text-center transition-all duration-700"
          style={{
            transform: `translate3d(0, 0, ${isHovered ? 25 : 10}px)`
          }}
        >
          <span 
            className={`font-sans text-xs sm:text-sm font-bold tracking-[0.38em] uppercase transition-all duration-500 block ${
              isHovered 
                ? 'text-white drop-shadow-[0_0_16px_rgba(56,189,248,0.9)] tracking-[0.42em]' 
                : 'text-zinc-200/90 drop-shadow-[0_0_8px_rgba(0,163,255,0.5)]'
            }`}
          >
            GEA PIENSA EN TI
          </span>

          {/* Ambient subtle underline beam */}
          <div 
            className={`h-[1.5px] mx-auto mt-2 rounded-full transition-all duration-700 ${
              isHovered 
                ? 'w-48 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38BDF8]' 
                : 'w-24 bg-gradient-to-r from-transparent via-white/30 to-transparent'
            }`} 
          />
        </div>
      )}
    </div>
  );
};
