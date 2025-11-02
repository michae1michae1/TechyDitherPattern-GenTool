/**
 * Custom hook for handling image uploads and processing
 * Converts uploaded images into brightness maps for shape-guided patterns
 */

import { useCallback } from 'react';

/**
 * Return type for the useImageUpload hook
 */
interface UseImageUploadReturn {
  /** Process an uploaded image file */
  handleImageUpload: (
    file: File,
    onComplete: (img: HTMLImageElement, brightnessMap: number[][]) => void
  ) => void;
}

/**
 * Hook for handling image uploads and converting them to brightness maps
 * 
 * @returns Image upload handler
 * 
 * @example
 * ```tsx
 * const { handleImageUpload } = useImageUpload();
 * 
 * const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 *   const file = e.target.files?.[0];
 *   if (file) {
 *     handleImageUpload(file, (img, brightnessMap) => {
 *       updateLayer({ shapeImage: img, shapeData: brightnessMap });
 *     });
 *   }
 * };
 * ```
 */
export function useImageUpload(): UseImageUploadReturn {
  /**
   * Process an uploaded image into a brightness map
   */
  const processShapeImage = useCallback((
    img: HTMLImageElement,
    onComplete: (img: HTMLImageElement, brightnessMap: number[][]) => void
  ) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Scale image down to reasonable size for performance
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
        // Calculate brightness (0-1), transparent pixels = 0
        const brightness = a === 0 ? 0 : (r + g + b) / 3 / 255;
        row.push(brightness);
      }
      brightnessMap.push(row);
    }
    
    onComplete(img, brightnessMap);
  }, []);

  /**
   * Handle image file upload
   */
  const handleImageUpload = useCallback((
    file: File,
    onComplete: (img: HTMLImageElement, brightnessMap: number[][]) => void
  ) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        processShapeImage(img, onComplete);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [processShapeImage]);

  return {
    handleImageUpload
  };
}

