# Tech Dither Pattern Generator

A beautiful animated pattern generator built with React, featuring multiple animation patterns, custom symbols, and shape masking capabilities.

## Features

- 🎨 Multiple pattern types (Rain, Wave, Static, Glitch, Pulse)
- 🔤 Multiple symbol presets (Binary, Matrix, Tech, Dots, Arrows, Geometric, Lines)
- 🖼️ Upload images to create shape-based patterns
- 🎮 Frame-by-frame controls
- 🎨 Customizable colors, speed, and effects
- 💾 Download generated patterns as PNG
- ✨ Gradient and glow effects

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

1. **Pattern Type**: Choose from Rain, Wave, Static, Glitch, or Pulse patterns
2. **Symbol Set**: Select a preset symbol set or enter your own custom symbols
3. **Upload Image**: Click the upload button to add a shape guide
4. **Adjust Controls**: Fine-tune density, cell size, speed, colors, and effects
5. **Animation**: Use play/pause and step controls to navigate frames
6. **Download**: Save your creation as a PNG image
7. **Randomize**: Click the refresh icon to generate random settings

## Technologies

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (icons)
- Canvas API for rendering

## Project Structure

```
.
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── TechDitherGenerator.tsx
    └── index.css
```

## License

MIT

