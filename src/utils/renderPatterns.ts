/**
 * Pattern rendering functions for different animation types
 * Each function renders a specific pattern type to a canvas context
 */

import type { Layer, Drop, RandomSeed } from '@/types';
import { getShapeBrightnessForLayer, brightnessToHex, calculateGlowBlur } from './colorUtils';

/**
 * Common parameters for all pattern rendering functions
 */
interface RenderPatternParams {
  ctx: CanvasRenderingContext2D;
  layer: Layer;
  cols: number;
  rows: number;
  cellSize: number;
  frame: number;
  randomSeeds: RandomSeed[];
}

/**
 * Renders the rain pattern - symbols falling like rain drops
 * 
 * @param params - Rendering parameters
 * @param drops - Array of drop objects tracking rain animation
 */
export function renderRainPattern(
  params: RenderPatternParams,
  drops: Drop[]
): void {
  const { ctx, layer, cols, rows, cellSize, randomSeeds } = params;
  const layerConfig = layer.config;
  const layerSymbols = layerConfig.symbolSet.split('');
  const halfCell = Math.floor(cellSize / 2);
  const colorBase = layerConfig.color;

  let currentShadowBlur = -1;
  
  if (layerConfig.glowEffect) {
    ctx.shadowColor = layerConfig.color;
  }

  drops.forEach((drop) => {
    const dropX = drop.x;
    for (let j = 0; j < drop.length; j++) {
      const y = drop.y - j;
      if (y < 0 || y >= rows) continue;

      const yInt = Math.floor(y);
      const shapeBrightness = getShapeBrightnessForLayer(dropX, yInt, cols, rows, layer);
      const alpha = (1 - (j / drop.length)) * shapeBrightness;
      const brightness = layerConfig.gradient 
        ? alpha * layerConfig.gradientStrength + (1 - layerConfig.gradientStrength) 
        : shapeBrightness;
      
      if (brightness > 0.1) {
        const brightnessHex = brightnessToHex(brightness);
        ctx.fillStyle = colorBase + brightnessHex;
        
        const targetBlur = layerConfig.glowEffect 
          ? calculateGlowBlur(layerConfig.glowIntensity, brightness, layerConfig.glowRadius)
          : 0;
        if (currentShadowBlur !== targetBlur) {
          ctx.shadowBlur = targetBlur;
          currentShadowBlur = targetBlur;
        }

        const seedIndex = (dropX + yInt) % randomSeeds.length;
        const symbolIndex = Math.floor(randomSeeds[seedIndex].r1 * layerSymbols.length);
        
        ctx.fillText(
          layerSymbols[symbolIndex],
          dropX * cellSize + halfCell,
          yInt * cellSize + halfCell
        );
      }
    }
  });
}

/**
 * Renders the wave pattern - undulating wave effect
 * 
 * @param params - Rendering parameters
 */
export function renderWavePattern(params: RenderPatternParams): void {
  const { ctx, layer, cols, rows, cellSize, frame, randomSeeds } = params;
  const layerConfig = layer.config;
  const layerSymbols = layerConfig.symbolSet.split('');
  const halfCell = Math.floor(cellSize / 2);
  const colorBase = layerConfig.color;

  let currentShadowBlur = -1;
  
  if (layerConfig.glowEffect) {
    ctx.shadowColor = layerConfig.color;
  }

  for (let i = 0; i < cols; i++) {
    const iCellPos = i * cellSize + halfCell;
    for (let j = 0; j < rows; j++) {
      const wave = Math.sin((i + frame * 0.1) * 0.3) * Math.cos((j + frame * 0.1) * 0.3);
      const waveAlpha = (wave + 1) / 2;
      const shapeBrightness = getShapeBrightnessForLayer(i, j, cols, rows, layer);
      const alpha = waveAlpha * shapeBrightness;
      
      const seedIndex = (i * rows + j) % randomSeeds.length;
      
      if (randomSeeds[seedIndex].r1 < layerConfig.density * alpha) {
        const brightness = layerConfig.gradient 
          ? alpha * layerConfig.gradientStrength + (1 - layerConfig.gradientStrength) * shapeBrightness 
          : shapeBrightness;
        const brightnessHex = brightnessToHex(brightness);
        ctx.fillStyle = colorBase + brightnessHex;
        
        const targetBlur = layerConfig.glowEffect 
          ? calculateGlowBlur(layerConfig.glowIntensity, brightness, layerConfig.glowRadius)
          : 0;
        if (currentShadowBlur !== targetBlur) {
          ctx.shadowBlur = targetBlur;
          currentShadowBlur = targetBlur;
        }

        const symbolIndex = Math.floor(randomSeeds[seedIndex].r2 * layerSymbols.length);
        ctx.fillText(
          layerSymbols[symbolIndex],
          iCellPos,
          j * cellSize + halfCell
        );
      }
    }
  }
}

/**
 * Renders the static pattern - TV static-like noise
 * 
 * @param params - Rendering parameters
 */
export function renderStaticPattern(params: RenderPatternParams): void {
  const { ctx, layer, cols, rows, cellSize, frame, randomSeeds } = params;
  const layerConfig = layer.config;
  const layerSymbols = layerConfig.symbolSet.split('');
  const halfCell = Math.floor(cellSize / 2);
  const colorBase = layerConfig.color;

  const frameOffset = (frame * 17) % randomSeeds.length;
  let currentShadowBlur = -1;
  
  if (layerConfig.glowEffect) {
    ctx.shadowColor = layerConfig.color;
  }
  
  for (let i = 0; i < cols; i++) {
    const iCellPos = i * cellSize + halfCell;
    for (let j = 0; j < rows; j++) {
      const shapeBrightness = getShapeBrightnessForLayer(i, j, cols, rows, layer);
      const baseSeedIndex = (i * rows + j) % randomSeeds.length;
      const seedIndex = (baseSeedIndex + frameOffset) % randomSeeds.length;
      
      if (randomSeeds[seedIndex].r1 < layerConfig.density * shapeBrightness) {
        const brightness = layerConfig.gradient 
          ? randomSeeds[seedIndex].r2 * shapeBrightness * layerConfig.gradientStrength + (1 - layerConfig.gradientStrength) * shapeBrightness 
          : shapeBrightness;
        const brightnessHex = brightnessToHex(brightness);
        ctx.fillStyle = colorBase + brightnessHex;
        
        const targetBlur = layerConfig.glowEffect 
          ? calculateGlowBlur(layerConfig.glowIntensity, brightness, layerConfig.glowRadius)
          : 0;
        if (currentShadowBlur !== targetBlur) {
          ctx.shadowBlur = targetBlur;
          currentShadowBlur = targetBlur;
        }

        const symbolIndex = Math.floor(randomSeeds[seedIndex].r3 * layerSymbols.length);
        ctx.fillText(
          layerSymbols[symbolIndex],
          iCellPos,
          j * cellSize + halfCell
        );
      }
    }
  }
}

/**
 * Renders the glitch pattern - random digital glitches and offsets
 * 
 * @param params - Rendering parameters
 */
export function renderGlitchPattern(params: RenderPatternParams): void {
  const { ctx, layer, cols, rows, cellSize, frame, randomSeeds } = params;
  const layerConfig = layer.config;
  const layerSymbols = layerConfig.symbolSet.split('');
  const halfCell = Math.floor(cellSize / 2);
  const colorBase = layerConfig.color;

  const glitchCycle = frame % 80;
  const isGlitching = glitchCycle < 5 || (glitchCycle > 30 && glitchCycle < 35);
  const glitchIntensity = isGlitching ? (Math.sin(frame * 0.5) + 1) / 2 : 0;
  
  let currentShadowBlur = -1;
  
  if (layerConfig.glowEffect) {
    ctx.shadowColor = layerConfig.color;
  }
  
  for (let i = 0; i < cols; i++) {
    const iCellPos = i * cellSize + halfCell;
    for (let j = 0; j < rows; j++) {
      const shapeBrightness = getShapeBrightnessForLayer(i, j, cols, rows, layer);
      const seedIndex = (i * rows + j) % randomSeeds.length;
      
      let offsetX = 0;
      let offsetY = 0;
      if (isGlitching) {
        const glitchSeedIndex = (seedIndex + frame) % randomSeeds.length;
        const shouldGlitch = randomSeeds[glitchSeedIndex].r1 < 0.15;
        if (shouldGlitch) {
          offsetX = (randomSeeds[glitchSeedIndex].r2 - 0.5) * 30 * glitchIntensity;
          offsetY = (randomSeeds[glitchSeedIndex].r3 - 0.5) * 10 * glitchIntensity;
        }
      }
      
      if (randomSeeds[seedIndex].r2 < layerConfig.density * shapeBrightness) {
        const brightness = layerConfig.gradient 
          ? (0.5 + randomSeeds[seedIndex].r3 * 0.5) * shapeBrightness * layerConfig.gradientStrength + (1 - layerConfig.gradientStrength) * shapeBrightness 
          : shapeBrightness;
        const brightnessHex = brightnessToHex(brightness);
        ctx.fillStyle = colorBase + brightnessHex;
        
        const targetBlur = layerConfig.glowEffect 
          ? calculateGlowBlur(layerConfig.glowIntensity, brightness, layerConfig.glowRadius)
          : 0;
        if (currentShadowBlur !== targetBlur) {
          ctx.shadowBlur = targetBlur;
          currentShadowBlur = targetBlur;
        }

        const symbolIndex = Math.floor(randomSeeds[seedIndex].r1 * layerSymbols.length);
        ctx.fillText(
          layerSymbols[symbolIndex],
          iCellPos + offsetX,
          j * cellSize + halfCell + offsetY
        );
      }
    }
  }
}

/**
 * Renders the pulse pattern - pulsing from center outward
 * 
 * @param params - Rendering parameters
 */
export function renderPulsePattern(params: RenderPatternParams): void {
  const { ctx, layer, cols, rows, cellSize, frame, randomSeeds } = params;
  const layerConfig = layer.config;
  const layerSymbols = layerConfig.symbolSet.split('');
  const halfCell = Math.floor(cellSize / 2);
  const colorBase = layerConfig.color;

  const pulse = (Math.sin(frame * 0.05) + 1) / 2;
  const centerX = cols / 2;
  const centerY = rows / 2;
  const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
  
  let currentShadowBlur = -1;
  
  if (layerConfig.glowEffect) {
    ctx.shadowColor = layerConfig.color;
  }
  
  for (let i = 0; i < cols; i++) {
    const dx = i - centerX;
    const iCellPos = i * cellSize + halfCell;
    for (let j = 0; j < rows; j++) {
      const shapeBrightness = getShapeBrightnessForLayer(i, j, cols, rows, layer);
      const dy = j - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const normalizedDist = dist / maxDist;
      
      const seedIndex = (i * rows + j) % randomSeeds.length;
      
      if (randomSeeds[seedIndex].r1 < layerConfig.density * (1 - normalizedDist) * pulse * shapeBrightness) {
        const brightness = layerConfig.gradient 
          ? (1 - normalizedDist) * pulse * shapeBrightness * layerConfig.gradientStrength + (1 - layerConfig.gradientStrength) * shapeBrightness 
          : shapeBrightness;
        const brightnessHex = brightnessToHex(brightness);
        ctx.fillStyle = colorBase + brightnessHex;
        
        const targetBlur = layerConfig.glowEffect 
          ? calculateGlowBlur(layerConfig.glowIntensity, brightness, layerConfig.glowRadius)
          : 0;
        if (currentShadowBlur !== targetBlur) {
          ctx.shadowBlur = targetBlur;
          currentShadowBlur = targetBlur;
        }

        const symbolIndex = Math.floor(randomSeeds[seedIndex].r2 * layerSymbols.length);
        ctx.fillText(
          layerSymbols[symbolIndex],
          iCellPos,
          j * cellSize + halfCell
        );
      }
    }
  }
}

