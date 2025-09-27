import React, { useRef, useEffect } from 'react';
import { ThumbnailState } from '../types';
import { YOUTUBE_THUMBNAIL_WIDTH, YOUTUBE_THUMBNAIL_HEIGHT } from '../constants';

interface CanvasRendererProps {
  state: ThumbnailState;
}

/**
 * A helper function to wrap text into multiple lines based on a max width.
 * It does not draw, only returns an array of strings (lines).
 */
const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.toUpperCase().split(' ');
    let line = '';
    const lines: string[] = [];

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            lines.push(line.trim());
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line.trim());
    return lines.filter(l => l.length > 0); // Filter out any empty lines
};

/**
 * Calculates the optimal font size for a text to fit within given dimensions.
 * Returns the font size and the wrapped lines of text.
 */
const getAdjustedFontSizeAndLines = (
  ctx: CanvasRenderingContext2D,
  text: string,
  fontFamily: string,
  fontWeight: number,
  maxWidth: number,
  maxHeight: number,
  initialFontSize: number,
  minFontSize: number
): { fontSize: number; lines: string[] } => {
  let fontSize = initialFontSize;
  let lines: string[] = [];

  // Iterate from largest to smallest font size
  while (fontSize >= minFontSize) {
    ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;
    lines = wrapText(ctx, text, maxWidth);
    const lineHeight = fontSize * 1.1; // Estimate line height
    const totalHeight = lines.length * lineHeight;

    if (totalHeight <= maxHeight) {
      // It fits, we're done
      return { fontSize, lines };
    }

    fontSize -= 2; // Reduce font size and try again
  }

  // If it still doesn't fit, return the smallest possible size
  // The wrapText would have been called one last time with minFontSize
  ctx.font = `${fontWeight} ${minFontSize}px "${fontFamily}", sans-serif`;
  lines = wrapText(ctx, text, maxWidth); // Re-wrap with the smallest size to ensure 'lines' is correct
  return { fontSize: minFontSize, lines };
};


const drawGradientBackground = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color1: string,
  color2: string,
) => {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
};

const CanvasRenderer: React.FC<CanvasRendererProps> = ({ state }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawContent = () => {
      // --- NEW DYNAMIC TEXT SIZING AND POSITIONING LOGIC ---

      // 1. Calculate Title font size and lines
      const titleResult = getAdjustedFontSizeAndLines(
        ctx,
        state.title,
        state.titleFont,
        900, // fontWeight
        YOUTUBE_THUMBNAIL_WIDTH * 0.9, // maxWidth
        YOUTUBE_THUMBNAIL_HEIGHT * 0.6, // maxHeight
        120, // initialFontSize
        40  // minFontSize
      );
      const titleFontSize = titleResult.fontSize;
      const titleLines = titleResult.lines;
      const titleLineHeight = titleFontSize * 1.1;
      const titleBlockHeight = titleLines.length * titleLineHeight;

      // 2. Calculate Subtitle font size and lines
      const subtitleResult = getAdjustedFontSizeAndLines(
        ctx,
        state.subtitle,
        state.subtitleFont,
        700, // fontWeight
        YOUTUBE_THUMBNAIL_WIDTH * 0.8, // maxWidth
        YOUTUBE_THUMBNAIL_HEIGHT * 0.25, // maxHeight
        70, // initialFontSize
        30  // minFontSize
      );
      const subtitleFontSize = subtitleResult.fontSize;
      const subtitleLines = subtitleResult.lines;
      const subtitleLineHeight = subtitleFontSize * 1.1;
      const subtitleBlockHeight = subtitleLines.length > 0 ? subtitleLines.length * subtitleLineHeight : 0;
      
      // 3. Calculate positioning for the entire text block to be centered
      const spacing = 20;
      const totalTextBlockHeight = titleBlockHeight + (subtitleBlockHeight > 0 ? spacing + subtitleBlockHeight : 0);
      let currentY = (YOUTUBE_THUMBNAIL_HEIGHT / 2) - (totalTextBlockHeight / 2);

      // 4. Draw Title with dynamic size
      ctx.font = `900 ${titleFontSize}px "${state.titleFont}", sans-serif`;
      ctx.fillStyle = state.titleColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;

      for (const line of titleLines) {
          ctx.fillText(line, YOUTUBE_THUMBNAIL_WIDTH / 2, currentY);
          currentY += titleLineHeight;
      }

      // 5. Draw Subtitle with dynamic size
      if (subtitleLines.length > 0) {
          currentY += spacing;
          ctx.font = `700 ${subtitleFontSize}px "${state.subtitleFont}", sans-serif`;
          ctx.fillStyle = state.subtitleColor;
          // Use a smaller, more subtle shadow for subtitle
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;

          for (const line of subtitleLines) {
              ctx.fillText(line, YOUTUBE_THUMBNAIL_WIDTH / 2, currentY);
              currentY += subtitleLineHeight;
          }
      }
      
      // Draw Logo (existing logic)
      if (state.showLogo && state.logoUrl) {
        const logo = new Image();
        logo.crossOrigin = 'anonymous';
        logo.src = state.logoUrl;
        logo.onload = () => {
          const logoSize = 120;
          const padding = 40;
          ctx.drawImage(
            logo,
            YOUTUBE_THUMBNAIL_WIDTH - logoSize - padding,
            padding,
            logoSize,
            logoSize,
          );
        };
      }
    };

    const render = () => {
      // High-DPI rendering for crisp images
      const dpr = window.devicePixelRatio || 1;
      canvas.width = YOUTUBE_THUMBNAIL_WIDTH * dpr;
      canvas.height = YOUTUBE_THUMBNAIL_HEIGHT * dpr;
      ctx.scale(dpr, dpr);

      // Clear canvas
      ctx.clearRect(0, 0, YOUTUBE_THUMBNAIL_WIDTH, YOUTUBE_THUMBNAIL_HEIGHT);

      // Background (Image or Gradient)
      if (state.backgroundImageUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = state.backgroundImageUrl;
        img.onload = () => {
          ctx.drawImage(img, 0, 0, YOUTUBE_THUMBNAIL_WIDTH, YOUTUBE_THUMBNAIL_HEIGHT);
          drawContent();
        };
        img.onerror = () => {
          // Fallback to gradient if image fails to load
          drawGradientBackground(
            ctx,
            YOUTUBE_THUMBNAIL_WIDTH,
            YOUTUBE_THUMBNAIL_HEIGHT,
            state.backgroundColor1,
            state.backgroundColor2,
          );
          drawContent();
        };
      } else {
        drawGradientBackground(
          ctx,
          YOUTUBE_THUMBNAIL_WIDTH,
          YOUTUBE_THUMBNAIL_HEIGHT,
          state.backgroundColor1,
          state.backgroundColor2,
        );
        drawContent();
      }
    };

    render();
  }, [state]);
  
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    
    // Sanitize the title to create a valid filename, fallback to a default name
    const fileName = state.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'thumbnail';
    
    link.download = `${fileName}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95); // High quality JPEG
    
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4">
      <div
        className="w-full"
        style={{
          aspectRatio: `${YOUTUBE_THUMBNAIL_WIDTH}/${YOUTUBE_THUMBNAIL_HEIGHT}`,
        }}
      >
        <canvas ref={canvasRef} className="w-full h-full rounded-lg shadow-2xl" />
      </div>
      {state.backgroundImageUrl && (
         <button
            onClick={handleDownload}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 shadow-lg"
        >
            Baixar Imagem (.jpg)
        </button>
      )}
    </div>
  );
};

export default CanvasRenderer;