import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useHandDetection } from '@/hooks/useHandDetection';
import { Direction } from '@/hooks/useSnakeGame';
import { cn } from '@/lib/utils';
import { Loader2, Camera, AlertCircle } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface CameraFeedProps {
  enabled: boolean;
  onDirectionChange: (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void;
  onDrawingChange: (isDrawing: boolean) => void;
  className?: string;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({
  enabled,
  onDirectionChange,
  onDrawingChange,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);
  const [lastDirection, setLastDirection] = useState<Direction | null>(null);
  const wasPinchingRef = useRef(false);

  const { isPinching, pinchPosition, isLoading, error } = useHandDetection(
    videoRef,
    canvasRef,
    enabled
  );

  // Calculate direction from drawn line
  const calculateDirection = useCallback((points: Point[]): Direction | null => {
    if (points.length < 5) return null;

    const start = points[0];
    const end = points[points.length - 1];
    
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    const minDistance = 30;
    if (Math.abs(dx) < minDistance && Math.abs(dy) < minDistance) return null;

    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'RIGHT' : 'LEFT';
    } else {
      return dy > 0 ? 'DOWN' : 'UP';
    }
  }, []);

  // Handle pinch gesture and drawing
  useEffect(() => {
    if (!drawingCanvasRef.current) return;

    const canvas = drawingCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (isPinching && pinchPosition) {
      // Notify that we're drawing (snake should pause)
      if (!wasPinchingRef.current) {
        onDrawingChange(true);
      }
      
      // Add point to drawing
      setDrawingPoints(prev => [...prev, pinchPosition]);
      
      // Draw trail
      if (drawingPoints.length > 0) {
        const lastPoint = drawingPoints[drawingPoints.length - 1];
        
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(pinchPosition.x, pinchPosition.y);
        ctx.strokeStyle = 'hsl(280, 100%, 60%)';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.shadowColor = 'hsl(280, 100%, 60%)';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      
      wasPinchingRef.current = true;
    } else if (wasPinchingRef.current) {
      // Pinch ended - calculate direction and resume
      const direction = calculateDirection(drawingPoints);
      
      if (direction) {
        onDirectionChange(direction);
        setLastDirection(direction);
      }
      
      // Stop drawing (snake can move again)
      onDrawingChange(false);
      
      // Clear drawing
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setDrawingPoints([]);
      wasPinchingRef.current = false;
    }
  }, [isPinching, pinchPosition, drawingPoints, calculateDirection, onDirectionChange, onDrawingChange]);

  // Setup canvas sizes
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = 640;
      canvasRef.current.height = 480;
    }
    if (drawingCanvasRef.current) {
      drawingCanvasRef.current.width = 640;
      drawingCanvasRef.current.height = 480;
    }
  }, []);

  return (
    <div className={cn('relative rounded-lg overflow-hidden', className)}>
      {/* Hidden video element */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        autoPlay
        muted
      />

      {/* Main canvas for hand detection visualization */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover rounded-lg"
        style={{
          boxShadow: '0 0 20px hsl(280, 100%, 60% / 0.3)',
          border: '2px solid hsl(280, 100%, 60% / 0.5)',
        }}
      />

      {/* Drawing overlay canvas */}
      <canvas
        ref={drawingCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Pinch indicator */}
      {isPinching && pinchPosition && (
        <div
          className="absolute w-8 h-8 rounded-full animate-pulse-glow pointer-events-none"
          style={{
            left: pinchPosition.x - 16,
            top: pinchPosition.y - 16,
            backgroundColor: 'hsl(var(--pinch-active) / 0.8)',
            boxShadow: '0 0 20px hsl(45, 100%, 55%), 0 0 40px hsl(45, 100%, 55% / 0.5)',
          }}
        />
      )}

      {/* Direction indicator */}
      {lastDirection && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-secondary/80 text-secondary-foreground font-display text-sm backdrop-blur-sm">
          → {lastDirection}
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center space-y-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground font-body text-lg">Initializing camera...</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center space-y-3 p-6">
            <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
            <p className="text-destructive font-body text-lg">{error}</p>
          </div>
        </div>
      )}

      {/* Not enabled overlay */}
      {!enabled && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm">
          <div className="text-center space-y-3">
            <Camera className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
            <p className="text-muted-foreground font-body text-lg">
              Start game to enable camera
            </p>
          </div>
        </div>
      )}

      {/* Status indicator */}
      {enabled && !isLoading && !error && (
        <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/60 backdrop-blur-sm border border-primary/30">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-body text-primary">TRACKING</span>
        </div>
      )}
    </div>
  );
};
