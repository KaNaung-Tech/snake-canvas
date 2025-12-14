import React from 'react';
import { cn } from '@/lib/utils';
import { Skull, Trophy, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  score,
  highScore,
  isNewHighScore,
  onRestart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-md z-50">
      <div 
        className={cn(
          'p-8 rounded-2xl text-center space-y-6',
          'bg-card/90 backdrop-blur-sm',
          'border-2',
          isNewHighScore ? 'border-accent' : 'border-destructive/50'
        )}
        style={{
          boxShadow: isNewHighScore 
            ? '0 0 40px hsl(45, 100%, 55% / 0.4), 0 0 80px hsl(45, 100%, 55% / 0.2)'
            : '0 0 40px hsl(0, 85%, 55% / 0.3)',
        }}
      >
        {/* Icon */}
        <div className="relative">
          {isNewHighScore ? (
            <Trophy className="w-20 h-20 mx-auto text-accent animate-float" />
          ) : (
            <Skull className="w-20 h-20 mx-auto text-destructive animate-pulse-glow" />
          )}
        </div>

        {/* Title */}
        <div>
          <h2 className={cn(
            'text-4xl font-display font-bold mb-2',
            isNewHighScore ? 'text-accent text-glow-accent' : 'text-destructive'
          )}>
            {isNewHighScore ? 'NEW RECORD!' : 'GAME OVER'}
          </h2>
          
          {isNewHighScore && (
            <p className="text-muted-foreground font-body">
              Incredible! You beat your previous best!
            </p>
          )}
        </div>

        {/* Score */}
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-background/50 border border-primary/30">
            <p className="text-sm font-body text-muted-foreground uppercase tracking-wider">Your Score</p>
            <p className="text-5xl font-display font-bold text-primary text-glow">
              {score}
            </p>
          </div>
          
          <p className="text-muted-foreground font-body">
            High Score: <span className="text-accent font-bold">{highScore}</span>
          </p>
        </div>

        {/* Restart Button */}
        <Button
          onClick={onRestart}
          size="lg"
          className="w-full gap-2 font-display text-lg bg-primary text-primary-foreground hover:bg-primary/90 box-glow transition-all duration-300 hover:scale-105"
        >
          <RotateCcw className="w-5 h-5" />
          PLAY AGAIN
        </Button>
      </div>
    </div>
  );
};
