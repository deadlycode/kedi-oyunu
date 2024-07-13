import React, { useState, useEffect, useCallback } from 'react';

const GRAVITY = 0.6;
const JUMP_STRENGTH = -10;
const PIPE_WIDTH = 80;
const PIPE_GAP = 200;
const PIPE_SPEED = 3;
const CAT_WIDTH = 40;
const CAT_HEIGHT = 30;
const MIN_PIPE_HEIGHT = 50;
const PIPE_SPACING = 300;

type Title = {
  score: number;
  title: string;
};

const titles: Title[] = [
  { score: 0, title: "Yavru Kedi" },
  { score: 10, title: "Ev Kedisi" },
  { score: 20, title: "Sokak Kedisi" },
  { score: 30, title: "Mahalle Şampiyonu" },
  { score: 40, title: "Şehir Kaşifi" },
  { score: 50, title: "Bölge Kahramanı" },
  { score: 60, title: "Ulusal Yıldız" },
  { score: 70, title: "Dünya Yıldızı" },
  { score: 80, title: "Efsanevi Kedi" },
  { score: 90, title: "Uzay Kedisi" },
  { score: 100, title: "Galaksinin Koruyucusu" }
];

const getTitle = (score: number): string => {
  for (let i = titles.length - 1; i >= 0; i--) {
    if (score >= titles[i].score) {
      return titles[i].title;
    }
  }
  return titles[0].title;
};

const FlappyCat: React.FC = () => {
  const [gameSize, setGameSize] = useState<{ width: number; height: number }>({ width: window.innerWidth, height: window.innerHeight });
  const [catPosition, setCatPosition] = useState<number>(gameSize.height / 2);
  const [catVelocity, setCatVelocity] = useState<number>(0);
  const [catRotation, setCatRotation] = useState<number>(0);
  const [pipes, setPipes] = useState<{ x: number; height: number }[]>([]);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setGameSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const generatePipe = useCallback((xPosition: number): { x: number; height: number } => {
    const maxPipeHeight = gameSize.height - PIPE_GAP - MIN_PIPE_HEIGHT;
    const height = Math.random() * (maxPipeHeight - MIN_PIPE_HEIGHT) + MIN_PIPE_HEIGHT;
    return { x: xPosition, height: height };
  }, [gameSize.height]);

  const initializePipes = useCallback((): { x: number; height: number }[] => {
    const initialPipes = [];
    for (let i = 0; i < 3; i++) {
      initialPipes.push(generatePipe(gameSize.width + i * PIPE_SPACING));
    }
    return initialPipes;
  }, [gameSize.width, generatePipe]);

  const jump = useCallback(() => {
    if (!gameStarted) {
      setGameStarted(true);
      setPipes(initializePipes());
    }
    if (!gameOver) {
      setCatVelocity(JUMP_STRENGTH);
      setCatRotation(-45);
    }
  }, [gameStarted, gameOver, initializePipes]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        jump();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('touchstart', jump);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('touchstart', jump);
    };
  }, [jump]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const gameLoop = setInterval(() => {
        setCatPosition((prevPosition) => {
          const newPosition = prevPosition + catVelocity;
          if (newPosition > gameSize.height - CAT_HEIGHT || newPosition < 0) {
            setGameOver(true);
            return prevPosition;
          }
          return newPosition;
        });
        
        setCatVelocity((prevVelocity) => prevVelocity + GRAVITY);
        
        setCatRotation((prevRotation) => {
          if (prevRotation < 90) {
            return prevRotation + 4;
          }
          return 90;
        });
        
        setPipes((prevPipes) => {
          const newPipes = prevPipes.map((pipe) => ({
            ...pipe,
            x: pipe.x - PIPE_SPEED,
          })).filter((pipe) => pipe.x > -PIPE_WIDTH);
          
          if (newPipes.length < 3) {
            const lastPipe = newPipes[newPipes.length - 1];
            newPipes.push(generatePipe(lastPipe.x + PIPE_SPACING));
          }
          
          return newPipes;
        });
        
        setScore((prevScore) => {
          const passedPipe = pipes.find((pipe) => pipe.x + PIPE_WIDTH <= gameSize.width / 2 && pipe.x + PIPE_WIDTH > gameSize.width / 2 - PIPE_SPEED);
          return passedPipe ? prevScore + 1 : prevScore;
        });
        
        // Collision detection
        pipes.forEach((pipe) => {
          if (
            (catPosition < pipe.height || catPosition + CAT_HEIGHT > pipe.height + PIPE_GAP) &&
            pipe.x < gameSize.width / 2 + CAT_WIDTH / 2 && pipe.x + PIPE_WIDTH > gameSize.width / 2 - CAT_WIDTH / 2
          ) {
            setGameOver(true);
          }
        });
      }, 20);
      
      return () => clearInterval(gameLoop);
    }
  }, [gameStarted, gameOver, catPosition, catVelocity, pipes, gameSize, generatePipe]);

  const restartGame = () => {
    setCatPosition(gameSize.height / 2);
    setCatVelocity(0);
    setCatRotation(0);
    setPipes([]);
    setGameStarted(false);
    setScore(0);
    setGameOver(false);
  };

  return (
    <div 
      className="relative overflow-hidden w-screen h-screen"
      onClick={jump}
    >
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-blue-300 to-blue-500" />
      {pipes.map((pipe, index) => (
        <React.Fragment key={index}>
          <div className="absolute bg-green-600" style={{
            left: pipe.x,
            top: 0,
            width: PIPE_WIDTH,
            height: pipe.height
          }} />
          <div className="absolute bg-green-600" style={{
            left: pipe.x,
            top: pipe.height + PIPE_GAP,
            width: PIPE_WIDTH,
            height: gameSize.height - pipe.height - PIPE_GAP
          }} />
        </React.Fragment>
      ))}
      <div
        className="absolute text-4xl"
        style={{
          left: gameSize.width / 2 - CAT_WIDTH / 2,
          top: catPosition,
          transform: `translateY(-50%) rotate(${catRotation}deg)`,
        }}
      >
        🐱
      </div>
      <div className="absolute top-4 right-4 text-4xl font-bold text-white drop-shadow-md">
        {score}
      </div>
      {!gameStarted && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 text-white">
          <h1 className="text-6xl font-bold mb-8 animate-pulse">Uçan Kedi</h1>
          <p className="text-2xl mb-8">Başlamak için tıkla veya boşluk tuşuna bas</p>
          <div className="text-7xl animate-bounce">🐱</div>
        </div>
      )}
      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 text-white">
          <div className="text-4xl mb-4 font-bold">
            OYUN BİTTİ
          </div>
          <div className="text-2xl mb-2">
            Puan: {score}
          </div>
          <div className="text-xl mb-4">
            Unvan: {getTitle(score)}
          </div>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={restartGame}
          >
            Yeniden Başla
          </button>
        </div>
      )}
    </div>
  );
};

export default FlappyCat;