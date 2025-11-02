/**
 * Pattern controls component
 * Handles pattern type selection and shape influence
 */

import { patternTypes, type PatternType } from '@/utils/constants';
import { SliderControl } from './SliderControl';

interface PatternControlsProps {
  /** Current pattern type */
  pattern: string;
  /** Shape influence value (0-1) */
  shapeInfluence: number;
  /** Whether shape data exists */
  hasShapeData: boolean;
  /** Callback when pattern changes */
  onPatternChange: (pattern: string) => void;
  /** Callback when shape influence changes */
  onShapeInfluenceChange: (value: number) => void;
}

/**
 * Controls for pattern type and shape influence
 */
export function PatternControls({
  pattern,
  shapeInfluence,
  hasShapeData,
  onPatternChange,
  onShapeInfluenceChange
}: PatternControlsProps) {
  return (
    <>
      {/* Pattern Type */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Pattern Type
        </label>
        <select
          value={pattern}
          onChange={(e) => onPatternChange(e.target.value)}
          className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {patternTypes.map(type => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Shape Influence - only show if shape data exists */}
      {hasShapeData && (
        <SliderControl
          label="Shape Influence"
          value={shapeInfluence}
          min={0}
          max={1}
          step={0.05}
          onChange={onShapeInfluenceChange}
          formatValue={(v) => v.toFixed(2)}
          description="Higher = pattern follows shape more closely"
        />
      )}
    </>
  );
}

