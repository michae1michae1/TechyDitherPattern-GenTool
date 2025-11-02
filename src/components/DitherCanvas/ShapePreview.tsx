/**
 * Shape preview overlay component
 * Displays the uploaded shape guide image
 */

import { X } from 'lucide-react';

interface ShapePreviewProps {
  /** The shape image to display */
  shapeImage: HTMLImageElement;
  /** Callback when clear button is clicked */
  onClear: () => void;
}

/**
 * Overlay that shows the uploaded shape guide
 */
export function ShapePreview({ shapeImage, onClear }: ShapePreviewProps) {
  return (
    <div className="absolute top-6 left-6 bg-gray-800 p-3 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-white text-sm font-medium">Shape Guide</span>
        <button
          onClick={onClear}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
      <img 
        src={shapeImage.src} 
        alt="Shape guide" 
        className="w-24 h-24 object-contain bg-gray-700 rounded"
      />
    </div>
  );
}

