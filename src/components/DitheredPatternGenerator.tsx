/**
 * Main Dithered Pattern Generator Component
 * Orchestrates all hooks and composes child components
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  useCanvasAnimation, 
  useCanvasRenderer, 
  useDrops, 
  useImageUpload, 
  useLayerManager 
} from '@/hooks';
import { symbolPresets, type SymbolPresetKey } from '@/utils/constants';
import { DitherCanvas } from './DitherCanvas';
import { ControlPanel } from './ControlPanel';

/**
 * Main application component
 * Manages state via custom hooks and composes UI components
 */
export default function DitheredPatternGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Canvas size state
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [debouncedCellSize, setDebouncedCellSize] = useState(12);
  
  // Layer management hook
  const {
    layers,
    activeLayerId,
    activeLayer,
    expandedLayerIds,
    setActiveLayerId,
    addLayer,
    removeLayer,
    updateActiveLayerConfig,
    updateLayerProperty,
    reorderLayers,
    toggleLayerExpand
  } = useLayerManager();

  // Drops and random seeds hook
  const { dropsRef, randomSeedsRef } = useDrops({
    width: canvasSize.width,
    height: canvasSize.height,
    cellSize: debouncedCellSize
  });

  // Canvas renderer hook
  const { renderFrame } = useCanvasRenderer({
    canvasRef,
    canvasSize,
    layers,
    drops: dropsRef.current,
    randomSeeds: randomSeedsRef.current,
    cellSize: activeLayer.config.cellSize
  });

  // Animation hook
  const { isAnimating, currentFrame, toggleAnimation, stepFrame } = useCanvasAnimation({
    animationSpeed: activeLayer.config.animationSpeed,
    onRenderFrame: renderFrame,
    startPlaying: false
  });

  // Image upload hook
  const { handleImageUpload } = useImageUpload();

  // Debounce cell size changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCellSize(activeLayer.config.cellSize);
    }, 150);
    
    return () => clearTimeout(timer);
  }, [activeLayer.config.cellSize]);

  // Initialize canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    
    canvas.width = width;
    canvas.height = height;
    
    setCanvasSize({ width, height });
  }, []);

  /**
   * Handle image file upload for active layer
   */
  const onImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleImageUpload(file, (img, brightnessMap) => {
      updateLayerProperty(activeLayerId, {
        shapeImage: img,
        shapeData: brightnessMap
      });
    });
  };

  /**
   * Clear shape guide for active layer
   */
  const clearShape = useCallback(() => {
    updateLayerProperty(activeLayerId, {
      shapeImage: null,
      shapeData: null
    });
  }, [activeLayerId, updateLayerProperty]);

  /**
   * Download canvas as PNG
   */
  const downloadImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'dithered-pattern.png';
    link.href = canvas.toDataURL();
    link.click();
  }, []);

  /**
   * Randomize active layer settings
   */
  const randomize = useCallback(() => {
    const presetKeys = Object.keys(symbolPresets).filter(k => k !== 'Custom');
    const randomPreset = presetKeys[Math.floor(Math.random() * presetKeys.length)] as SymbolPresetKey;
    const patternTypes = ['rain', 'wave', 'static', 'glitch', 'pulse'];
    const randomPattern = patternTypes[Math.floor(Math.random() * patternTypes.length)];
    
    updateActiveLayerConfig({
      symbolSet: symbolPresets[randomPreset],
      density: 0.3 + Math.random() * 0.6,
      pattern: randomPattern,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      gradient: Math.random() > 0.3,
      glowEffect: Math.random() > 0.3
    });
  }, [updateActiveLayerConfig]);

  return (
    <div className="w-full h-screen bg-gray-900 flex">
      {/* Canvas */}
      <DitherCanvas
        canvasRef={canvasRef}
        shapeImage={activeLayer.shapeImage}
        isAnimating={isAnimating}
        fileInputRef={fileInputRef}
        onToggleAnimation={toggleAnimation}
        onStepFrame={stepFrame}
        onDownload={downloadImage}
        onRandomize={randomize}
        onClearShape={clearShape}
        onImageUpload={onImageUpload}
      />

      {/* Control Panel */}
      <ControlPanel
        layers={layers}
        activeLayerId={activeLayerId}
        activeLayer={activeLayer}
        expandedLayerIds={expandedLayerIds}
        currentFrame={currentFrame}
        isAnimating={isAnimating}
        onSetActiveLayer={setActiveLayerId}
        onAddLayer={addLayer}
        onRemoveLayer={removeLayer}
        onUpdateLayer={updateLayerProperty}
        onReorderLayers={reorderLayers}
        onToggleExpanded={toggleLayerExpand}
        onUpdateActiveLayerConfig={updateActiveLayerConfig}
      />
    </div>
  );
}

