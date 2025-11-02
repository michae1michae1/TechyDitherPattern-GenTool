/**
 * Animation speed controls component
 */

import { SliderControl } from './SliderControl';

interface AnimationControlsProps {
  /** Animation speed in milliseconds per frame */
  animationSpeed: number;
  /** Callback when animation speed changes */
  onAnimationSpeedChange: (value: number) => void;
}

/**
 * Controls for animation speed
 */
export function AnimationControls({
  animationSpeed,
  onAnimationSpeedChange
}: AnimationControlsProps) {
  return (
    <SliderControl
      label="Speed"
      value={animationSpeed}
      min={10}
      max={200}
      step={10}
      onChange={onAnimationSpeedChange}
      unit="ms"
    />
  );
}

