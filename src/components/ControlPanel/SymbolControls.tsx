/**
 * Symbol set controls component
 * Handles symbol preset selection and custom symbol input
 */

import { symbolPresets, type SymbolPresetKey } from '@/utils/constants';

interface SymbolControlsProps {
  /** Current symbol set string */
  symbolSet: string;
  /** Callback when symbol set changes */
  onSymbolSetChange: (symbolSet: string) => void;
}

/**
 * Controls for selecting and customizing symbol sets
 */
export function SymbolControls({ symbolSet, onSymbolSetChange }: SymbolControlsProps) {
  // Find current preset or default to Custom
  const currentPreset = Object.keys(symbolPresets).find(
    key => symbolPresets[key as SymbolPresetKey] === symbolSet
  ) || 'Custom';

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = e.target.value as SymbolPresetKey;
    onSymbolSetChange(symbolPresets[preset] || symbolSet);
  };

  return (
    <>
      {/* Symbol Preset */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Symbol Set
        </label>
        <select
          value={currentPreset}
          onChange={handlePresetChange}
          className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.keys(symbolPresets).map(preset => (
            <option key={preset} value={preset}>{preset}</option>
          ))}
        </select>
      </div>

      {/* Custom Symbols */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Custom Symbols
        </label>
        <input
          type="text"
          value={symbolSet}
          onChange={(e) => onSymbolSetChange(e.target.value || '01')}
          className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter symbols..."
        />
      </div>
    </>
  );
}

