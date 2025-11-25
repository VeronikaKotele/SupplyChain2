export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const regex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
  const result = regex.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function rgbToHex(rgb: { r: number; g: number; b: number }): string {
  const r = rgb.r.toString(16).padStart(2, '0');
  const g = rgb.g.toString(16).padStart(2, '0');
  const b = rgb.b.toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

/**
 * Blend hex colors based on specified portions, like 1:1 or 3:5
 */
export function blendHexColors(color1: string, color2: string, color1Portion: number, color2Portion: number): string {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    if (!rgb1 || !rgb2) {
        throw new Error('Invalid hex color format');
    }
    const totalPortion = color1Portion + color2Portion;
    const r = Math.round((rgb1.r * color1Portion + rgb2.r * color2Portion) / totalPortion);
    const g = Math.round((rgb1.g * color1Portion + rgb2.g * color2Portion) / totalPortion);
    const b = Math.round((rgb1.b * color1Portion + rgb2.b * color2Portion) / totalPortion);
    return rgbToHex({ r: r, g: g, b: b });
}

export function generateUniqueHexColorsInRange(
    uniqueColorsCount: number,
    rangeStartHexColor: string,
    rangeEndHexColor: string
) : string[] {
  if (uniqueColorsCount < 3) {
    return [rangeStartHexColor, rangeEndHexColor];
  }

  const colors: string[] = [rangeStartHexColor];
  for (let index = 1; index < uniqueColorsCount - 1; index++) {
    const startColorPortion = index;
    const endColorPortion = uniqueColorsCount - 1 - index;
    const colorInBetween = blendHexColors(rangeStartHexColor, rangeEndHexColor, startColorPortion, endColorPortion);
    colors.push(colorInBetween);
  }
  colors.push(rangeEndHexColor);
  return colors;
}