/**
 * Frame information display component
 * Shows current frame number and animation status
 */

interface FrameInfoProps {
  /** Current frame number */
  currentFrame: number;
  /** Whether animation is playing */
  isAnimating: boolean;
}

/**
 * Displays current frame number and animation status
 */
export function FrameInfo({ currentFrame, isAnimating }: FrameInfoProps) {
  return (
    <div className="bg-gray-700 p-3 rounded">
      <div className="text-sm text-gray-300">
        Frame: <span className="text-white font-mono">{currentFrame}</span>
      </div>
      <div className="text-xs text-gray-400 mt-1">
        {isAnimating ? 'Playing' : 'Paused - use arrows to step'}
      </div>
    </div>
  );
}

