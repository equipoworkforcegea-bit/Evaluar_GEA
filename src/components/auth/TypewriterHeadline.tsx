import React, { useState, useEffect } from 'react';

export const TypewriterHeadline: React.FC = () => {
  // Phrases to cycle through after initial headline
  const phrases = [
    {
      line1Prefix: "TU ",
      line1Highlight: "TALENTO",
      line1Suffix: " TIENE UN LUGAR.",
      line2Prefix: "IMPULSA ",
      line2Highlight: "TU CARRERA",
      line3Prefix: "PROFESIONAL EN ",
      line3Highlight: "GEA",
      line3Suffix: "."
    },
    {
      line1Prefix: "TU ",
      line1Highlight: "VOCACIÓN",
      line1Suffix: " CRECE CON NOSOTROS.",
      line2Prefix: "DESARROLLA ",
      line2Highlight: "TU POTENCIAL",
      line3Prefix: "CON BENEFICIOS DE ",
      line3Highlight: "LEY",
      line3Suffix: "."
    },
    {
      line1Prefix: "TU ",
      line1Highlight: "FUTURO",
      line1Suffix: " EMPIEZA HOY.",
      line2Prefix: "CONSTRUYE ",
      line2Highlight: "LÍNEA DE CARRERA",
      line3Prefix: "EN EL EQUIPO ",
      line3Highlight: "GEA",
      line3Suffix: "."
    }
  ];

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const currentPhrase = phrases[phraseIndex];

  // Full raw text of current phrase for character counting
  const fullText = `${currentPhrase.line1Prefix}${currentPhrase.line1Highlight}${currentPhrase.line1Suffix}\n${currentPhrase.line2Prefix}${currentPhrase.line2Highlight}\n${currentPhrase.line3Prefix}${currentPhrase.line3Highlight}${currentPhrase.line3Suffix}`;

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (isPaused) {
      // Pause at full text or empty text before typing next
      timeout = setTimeout(() => {
        setIsPaused(false);
        if (charCount >= fullText.length) {
          setIsDeleting(true);
        } else {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }, charCount >= fullText.length ? 4500 : 400);
      return () => clearTimeout(timeout);
    }

    if (!isDeleting) {
      // Typing forward
      if (charCount < fullText.length) {
        // Natural keystroke cadence (faster on letters, slight delay on punctuation/newlines)
        const currentChar = fullText[charCount];
        const delay = currentChar === '\n' || currentChar === '.' ? 180 : Math.floor(Math.random() * 30) + 35;

        timeout = setTimeout(() => {
          setCharCount((prev) => prev + 1);
        }, delay);
      } else {
        // Finished typing full phrase
        setIsPaused(true);
      }
    } else {
      // Deleting backwards (faster cadence)
      if (charCount > 0) {
        timeout = setTimeout(() => {
          setCharCount((prev) => Math.max(0, prev - 2));
        }, 22);
      } else {
        // Finished deleting
        setIsDeleting(false);
        setIsPaused(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [charCount, isDeleting, isPaused, fullText, phrases.length]);

  // Helper to slice segments according to current charCount
  let consumed = 0;
  const getSlice = (text: string) => {
    if (charCount <= consumed) return '';
    const sliceLen = Math.max(0, Math.min(text.length, charCount - consumed));
    consumed += text.length;
    return text.slice(0, sliceLen);
  };

  const l1Pre = getSlice(currentPhrase.line1Prefix);
  const l1High = getSlice(currentPhrase.line1Highlight);
  const l1Suf = getSlice(currentPhrase.line1Suffix);
  // Account for newline
  consumed += 1;

  const l2Pre = getSlice(currentPhrase.line2Prefix);
  const l2High = getSlice(currentPhrase.line2Highlight);
  // Account for newline
  consumed += 1;

  const l3Pre = getSlice(currentPhrase.line3Prefix);
  const l3High = getSlice(currentPhrase.line3Highlight);
  const l3Suf = getSlice(currentPhrase.line3Suffix);

  return (
    <div className="relative">
      {/* Main Headline with Typewriter Rendering & Harmonic Colors */}
      <h1 className="text-3xl sm:text-4xl xl:text-[44px] font-black tracking-tight leading-[1.15] uppercase select-none min-h-[140px] sm:min-h-[160px] text-slate-900">
        
        {/* Line 1 */}
        <span className="block">
          <span className="text-slate-900">{l1Pre}</span>
          {l1High && (
            <span className="bg-gradient-to-r from-[#1F2A5E] via-[#2F5BA8] to-[#2F5BA8] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(31,42,94,0.2)]">
              {l1High}
            </span>
          )}
          <span className="text-slate-800">{l1Suf}</span>
        </span>

        {/* Line 2 */}
        {(l2Pre || l2High) && (
          <span className="block mt-1">
            <span className="bg-gradient-to-r from-[#2FA58B] via-[#2FA58B] to-[#1F2A5E] bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(47,165,139,0.2)]">
              {l2Pre}
            </span>
            <span className="text-slate-900">{l2High}</span>
          </span>
        )}

        {/* Line 3 */}
        {(l3Pre || l3High || l3Suf) && (
          <span className="block mt-1">
            <span className="text-slate-700">{l3Pre}</span>
            {l3High && (
              <span className="bg-gradient-to-r from-[#1F2A5E] via-[#2F5BA8] to-[#2FA58B] bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(31,42,94,0.2)]">
                {l3High}
              </span>
            )}
            {l3Suf && (
              <span className="text-[#E4572E] drop-shadow-[0_0_10px_rgba(228,87,46,0.4)]">
                {l3Suf}
              </span>
            )}
          </span>
        )}

        {/* Glowing Mechanical Blinking Cursor */}
        <span 
          className="inline-block w-1 sm:w-1.5 h-[0.85em] bg-[#1F2A5E] ml-1.5 align-middle shadow-[0_0_8px_rgba(31,42,94,0.4)] rounded-xs animate-pulse"
          style={{ animationDuration: '0.8s' }}
        />
      </h1>
    </div>
  );
};
