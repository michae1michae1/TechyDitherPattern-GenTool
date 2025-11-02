import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Play, Pause, Download, RefreshCw, ChevronLeft, ChevronRight, Upload, X } from 'lucide-react';

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

const DitheredPatternGenerator = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropsRef = useRef<Drop[]>([]);
  const randomSeedRef = useRef<RandomSeed[]>([]);
  const frameCounterRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  
  const [config, setConfig] = useState({
    symbolSet: '01',
    density: 0.7,
    cellSize: 12,
    color: '#00ff9f',
    bgColor: '#0a0e27',
    animationSpeed: 50,
    pattern: 'rain',
    gradient: true,
    glowEffect: true,
    shapeInfluence: 0.8
  });
  
  const [debouncedCellSize, setDebouncedCellSize] = useState(config.cellSize);
  
  const [isAnimating, setIsAnimating] = useState(false); // Start paused
  const [currentFrame, setCurrentFrame] = useState(0);
  const [shapeImage, setShapeImage] = useState<HTMLImageElement | null>(null);
  const [shapeData, setShapeData] = useState<number[][] | null>(null);
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

  // Load and process uploaded image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setShapeImage(img);
        processShapeImage(img);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const processShapeImage = (img: HTMLImageElement) => {
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
    
    setShapeData(brightnessMap);
  };

  const clearShape = () => {
    setShapeImage(null);
    setShapeData(null);
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

  // Memoized shape brightness lookup with cached offset calculation
  const shapeBrightnessCache = useMemo(() => {
    if (!shapeData) return null;
    
    const shapeWidth = shapeData[0].length;
    const shapeHeight = shapeData.length;
    
    return {
      shapeWidth,
      shapeHeight,
      data: shapeData
    };
  }, [shapeData]);

  const getShapeBrightness = useCallback((x: number, y: number, cols: number, rows: number) => {
    if (!shapeBrightnessCache) return 1;
    
    const { shapeWidth, shapeHeight, data } = shapeBrightnessCache;
    
    const offsetX = Math.floor((cols - shapeWidth) / 2);
    const offsetY = Math.floor((rows - shapeHeight) / 2);
    
    const shapeX = x - offsetX;
    const shapeY = y - offsetY;
    
    if (shapeX < 0 || shapeX >= shapeWidth || shapeY < 0 || shapeY >= shapeHeight) {
      return 1 - config.shapeInfluence;
    }
    
    const brightness = data[shapeY][shapeX];
    return brightness * config.shapeInfluence + (1 - config.shapeInfluence);
  }, [shapeBrightnessCache, config.shapeInfluence]);

  // Main render function
  const renderFrame = useCallback((frame: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvasSize;
    
    if (width === 0 || height === 0) return;

    const cols = Math.floor(width / config.cellSize);
    const rows = Math.floor(height / config.cellSize);
    const cellSize = config.cellSize;
    const halfCell = Math.floor(cellSize / 2);

    // Clear with background
    ctx.fillStyle = config.bgColor;
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${cellSize - 2}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Pre-calculate hex color base for performance
    const colorBase = config.color;

    // Batch shadow blur changes and reduce context state changes
    let currentShadowBlur = -1;
    
    // Set glow color once if enabled
    if (config.glowEffect) {
      ctx.shadowColor = config.color;
    }

    if (config.pattern === 'rain') {
      dropsRef.current.forEach((drop) => {
        const dropX = drop.x;
        for (let j = 0; j < drop.length; j++) {
          const y = drop.y - j;
          if (y < 0 || y >= rows) continue;

          const yInt = Math.floor(y);
          const shapeBrightness = getShapeBrightness(dropX, yInt, cols, rows);
          const alpha = (1 - (j / drop.length)) * shapeBrightness;
          const brightness = config.gradient ? alpha : shapeBrightness;
          
          if (brightness > 0.1) {
            const brightnessHex = Math.floor(brightness * 255).toString(16).padStart(2, '0');
            ctx.fillStyle = colorBase + brightnessHex;
            
            const targetBlur = config.glowEffect ? Math.floor(10 * brightness) : 0;
            if (currentShadowBlur !== targetBlur) {
              ctx.shadowBlur = targetBlur;
              currentShadowBlur = targetBlur;
            }

            const seedIndex = (dropX + yInt) % randomSeedRef.current.length;
            const symbolIndex = Math.floor(randomSeedRef.current[seedIndex].r1 * symbols.length);
            
            ctx.fillText(
              symbols[symbolIndex],
              dropX * cellSize + halfCell,
              yInt * cellSize + halfCell
            );
          }
        }

        drop.y += drop.speed * 0.3;
        if (drop.y > rows + drop.length) {
          drop.y = -drop.length;
          drop.speed = 0.5 + Math.random() * 1.5;
        }
      });
    } else if (config.pattern === 'wave') {
      for (let i = 0; i < cols; i++) {
        const iCellPos = i * cellSize + halfCell;
        for (let j = 0; j < rows; j++) {
          const wave = Math.sin((i + frame * 0.1) * 0.3) * Math.cos((j + frame * 0.1) * 0.3);
          const waveAlpha = (wave + 1) / 2;
          const shapeBrightness = getShapeBrightness(i, j, cols, rows);
          const alpha = waveAlpha * shapeBrightness;
          
          const seedIndex = (i * rows + j) % randomSeedRef.current.length;
          
          if (randomSeedRef.current[seedIndex].r1 < config.density * alpha) {
            const brightness = config.gradient ? alpha : shapeBrightness;
            const brightnessHex = Math.floor(brightness * 255).toString(16).padStart(2, '0');
            ctx.fillStyle = colorBase + brightnessHex;
            
            const targetBlur = config.glowEffect ? Math.floor(8 * brightness) : 0;
            if (currentShadowBlur !== targetBlur) {
              ctx.shadowBlur = targetBlur;
              currentShadowBlur = targetBlur;
            }

            const symbolIndex = Math.floor(randomSeedRef.current[seedIndex].r2 * symbols.length);
            ctx.fillText(
              symbols[symbolIndex],
              iCellPos,
              j * cellSize + halfCell
            );
          }
        }
      }
    } else if (config.pattern === 'static') {
      // True TV static - rapidly changing random noise
      const frameOffset = (frame * 17) % randomSeedRef.current.length; // Use prime number for better distribution
      
      for (let i = 0; i < cols; i++) {
        const iCellPos = i * cellSize + halfCell;
        for (let j = 0; j < rows; j++) {
          const shapeBrightness = getShapeBrightness(i, j, cols, rows);
          // Use frame offset to get different random values each frame for static effect
          const baseSeedIndex = (i * rows + j) % randomSeedRef.current.length;
          const seedIndex = (baseSeedIndex + frameOffset) % randomSeedRef.current.length;
          
          if (randomSeedRef.current[seedIndex].r1 < config.density * shapeBrightness) {
            const brightness = config.gradient ? randomSeedRef.current[seedIndex].r2 * shapeBrightness : shapeBrightness;
            const brightnessHex = Math.floor(brightness * 255).toString(16).padStart(2, '0');
            ctx.fillStyle = colorBase + brightnessHex;
            
            const targetBlur = config.glowEffect ? Math.floor(6 * brightness) : 0;
            if (currentShadowBlur !== targetBlur) {
              ctx.shadowBlur = targetBlur;
              currentShadowBlur = targetBlur;
            }

            const symbolIndex = Math.floor(randomSeedRef.current[seedIndex].r3 * symbols.length);
            ctx.fillText(
              symbols[symbolIndex],
              iCellPos,
              j * cellSize + halfCell
            );
          }
        }
      }
    } else if (config.pattern === 'glitch') {
      // Glitch effect - mostly stable with occasional distortions
      // Glitch triggers in bursts every 30-80 frames
      const glitchCycle = frame % 80;
      const isGlitching = glitchCycle < 5 || (glitchCycle > 30 && glitchCycle < 35);
      const glitchIntensity = isGlitching ? (Math.sin(frame * 0.5) + 1) / 2 : 0;
      
      for (let i = 0; i < cols; i++) {
        const iCellPos = i * cellSize + halfCell;
        for (let j = 0; j < rows; j++) {
          const shapeBrightness = getShapeBrightness(i, j, cols, rows);
          // Stable base pattern (no frame in calculation)
          const seedIndex = (i * rows + j) % randomSeedRef.current.length;
          
          // Apply glitch effects only during glitch periods
          let offsetX = 0;
          let offsetY = 0;
          if (isGlitching) {
            // Use frame to vary glitch effect
            const glitchSeedIndex = (seedIndex + frame) % randomSeedRef.current.length;
            const shouldGlitch = randomSeedRef.current[glitchSeedIndex].r1 < 0.15; // 15% of cells glitch
            if (shouldGlitch) {
              offsetX = (randomSeedRef.current[glitchSeedIndex].r2 - 0.5) * 30 * glitchIntensity;
              offsetY = (randomSeedRef.current[glitchSeedIndex].r3 - 0.5) * 10 * glitchIntensity;
            }
          }
          
          if (randomSeedRef.current[seedIndex].r2 < config.density * shapeBrightness) {
            const brightness = config.gradient ? (0.5 + randomSeedRef.current[seedIndex].r3 * 0.5) * shapeBrightness : shapeBrightness;
            const brightnessHex = Math.floor(brightness * 255).toString(16).padStart(2, '0');
            ctx.fillStyle = colorBase + brightnessHex;
            
            const targetBlur = config.glowEffect ? Math.floor(8 * brightness) : 0;
            if (currentShadowBlur !== targetBlur) {
              ctx.shadowBlur = targetBlur;
              currentShadowBlur = targetBlur;
            }

            const symbolIndex = Math.floor(randomSeedRef.current[seedIndex].r1 * symbols.length);
            ctx.fillText(
              symbols[symbolIndex],
              iCellPos + offsetX,
              j * cellSize + halfCell + offsetY
            );
          }
        }
      }
    } else if (config.pattern === 'pulse') {
      const pulse = (Math.sin(frame * 0.05) + 1) / 2;
      const centerX = cols / 2;
      const centerY = rows / 2;
      const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
      
      for (let i = 0; i < cols; i++) {
        const dx = i - centerX;
        const iCellPos = i * cellSize + halfCell;
        for (let j = 0; j < rows; j++) {
          const shapeBrightness = getShapeBrightness(i, j, cols, rows);
          const dy = j - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const normalizedDist = dist / maxDist;
          
          const seedIndex = (i * rows + j) % randomSeedRef.current.length;
          
          if (randomSeedRef.current[seedIndex].r1 < config.density * (1 - normalizedDist) * pulse * shapeBrightness) {
            const brightness = config.gradient ? (1 - normalizedDist) * pulse * shapeBrightness : shapeBrightness;
            const brightnessHex = Math.floor(brightness * 255).toString(16).padStart(2, '0');
            ctx.fillStyle = colorBase + brightnessHex;
            
            const targetBlur = config.glowEffect ? Math.floor(10 * brightness) : 0;
            if (currentShadowBlur !== targetBlur) {
              ctx.shadowBlur = targetBlur;
              currentShadowBlur = targetBlur;
            }

            const symbolIndex = Math.floor(randomSeedRef.current[seedIndex].r2 * symbols.length);
            ctx.fillText(
              symbols[symbolIndex],
              iCellPos,
              j * cellSize + halfCell
            );
          }
        }
      }
    }
  }, [canvasSize, config, symbols, getShapeBrightness]);

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
    
    setConfig({
      ...config,
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
        {shapeImage && (
          <div className="absolute top-6 left-6 bg-gray-800 p-3 rounded-lg shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white text-sm font-medium">Shape Guide</span>
              <button
                onClick={clearShape}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <img 
              src={shapeImage.src} 
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
            onClick={() => fileInputRef.current?.click()}
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
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Control Panel */}
      <div className="w-80 bg-gray-800 p-6 overflow-y-auto space-y-6">
        <h2 className="text-xl font-bold text-white mb-4">Pattern Controls</h2>

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
              setConfig({...config, symbolSet: symbolPresets[e.target.value as PresetKey] || config.symbolSet});
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
            onChange={(e) => setConfig({...config, symbolSet: e.target.value || '01'})}
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
            onChange={(e) => setConfig({...config, pattern: e.target.value})}
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
        {shapeData && (
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
              onChange={(e) => setConfig({...config, shapeInfluence: parseFloat(e.target.value)})}
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
            onChange={(e) => setConfig({...config, density: parseFloat(e.target.value)})}
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
            onChange={(e) => setConfig({...config, cellSize: parseInt(e.target.value)})}
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
            onChange={(e) => setConfig({...config, animationSpeed: parseInt(e.target.value)})}
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
            onChange={(e) => setConfig({...config, color: e.target.value})}
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
            onChange={(e) => setConfig({...config, bgColor: e.target.value})}
            className="w-full h-10 rounded cursor-pointer"
          />
        </div>

        {/* Gradient Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={config.gradient}
            onChange={(e) => setConfig({...config, gradient: e.target.checked})}
            className="w-4 h-4 mr-2"
          />
          <label className="text-sm font-medium text-gray-300">
            Gradient Effect
          </label>
        </div>

        {/* Glow Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={config.glowEffect}
            onChange={(e) => setConfig({...config, glowEffect: e.target.checked})}
            className="w-4 h-4 mr-2"
          />
          <label className="text-sm font-medium text-gray-300">
            Glow Effect
          </label>
        </div>
      </div>
    </div>
  );
};

export default DitheredPatternGenerator;