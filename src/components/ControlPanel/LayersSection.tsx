/**
 * Layers section component
 * Displays list of layers with add button and drag-to-reorder
 */

import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Layer } from '@/types';
import { LayerItem } from './LayerItem';

interface LayersSectionProps {
  /** Array of all layers */
  layers: Layer[];
  /** ID of the currently active layer */
  activeLayerId: string;
  /** Set of expanded layer IDs */
  expandedLayerIds: Set<string>;
  /** Callback to set active layer */
  onSetActiveLayer: (id: string) => void;
  /** Callback to add a new layer */
  onAddLayer: () => void;
  /** Callback to remove a layer */
  onRemoveLayer: (id: string) => void;
  /** Callback to update layer properties */
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  /** Callback to reorder layers */
  onReorderLayers: (fromIndex: number, toIndex: number) => void;
  /** Callback to toggle layer expanded state */
  onToggleExpanded: (id: string) => void;
}

/**
 * Layers management section with list and controls
 */
export function LayersSection({
  layers,
  activeLayerId,
  expandedLayerIds,
  onSetActiveLayer,
  onAddLayer,
  onRemoveLayer,
  onUpdateLayer,
  onReorderLayers,
  onToggleExpanded
}: LayersSectionProps) {
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);

  return (
    <div className="bg-gray-700 rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">Layers</h3>
        <button
          onClick={onAddLayer}
          disabled={layers.length >= 3}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {layers.map((layer, index) => (
        <div
          key={layer.id}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (draggedLayerId) {
              const fromIndex = layers.findIndex(l => l.id === draggedLayerId);
              onReorderLayers(fromIndex, index);
            }
          }}
        >
          <LayerItem
            layer={layer}
            isActive={layer.id === activeLayerId}
            isExpanded={expandedLayerIds.has(layer.id)}
            isOnlyLayer={layers.length === 1}
            onActivate={() => onSetActiveLayer(layer.id)}
            onToggleVisibility={() => onUpdateLayer(layer.id, { visible: !layer.visible })}
            onNameChange={(name) => onUpdateLayer(layer.id, { name })}
            onOpacityChange={(opacity) => onUpdateLayer(layer.id, { opacity })}
            onDelete={() => onRemoveLayer(layer.id)}
            onToggleExpand={() => onToggleExpanded(layer.id)}
            onDragStart={() => setDraggedLayerId(layer.id)}
            onDragEnd={() => setDraggedLayerId(null)}
          />
        </div>
      ))}
    </div>
  );
}

