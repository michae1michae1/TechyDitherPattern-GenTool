/**
 * Canvas controls component
 * Floating controls for play/pause, frame stepping, and actions
 */

import { Play, Pause, Download, RefreshCw, ChevronLeft, ChevronRight, Upload } from 'lucide-react';

interface CanvasControlsProps {
  /** Whether animation is currently playing */
  isAnimating: boolean;
  /** Callback when play/pause is toggled */
  onToggleAnimation: () => void;
  /** Callback when frame should step forward or backward */
  onStepFrame: (direction: number) => void;
  /** Callback when upload button is clicked */
  onUpload: () => void;
  /** Callback when download button is clicked */
  onDownload: () => void;
  /** Callback when randomize button is clicked */
  onRandomize: () => void;
}

/**
 * Floating control buttons at bottom of canvas
 */
export function CanvasControls({
  isAnimating,
  onToggleAnimation,
  onStepFrame,
  onUpload,
  onDownload,
  onRandomize
}: CanvasControlsProps) {
  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3">
      <button
        onClick={() => onStepFrame(-1)}
        disabled={isAnimating}
        className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={onToggleAnimation}
        className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg shadow-lg transition-colors"
      >
        {isAnimating ? <Pause size={20} /> : <Play size={20} />}
      </button>
      <button
        onClick={() => onStepFrame(1)}
        disabled={isAnimating}
        className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight size={20} />
      </button>
      <button
        onClick={onUpload}
        className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg shadow-lg transition-colors"
      >
        <Upload size={20} />
      </button>
      <button
        onClick={onDownload}
        className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg shadow-lg transition-colors"
      >
        <Download size={20} />
      </button>
      <button
        onClick={onRandomize}
        className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg shadow-lg transition-colors"
      >
        <RefreshCw size={20} />
      </button>
    </div>
  );
}

