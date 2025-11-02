/**
 * Constant values and preset configurations for the pattern generator
 */

/**
 * Predefined symbol sets for different visual styles
 * Each preset contains a string of characters that can be used in patterns
 */
export const symbolPresets = {
  Binary: '01',
  Matrix: '01ｦｱｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ',
  Tech: '▀▁▂▃▄▅▆▇█▉▊▋▌▍▎▏▐░▒▓■□',
  Dots: '.:;+=xX$&#@',
  Arrows: '↑↓←→↖↗↘↙⇄⇅⇆⇇⇈⇉⇊',
  Geometric: '◢◣◤◥●○◐◑◒◓◔◕',
  Lines: '─│┌┐└┘├┤┬┴┼═║╔╗╚╝╠╣╦╩╬',
  Custom: '01' // Default custom value
} as const;

/**
 * Type for symbol preset keys
 */
export type SymbolPresetKey = keyof typeof symbolPresets;

/**
 * Available pattern animation types
 */
export const patternTypes = ['rain', 'wave', 'static', 'glitch', 'pulse'] as const;

/**
 * Type for pattern types
 */
export type PatternType = typeof patternTypes[number];

/**
 * Default configuration values for new layers
 */
export const DEFAULT_LAYER_CONFIG = {
  symbolSet: '01',
  density: 0.7,
  cellSize: 12,
  color: '#00ff9f',
  bgColor: '#0a0e27',
  animationSpeed: 50,
  pattern: 'rain' as PatternType,
  gradient: true,
  glowEffect: true,
  shapeInfluence: 0.8,
  gradientStrength: 0.8,
  glowIntensity: 10,
  glowRadius: 10
} as const;

