/**
 * Custom hook for managing layers state and operations
 * Handles layer CRUD, reordering, and active layer selection
 */

import { useState } from 'react';
import type { Layer, LayerConfig } from '@/types';
import { DEFAULT_LAYER_CONFIG } from '@/utils/constants';

/**
 * Return type for the useLayerManager hook
 */
interface UseLayerManagerReturn {
  /** Array of all layers */
  layers: Layer[];
  /** Currently active layer ID */
  activeLayerId: string;
  /** Currently active layer object */
  activeLayer: Layer;
  /** Set of expanded layer IDs in the UI */
  expandedLayerIds: Set<string>;
  /** Set the active layer by ID */
  setActiveLayerId: (id: string) => void;
  /** Add a new layer (max 3 layers) */
  addLayer: () => void;
  /** Remove a layer by ID (min 1 layer) */
  removeLayer: (id: string) => void;
  /** Update the active layer's configuration */
  updateActiveLayerConfig: (configUpdate: Partial<LayerConfig>) => void;
  /** Update any layer property */
  updateLayerProperty: (layerId: string, updates: Partial<Layer>) => void;
  /** Reorder layers by moving from one index to another */
  reorderLayers: (fromIndex: number, toIndex: number) => void;
  /** Toggle a layer's expanded state in the UI */
  toggleLayerExpand: (layerId: string) => void;
}

/**
 * Creates a default layer configuration
 */
function createDefaultLayerConfig(): LayerConfig {
  return { ...DEFAULT_LAYER_CONFIG };
}

/**
 * Hook for managing layers with CRUD operations and state
 * 
 * @returns Layer management interface
 * 
 * @example
 * ```tsx
 * const {
 *   layers,
 *   activeLayer,
 *   addLayer,
 *   removeLayer,
 *   updateActiveLayerConfig
 * } = useLayerManager();
 * ```
 */
export function useLayerManager(): UseLayerManagerReturn {
  // Initialize with one default layer
  const [layers, setLayers] = useState<Layer[]>([{
    id: 'layer-1',
    name: 'Layer 1',
    visible: true,
    opacity: 1,
    config: createDefaultLayerConfig(),
    shapeImage: null,
    shapeData: null
  }]);

  const [activeLayerId, setActiveLayerId] = useState<string>('layer-1');
  const [expandedLayerIds, setExpandedLayerIds] = useState<Set<string>>(new Set(['layer-1']));
  
  // Get active layer (with fallback to first layer)
  const activeLayer = layers.find(l => l.id === activeLayerId) || layers[0];

  /**
   * Add a new layer (maximum 3 layers)
   */
  const addLayer = () => {
    if (layers.length >= 3) return;
    const newId = `layer-${Date.now()}`;
    const newLayer: Layer = {
      id: newId,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      opacity: 1,
      config: createDefaultLayerConfig(),
      shapeImage: null,
      shapeData: null
    };
    setLayers([...layers, newLayer]);
    setActiveLayerId(newId);
    setExpandedLayerIds(new Set([...expandedLayerIds, newId]));
  };

  /**
   * Remove a layer (minimum 1 layer must remain)
   */
  const removeLayer = (layerId: string) => {
    if (layers.length === 1) return; // Keep at least one layer
    const newLayers = layers.filter(l => l.id !== layerId);
    setLayers(newLayers);
    if (activeLayerId === layerId) {
      setActiveLayerId(newLayers[0].id);
    }
    const newExpanded = new Set(expandedLayerIds);
    newExpanded.delete(layerId);
    setExpandedLayerIds(newExpanded);
  };

  /**
   * Update the active layer's configuration
   */
  const updateActiveLayerConfig = (configUpdate: Partial<LayerConfig>) => {
    setLayers(layers.map(layer => 
      layer.id === activeLayerId 
        ? { ...layer, config: { ...layer.config, ...configUpdate } }
        : layer
    ));
  };

  /**
   * Update any layer's properties
   */
  const updateLayerProperty = (layerId: string, updates: Partial<Layer>) => {
    setLayers(layers.map(layer =>
      layer.id === layerId ? { ...layer, ...updates } : layer
    ));
  };

  /**
   * Reorder layers by dragging
   */
  const reorderLayers = (fromIndex: number, toIndex: number) => {
    const newLayers = [...layers];
    const [removed] = newLayers.splice(fromIndex, 1);
    newLayers.splice(toIndex, 0, removed);
    setLayers(newLayers);
  };

  /**
   * Toggle a layer's expanded state in the UI
   */
  const toggleLayerExpand = (layerId: string) => {
    const newExpanded = new Set(expandedLayerIds);
    if (newExpanded.has(layerId)) {
      newExpanded.delete(layerId);
    } else {
      newExpanded.add(layerId);
    }
    setExpandedLayerIds(newExpanded);
  };

  return {
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
  };
}

