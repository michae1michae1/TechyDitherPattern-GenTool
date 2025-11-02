/**
 * Appearance controls component
 * Handles density, cell size, and color controls
 */

import { SliderControl } from './SliderControl';

interface AppearanceControlsProps {
  /** Density value (0.1-1) */
  density: number;
  /** Cell size in pixels (6-24) */
  cellSize: number;
  /** Foreground color (hex) */
  color: string;
  /** Background color (hex) */
  bgColor: string;
  /** Callback when density changes */
  onDensityChange: (value: number) => void;
  /** Callback when cell size changes */
  onCellSizeChange: (value: number) => void;
  /** Callback when color changes */
  onColorChange: (color: string) => void;
  /** Callback when background color changes */
  onBgColorChange: (color: string) => void;
}

/**
 * Controls for density, cell size, and colors
 */
export function AppearanceControls({
  density,
  cellSize,
  color,
  bgColor,
  onDensityChange,
  onCellSizeChange,
  onColorChange,
  onBgColorChange
}: AppearanceControlsProps) {
  return (
    <>
      {/* Density */}
      <SliderControl
        label="Density"
        value={density}
        min={0.1}
        max={1}
        step={0.05}
        onChange={onDensityChange}
        formatValue={(v) => v.toFixed(2)}
      />

      {/* Cell Size */}
      <SliderControl
        label="Cell Size"
        value={cellSize}
        min={6}
        max={24}
        step={2}
        onChange={onCellSizeChange}
        unit="px"
      />

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Color
        </label>
        <input
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-full h-10 rounded cursor-pointer"
        />
      </div>

      {/* Background Color */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Background
        </label>
        <input
          type="color"
          value={bgColor}
          onChange={(e) => onBgColorChange(e.target.value)}
          className="w-full h-10 rounded cursor-pointer"
        />
      </div>
    </>
  );
}

