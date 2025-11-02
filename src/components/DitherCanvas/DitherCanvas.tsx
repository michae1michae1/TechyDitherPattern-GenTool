/**
 * Main canvas component
 * Renders the dithered pattern with overlays
 */

import { CanvasControls } from './CanvasControls';
import { ShapePreview } from './ShapePreview';

interface DitherCanvasProps {
  /** Reference to the canvas element */
  canvasRef: React.RefObject<HTMLCanvasElement>;
  /** Shape image to display (if any) */
  shapeImage: HTMLImageElement | null;
  /** Whether animation is playing */
  isAnimating: boolean;
  /** File input reference for image upload */
  fileInputRef: React.RefObject<HTMLInputElement>;
  /** Callback when play/pause toggled */
  onToggleAnimation: () => void;
  /** Callback when frame stepping */
  onStepFrame: (direction: number) => void;
  /** Callback when download requested */
  onDownload: () => void;
  /** Callback when randomize requested */
  onRandomize: () => void;
  /** Callback when shape is cleared */
  onClearShape: () => void;
  /** Callback when image upload changes */
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Canvas component with controls and overlays
 */
export function DitherCanvas({
  canvasRef,
  shapeImage,
  isAnimating,
  fileInputRef,
  onToggleAnimation,
  onStepFrame,
  onDownload,
  onRandomize,
  onClearShape,
  onImageUpload
}: DitherCanvasProps) {
  return (
    <div className="flex-1 relative">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />
      
      {/* Shape Preview */}
      {shapeImage && (
        <ShapePreview 
          shapeImage={shapeImage}
          onClear={onClearShape}
        />
      )}
      
      {/* Floating Controls */}
      <CanvasControls
        isAnimating={isAnimating}
        onToggleAnimation={onToggleAnimation}
        onStepFrame={onStepFrame}
        onUpload={() => fileInputRef.current?.click()}
        onDownload={onDownload}
        onRandomize={onRandomize}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onImageUpload}
        className="hidden"
      />
    </div>
  );
}

