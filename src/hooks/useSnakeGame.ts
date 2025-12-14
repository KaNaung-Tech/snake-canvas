import { useState, useCallback, useEffect, useRef } from 'react';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null;

interface Position {
  x: number;
  y: number;
}

interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  score: number;
  highScore: number;
  isGameOver: boolean;
  isPaused: boolean;
  isWaitingForInput: boolean;
  isDrawing: boolean;
}

const GRID_SIZE = 20;
const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

const getRandomPosition = (snake: Position[]): Position => {
  let position: Position;
  do {
    position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some(seg => seg.x === position.x && seg.y === position.y));
  return position;
};

export const useSnakeGame = (gameSpeed: number = 250) => {
  const [gameState, setGameState] = useState<GameState>(() => ({
    snake: INITIAL_SNAKE,
    food: getRandomPosition(INITIAL_SNAKE),
    direction: null,
    score: 0,
    highScore: parseInt(localStorage.getItem('snakeHighScore') || '0'),
    isGameOver: false,
    isPaused: true,
    isWaitingForInput: true,
    isDrawing: false,
  }));

  const directionRef = useRef<Direction>(gameState.direction);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const setDrawing = useCallback((drawing: boolean) => {
    setGameState(prev => ({ ...prev, isDrawing: drawing }));
  }, []);

  const setDirection = useCallback((newDirection: Exclude<Direction, null>) => {
    const opposites: Record<Exclude<Direction, null>, Exclude<Direction, null>> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };

    // Allow first direction input even if waiting
    if (directionRef.current === null || opposites[newDirection] !== directionRef.current) {
      directionRef.current = newDirection;
      setGameState(prev => ({ 
        ...prev, 
        direction: newDirection,
        isWaitingForInput: false,
      }));
    }
  }, []);

  const moveSnake = useCallback(() => {
    setGameState(prev => {
      // Don't move if paused, game over, waiting for input, or currently drawing
      if (prev.isGameOver || prev.isPaused || prev.isWaitingForInput || prev.isDrawing || !directionRef.current) {
        return prev;
      }

      const head = prev.snake[0];
      const direction = directionRef.current;
      
      let newHead: Position;
      switch (direction) {
        case 'UP':
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case 'DOWN':
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case 'LEFT':
          newHead = { x: head.x - 1, y: head.y };
          break;
        case 'RIGHT':
          newHead = { x: head.x + 1, y: head.y };
          break;
      }

      // Check wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        const newHighScore = Math.max(prev.score, prev.highScore);
        localStorage.setItem('snakeHighScore', newHighScore.toString());
        return { ...prev, isGameOver: true, highScore: newHighScore };
      }

      // Check self collision
      if (prev.snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        const newHighScore = Math.max(prev.score, prev.highScore);
        localStorage.setItem('snakeHighScore', newHighScore.toString());
        return { ...prev, isGameOver: true, highScore: newHighScore };
      }

      // Check food collision
      const ateFood = newHead.x === prev.food.x && newHead.y === prev.food.y;
      
      const newSnake = [newHead, ...prev.snake];
      if (!ateFood) {
        newSnake.pop();
      }

      return {
        ...prev,
        snake: newSnake,
        food: ateFood ? getRandomPosition(newSnake) : prev.food,
        score: ateFood ? prev.score + 10 : prev.score,
      };
    });
  }, []);

  const startGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: false }));
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const resetGame = useCallback(() => {
    directionRef.current = null;
    setGameState(prev => ({
      snake: INITIAL_SNAKE,
      food: getRandomPosition(INITIAL_SNAKE),
      direction: null,
      score: 0,
      highScore: prev.highScore,
      isGameOver: false,
      isPaused: true,
      isWaitingForInput: true,
      isDrawing: false,
    }));
  }, []);

  useEffect(() => {
    if (!gameState.isPaused && !gameState.isGameOver) {
      gameLoopRef.current = setInterval(moveSnake, gameSpeed);
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState.isPaused, gameState.isGameOver, moveSnake, gameSpeed]);

  return {
    ...gameState,
    setDirection: setDirection as (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void,
    setDrawing,
    startGame,
    pauseGame,
    resetGame,
    gridSize: GRID_SIZE,
  };
};
