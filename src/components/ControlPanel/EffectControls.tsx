/**
 * Effect controls component
 * Handles gradient and glow effect toggles and settings
 */

import { SliderControl } from './SliderControl';

interface EffectControlsProps {
  /** Whether gradient effect is enabled */
  gradient: boolean;
  /** Gradient strength (0-1) */
  gradientStrength: number;
  /** Whether glow effect is enabled */
  glowEffect: boolean;
  /** Glow intensity (0-20) */
  glowIntensity: number;
  /** Glow radius (0-30) */
  glowRadius: number;
  /** Callback when gradient toggle changes */
  onGradientChange: (enabled: boolean) => void;
  /** Callback when gradient strength changes */
  onGradientStrengthChange: (value: number) => void;
  /** Callback when glow toggle changes */
  onGlowEffectChange: (enabled: boolean) => void;
  /** Callback when glow intensity changes */
  onGlowIntensityChange: (value: number) => void;
  /** Callback when glow radius changes */
  onGlowRadiusChange: (value: number) => void;
}

/**
 * Controls for gradient and glow effects
 */
export function EffectControls({
  gradient,
  gradientStrength,
  glowEffect,
  glowIntensity,
  glowRadius,
  onGradientChange,
  onGradientStrengthChange,
  onGlowEffectChange,
  onGlowIntensityChange,
  onGlowRadiusChange
}: EffectControlsProps) {
  return (
    <>
      {/* Gradient Toggle */}
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={gradient}
          onChange={(e) => onGradientChange(e.target.checked)}
          className="w-4 h-4 mr-2"
        />
        <label className="text-sm font-medium text-gray-300">
          Gradient Effect
        </label>
      </div>

      {/* Gradient Strength */}
      {gradient && (
        <SliderControl
          label="Gradient Strength"
          value={gradientStrength}
          min={0}
          max={1}
          step={0.05}
          onChange={onGradientStrengthChange}
          formatValue={(v) => v.toFixed(2)}
        />
      )}

      {/* Glow Toggle */}
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={glowEffect}
          onChange={(e) => onGlowEffectChange(e.target.checked)}
          className="w-4 h-4 mr-2"
        />
        <label className="text-sm font-medium text-gray-300">
          Glow Effect
        </label>
      </div>

      {/* Glow Intensity */}
      {glowEffect && (
        <>
          <SliderControl
            label="Glow Intensity"
            value={glowIntensity}
            min={0}
            max={20}
            step={1}
            onChange={onGlowIntensityChange}
          />
          <SliderControl
            label="Glow Radius"
            value={glowRadius}
            min={0}
            max={30}
            step={1}
            onChange={onGlowRadiusChange}
            description="Higher = more spread"
          />
        </>
      )}
    </>
  );
}

