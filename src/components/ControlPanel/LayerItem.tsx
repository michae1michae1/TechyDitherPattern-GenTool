/**
 * Individual layer item component with drag-and-drop support
 */

import { RxDragHandleDots2 } from 'react-icons/rx';
import { Eye, EyeOff, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import type { Layer } from '@/types';

interface LayerItemProps {
  /** The layer to display */
  layer: Layer;
  /** Whether this layer is currently active */
  isActive: boolean;
  /** Whether this layer is expanded in the UI */
  isExpanded: boolean;
  /** Whether this is the only layer (cannot be deleted) */
  isOnlyLayer: boolean;
  /** Callback when layer is clicked to activate */
  onActivate: () => void;
  /** Callback when layer visibility is toggled */
  onToggleVisibility: () => void;
  /** Callback when layer name changes */
  onNameChange: (name: string) => void;
  /** Callback when layer opacity changes */
  onOpacityChange: (opacity: number) => void;
  /** Callback when layer should be deleted */
  onDelete: () => void;
  /** Callback when layer expand state is toggled */
  onToggleExpand: () => void;
  /** Drag event handlers */
  onDragStart: () => void;
  onDragEnd: () => void;
}

/**
 * Single layer row with controls
 */
export function LayerItem({
  layer,
  isActive,
  isExpanded,
  isOnlyLayer,
  onActivate,
  onToggleVisibility,
  onNameChange,
  onOpacityChange,
  onDelete,
  onToggleExpand,
  onDragStart,
  onDragEnd
}: LayerItemProps) {
  return (
    <div
      className={`bg-gray-800 rounded p-3 border-2 transition-colors ${
        isActive ? 'border-blue-500' : 'border-transparent'
      }`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex items-center gap-2">
        <button className="cursor-move text-gray-400 hover:text-white">
          <RxDragHandleDots2 size={20} />
        </button>

        <button
          onClick={onToggleVisibility}
          className="text-gray-300 hover:text-white"
        >
          {layer.visible ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>

        <button
          onClick={() => {
            onActivate();
            onToggleExpand();
          }}
          className="flex-1 text-left text-white font-medium text-sm flex items-center gap-2"
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <input
            type="text"
            value={layer.name}
            onChange={(e) => onNameChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-transparent border-none outline-none"
          />
        </button>

        {!isOnlyLayer && (
          <button
            onClick={onDelete}
            className="text-red-400 hover:text-red-300"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Layer Opacity */}
      {isExpanded && (
        <div className="mt-2 ml-7">
          <label className="text-xs text-gray-400">
            Opacity: {Math.round(layer.opacity * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={layer.opacity}
            onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
            className="w-full h-1"
          />
        </div>
      )}
    </div>
  );
}

