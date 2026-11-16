import React, { useMemo } from 'react';

// Code 128 (Subset B) bit patterns for ASCII 32 to 127 + Start B (104) + Stop (106)
const CODES: string[] = [
  '11011001100', '11001101100', '11001100110', '10010011000', '10010001100',
  '10001001100', '10011001000', '10011000100', '10001100100', '11001001000',
  '11001000100', '11000100100', '10110011100', '10011011100', '10011001110',
  '10111001100', '10011101100', '10011100110', '11001110010', '11001011100',
  '11001001110', '11011100100', '11001110100', '11101101110', '11101001100',
  '11100101100', '11100100110', '11101100100', '11100110100', '11100110010',
  '11011011000', '11011000110', '11000110110', '10100011000', '10001011000',
  '10001000110', '10110001000', '10001101000', '10001100010', '11010001000',
  '11000101000', '11000100010', '10110111000', '10110001110', '10001101110',
  '10111011000', '10111000110', '10001110110', '11101110110', '11010001110',
  '11000101110', '11011101000', '11011100010', '11011101110', '11101011000',
  '11101000110', '11100010110', '11101101000', '11101100010', '11100011010',
  '11101111010', '11001000010', '11110001010', '10100110000', '10100001100',
  '10010110000', '10010000110', '10000101100', '10000100110', '10110010000',
  '10110000100', '10011010000', '10011000010', '10000110100', '10000110010',
  '11000010010', '11001010000', '11110111010', '11000010100', '10001111010',
  '10100111100', '10010111100', '10010011110', '10111100100', '10011110100',
  '10011110010', '11110100100', '11110010100', '11110010010', '11011011110',
  '11011110110', '11110110110', '10101111000', '10100011110', '10001011110',
  '10111101000', '10111100010', '11110101000', '11110100010', '10111011110',
  '10111101110', '11101011110', '11110101110', '11010000100', '11010010000',
  '11010011100',
];

const START_B = 104;
const STOP = '1100011101011';

export interface BarcodeProps {
  value: string;
  height?: number;
  barWidth?: number;
  showText?: boolean;
  className?: string;
  label?: string;
}

export function encodeCode128(value: string, barWidth: number = 2): { bars: { x: number; width: number }[]; totalWidth: number } {
  if (!value) return { bars: [], totalWidth: 100 };

  const sanitized = value.trim();
  let checksum = START_B;
  let bitstring = CODES[START_B];

  for (let i = 0; i < sanitized.length; i++) {
    const code = sanitized.charCodeAt(i) - 32;
    const validCode = code >= 0 && code <= 95 ? code : 0;
    checksum += (i + 1) * validCode;
    bitstring += CODES[validCode];
  }

  bitstring += CODES[checksum % 103];
  bitstring += STOP;

  // Quiet zones: 10 modules on each side
  const quietZone = 10;
  const totalModules = bitstring.length + quietZone * 2;
  const calculatedWidth = totalModules * barWidth;

  // Build contiguous bar rects
  const rects: { x: number; width: number }[] = [];
  let currentBarStart: number | null = null;

  for (let i = 0; i < bitstring.length; i++) {
    if (bitstring[i] === '1') {
      if (currentBarStart === null) {
        currentBarStart = i;
      }
    } else {
      if (currentBarStart !== null) {
        rects.push({
          x: (currentBarStart + quietZone) * barWidth,
          width: (i - currentBarStart) * barWidth,
        });
        currentBarStart = null;
      }
    }
  }
  if (currentBarStart !== null) {
    rects.push({
      x: (currentBarStart + quietZone) * barWidth,
      width: (bitstring.length - currentBarStart) * barWidth,
    });
  }

  return { bars: rects, totalWidth: calculatedWidth };
}

export function generateBarcodeSvg(
  value: string,
  options: {
    height?: number;
    barWidth?: number;
    showText?: boolean;
    label?: string;
  } = {}
): string {
  const { height = 50, barWidth = 1.5, showText = true, label } = options;
  const { bars, totalWidth } = encodeCode128(value, barWidth);
  const displayLabel = label ?? value;
  const svgHeight = height + (showText ? 22 : 0);

  const rectsHtml = bars
    .map((bar) => `<rect x="${bar.x}" y="2" width="${bar.width}" height="${height}" fill="#0f172a" />`)
    .join('');

  const textHtml = showText
    ? `<text x="${totalWidth / 2}" y="${height + 17}" text-anchor="middle" fill="#0f172a" font-size="13" font-weight="700" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" letter-spacing="2.5">${displayLabel}</text>`
    : '';

  return `<svg viewBox="0 0 ${totalWidth} ${svgHeight}" style="max-width: ${totalWidth}px; width: 100%; height: auto; display: block; margin: 0 auto;" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
    <rect width="${totalWidth}" height="${svgHeight}" fill="#ffffff" />
    ${rectsHtml}
    ${textHtml}
  </svg>`;
}

export const Barcode: React.FC<BarcodeProps> = ({
  value,
  height = 55,
  barWidth = 2,
  showText = true,
  className = '',
  label,
}) => {
  const { bars, totalWidth } = useMemo(() => {
    return encodeCode128(value, barWidth);
  }, [value, barWidth]);

  const displayLabel = label ?? value;
  const svgHeight = height + (showText ? 22 : 0);

  return (
    <div className={`inline-flex flex-col items-center justify-center select-none bg-white p-2 rounded ${className}`}>
      <svg
        viewBox={`0 0 ${totalWidth} ${svgHeight}`}
        style={{ maxWidth: `${totalWidth}px`, width: '100%', height: 'auto', display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
      >
        <rect width={totalWidth} height={svgHeight} fill="#ffffff" />
        {bars.map((bar, idx) => (
          <rect
            key={idx}
            x={bar.x}
            y={2}
            width={bar.width}
            height={height}
            fill="#0f172a"
          />
        ))}
        {showText && (
          <text
            x={totalWidth / 2}
            y={height + 17}
            textAnchor="middle"
            fill="#0f172a"
            fontSize="13"
            fontWeight="600"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
            letterSpacing="2.5"
          >
            {displayLabel}
          </text>
        )}
      </svg>
    </div>
  );
};

