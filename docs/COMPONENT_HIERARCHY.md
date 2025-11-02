# Component Hierarchy

## Visual Component Tree

```
App
└── DitheredPatternGenerator (Main Orchestrator)
    ├── DitherCanvas
    │   ├── <canvas> (HTML5 Canvas Element)
    │   ├── ShapePreview (conditional)
    │   │   └── <img> (uploaded shape guide)
    │   └── CanvasControls
    │       ├── Step Backward Button
    │       ├── Play/Pause Button
    │       ├── Step Forward Button
    │       ├── Upload Button
    │       ├── Download Button
    │       └── Randomize Button
    │
    └── ControlPanel
        ├── LayersSection
        │   ├── Add Layer Button
        │   └── LayerItem (x1-3)
        │       ├── Drag Handle
        │       ├── Visibility Toggle
        │       ├── Layer Name Input
        │       ├── Delete Button
        │       └── Opacity Slider (when expanded)
        │
        ├── FrameInfo
        │   ├── Frame Number Display
        │   └── Status Text
        │
        ├── SymbolControls
        │   ├── Preset Selector
        │   └── Custom Symbol Input
        │
        ├── PatternControls
        │   ├── Pattern Type Selector
        │   └── Shape Influence Slider (conditional)
        │
        ├── AppearanceControls
        │   ├── Density Slider
        │   ├── Cell Size Slider
        │   ├── Color Picker
        │   └── Background Color Picker
        │
        ├── AnimationControls
        │   └── Speed Slider
        │
        └── EffectControls
            ├── Gradient Toggle
            ├── Gradient Strength Slider (conditional)
            ├── Glow Toggle
            ├── Glow Intensity Slider (conditional)
            └── Glow Radius Slider (conditional)
```

## Component Responsibilities

### Top Level
- **App**: Entry point, renders DitheredPatternGenerator
- **DitheredPatternGenerator**: Orchestrates all hooks and state, composes main layout

### Canvas Area
- **DitherCanvas**: Canvas container with overlays
  - Renders HTML5 canvas element
  - Manages canvas ref
  - Composes controls and shape preview
  
- **CanvasControls**: Floating button bar
  - Play/pause animation
  - Frame stepping (backward/forward)
  - Upload shape guide
  - Download canvas as PNG
  - Randomize settings

- **ShapePreview**: Shape guide overlay
  - Displays uploaded image thumbnail
  - Clear button to remove shape

### Control Panel Area
- **ControlPanel**: Sidebar container
  - Scrollable
  - Composes all control sections
  - Passes props from orchestrator

- **LayersSection**: Layer management
  - Lists all layers
  - Add layer button (max 3)
  - Drag-to-reorder functionality

- **LayerItem**: Individual layer row
  - Drag handle for reordering
  - Visibility toggle (eye icon)
  - Editable layer name
  - Delete button (min 1 layer)
  - Opacity slider (when expanded)
  - Active state highlighting

### Control Sections
- **FrameInfo**: Display only
  - Current frame number
  - Animation status (playing/paused)

- **SymbolControls**: Symbol set selection
  - Preset dropdown (Binary, Matrix, Tech, etc.)
  - Custom symbol text input

- **PatternControls**: Pattern configuration
  - Pattern type dropdown
  - Shape influence slider (when shape uploaded)

- **AppearanceControls**: Visual settings
  - Density slider (how many symbols)
  - Cell size slider (symbol size)
  - Foreground color picker
  - Background color picker

- **AnimationControls**: Timing
  - Animation speed slider (ms per frame)

- **EffectControls**: Visual effects
  - Gradient toggle and strength
  - Glow toggle, intensity, and radius

### Reusable Components
- **SliderControl**: Generic slider
  - Label
  - Current value display
  - Min/max/step configuration
  - Optional unit suffix
  - Optional description text

## Data Flow Through Components

### Downward (Props)
```
DitheredPatternGenerator
    ↓ (state from hooks)
ControlPanel / DitherCanvas
    ↓ (specific props)
Control Components
```

### Upward (Callbacks)
```
User Interaction
    ↓ (onChange, onClick, etc.)
Control Component
    ↓ (callback prop)
ControlPanel (pass-through)
    ↓ (callback prop)
DitheredPatternGenerator
    ↓ (hook function)
Hook (updates state)
```

## Component Composition Patterns

### Container/Presentational
- **Container**: DitheredPatternGenerator (manages state)
- **Presentational**: ControlPanel, DitherCanvas (receive props)

### Compound Components
- **Parent**: LayersSection
- **Children**: LayerItem (manages own drag state)

### Render Props
Not used - prefer composition and custom hooks

### Higher-Order Components
Not used - prefer custom hooks for logic reuse

## Component Communication

### Between Siblings
Siblings communicate through the parent orchestrator:
```
CanvasControls (upload button)
    ↓ onClick callback
DitheredPatternGenerator
    ↓ handleImageUpload
useImageUpload hook
    ↓ onComplete callback
updateLayerProperty
    ↓ state update
Canvas re-renders with new shape
```

### Prop Drilling
Kept minimal by:
1. Composition (ControlPanel composes sections)
2. Direct props to leaves (not deep chains)
3. No context needed at this scale

### Event Bubbling
Standard React event handling:
- Click events handled at component level
- onChange for inputs
- No custom event system

## Testing Considerations

### Unit Testing
- **Hooks**: Test in isolation with React Testing Library
- **Utils**: Pure functions, easy to test
- **Components**: Test rendering and callbacks

### Integration Testing
- Test hook + component combinations
- Test full data flow paths

### E2E Testing
- Test full user workflows
- Layer management, pattern changes, download

