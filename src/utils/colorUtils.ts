/**
 * Utility functions for color and brightness calculations
 */

import type { Layer } from '@/types';

/**
 * Calculates the shape brightness at a given position
 * Returns a value between 0-1 representing how bright the shape is at that position
 * 
 * @param x - Horizontal grid position
 * @param y - Vertical grid position
 * @param cols - Total number of columns in the grid
 * @param rows - Total number of rows in the grid
 * @param layer - Layer containing shape data
 * @returns Brightness value (0-1), where 1 is full brightness
 * 
 * @example
 * const brightness = getShapeBrightnessForLayer(10, 20, 100, 100, layer);
 */
export function getShapeBrightnessForLayer(
  x: number,
  y: number,
  cols: number,
  rows: number,
  layer: Layer
): number {
  if (!layer.shapeData) return 1;
  
  const shapeWidth = layer.shapeData[0].length;
  const shapeHeight = layer.shapeData.length;
  
  // Center the shape in the canvas
  const offsetX = Math.floor((cols - shapeWidth) / 2);
  const offsetY = Math.floor((rows - shapeHeight) / 2);
  
  const shapeX = x - offsetX;
  const shapeY = y - offsetY;
  
  // Outside shape bounds - use inverted influence
  if (shapeX < 0 || shapeX >= shapeWidth || shapeY < 0 || shapeY >= shapeHeight) {
    return 1 - layer.config.shapeInfluence;
  }
  
  // Inside shape - blend brightness with influence
  const brightness = layer.shapeData[shapeY][shapeX];
  return brightness * layer.config.shapeInfluence + (1 - layer.config.shapeInfluence);
}

/**
 * Converts a brightness value (0-1) to a hex alpha channel string
 * 
 * @param brightness - Brightness value between 0 and 1
 * @returns Hex string (e.g., 'ff', 'a3', '00')
 * 
 * @example
 * brightnessToHex(0.5) // Returns '80'
 * brightnessToHex(1.0) // Returns 'ff'
 */
export function brightnessToHex(brightness: number): string {
  return Math.floor(brightness * 255).toString(16).padStart(2, '0');
}

/**
 * Calculates the glow blur radius based on intensity and brightness
 * 
 * @param glowIntensity - Base glow intensity (0-20)
 * @param brightness - Current brightness value (0-1)
 * @param glowRadius - Glow spread radius (0-30)
 * @returns Blur radius in pixels
 */
export function calculateGlowBlur(
  glowIntensity: number,
  brightness: number,
  glowRadius: number
): number {
  return Math.floor(glowIntensity * brightness * (glowRadius / 10));
}

