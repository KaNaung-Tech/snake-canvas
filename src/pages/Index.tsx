import React, { useEffect, useState } from 'react';
import { useSnakeGame } from '@/hooks/useSnakeGame';
import { GameBoard } from '@/components/GameBoard';
import { CameraFeed } from '@/components/CameraFeed';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { GameControls } from '@/components/GameControls';
import { GameOverModal } from '@/components/GameOverModal';
import { Gamepad2 } from 'lucide-react';

const Index = () => {
  const {
    snake,
    food,
    score,
    highScore,
    isGameOver,
    isPaused,
    isWaitingForInput,
    isDrawing,
    gridSize,
    setDirection,
    setDrawing,
    startGame,
    pauseGame,
    resetGame,
  } = useSnakeGame(200);

  const [previousHighScore] = useState(highScore);
  const isNewHighScore = isGameOver && score === highScore && score > previousHighScore;

  // Keyboard controls as fallback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          setDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          setDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          setDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          setDirection('RIGHT');
          break;
        case ' ':
          e.preventDefault();
          if (isGameOver) {
            resetGame();
          } else if (isPaused) {
            startGame();
          } else {
            pauseGame();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setDirection, isGameOver, isPaused, resetGame, startGame, pauseGame]);

  return (
    <div className="min-h-screen w-full overflow-hidden relative">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Gamepad2 className="w-10 h-10 text-primary animate-pulse-glow" />
            <h1 className="text-5xl md:text-6xl font-display font-black text-primary text-glow tracking-wider">
              GESTURE SNAKE
            </h1>
          </div>
          <p className="text-muted-foreground font-body text-lg">
            Control the snake with your hands • Pinch & draw to change direction
          </p>
        </header>

        {/* Score Display */}
        <div className="flex justify-center mb-6">
          <ScoreDisplay score={score} highScore={highScore} />
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 items-center justify-center">
          {/* Game Board */}
          <div className="relative w-full max-w-lg aspect-square">
            <GameBoard
              snake={snake}
              food={food}
              gridSize={gridSize}
            />
            
            {/* Game Over Modal */}
            <GameOverModal
              isOpen={isGameOver}
              score={score}
              highScore={highScore}
              isNewHighScore={isNewHighScore}
              onRestart={resetGame}
            />

            {/* Drawing Overlay - Snake paused while you draw */}
            {!isPaused && !isGameOver && !isWaitingForInput && isDrawing && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg z-30 pointer-events-none">
                <div className="absolute inset-0 bg-secondary/10 animate-pulse" />
                <div className="text-center p-4 bg-background/80 rounded-xl backdrop-blur-sm border border-secondary/50">
                  <p className="text-xl font-display font-bold text-secondary">
                    DRAWING...
                  </p>
                  <p className="text-sm text-muted-foreground font-body">
                    Release to move
                  </p>
                </div>
              </div>
            )}

            {/* Waiting for Input Overlay */}
            {!isPaused && !isGameOver && isWaitingForInput && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg z-30">
                <div className="text-center p-6">
                  <p className="text-3xl font-display font-bold text-accent text-glow-accent animate-pulse-glow mb-3">
                    DRAW A DIRECTION
                  </p>
                  <p className="text-muted-foreground font-body">
                    Pinch your fingers and draw to start moving
                  </p>
                </div>
              </div>
            )}

            {/* Pause Overlay */}
            {isPaused && !isGameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg z-30">
                <div className="text-center">
                  <p className="text-4xl font-display font-bold text-primary text-glow animate-pulse-glow">
                    PAUSED
                  </p>
                  <p className="text-muted-foreground font-body mt-2">
                    Press START or SPACE to continue
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="w-full max-w-sm space-y-6">
            {/* Camera Feed */}
            <div className="aspect-[4/3]">
              <CameraFeed
                enabled={!isPaused && !isGameOver}
                onDirectionChange={setDirection}
                onDrawingChange={setDrawing}
              />
            </div>

            {/* Controls */}
            <GameControls
              isPaused={isPaused}
              isGameOver={isGameOver}
              onStart={startGame}
              onPause={pauseGame}
              onReset={resetGame}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 py-4">
          <p className="text-sm font-body text-muted-foreground">
            Keyboard controls: Arrow keys / WASD • Space to pause
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
