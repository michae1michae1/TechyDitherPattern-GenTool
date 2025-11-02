/**
 * Core type definitions for the Dithered Pattern Generator
 */

/**
 * Represents a single drop in the rain animation pattern
 */
export interface Drop {
  /** Horizontal position (column index) */
  x: number;
  /** Vertical position (can be fractional for smooth animation) */
  y: number;
  /** Speed of the drop (pixels per frame) */
  speed: number;
  /** Length of the drop trail */
  length: number;
}

/**
 * Pre-generated random values for consistent randomization
 */
export interface RandomSeed {
  /** First random value (0-1) */
  r1: number;
  /** Second random value (0-1) */
  r2: number;
  /** Third random value (0-1) */
  r3: number;
}

/**
 * Configuration for a single layer's visual properties and behavior
 */
export interface LayerConfig {
  /** Characters/symbols to use in the pattern (e.g., '01', '▀▁▂▃') */
  symbolSet: string;
  /** Density of symbols (0-1, higher = more symbols) */
  density: number;
  /** Size of each cell in pixels */
  cellSize: number;
  /** Foreground color (hex format) */
  color: string;
  /** Background color (hex format) */
  bgColor: string;
  /** Animation speed in milliseconds per frame */
  animationSpeed: number;
  /** Pattern type ('rain', 'wave', 'static', 'glitch', 'pulse') */
  pattern: string;
  /** Whether to apply gradient effect */
  gradient: boolean;
  /** Whether to apply glow effect */
  glowEffect: boolean;
  /** How strongly the shape guide influences the pattern (0-1) */
  shapeInfluence: number;
  /** Strength of the gradient effect (0-1) */
  gradientStrength: number;
  /** Intensity of the glow effect (0-20) */
  glowIntensity: number;
  /** Radius of the glow effect (0-30) */
  glowRadius: number;
}

/**
 * Represents a single layer in the composition
 */
export interface Layer {
  /** Unique identifier for the layer */
  id: string;
  /** Display name of the layer */
  name: string;
  /** Whether the layer is currently visible */
  visible: boolean;
  /** Layer opacity (0-1) */
  opacity: number;
  /** Visual configuration for this layer */
  config: LayerConfig;
  /** Uploaded shape guide image (if any) */
  shapeImage: HTMLImageElement | null;
  /** Brightness map derived from shape image */
  shapeData: number[][] | null;
}

