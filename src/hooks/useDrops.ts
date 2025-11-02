/**
 * Custom hook for managing rain drops state
 * Initializes and maintains drop positions for rain animation
 */

import { useEffect, useRef } from 'react';
import type { Drop, RandomSeed } from '@/types';

/**
 * Parameters for the useDrops hook
 */
interface UseDropsParams {
  /** Canvas width in pixels */
  width: number;
  /** Canvas height in pixels */
  height: number;
  /** Cell size in pixels */
  cellSize: number;
}

/**
 * Return type for the useDrops hook
 */
interface UseDropsReturn {
  /** Reference to drops array */
  dropsRef: React.MutableRefObject<Drop[]>;
  /** Reference to pre-generated random seeds */
  randomSeedsRef: React.MutableRefObject<RandomSeed[]>;
}

/**
 * Hook for managing rain drops and random seeds for animations
 * Initializes drops based on canvas dimensions
 * 
 * @param params - Canvas dimensions and cell size
 * @returns Refs to drops and random seeds
 * 
 * @example
 * ```tsx
 * const { dropsRef, randomSeedsRef } = useDrops({
 *   width: 800,
 *   height: 600,
 *   cellSize: 12
 * });
 * ```
 */
export function useDrops(params: UseDropsParams): UseDropsReturn {
  const { width, height, cellSize } = params;
  
  const dropsRef = useRef<Drop[]>([]);
  const randomSeedsRef = useRef<RandomSeed[]>([]);

  // Initialize drops when canvas size or cell size changes
  useEffect(() => {
    if (width === 0 || height === 0) return;

    const cols = Math.floor(width / cellSize);
    const rows = Math.floor(height / cellSize);

    // Initialize drops for rain animation
    dropsRef.current = [];
    for (let i = 0; i < cols; i++) {
      dropsRef.current.push({
        x: i,
        y: Math.random() * rows,
        speed: 0.5 + Math.random() * 1.5,
        length: 10 + Math.random() * 20
      });
    }

    // Pre-generate random seeds for consistent random values
    randomSeedsRef.current = [];
    for (let i = 0; i < cols * rows; i++) {
      randomSeedsRef.current.push({
        r1: Math.random(),
        r2: Math.random(),
        r3: Math.random()
      });
    }
  }, [width, height, cellSize]);

  return {
    dropsRef,
    randomSeedsRef
  };
}

