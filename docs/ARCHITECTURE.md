# Architecture Documentation

## System Overview

The Dithered Pattern Generator is a React application that creates animated, customizable ASCII/symbol-based patterns with multi-layer composition support. The application follows modern React best practices with a clear separation of concerns.

## Core Principles

### 1. Separation of Concerns
- **UI Components**: Pure presentational components
- **Business Logic**: Encapsulated in custom hooks
- **Utilities**: Pure functions for calculations and rendering
- **Types**: Centralized TypeScript definitions

### 2. Component Composition
The application uses a compositional approach where complex components are built from smaller, focused components. This makes the codebase maintainable and testable.

### 3. Custom Hooks Pattern
State management and side effects are abstracted into custom hooks, keeping components clean and focused on presentation.

## Directory Structure

```
src/
├── components/          # UI Components
│   ├── DitherCanvas/   # Canvas and controls
│   ├── ControlPanel/   # Sidebar with settings
│   └── DitheredPatternGenerator.tsx  # Main orchestrator
├── hooks/              # Custom React hooks
│   ├── useCanvasAnimation.ts   # Animation loop
│   ├── useCanvasRenderer.ts    # Rendering logic
│   ├── useDrops.ts            # Rain drops state
│   ├── useImageUpload.ts      # Image processing
│   └── useLayerManager.ts     # Layer management
├── utils/              # Utility functions
│   ├── colorUtils.ts          # Color calculations
│   ├── constants.ts           # Presets and defaults
│   └── renderPatterns.ts      # Pattern rendering
└── types/              # TypeScript definitions
    └── index.ts               # All interfaces
```

## Data Flow

### 1. State Management
State is managed through custom hooks that encapsulate related logic:
- `useLayerManager`: Manages layer CRUD operations and active layer
- `useDrops`: Initializes and maintains rain drop positions
- `useCanvasAnimation`: Controls animation playback and frame stepping

### 2. Rendering Pipeline
```
DitheredPatternGenerator (orchestrator)
    ↓
useCanvasRenderer hook
    ↓
renderFrame() for each visible layer
    ↓
Pattern-specific render functions (rain, wave, static, glitch, pulse)
    ↓
Canvas composite with opacity
```

### 3. Event Flow
```
User Interaction (UI Component)
    ↓
Event Handler (in DitheredPatternGenerator)
    ↓
Hook Function Call (e.g., updateActiveLayerConfig)
    ↓
State Update
    ↓
Re-render
```

## Key Components

### DitheredPatternGenerator (Main Orchestrator)
- Composes all hooks and components
- Manages refs (canvas, file input)
- Coordinates data flow between subsystems
- ~150 lines of code

### ControlPanel
- Sidebar container
- Composes all control sections
- Passes callbacks from orchestrator to child components

### DitherCanvas
- Main canvas element
- Floating controls overlay
- Shape preview overlay

## Custom Hooks

### useLayerManager
**Purpose**: Manage layers array and operations
**Returns**: 
- `layers`: Array of all layers
- `activeLayer`: Currently selected layer
- `addLayer`, `removeLayer`: CRUD operations
- `updateActiveLayerConfig`: Update layer settings

### useCanvasAnimation
**Purpose**: Control animation playback
**Returns**:
- `isAnimating`: Play/pause state
- `currentFrame`: Current frame number
- `toggleAnimation`: Play/pause toggle
- `stepFrame`: Manual frame stepping

### useCanvasRenderer
**Purpose**: Render patterns to canvas
**Returns**:
- `renderFrame`: Function to render a single frame

### useDrops
**Purpose**: Initialize rain drops and random seeds
**Returns**:
- `dropsRef`: Mutable ref to drops array
- `randomSeedsRef`: Pre-generated random values

### useImageUpload
**Purpose**: Process uploaded images into brightness maps
**Returns**:
- `handleImageUpload`: Process image file

## Performance Optimizations

1. **Debounced Cell Size**: Cell size changes are debounced to avoid expensive re-initialization
2. **Pre-generated Random Seeds**: Random values pre-calculated to avoid Math.random() in render loop
3. **Shadow Blur Batching**: Canvas shadow blur only changed when value differs
4. **Frame Counter Optimization**: Display frame updated every 10 frames to reduce re-renders
5. **Offscreen Canvas Compositing**: Each layer rendered to offscreen canvas before compositing

## Extending the Application

### Adding a New Pattern Type
1. Add pattern name to `patternTypes` in `src/utils/constants.ts`
2. Create render function in `src/utils/renderPatterns.ts`
3. Add case to switch statement in `useCanvasRenderer.ts`

### Adding a New Control
1. Create control component in `src/components/ControlPanel/`
2. Add to `ControlPanel.tsx` composition
3. Export from `index.ts`

### Adding a New Hook
1. Create hook file in `src/hooks/`
2. Follow naming convention `useSomething.ts`
3. Add JSDoc comments with examples
4. Export from `src/hooks/index.ts`

