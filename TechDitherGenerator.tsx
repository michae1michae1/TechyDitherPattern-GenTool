import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Download, RefreshCw, ChevronLeft, ChevronRight, Upload, X } from 'lucide-react';

const DitheredPatternGenerator = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const fileInputRef = useRef(null);
  
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
  
  const [isAnimating, setIsAnimating] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [drops, setDrops] = useState([]);
  const [shapeImage, setShapeImage] = useState(null);
  const [shapeData, setShapeData] = useState(null);

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

  // Load and process uploaded image
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setShapeImage(img);
        processShapeImage(img);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const processShapeImage = (img) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Scale to match pattern grid
    const maxSize = 200;
    const scale = Math.min(maxSize / img.width, maxSize / img.height);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Convert to brightness map
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

  const stepFrame = (direction) => {
    setCurrentFrame(prev => prev + direction);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    const cols = Math.floor(width / config.cellSize);
    const rows = Math.floor(height / config.cellSize);

    // Initialize drops for rain effect
    if (drops.length === 0) {
      const initDrops = [];
      for (let i = 0; i < cols; i++) {
        initDrops.push({
          x: i,
          y: Math.random() * rows,
          speed: 0.5 + Math.random() * 1.5,
          length: 10 + Math.random() * 20
        });
      }
      setDrops(initDrops);
    }

    const getShapeBrightness = (x, y) => {
      if (!shapeData) return 1;
      
      const shapeWidth = shapeData[0].length;
      const shapeHeight = shapeData.length;
      
      // Center the shape
      const offsetX = Math.floor((cols - shapeWidth) / 2);
      const offsetY = Math.floor((rows - shapeHeight) / 2);
      
      const shapeX = x - offsetX;
      const shapeY = y - offsetY;
      
      if (shapeX < 0 || shapeX >= shapeWidth || shapeY < 0 || shapeY >= shapeHeight) {
        return 1 - config.shapeInfluence;
      }
      
      const brightness = shapeData[shapeY][shapeX];
      return brightness * config.shapeInfluence + (1 - config.shapeInfluence);
    };

    const renderFrame = (frame) => {
      ctx.fillStyle = config.bgColor;
      ctx.fillRect(0, 0, width, height);

      const symbols = config.symbolSet.split('');
      
      ctx.font = `${config.cellSize - 2}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (config.pattern === 'rain') {
        drops.forEach((drop) => {
          for (let j = 0; j < drop.length; j++) {
            const y = drop.y - j;
            if (y < 0 || y >= rows) continue;

            const shapeBrightness = getShapeBrightness(drop.x, Math.floor(y));
            const alpha = (1 - (j / drop.length)) * shapeBrightness;
            const brightness = config.gradient ? alpha : shapeBrightness;
            
            if (brightness > 0.1) {
              ctx.fillStyle = config.color + Math.floor(brightness * 255).toString(16).padStart(2, '0');
              
              if (config.glowEffect) {
                ctx.shadowBlur = 10 * brightness;
                ctx.shadowColor = config.color;
              } else {
                ctx.shadowBlur = 0;
              }

              const symbol = symbols[Math.floor(Math.random() * symbols.length)];
              ctx.fillText(
                symbol,
                drop.x * config.cellSize + config.cellSize / 2,
                y * config.cellSize + config.cellSize / 2
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
          for (let j = 0; j < rows; j++) {
            const wave = Math.sin((i + frame * 0.1) * 0.3) * Math.cos((j + frame * 0.1) * 0.3);
            const waveAlpha = (wave + 1) / 2;
            const shapeBrightness = getShapeBrightness(i, j);
            const alpha = waveAlpha * shapeBrightness;
            
            if (Math.random() < config.density * alpha) {
              const brightness = config.gradient ? alpha : shapeBrightness;
              ctx.fillStyle = config.color + Math.floor(brightness * 255).toString(16).padStart(2, '0');
              
              if (config.glowEffect) {
                ctx.shadowBlur = 8 * brightness;
                ctx.shadowColor = config.color;
              } else {
                ctx.shadowBlur = 0;
              }

              const symbol = symbols[Math.floor(Math.random() * symbols.length)];
              ctx.fillText(
                symbol,
                i * config.cellSize + config.cellSize / 2,
                j * config.cellSize + config.cellSize / 2
              );
            }
          }
        }
      } else if (config.pattern === 'static') {
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const shapeBrightness = getShapeBrightness(i, j);
            
            if (Math.random() < config.density * shapeBrightness) {
              const brightness = config.gradient ? Math.random() * shapeBrightness : shapeBrightness;
              ctx.fillStyle = config.color + Math.floor(brightness * 255).toString(16).padStart(2, '0');
              
              if (config.glowEffect) {
                ctx.shadowBlur = 6 * brightness;
                ctx.shadowColor = config.color;
              } else {
                ctx.shadowBlur = 0;
              }

              const symbol = symbols[Math.floor(Math.random() * symbols.length)];
              ctx.fillText(
                symbol,
                i * config.cellSize + config.cellSize / 2,
                j * config.cellSize + config.cellSize / 2
              );
            }
          }
        }
      } else if (config.pattern === 'glitch') {
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const shapeBrightness = getShapeBrightness(i, j);
            const glitch = Math.random() < 0.05 ? Math.random() : 0;
            const offsetX = glitch * (Math.random() - 0.5) * 20;
            
            if (Math.random() < config.density * shapeBrightness) {
              const brightness = config.gradient ? (0.5 + Math.random() * 0.5) * shapeBrightness : shapeBrightness;
              ctx.fillStyle = config.color + Math.floor(brightness * 255).toString(16).padStart(2, '0');
              
              if (config.glowEffect) {
                ctx.shadowBlur = 8 * brightness;
                ctx.shadowColor = config.color;
              } else {
                ctx.shadowBlur = 0;
              }

              const symbol = symbols[Math.floor(Math.random() * symbols.length)];
              ctx.fillText(
                symbol,
                i * config.cellSize + config.cellSize / 2 + offsetX,
                j * config.cellSize + config.cellSize / 2
              );
            }
          }
        }
      } else if (config.pattern === 'pulse') {
        const pulse = (Math.sin(frame * 0.05) + 1) / 2;
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const shapeBrightness = getShapeBrightness(i, j);
            const dist = Math.sqrt(Math.pow(i - cols/2, 2) + Math.pow(j - rows/2, 2));
            const maxDist = Math.sqrt(Math.pow(cols/2, 2) + Math.pow(rows/2, 2));
            const normalizedDist = dist / maxDist;
            
            if (Math.random() < config.density * (1 - normalizedDist) * pulse * shapeBrightness) {
              const brightness = config.gradient ? (1 - normalizedDist) * pulse * shapeBrightness : shapeBrightness;
              ctx.fillStyle = config.color + Math.floor(brightness * 255).toString(16).padStart(2, '0');
              
              if (config.glowEffect) {
                ctx.shadowBlur = 10 * brightness;
                ctx.shadowColor = config.color;
              } else {
                ctx.shadowBlur = 0;
              }

              const symbol = symbols[Math.floor(Math.random() * symbols.length)];
              ctx.fillText(
                symbol,
                i * config.cellSize + config.cellSize / 2,
                j * config.cellSize + config.cellSize / 2
              );
            }
          }
        }
      }
    };

    const animate = () => {
      if (!isAnimating) return;

      renderFrame(currentFrame);
      setCurrentFrame(prev => prev + 1);

      animationRef.current = setTimeout(() => {
        requestAnimationFrame(animate);
      }, config.animationSpeed);
    };

    if (isAnimating) {
      animate();
    } else {
      renderFrame(currentFrame);
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [config, isAnimating, drops, currentFrame, shapeData]);

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'dithered-pattern.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const randomize = () => {
    const presetKeys = Object.keys(symbolPresets).filter(k => k !== 'Custom');
    const randomPreset = presetKeys[Math.floor(Math.random() * presetKeys.length)];
    const randomPattern = patternTypes[Math.floor(Math.random() * patternTypes.length)];
    
    setConfig({
      ...config,
      symbolSet: symbolPresets[randomPreset],
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
            value={Object.keys(symbolPresets).find(key => symbolPresets[key] === config.symbolSet) || 'Custom'}
            onChange={(e) => setConfig({...config, symbolSet: symbolPresets[e.target.value] || config.symbolSet})}
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