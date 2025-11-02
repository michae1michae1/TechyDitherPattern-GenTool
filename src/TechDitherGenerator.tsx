import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Play, Pause, Download, RefreshCw, ChevronLeft, ChevronRight, Upload, X } from 'lucide-react';
import { RxDragHandleDots2 } from 'react-icons/rx';
import { Eye, EyeOff, Plus, Trash2, ChevronDown, ChevronRight as ChevronRightIcon } from 'lucide-react';

interface Drop {
  x: number;
  y: number;
  speed: number;
  length: number;
}

interface RandomSeed {
  r1: number;
  r2: number;
  r3: number;
}

interface LayerConfig {
  symbolSet: string;
  density: number;
  cellSize: number;
  color: string;
  bgColor: string;
  animationSpeed: number;
  pattern: string;
  gradient: boolean;
  glowEffect: boolean;
  shapeInfluence: number;
  gradientStrength: number;
  glowIntensity: number;
  glowRadius: number;
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  config: LayerConfig;
  shapeImage: HTMLImageElement | null;
  shapeData: number[][] | null;
}

const DitheredPatternGenerator = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const dropsRef = useRef<Drop[]>([]);
  const randomSeedRef = useRef<RandomSeed[]>([]);
  const frameCounterRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  
  // Helper function to create a default layer config
  const createDefaultLayerConfig = (): LayerConfig => ({
    symbolSet: '01',
    density: 0.7,
    cellSize: 12,
    color: '#00ff9f',
    bgColor: '#0a0e27',
    animationSpeed: 50,
    pattern: 'rain',
    gradient: true,
    glowEffect: true,
    shapeInfluence: 0.8,
    gradientStrength: 0.8,
    glowIntensity: 10,
    glowRadius: 10
  });

  // Initialize with one default layer
  const [layers, setLayers] = useState<Layer[]>([{
    id: 'layer-1',
    name: 'Layer 1',
    visible: true,
    opacity: 1,
    config: createDefaultLayerConfig(),
    shapeImage: null,
    shapeData: null
  }]);

  const [activeLayerId, setActiveLayerId] = useState<string>('layer-1');
  const [expandedLayerIds, setExpandedLayerIds] = useState<Set<string>>(new Set(['layer-1']));
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);
  
  // Get active layer (for convenience)
  const activeLayer = layers.find(l => l.id === activeLayerId) || layers[0];
  const config = activeLayer.config;
  
  const [debouncedCellSize, setDebouncedCellSize] = useState(config.cellSize);
  
  const [isAnimating, setIsAnimating] = useState(false); // Start paused
  const [currentFrame, setCurrentFrame] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const symbolPresets = {
    'Binary': '01',
    'Matrix': '01ｦｱｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ',
    'Tech': '▀▁▂▃▄▅▆▇█▉▊▋▌▍▎▏▐░▒▓■□',
    'Dots': '.:;+=xX$&#@',
    'Arrows': '↑↓←→↖↗↘↙⇄⇅⇆⇇⇈⇉⇊',
    'Geometric': '◢◣◤◥●○◐◑◒◓◔◕',
    'Lines': '─│┌┐└┘├┤┬┴┼═║╔╗╚╝╠╣╦╩╬',
    'Custom': config.symbolSet
  };

  const patternTypes = ['rain', 'wave', 'static', 'glitch', 'pulse'];

  // Memoize symbols array
  const symbols = useMemo(() => config.symbolSet.split(''), [config.symbolSet]);

  // Layer management functions
  const updateActiveLayerConfig = (configUpdate: Partial<LayerConfig>) => {
    setLayers(layers.map(layer => 
      layer.id === activeLayerId 
        ? { ...layer, config: { ...layer.config, ...configUpdate } }
        : layer
    ));
  };

  const updateLayerProperty = (layerId: string, updates: Partial<Layer>) => {
    setLayers(layers.map(layer =>
      layer.id === layerId ? { ...layer, ...updates } : layer
    ));
  };

  const addLayer = () => {
    if (layers.length >= 3) return;
    const newId = `layer-${Date.now()}`;
    const newLayer: Layer = {
      id: newId,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      opacity: 1,
      config: createDefaultLayerConfig(),
      shapeImage: null,
      shapeData: null
    };
    setLayers([...layers, newLayer]);
    setActiveLayerId(newId);
    setExpandedLayerIds(new Set([...expandedLayerIds, newId]));
  };

  const removeLayer = (layerId: string) => {
    if (layers.length === 1) return; // Keep at least one layer
    const newLayers = layers.filter(l => l.id !== layerId);
    setLayers(newLayers);
    if (activeLayerId === layerId) {
      setActiveLayerId(newLayers[0].id);
    }
    const newExpanded = new Set(expandedLayerIds);
    newExpanded.delete(layerId);
    setExpandedLayerIds(newExpanded);
  };

  const toggleLayerExpand = (layerId: string) => {
    const newExpanded = new Set(expandedLayerIds);
    if (newExpanded.has(layerId)) {
      newExpanded.delete(layerId);
    } else {
      newExpanded.add(layerId);
    }
    setExpandedLayerIds(newExpanded);
  };

  const reorderLayers = (fromIndex: number, toIndex: number) => {
    const newLayers = [...layers];
    const [removed] = newLayers.splice(fromIndex, 1);
    newLayers.splice(toIndex, 0, removed);
    setLayers(newLayers);
  };

  // Load and process uploaded image for active layer
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, layerId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        processShapeImage(img, layerId);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const processShapeImage = (img: HTMLImageElement, layerId: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const maxSize = 200;
    const scale = Math.min(maxSize / img.width, maxSize / img.height);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    const brightnessMap = [];
    for (let y = 0; y < canvas.height; y++) {
      const row = [];
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const a = imageData.data[i + 3];
        const brightness = a === 0 ? 0 : (r + g + b) / 3 / 255;
        row.push(brightness);
      }
      brightnessMap.push(row);
    }
    
    updateLayerProperty(layerId, { shapeImage: img, shapeData: brightnessMap });
  };

  const clearShape = (layerId: string) => {
    updateLayerProperty(layerId, { shapeImage: null, shapeData: null });
  };

  const stepFrame = (direction: number) => {
    frameCounterRef.current += direction;
    setCurrentFrame(frameCounterRef.current);
    renderFrame(frameCounterRef.current);
  };

  // Debounce cellSize changes to avoid expensive re-initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCellSize(config.cellSize);
    }, 150);
    
    return () => clearTimeout(timer);
  }, [config.cellSize]);

  // Initialize canvas size and drops
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    
    canvas.width = width;
    canvas.height = height;
    
    setCanvasSize({ width, height });

    const cols = Math.floor(width / debouncedCellSize);
    const rows = Math.floor(height / debouncedCellSize);

    // Initialize drops
    dropsRef.current = [];
    for (let i = 0; i < cols; i++) {
      dropsRef.current.push({
        x: i,
        y: Math.random() * rows,
        speed: 0.5 + Math.random() * 1.5,
        length: 10 + Math.random() * 20
      });
    }

    // Pre-generate random seeds for consistent random values
    randomSeedRef.current = [];
    for (let i = 0; i < cols * rows; i++) {
      randomSeedRef.current.push({
        r1: Math.random(),
        r2: Math.random(),
        r3: Math.random()
      });
    }
  }, [debouncedCellSize]);

  // Memoized shape brightness lookup with cached offset calculation (per layer)
  const getShapeBrightnessForLayer = useCallback((x: number, y: number, cols: number, rows: number, layer: Layer) => {
    if (!layer.shapeData) return 1;
    
    const shapeWidth = layer.shapeData[0].length;
    const shapeHeight = layer.shapeData.length;
    
    const offsetX = Math.floor((cols - shapeWidth) / 2);
    const offsetY = Math.floor((rows - shapeHeight) / 2);
    
    const shapeX = x - offsetX;
    const shapeY = y - offsetY;
    
    if (shapeX < 0 || shapeX >= shapeWidth || shapeY < 0 || shapeY >= shapeHeight) {
      return 1 - layer.config.shapeInfluence;
    }
    
    const brightness = layer.shapeData[shapeY][shapeX];
    return brightness * layer.config.shapeInfluence + (1 - layer.config.shapeInfluence);
  }, []);

  // Helper function to render a single layer to a canvas
  const renderLayerToCanvas = useCallback((layer: Layer, canvas: HTMLCanvasElement, frame: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvasSize;
    if (width === 0 || height === 0) return;

    const layerConfig = layer.config;
    const layerSymbols = layerConfig.symbolSet.split('');
    
    const cols = Math.floor(width / layerConfig.cellSize);
    const rows = Math.floor(height / layerConfig.cellSize);
    const cellSize = layerConfig.cellSize;
    const halfCell = Math.floor(cellSize / 2);

    // Clear with transparent background (layers composite)
    ctx.clearRect(0, 0, width, height);

    ctx.font = `${cellSize - 2}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Pre-calculate hex color base for performance
    const colorBase = layerConfig.color;

    // Batch shadow blur changes
    let currentShadowBlur = -1;
    
    // Set glow color once if enabled
    if (layerConfig.glowEffect) {
      ctx.shadowColor = layerConfig.color;
    }

    if (layerConfig.pattern === 'rain') {
      dropsRef.current.forEach((drop) => {
        const dropX = drop.x;
        for (let j = 0; j < drop.length; j++) {
          const y = drop.y - j;
          if (y < 0 || y >= rows) continue;

          const yInt = Math.floor(y);
          const shapeBrightness = getShapeBrightnessForLayer(dropX, yInt, cols, rows, layer);
          const alpha = (1 - (j / drop.length)) * shapeBrightness;
          const brightness = layerConfig.gradient ? alpha * layerConfig.gradientStrength + (1 - layerConfig.gradientStrength) : shapeBrightness;
          
          if (brightness > 0.1) {
            const brightnessHex = Math.floor(brightness * 255).toString(16).padStart(2, '0');
            ctx.fillStyle = colorBase + brightnessHex;
            
            const targetBlur = layerConfig.glowEffect ? Math.floor(layerConfig.glowIntensity * brightness * (layerConfig.glowRadius / 10)) : 0;
            if (currentShadowBlur !== targetBlur) {
              ctx.shadowBlur = targetBlur;
              currentShadowBlur = targetBlur;
            }

            const seedIndex = (dropX + yInt) % randomSeedRef.current.length;
            const symbolIndex = Math.floor(randomSeedRef.current[seedIndex].r1 * layerSymbols.length);
            
            ctx.fillText(
              layerSymbols[symbolIndex],
              dropX * cellSize + halfCell,
              yInt * cellSize + halfCell
            );
          }
        }
      });
    } else if (layerConfig.pattern === 'wave') {
      for (let i = 0; i < cols; i++) {
        const iCellPos = i * cellSize + halfCell;
        for (let j = 0; j < rows; j++) {
          const wave = Math.sin((i + frame * 0.1) * 0.3) * Math.cos((j + frame * 0.1) * 0.3);
          const waveAlpha = (wave + 1) / 2;
          const shapeBrightness = getShapeBrightnessForLayer(i, j, cols, rows, layer);
          const alpha = waveAlpha * shapeBrightness;
          
          const seedIndex = (i * rows + j) % randomSeedRef.current.length;
          
          if (randomSeedRef.current[seedIndex].r1 < layerConfig.density * alpha) {
            const brightness = layerConfig.gradient ? alpha * layerConfig.gradientStrength + (1 - layerConfig.gradientStrength) * shapeBrightness : shapeBrightness;
            const brightnessHex = Math.floor(brightness * 255).toString(16).padStart(2, '0');
            ctx.fillStyle = colorBase + brightnessHex;
            
            const targetBlur = layerConfig.glowEffect ? Math.floor(layerConfig.glowIntensity * brightness * (layerConfig.glowRadius / 10)) : 0;
            if (currentShadowBlur !== targetBlur) {
              ctx.shadowBlur = targetBlur;
              currentShadowBlur = targetBlur;
            }

            const symbolIndex = Math.floor(randomSeedRef.current[seedIndex].r2 * layerSymbols.length);
            ctx.fillText(
              layerSymbols[symbolIndex],
              iCellPos,
              j * cellSize + halfCell
            );
          }
        }
      }
    } else if (layerConfig.pattern === 'static') {
      const frameOffset = (frame * 17) % randomSeedRef.current.length;
      
      for (let i = 0; i < cols; i++) {
        const iCellPos = i * cellSize + halfCell;
        for (let j = 0; j < rows; j++) {
          const shapeBrightness = getShapeBrightnessForLayer(i, j, cols, rows, layer);
          const baseSeedIndex = (i * rows + j) % randomSeedRef.current.length;
          const seedIndex = (baseSeedIndex + frameOffset) % randomSeedRef.current.length;
          
          if (randomSeedRef.current[seedIndex].r1 < layerConfig.density * shapeBrightness) {
            const brightness = layerConfig.gradient ? randomSeedRef.current[seedIndex].r2 * shapeBrightness * layerConfig.gradientStrength + (1 - layerConfig.gradientStrength) * shapeBrightness : shapeBrightness;
            const brightnessHex = Math.floor(brightness * 255).toString(16).padStart(2, '0');
            ctx.fillStyle = colorBase + brightnessHex;
            
            const targetBlur = layerConfig.glowEffect ? Math.floor(layerConfig.glowIntensity * brightness * (layerConfig.glowRadius / 10)) : 0;
            if (currentShadowBlur !== targetBlur) {
              ctx.shadowBlur = targetBlur;
              currentShadowBlur = targetBlur;
            }

            const symbolIndex = Math.floor(randomSeedRef.current[seedIndex].r3 * layerSymbols.length);
            ctx.fillText(
              layerSymbols[symbolIndex],
              iCellPos,
              j * cellSize + halfCell
            );
          }
        }
      }
    } else if (layerConfig.pattern === 'glitch') {
      const glitchCycle = frame % 80;
      const isGlitching = glitchCycle < 5 || (glitchCycle > 30 && glitchCycle < 35);
      const glitchIntensity = isGlitching ? (Math.sin(frame * 0.5) + 1) / 2 : 0;
      
      for (let i = 0; i < cols; i++) {
        const iCellPos = i * cellSize + halfCell;
        for (let j = 0; j < rows; j++) {
          const shapeBrightness = getShapeBrightnessForLayer(i, j, cols, rows, layer);
          const seedIndex = (i * rows + j) % randomSeedRef.current.length;
          
          let offsetX = 0;
          let offsetY = 0;
          if (isGlitching) {
            const glitchSeedIndex = (seedIndex + frame) % randomSeedRef.current.length;
            const shouldGlitch = randomSeedRef.current[glitchSeedIndex].r1 < 0.15;
            if (shouldGlitch) {
              offsetX = (randomSeedRef.current[glitchSeedIndex].r2 - 0.5) * 30 * glitchIntensity;
              offsetY = (randomSeedRef.current[glitchSeedIndex].r3 - 0.5) * 10 * glitchIntensity;
            }
          }
          
          if (randomSeedRef.current[seedIndex].r2 < layerConfig.density * shapeBrightness) {
            const brightness = layerConfig.gradient ? (0.5 + randomSeedRef.current[seedIndex].r3 * 0.5) * shapeBrightness * layerConfig.gradientStrength + (1 - layerConfig.gradientStrength) * shapeBrightness : shapeBrightness;
            const brightnessHex = Math.floor(brightness * 255).toString(16).padStart(2, '0');
            ctx.fillStyle = colorBase + brightnessHex;
            
            const targetBlur = layerConfig.glowEffect ? Math.floor(layerConfig.glowIntensity * brightness * (layerConfig.glowRadius / 10)) : 0;
            if (currentShadowBlur !== targetBlur) {
              ctx.shadowBlur = targetBlur;
              currentShadowBlur = targetBlur;
            }

            const symbolIndex = Math.floor(randomSeedRef.current[seedIndex].r1 * layerSymbols.length);
            ctx.fillText(
              layerSymbols[symbolIndex],
              iCellPos + offsetX,
              j * cellSize + halfCell + offsetY
            );
          }
        }
      }
    } else if (layerConfig.pattern === 'pulse') {
      const pulse = (Math.sin(frame * 0.05) + 1) / 2;
      const centerX = cols / 2;
      const centerY = rows / 2;
      const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
      
      for (let i = 0; i < cols; i++) {
        const dx = i - centerX;
        const iCellPos = i * cellSize + halfCell;
        for (let j = 0; j < rows; j++) {
          const shapeBrightness = getShapeBrightnessForLayer(i, j, cols, rows, layer);
          const dy = j - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const normalizedDist = dist / maxDist;
          
          const seedIndex = (i * rows + j) % randomSeedRef.current.length;
          
          if (randomSeedRef.current[seedIndex].r1 < layerConfig.density * (1 - normalizedDist) * pulse * shapeBrightness) {
            const brightness = layerConfig.gradient ? (1 - normalizedDist) * pulse * shapeBrightness * layerConfig.gradientStrength + (1 - layerConfig.gradientStrength) * shapeBrightness : shapeBrightness;
            const brightnessHex = Math.floor(brightness * 255).toString(16).padStart(2, '0');
            ctx.fillStyle = colorBase + brightnessHex;
            
            const targetBlur = layerConfig.glowEffect ? Math.floor(layerConfig.glowIntensity * brightness * (layerConfig.glowRadius / 10)) : 0;
            if (currentShadowBlur !== targetBlur) {
              ctx.shadowBlur = targetBlur;
              currentShadowBlur = targetBlur;
            }

            const symbolIndex = Math.floor(randomSeedRef.current[seedIndex].r2 * layerSymbols.length);
            ctx.fillText(
              layerSymbols[symbolIndex],
              iCellPos,
              j * cellSize + halfCell
            );
          }
        }
      }
    }
  }, [canvasSize, getShapeBrightnessForLayer]);

  // Main render function - composites all visible layers
  const renderFrame = useCallback((frame: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvasSize;
    if (width === 0 || height === 0) return;

    // Clear main canvas with the bottom layer's background color (or default)
    const bottomLayer = layers[0];
    ctx.fillStyle = bottomLayer?.config.bgColor || '#0a0e27';
    ctx.fillRect(0, 0, width, height);

    // Create offscreen canvases for each visible layer and composite them
    const visibleLayers = layers.filter(layer => layer.visible);
    
    visibleLayers.forEach((layer) => {
      // Create an offscreen canvas for this layer
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = width;
      offscreenCanvas.height = height;
      
      // Render layer to offscreen canvas
      renderLayerToCanvas(layer, offscreenCanvas, frame);
      
      // Composite onto main canvas with layer opacity
      ctx.globalAlpha = layer.opacity;
      ctx.drawImage(offscreenCanvas, 0, 0);
      ctx.globalAlpha = 1; // Reset
    });

    // Update drops for rain animation (shared across layers)
    dropsRef.current.forEach((drop) => {
      const cols = Math.floor(width / config.cellSize);
      const rows = Math.floor(height / config.cellSize);
      
      drop.y += drop.speed * 0.3;
      if (drop.y > rows + drop.length) {
        drop.y = -drop.length;
        drop.speed = 0.5 + Math.random() * 1.5;
      }
    });
  }, [canvasSize, layers, renderLayerToCanvas, config.cellSize]);

  // Animation loop
  useEffect(() => {
    if (!isAnimating) {
      renderFrame(frameCounterRef.current);
      return;
    }

    let isActive = true;
    lastFrameTimeRef.current = performance.now();

    const animate = (timestamp: number) => {
      if (!isActive) return;

      const elapsed = timestamp - lastFrameTimeRef.current;

      if (elapsed >= config.animationSpeed) {
        frameCounterRef.current++;
        renderFrame(frameCounterRef.current);
        
        // Update display frame counter every 10 frames to reduce re-renders
        if (frameCounterRef.current % 10 === 0) {
          setCurrentFrame(frameCounterRef.current);
        }
        
        lastFrameTimeRef.current = timestamp;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      isActive = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, config.animationSpeed, renderFrame]);

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'dithered-pattern.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const randomize = () => {
    const presetKeys = Object.keys(symbolPresets).filter(k => k !== 'Custom');
    const randomPreset = presetKeys[Math.floor(Math.random() * presetKeys.length)];
    const randomPattern = patternTypes[Math.floor(Math.random() * patternTypes.length)];
    
    type PresetKey = keyof typeof symbolPresets;
    
    updateActiveLayerConfig({
      symbolSet: symbolPresets[randomPreset as PresetKey],
      density: 0.3 + Math.random() * 0.6,
      pattern: randomPattern,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      gradient: Math.random() > 0.3,
      glowEffect: Math.random() > 0.3
    });
  };

  return (
    <div className="w-full h-screen bg-gray-900 flex">
      {/* Canvas */}
      <div className="flex-1 relative">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full"
          style={{ imageRendering: 'pixelated' }}
        />
        
        {/* Shape Preview */}
        {activeLayer.shapeImage && (
          <div className="absolute top-6 left-6 bg-gray-800 p-3 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white text-sm font-medium">Shape Guide</span>
              <button
                onClick={() => clearShape(activeLayerId)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <img 
              src={activeLayer.shapeImage.src} 
              alt="Shape guide" 
              className="w-24 h-24 object-contain bg-gray-700 rounded"
            />
          </div>
        )}
        
        {/* Floating Controls */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3">
          <button
            onClick={() => stepFrame(-1)}
            disabled={isAnimating}
            className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={toggleAnimation}
            className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg shadow-lg transition-colors"
          >
            {isAnimating ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            onClick={() => stepFrame(1)}
            disabled={isAnimating}
            className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
          <button
            onClick={() => fileInputRefs.current[activeLayerId]?.click()}
            className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg shadow-lg transition-colors"
          >
            <Upload size={20} />
          </button>
          <button
            onClick={downloadImage}
            className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg shadow-lg transition-colors"
          >
            <Download size={20} />
          </button>
          <button
            onClick={randomize}
            className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg shadow-lg transition-colors"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        <input
          ref={(el) => { fileInputRefs.current[activeLayerId] = el; }}
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, activeLayerId)}
          className="hidden"
        />
      </div>

      {/* Control Panel */}
      <div className="w-80 bg-gray-800 p-6 overflow-y-auto space-y-6">
        <h2 className="text-xl font-bold text-white mb-4">Pattern Controls</h2>

        {/* Layers Section */}
        <div className="bg-gray-700 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">Layers</h3>
            <button
              onClick={addLayer}
              disabled={layers.length >= 3}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
            >
              <Plus size={16} />
              Add
            </button>
          </div>

          {layers.map((layer, index) => (
            <div
              key={layer.id}
              className={`bg-gray-800 rounded p-3 border-2 transition-colors ${
                layer.id === activeLayerId ? 'border-blue-500' : 'border-transparent'
              }`}
              draggable
              onDragStart={() => setDraggedLayerId(layer.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggedLayerId) {
                  const fromIndex = layers.findIndex(l => l.id === draggedLayerId);
                  reorderLayers(fromIndex, index);
                }
              }}
              onDragEnd={() => setDraggedLayerId(null)}
            >
              <div className="flex items-center gap-2">
                <button className="cursor-move text-gray-400 hover:text-white">
                  <RxDragHandleDots2 size={20} />
                </button>

                <button
                  onClick={() => updateLayerProperty(layer.id, { visible: !layer.visible })}
                  className="text-gray-300 hover:text-white"
                >
                  {layer.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>

                <button
                  onClick={() => {
                    setActiveLayerId(layer.id);
                    toggleLayerExpand(layer.id);
                  }}
                  className="flex-1 text-left text-white font-medium text-sm flex items-center gap-2"
                >
                  {expandedLayerIds.has(layer.id) ? <ChevronDown size={16} /> : <ChevronRightIcon size={16} />}
                  <input
                    type="text"
                    value={layer.name}
                    onChange={(e) => updateLayerProperty(layer.id, { name: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-transparent border-none outline-none"
                  />
                </button>

                {layers.length > 1 && (
                  <button
                    onClick={() => removeLayer(layer.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {/* Layer Opacity */}
              <div className="mt-2 ml-7">
                <label className="text-xs text-gray-400">
                  Opacity: {Math.round(layer.opacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={layer.opacity}
                  onChange={(e) => updateLayerProperty(layer.id, { opacity: parseFloat(e.target.value) })}
                  className="w-full h-1"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Active Layer Settings</h3>
        </div>

        {/* Frame Info */}
        <div className="bg-gray-700 p-3 rounded">
          <div className="text-sm text-gray-300">
            Frame: <span className="text-white font-mono">{currentFrame}</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {isAnimating ? 'Playing' : 'Paused - use arrows to step'}
          </div>
        </div>

        {/* Symbol Preset */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Symbol Set
          </label>
          <select
            value={Object.keys(symbolPresets).find(key => symbolPresets[key as keyof typeof symbolPresets] === config.symbolSet) || 'Custom'}
            onChange={(e) => {
              type PresetKey = keyof typeof symbolPresets;
              updateActiveLayerConfig({ symbolSet: symbolPresets[e.target.value as PresetKey] || config.symbolSet });
            }}
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
            value={config.symbolSet}
            onChange={(e) => updateActiveLayerConfig({ symbolSet: e.target.value || '01' })}
            className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter symbols..."
          />
        </div>

        {/* Pattern Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Pattern Type
          </label>
          <select
            value={config.pattern}
            onChange={(e) => updateActiveLayerConfig({ pattern: e.target.value })}
            className="w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {patternTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Shape Influence */}
        {activeLayer.shapeData && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Shape Influence: {config.shapeInfluence.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.shapeInfluence}
              onChange={(e) => updateActiveLayerConfig({ shapeInfluence: parseFloat(e.target.value) })}
              className="w-full"
            />
            <p className="text-xs text-gray-400 mt-1">
              Higher = pattern follows shape more closely
            </p>
          </div>
        )}

        {/* Density */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Density: {config.density.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={config.density}
              onChange={(e) => updateActiveLayerConfig({ density: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Cell Size */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Cell Size: {config.cellSize}px
          </label>
          <input
            type="range"
            min="6"
            max="24"
            step="2"
            value={config.cellSize}
            onChange={(e) => updateActiveLayerConfig({ cellSize: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Animation Speed */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Speed: {config.animationSpeed}ms
          </label>
          <input
            type="range"
            min="10"
            max="200"
            step="10"
            value={config.animationSpeed}
            onChange={(e) => updateActiveLayerConfig({ animationSpeed: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Color
          </label>
          <input
            type="color"
            value={config.color}
            onChange={(e) => updateActiveLayerConfig({ color: e.target.value })}
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
            value={config.bgColor}
            onChange={(e) => updateActiveLayerConfig({ bgColor: e.target.value })}
            className="w-full h-10 rounded cursor-pointer"
          />
        </div>

        {/* Gradient Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={config.gradient}
            onChange={(e) => updateActiveLayerConfig({ gradient: e.target.checked })}
            className="w-4 h-4 mr-2"
          />
          <label className="text-sm font-medium text-gray-300">
            Gradient Effect
          </label>
        </div>

        {/* Gradient Strength */}
        {config.gradient && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Gradient Strength: {config.gradientStrength.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.gradientStrength}
              onChange={(e) => updateActiveLayerConfig({ gradientStrength: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        )}

        {/* Glow Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={config.glowEffect}
            onChange={(e) => updateActiveLayerConfig({ glowEffect: e.target.checked })}
            className="w-4 h-4 mr-2"
          />
          <label className="text-sm font-medium text-gray-300">
            Glow Effect
          </label>
        </div>

        {/* Glow Intensity */}
        {config.glowEffect && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Glow Intensity: {config.glowIntensity}
              </label>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={config.glowIntensity}
                onChange={(e) => updateActiveLayerConfig({ glowIntensity: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Glow Radius: {config.glowRadius}
              </label>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={config.glowRadius}
                onChange={(e) => updateActiveLayerConfig({ glowRadius: parseInt(e.target.value) })}
                className="w-full"
              />
              <p className="text-xs text-gray-400 mt-1">
                Higher = more spread
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DitheredPatternGenerator;