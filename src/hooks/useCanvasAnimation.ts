/**
 * Custom hook for managing canvas animation state and controls
 * Provides play/pause functionality and frame stepping
 */

import { useState, useEffect, useRef } from 'react';

/**
 * Configuration options for the animation hook
 */
interface UseCanvasAnimationOptions {
  /** Animation speed in milliseconds per frame */
  animationSpeed: number;
  /** Callback function to render each frame */
  onRenderFrame: (frame: number) => void;
  /** Whether to start with animation playing (default: false) */
  startPlaying?: boolean;
}

/**
 * Return type for the useCanvasAnimation hook
 */
interface UseCanvasAnimationReturn {
  /** Whether animation is currently playing */
  isAnimating: boolean;
  /** Current frame number */
  currentFrame: number;
  /** Toggle between playing and paused */
  toggleAnimation: () => void;
  /** Step forward or backward by one frame (direction: 1 or -1) */
  stepFrame: (direction: number) => void;
}

/**
 * Hook for managing canvas animation loop with play/pause and frame stepping
 * 
 * @param options - Configuration options
 * @returns Animation state and control functions
 * 
 * @example
 * ```tsx
 * const { isAnimating, currentFrame, toggleAnimation, stepFrame } = useCanvasAnimation({
 *   animationSpeed: 50,
 *   onRenderFrame: (frame) => renderCanvas(frame),
 *   startPlaying: false
 * });
 * ```
 */
export function useCanvasAnimation(
  options: UseCanvasAnimationOptions
): UseCanvasAnimationReturn {
  const { animationSpeed, onRenderFrame, startPlaying = false } = options;
  
  const [isAnimating, setIsAnimating] = useState(startPlaying);
  const [currentFrame, setCurrentFrame] = useState(0);
  
  const animationRef = useRef<number | null>(null);
  const frameCounterRef = useRef(0);
  const lastFrameTimeRef = useRef(0);

  /**
   * Toggle between playing and paused states
   */
  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  /**
   * Step forward or backward by one frame (while paused)
   */
  const stepFrame = (direction: number) => {
    frameCounterRef.current += direction;
    setCurrentFrame(frameCounterRef.current);
    onRenderFrame(frameCounterRef.current);
  };

  // Animation loop effect
  useEffect(() => {
    if (!isAnimating) {
      onRenderFrame(frameCounterRef.current);
      return;
    }

    let isActive = true;
    lastFrameTimeRef.current = performance.now();

    const animate = (timestamp: number) => {
      if (!isActive) return;

      const elapsed = timestamp - lastFrameTimeRef.current;

      if (elapsed >= animationSpeed) {
        frameCounterRef.current++;
        onRenderFrame(frameCounterRef.current);
        
        // Update display frame counter every 10 frames to reduce re-renders
        if (frameCounterRef.current % 10 === 0) {
          setCurrentFrame(frameCounterRef.current);
        }
        
        lastFrameTimeRef.current = timestamp;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      isActive = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, animationSpeed, onRenderFrame]);

  return {
    isAnimating,
    currentFrame,
    toggleAnimation,
    stepFrame
  };
}

