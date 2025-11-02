/**
 * Custom hook for canvas rendering logic
 * Handles compositing multiple layers and rendering patterns
 */

import { useCallback } from 'react';
import type { Layer, Drop, RandomSeed } from '@/types';
import {
  renderRainPattern,
  renderWavePattern,
  renderStaticPattern,
  renderGlitchPattern,
  renderPulsePattern
} from '@/utils/renderPatterns';

/**
 * Canvas size information
 */
interface CanvasSize {
  width: number;
  height: number;
}

/**
 * Parameters for the useCanvasRenderer hook
 */
interface UseCanvasRendererParams {
  /** Reference to the main canvas element */
  canvasRef: React.RefObject<HTMLCanvasElement>;
  /** Canvas dimensions */
  canvasSize: CanvasSize;
  /** Array of layers to render */
  layers: Layer[];
  /** Rain drops for animation */
  drops: Drop[];
  /** Pre-generated random seeds */
  randomSeeds: RandomSeed[];
  /** Cell size for drop updates */
  cellSize: number;
}

/**
 * Return type for the useCanvasRenderer hook
 */
interface UseCanvasRendererReturn {
  /** Render a single frame to the canvas */
  renderFrame: (frame: number) => void;
}

/**
 * Hook for rendering canvas with layer composition
 * 
 * @param params - Rendering parameters
 * @returns Rendering functions
 * 
 * @example
 * ```tsx
 * const { renderFrame } = useCanvasRenderer({
 *   canvasRef,
 *   canvasSize,
 *   layers,
 *   drops,
 *   randomSeeds,
 *   cellSize: 12
 * });
 * 
 * // Render frame 100
 * renderFrame(100);
 * ```
 */
export function useCanvasRenderer(
  params: UseCanvasRendererParams
): UseCanvasRendererReturn {
  const { canvasRef, canvasSize, layers, drops, randomSeeds, cellSize } = params;

  /**
   * Renders a single layer to an offscreen canvas
   */
  const renderLayerToCanvas = useCallback((
    layer: Layer,
    canvas: HTMLCanvasElement,
    frame: number
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvasSize;
    if (width === 0 || height === 0) return;

    const layerConfig = layer.config;
    
    const cols = Math.floor(width / layerConfig.cellSize);
    const rows = Math.floor(height / layerConfig.cellSize);

    // Clear with transparent background (layers composite)
    ctx.clearRect(0, 0, width, height);

    ctx.font = `${layerConfig.cellSize - 2}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Prepare common parameters for pattern rendering
    const renderParams = {
      ctx,
      layer,
      cols,
      rows,
      cellSize: layerConfig.cellSize,
      frame,
      randomSeeds
    };

    // Render based on pattern type
    switch (layerConfig.pattern) {
      case 'rain':
        renderRainPattern(renderParams, drops);
        break;
      case 'wave':
        renderWavePattern(renderParams);
        break;
      case 'static':
        renderStaticPattern(renderParams);
        break;
      case 'glitch':
        renderGlitchPattern(renderParams);
        break;
      case 'pulse':
        renderPulsePattern(renderParams);
        break;
    }
  }, [canvasSize, drops, randomSeeds]);

  /**
   * Main render function - composites all visible layers
   */
  const renderFrame = useCallback((frame: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvasSize;
    if (width === 0 || height === 0) return;

    // Clear main canvas with the bottom layer's background color (or default)
    const bottomLayer = layers[0];
    ctx.fillStyle = bottomLayer?.config.bgColor || '#0a0e27';
    ctx.fillRect(0, 0, width, height);

    // Create offscreen canvases for each visible layer and composite them
    const visibleLayers = layers.filter(layer => layer.visible);
    
    visibleLayers.forEach((layer) => {
      // Create an offscreen canvas for this layer
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = width;
      offscreenCanvas.height = height;
      
      // Render layer to offscreen canvas
      renderLayerToCanvas(layer, offscreenCanvas, frame);
      
      // Composite onto main canvas with layer opacity
      ctx.globalAlpha = layer.opacity;
      ctx.drawImage(offscreenCanvas, 0, 0);
      ctx.globalAlpha = 1; // Reset
    });

    // Update drops for rain animation (shared across layers)
    drops.forEach((drop) => {
      const cols = Math.floor(width / cellSize);
      const rows = Math.floor(height / cellSize);
      
      drop.y += drop.speed * 0.3;
      if (drop.y > rows + drop.length) {
        drop.y = -drop.length;
        drop.speed = 0.5 + Math.random() * 1.5;
      }
    });
  }, [canvasRef, canvasSize, layers, drops, cellSize, renderLayerToCanvas]);

  return {
    renderFrame
  };
}

