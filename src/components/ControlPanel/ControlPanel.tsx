/**
 * Main control panel component
 * Composes all control sections into a sidebar
 */

import type { Layer, LayerConfig } from '@/types';
import { LayersSection } from './LayersSection';
import { FrameInfo } from './FrameInfo';
import { SymbolControls } from './SymbolControls';
import { PatternControls } from './PatternControls';
import { AppearanceControls } from './AppearanceControls';
import { AnimationControls } from './AnimationControls';
import { EffectControls } from './EffectControls';

interface ControlPanelProps {
  /** All layers */
  layers: Layer[];
  /** Active layer ID */
  activeLayerId: string;
  /** Active layer object */
  activeLayer: Layer;
  /** Expanded layer IDs */
  expandedLayerIds: Set<string>;
  /** Current frame number */
  currentFrame: number;
  /** Whether animation is playing */
  isAnimating: boolean;
  /** Layer management callbacks */
  onSetActiveLayer: (id: string) => void;
  onAddLayer: () => void;
  onRemoveLayer: (id: string) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onReorderLayers: (fromIndex: number, toIndex: number) => void;
  onToggleExpanded: (id: string) => void;
  /** Active layer config update callback */
  onUpdateActiveLayerConfig: (updates: Partial<LayerConfig>) => void;
}

/**
 * Control panel sidebar with all settings
 */
export function ControlPanel({
  layers,
  activeLayerId,
  activeLayer,
  expandedLayerIds,
  currentFrame,
  isAnimating,
  onSetActiveLayer,
  onAddLayer,
  onRemoveLayer,
  onUpdateLayer,
  onReorderLayers,
  onToggleExpanded,
  onUpdateActiveLayerConfig
}: ControlPanelProps) {
  const config = activeLayer.config;

  return (
    <div className="w-80 bg-gray-800 p-6 overflow-y-auto space-y-6">
      <h2 className="text-xl font-bold text-white mb-4">Pattern Controls</h2>

      {/* Layers Section */}
      <LayersSection
        layers={layers}
        activeLayerId={activeLayerId}
        expandedLayerIds={expandedLayerIds}
        onSetActiveLayer={onSetActiveLayer}
        onAddLayer={onAddLayer}
        onRemoveLayer={onRemoveLayer}
        onUpdateLayer={onUpdateLayer}
        onReorderLayers={onReorderLayers}
        onToggleExpanded={onToggleExpanded}
      />

      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Active Layer Settings</h3>
      </div>

      {/* Frame Info */}
      <FrameInfo 
        currentFrame={currentFrame}
        isAnimating={isAnimating}
      />

      {/* Symbol Controls */}
      <SymbolControls
        symbolSet={config.symbolSet}
        onSymbolSetChange={(symbolSet) => onUpdateActiveLayerConfig({ symbolSet })}
      />

      {/* Pattern Controls */}
      <PatternControls
        pattern={config.pattern}
        shapeInfluence={config.shapeInfluence}
        hasShapeData={activeLayer.shapeData !== null}
        onPatternChange={(pattern) => onUpdateActiveLayerConfig({ pattern })}
        onShapeInfluenceChange={(shapeInfluence) => onUpdateActiveLayerConfig({ shapeInfluence })}
      />

      {/* Appearance Controls */}
      <AppearanceControls
        density={config.density}
        cellSize={config.cellSize}
        color={config.color}
        bgColor={config.bgColor}
        onDensityChange={(density) => onUpdateActiveLayerConfig({ density })}
        onCellSizeChange={(cellSize) => onUpdateActiveLayerConfig({ cellSize })}
        onColorChange={(color) => onUpdateActiveLayerConfig({ color })}
        onBgColorChange={(bgColor) => onUpdateActiveLayerConfig({ bgColor })}
      />

      {/* Animation Controls */}
      <AnimationControls
        animationSpeed={config.animationSpeed}
        onAnimationSpeedChange={(animationSpeed) => onUpdateActiveLayerConfig({ animationSpeed })}
      />

      {/* Effect Controls */}
      <EffectControls
        gradient={config.gradient}
        gradientStrength={config.gradientStrength}
        glowEffect={config.glowEffect}
        glowIntensity={config.glowIntensity}
        glowRadius={config.glowRadius}
        onGradientChange={(gradient) => onUpdateActiveLayerConfig({ gradient })}
        onGradientStrengthChange={(gradientStrength) => onUpdateActiveLayerConfig({ gradientStrength })}
        onGlowEffectChange={(glowEffect) => onUpdateActiveLayerConfig({ glowEffect })}
        onGlowIntensityChange={(glowIntensity) => onUpdateActiveLayerConfig({ glowIntensity })}
        onGlowRadiusChange={(glowRadius) => onUpdateActiveLayerConfig({ glowRadius })}
      />
    </div>
  );
}

