import React from 'react';
import { cn } from '@/lib/utils';
import { Trophy, Zap } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
  highScore: number;
  className?: string;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  highScore,
  className,
}) => {
  return (
    <div className={cn('flex gap-6', className)}>
      {/* Current Score */}
      <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card/50 backdrop-blur-sm border border-primary/30 box-glow">
        <Zap className="w-6 h-6 text-primary" />
        <div>
          <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">Score</p>
          <p className="text-2xl font-display font-bold text-primary text-glow">
            {score.toString().padStart(4, '0')}
          </p>
        </div>
      </div>

      {/* High Score */}
      <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-card/50 backdrop-blur-sm border border-accent/30" 
        style={{ boxShadow: '0 0 20px hsl(45, 100%, 55% / 0.2)' }}>
        <Trophy className="w-6 h-6 text-accent" />
        <div>
          <p className="text-xs font-body text-muted-foreground uppercase tracking-wider">Best</p>
          <p className="text-2xl font-display font-bold text-accent text-glow-accent">
            {highScore.toString().padStart(4, '0')}
          </p>
        </div>
      </div>
    </div>
  );
};
