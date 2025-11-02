# Tech Dither Pattern Generator

A beautiful animated pattern generator built with React, featuring multiple animation patterns, custom symbols, multi-layer composition, and shape masking capabilities.

## Features

- 🎨 Multiple pattern types (Rain, Wave, Static, Glitch, Pulse)
- 📚 **Multi-layer composition** (up to 3 layers with opacity control)
- 🔤 Multiple symbol presets (Binary, Matrix, Tech, Dots, Arrows, Geometric, Lines)
- 🖼️ Upload images to create shape-based patterns
- 🎮 Frame-by-frame controls
- 🎨 Customizable colors, speed, and effects per layer
- 💾 Download generated patterns as PNG
- ✨ Gradient and glow effects
- 🔄 Drag-and-drop layer reordering

## Quick Start

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

The app will open automatically at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

### Basic Controls
1. **Pattern Type**: Choose from Rain, Wave, Static, Glitch, or Pulse patterns
2. **Symbol Set**: Select a preset symbol set or enter your own custom symbols
3. **Upload Image**: Click the upload button to add a shape guide
4. **Adjust Controls**: Fine-tune density, cell size, speed, colors, and effects
5. **Animation**: Use play/pause and step controls to navigate frames
6. **Download**: Save your creation as a PNG image
7. **Randomize**: Click the refresh icon to generate random settings

### Layer Management
1. **Add Layer**: Click the "Add" button (max 3 layers)
2. **Reorder**: Drag layers to change their rendering order
3. **Toggle Visibility**: Click the eye icon to show/hide layers
4. **Adjust Opacity**: Expand a layer and use the opacity slider
5. **Delete**: Remove unwanted layers (must keep at least 1)

## Technologies

- React 18 with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Lucide React (icons)
- Canvas API (rendering)

## Project Structure

```
.
├── docs/                    # Documentation
│   ├── ARCHITECTURE.md     # System design and data flow
│   ├── COMPONENT_HIERARCHY.md  # Component tree
│   └── DEVELOPMENT_GUIDE.md    # How to extend
├── src/
│   ├── components/         # UI components
│   │   ├── ControlPanel/  # Sidebar controls
│   │   ├── DitherCanvas/  # Canvas and overlays
│   │   └── DitheredPatternGenerator.tsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useCanvasAnimation.ts
│   │   ├── useCanvasRenderer.ts
│   │   ├── useDrops.ts
│   │   ├── useImageUpload.ts
│   │   └── useLayerManager.ts
│   ├── utils/             # Utilities and helpers
│   │   ├── colorUtils.ts
│   │   ├── constants.ts
│   │   └── renderPatterns.ts
│   └── types/             # TypeScript definitions
│       └── index.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Architecture

This project follows React best practices with a clear separation of concerns:

- **Components**: Pure presentational components using composition
- **Hooks**: Business logic and state management encapsulated in custom hooks
- **Utils**: Pure functions for calculations and rendering
- **Types**: Centralized TypeScript interfaces

### Key Design Principles
1. **Component Composition**: Complex UI built from small, focused components
2. **Custom Hooks Pattern**: State and effects abstracted from presentation
3. **Path Aliases**: Clean imports using `@/components`, `@/hooks`, etc.
4. **Type Safety**: Full TypeScript coverage with strict mode

For detailed architecture information, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Documentation

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)**: System design, data flow, and core principles
- **[COMPONENT_HIERARCHY.md](docs/COMPONENT_HIERARCHY.md)**: Visual component tree and relationships
- **[DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md)**: How to add features and extend the app

## Contributing

Contributions are welcome! Please see [DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md) for:
- How to add new pattern types
- How to add new controls
- Coding standards and best practices
- Common issues and debugging tips

## License

MIT

