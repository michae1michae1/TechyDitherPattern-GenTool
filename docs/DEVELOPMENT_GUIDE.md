# Development Guide

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Modern browser with HTML5 Canvas support
- Code editor (VS Code recommended)

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Runs on `http://localhost:3000` with hot reload

### Build for Production
```bash
npm run build
```
Outputs to `dist/` directory

### Preview Production Build
```bash
npm run preview
```

## Project Structure

### Path Aliases
The project uses TypeScript path aliases for clean imports:
```typescript
import { Layer } from '@/types';
import { useLayerManager } from '@/hooks';
import { symbolPresets } from '@/utils';
```

Configured in:
- `tsconfig.json` - TypeScript path mapping
- `vite.config.ts` - Vite resolver

### File Organization
```
src/
├── components/       # UI components
├── hooks/           # Custom React hooks
├── utils/           # Pure utility functions
└── types/           # TypeScript interfaces
```

## Adding New Features

### Adding a New Pattern Type

1. **Add to constants** (`src/utils/constants.ts`):
```typescript
export const patternTypes = [..., 'myNewPattern'] as const;
```

2. **Create render function** (`src/utils/renderPatterns.ts`):
```typescript
/**
 * Renders my new pattern - description
 */
export function renderMyNewPattern(params: RenderPatternParams): void {
  const { ctx, layer, cols, rows, cellSize, frame, randomSeeds } = params;
  
  // Your rendering logic here
  // Loop through grid, calculate positions, draw symbols
}
```

3. **Add to renderer** (`src/hooks/useCanvasRenderer.ts`):
```typescript
switch (layerConfig.pattern) {
  // ... existing cases
  case 'myNewPattern':
    renderMyNewPattern(renderParams);
    break;
}
```

### Adding a New Symbol Preset

**Update constants** (`src/utils/constants.ts`):
```typescript
export const symbolPresets = {
  // ... existing presets
  MyPreset: '⚡⚙⚗⚛',
} as const;
```

No other changes needed! The UI automatically picks up new presets.

### Adding a New Control

1. **Create component** (`src/components/ControlPanel/MyNewControl.tsx`):
```typescript
interface MyNewControlProps {
  value: number;
  onChange: (value: number) => void;
}

export function MyNewControl({ value, onChange }: MyNewControlProps) {
  return (
    <SliderControl
      label="My Setting"
      value={value}
      min={0}
      max={100}
      step={1}
      onChange={onChange}
    />
  );
}
```

2. **Add to LayerConfig type** (`src/types/index.ts`):
```typescript
export interface LayerConfig {
  // ... existing properties
  myNewSetting: number;
}
```

3. **Add to default config** (`src/utils/constants.ts`):
```typescript
export const DEFAULT_LAYER_CONFIG = {
  // ... existing properties
  myNewSetting: 50,
} as const;
```

4. **Use in ControlPanel** (`src/components/ControlPanel/ControlPanel.tsx`):
```typescript
import { MyNewControl } from './MyNewControl';

// In JSX:
<MyNewControl
  value={config.myNewSetting}
  onChange={(value) => onUpdateActiveLayerConfig({ myNewSetting: value })}
/>
```

5. **Export** (`src/components/ControlPanel/index.ts`):
```typescript
export * from './MyNewControl';
```

### Adding a New Hook

1. **Create hook file** (`src/hooks/useMyFeature.ts`):
```typescript
/**
 * Custom hook for my feature
 * 
 * @returns Feature interface
 * 
 * @example
 * ```tsx
 * const { data, doSomething } = useMyFeature();
 * ```
 */
export function useMyFeature() {
  const [data, setData] = useState(null);
  
  const doSomething = useCallback(() => {
    // Logic here
  }, []);
  
  return { data, doSomething };
}
```

2. **Export from barrel** (`src/hooks/index.ts`):
```typescript
export * from './useMyFeature';
```

3. **Use in component**:
```typescript
import { useMyFeature } from '@/hooks';

function MyComponent() {
  const { data, doSomething } = useMyFeature();
  // ...
}
```

## Coding Standards

### TypeScript
- Use explicit types for function parameters
- Avoid `any` - use `unknown` if needed
- Export interfaces from `@/types`
- Use `const` assertions for constants

### React Components
- Use function components with hooks
- Props interfaces above component
- JSDoc comments for exported components
- Destructure props in parameter

### Custom Hooks
- Name with `use` prefix
- Return objects, not arrays
- Document with JSDoc and examples
- Keep focused (single responsibility)

### Utilities
- Pure functions only
- No side effects
- Document parameters and return values
- Export named, not default

### File Naming
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utils: `camelCase.ts`
- Types: `index.ts` (barrel export)

## Best Practices

### Component Composition
```typescript
// ✅ Good: Compose from smaller components
<ControlPanel>
  <SymbolControls />
  <PatternControls />
</ControlPanel>

// ❌ Bad: Monolithic component with everything
<GiantComponent withEverything />
```

### Custom Hooks
```typescript
// ✅ Good: Encapsulate related logic
const { layers, addLayer, removeLayer } = useLayerManager();

// ❌ Bad: Spread state management across component
const [layers, setLayers] = useState([]);
const [activeId, setActiveId] = useState('');
// ... many more useState calls
```

### Props vs. State
```typescript
// ✅ Good: Derive from props
const displayValue = formatValue ? formatValue(value) : value;

// ❌ Bad: Duplicate in state
const [displayValue, setDisplayValue] = useState(value);
useEffect(() => setDisplayValue(formatValue(value)), [value]);
```

### Performance
```typescript
// ✅ Good: Memoize expensive calculations
const processedData = useMemo(() => heavyCalculation(data), [data]);

// ✅ Good: Useallback for event handlers
const handleClick = useCallback(() => doSomething(), [deps]);

// ❌ Bad: Create functions in render
<Button onClick={() => doSomething()} />
```

## Debugging

### React DevTools
- Install React DevTools browser extension
- Inspect component tree
- View props and state
- Trace re-renders

### Console Logging
```typescript
// In hooks
useEffect(() => {
  console.log('Layers updated:', layers);
}, [layers]);

// In render functions
const renderFrame = useCallback((frame: number) => {
  console.log('Rendering frame:', frame);
  // ...
}, []);
```

### Breakpoints
Set breakpoints in:
- Event handlers
- Hook functions
- Render functions
- Utility calculations

## Common Issues

### Path Aliases Not Resolving
- Check `tsconfig.json` paths configuration
- Check `vite.config.ts` alias resolver
- Restart dev server

### Canvas Not Rendering
- Check canvas ref is attached
- Verify canvas size is set
- Check context 2d is available
- Inspect layer visibility

### Performance Issues
- Check for unnecessary re-renders
- Verify memoization of expensive operations
- Profile with React DevTools Profiler
- Check animation frame rate

### State Not Updating
- Verify state setter is called
- Check dependencies in useEffect/useCallback
- Ensure not mutating state directly
- Use React DevTools to inspect state

## Contributing

### Code Review Checklist
- [ ] TypeScript types are correct
- [ ] Components have JSDoc comments
- [ ] No console.logs in production code
- [ ] Follows file naming conventions
- [ ] Uses path aliases (@/)
- [ ] Hooks follow React rules
- [ ] No linter errors
- [ ] Tested in development mode

### Git Workflow
1. Create feature branch
2. Make changes
3. Test locally
4. Commit with clear message
5. Push and create PR

### Commit Messages
```
feat: add pulse pattern type
fix: correct layer opacity calculation
docs: update architecture diagram
refactor: extract slider component
```

## Resources

### Documentation
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

### Internal Docs
- `ARCHITECTURE.md` - System design
- `COMPONENT_HIERARCHY.md` - Component tree
- `README.md` - Project overview

### Helpful Tools
- VS Code with TypeScript extension
- React Developer Tools
- Vite DevTools
- Chrome/Firefox DevTools

