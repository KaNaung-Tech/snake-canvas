import React from 'react';
import { cn } from '@/lib/utils';

interface Position {
  x: number;
  y: number;
}

interface GameBoardProps {
  snake: Position[];
  food: Position;
  gridSize: number;
  className?: string;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  snake,
  food,
  gridSize,
  className,
}) => {
  const cellSize = 100 / gridSize;

  return (
    <div
      className={cn(
        'relative aspect-square w-full rounded-lg overflow-hidden',
        'bg-background/80 backdrop-blur-sm',
        'border-2 border-primary/30',
        'grid-pattern',
        'box-glow',
        className
      )}
      style={{
        boxShadow: '0 0 30px hsl(160, 100%, 50% / 0.2), inset 0 0 60px hsl(160, 100%, 50% / 0.05)',
      }}
    >
      {/* Scanline effect */}
      <div className="absolute inset-0 scanline opacity-30 pointer-events-none" />
      
      {/* Food */}
      <div
        className="absolute rounded-full animate-food-pulse z-10"
        style={{
          width: `${cellSize}%`,
          height: `${cellSize}%`,
          left: `${food.x * cellSize}%`,
          top: `${food.y * cellSize}%`,
          backgroundColor: 'hsl(var(--food))',
          boxShadow: 'var(--shadow-food)',
        }}
      />

      {/* Snake */}
      {snake.map((segment, index) => {
        const isHead = index === 0;
        const opacity = 1 - (index / snake.length) * 0.5;
        
        return (
          <div
            key={index}
            className={cn(
              'absolute transition-all duration-75',
              isHead ? 'rounded-md z-20' : 'rounded-sm z-10'
            )}
            style={{
              width: `${cellSize}%`,
              height: `${cellSize}%`,
              left: `${segment.x * cellSize}%`,
              top: `${segment.y * cellSize}%`,
              backgroundColor: isHead 
                ? 'hsl(var(--snake-head))' 
                : `hsla(var(--snake-body) / ${opacity})`,
              boxShadow: isHead 
                ? 'var(--shadow-neon)' 
                : `0 0 ${10 - index}px hsl(var(--snake-glow) / ${opacity * 0.5})`,
              transform: isHead ? 'scale(1.1)' : 'scale(0.95)',
            }}
          >
            {isHead && (
              <>
                {/* Eyes */}
                <div 
                  className="absolute bg-background rounded-full"
                  style={{
                    width: '20%',
                    height: '20%',
                    top: '25%',
                    left: '20%',
                  }}
                />
                <div 
                  className="absolute bg-background rounded-full"
                  style={{
                    width: '20%',
                    height: '20%',
                    top: '25%',
                    right: '20%',
                  }}
                />
              </>
            )}
          </div>
        );
      })}

      {/* Grid overlay for better visibility */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--grid-line) / 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--grid-line) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: `${cellSize}% ${cellSize}%`,
        }}
      />
    </div>
  );
};
