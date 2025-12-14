import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Play, Pause, RotateCcw, Hand } from 'lucide-react';

interface GameControlsProps {
  isPaused: boolean;
  isGameOver: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  className?: string;
}

export const GameControls: React.FC<GameControlsProps> = ({
  isPaused,
  isGameOver,
  onStart,
  onPause,
  onReset,
  className,
}) => {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex gap-3">
        {isGameOver ? (
          <Button
            onClick={onReset}
            size="lg"
            className="flex-1 gap-2 font-display text-lg bg-primary text-primary-foreground hover:bg-primary/90 box-glow transition-all duration-300 hover:scale-105"
          >
            <RotateCcw className="w-5 h-5" />
            PLAY AGAIN
          </Button>
        ) : isPaused ? (
          <Button
            onClick={onStart}
            size="lg"
            className="flex-1 gap-2 font-display text-lg bg-primary text-primary-foreground hover:bg-primary/90 box-glow transition-all duration-300 hover:scale-105"
          >
            <Play className="w-5 h-5" />
            START
          </Button>
        ) : (
          <Button
            onClick={onPause}
            size="lg"
            variant="secondary"
            className="flex-1 gap-2 font-display text-lg box-glow-cyber transition-all duration-300 hover:scale-105"
          >
            <Pause className="w-5 h-5" />
            PAUSE
          </Button>
        )}

        {!isGameOver && !isPaused && (
          <Button
            onClick={onReset}
            size="lg"
            variant="outline"
            className="gap-2 font-display border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 rounded-xl bg-card/30 backdrop-blur-sm border border-border/50">
        <div className="flex items-center gap-2 mb-3">
          <Hand className="w-5 h-5 text-secondary" />
          <h3 className="font-display text-sm text-secondary">HAND CONTROLS</h3>
        </div>
        <ul className="space-y-2 text-sm font-body text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pinch-active" />
            Pinch thumb & index finger together
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-trail" />
            Draw a line in any direction
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Release to change snake direction
          </li>
        </ul>
      </div>
    </div>
  );
};
