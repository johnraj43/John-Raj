import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Point } from '../types';
import { GAME_CONFIG } from '../constants';
import { RotateCcw, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SnakeGameProps {
  onScoreUpdate: (score: number) => void;
}

const SnakeGame: React.FC<SnakeGameProps> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Point>({ x: 0, y: -1 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GAME_CONFIG.GRID_SIZE),
        y: Math.floor(Math.random() * GAME_CONFIG.GRID_SIZE),
      };
      const isColliding = currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
      if (!isColliding) break;
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood([{ x: 10, y: 10 }]));
    setDirection({ x: 0, y: -1 });
    setIsGameOver(false);
    setScore(0);
    setIsPaused(false);
    onScoreUpdate(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        case ' ':
          if (isPaused || isGameOver) resetGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, isPaused, isGameOver]);

  useEffect(() => {
    if (isPaused || isGameOver) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + direction.x,
          y: head.y + direction.y,
        };

        // Check walls
        if (
          newHead.x < 0 ||
          newHead.x >= GAME_CONFIG.GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GAME_CONFIG.GRID_SIZE
        ) {
          setIsGameOver(true);
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setIsGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food
        if (newHead.x === food.x && newHead.y === food.y) {
          const newScore = score + 10;
          setScore(newScore);
          onScoreUpdate(newScore);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const gameInterval = setInterval(moveSnake, Math.max(50, GAME_CONFIG.INITIAL_SPEED - score * 0.2));
    return () => clearInterval(gameInterval);
  }, [direction, food, isPaused, isGameOver, score, onScoreUpdate, generateFood]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width / GAME_CONFIG.GRID_SIZE;

    // Clear canvas
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid (Subtle as per theme opacity 20%)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GAME_CONFIG.GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * size, 0);
      ctx.lineTo(i * size, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * size);
      ctx.lineTo(canvas.width, i * size);
      ctx.stroke();
    }

    // Draw Food (Rose #f43f5e rounded)
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#f43f5e';
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(food.x * size + size / 2, food.y * size + size / 2, size / 3, 0, Math.PI * 2);
    ctx.fill();

    // Draw Snake (Cyan #22d3ee)
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#22d3ee';
    ctx.fillStyle = '#22d3ee';
    snake.forEach((segment, index) => {
      const isHead = index === 0;
      if (isHead) {
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#22d3ee';
      } else {
        ctx.shadowBlur = 5;
        ctx.fillStyle = 'rgba(34, 211, 238, 0.8)';
      }
      
      const x = segment.x * size + 0.5;
      const y = segment.y * size + 0.5;
      const w = size - 1;
      const h = size - 1;
      
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);
    });

    // Reset shadow
    ctx.shadowBlur = 0;
  }, [snake, food]);

  return (
    <div className="relative">
      <div className="relative bg-black/40 border-2 border-white/5 shadow-2xl rounded-sm p-1 leading-none">
        <canvas
          ref={canvasRef}
          width={480}
          height={480}
          className="block touch-none max-w-full h-auto"
        />

        {/* Gradient Overlay from theme */}
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent pointer-events-none"></div>

        <AnimatePresence>
          {(isPaused || isGameOver) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm"
            >
              {isGameOver ? (
                <div className="text-center p-8 border border-white/5 bg-[#0d0d10]/90 rounded-lg">
                  <h2 className="mb-2 text-2xl font-bold text-rose-500 uppercase tracking-[0.2em]">Connection Lost</h2>
                  <p className="mb-6 text-white/40 font-mono text-xs uppercase tracking-widest">Neural link severed.</p>
                  <button
                    onClick={resetGame}
                    className="flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-400 text-white rounded transition-all active:scale-95 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                  >
                    <RotateCcw size={18} />
                    <span className="font-bold uppercase text-xs tracking-[0.2em]">Relaunch Protocol</span>
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <button
                    onClick={() => setIsPaused(false)}
                    className="w-20 h-20 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:scale-110 active:scale-95 transition-all group"
                  >
                    <Play size={32} fill="currentColor" className="ml-1" />
                  </button>
                  <p className="mt-8 text-white/40 text-[10px] uppercase font-bold tracking-[0.4em] animate-pulse">Press to Initiate Sync</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SnakeGame;
