/**
 * Reusable slider control component with label and value display
 */

interface SliderControlProps {
  /** Label text to display above the slider */
  label: string;
  /** Current slider value */
  value: number;
  /** Minimum value */
  min: number;
  /** Maximum value */
  max: number;
  /** Step increment */
  step: number;
  /** Callback when value changes */
  onChange: (value: number) => void;
  /** Optional unit suffix (e.g., 'px', 'ms', '%') */
  unit?: string;
  /** Optional format function for displaying the value */
  formatValue?: (value: number) => string;
  /** Optional description text */
  description?: string;
}

/**
 * Reusable slider control component
 * Displays a labeled slider with current value
 * 
 * @example
 * ```tsx
 * <SliderControl
 *   label="Cell Size"
 *   value={12}
 *   min={6}
 *   max={24}
 *   step={2}
 *   onChange={(val) => updateConfig({ cellSize: val })}
 *   unit="px"
 * />
 * ```
 */
export function SliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit = '',
  formatValue,
  description
}: SliderControlProps) {
  const displayValue = formatValue ? formatValue(value) : value.toString();
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}: {displayValue}{unit}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
      {description && (
        <p className="text-xs text-gray-400 mt-1">
          {description}
        </p>
      )}
    </div>
  );
}

