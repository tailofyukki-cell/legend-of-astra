// ============================================================
// Legend of Astra - EndScreens Component
// Design: Neo-Retro Pixel Modern
// Game Over and Game Clear screens
// ============================================================

import { useEffect, useState } from 'react';
import { useGame } from '@/game/GameContext';

export function GameOverScreen() {
  const { setGameState, player } = useGame();
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setBlink(b => !b), 700);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setGameState('field');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setGameState]);

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center bg-gray-950"
      style={{ fontFamily: '"DotGothic16", monospace' }}
    >
      <div className="text-center space-y-6">
        <div
          className="text-6xl font-bold"
          style={{
            color: '#ef4444',
            textShadow: '2px 2px 0 #000, 0 0 20px rgba(239,68,68,0.5)',
            fontFamily: '"Press Start 2P", "DotGothic16", monospace',
          }}
        >
          GAME
        </div>
        <div
          className="text-6xl font-bold"
          style={{
            color: '#ef4444',
            textShadow: '2px 2px 0 #000, 0 0 20px rgba(239,68,68,0.5)',
            fontFamily: '"Press Start 2P", "DotGothic16", monospace',
          }}
        >
          OVER
        </div>
        
        <div className="text-gray-400 text-sm mt-4">
          {player.name}は力尽きた...
        </div>
        <div className="text-gray-500 text-xs">
          HPが半分の状態でフィールドに戻ります
        </div>

        <div className={`mt-8 transition-opacity ${blink ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={() => setGameState('field')}
            className="px-6 py-3 bg-gray-800 border-2 border-gray-600 text-gray-300 text-sm hover:bg-gray-700 transition-colors"
          >
            Enter / つづける
          </button>
        </div>
      </div>
    </div>
  );
}

export function GameClearScreen() {
  const { setGameState, player } = useGame();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (phase >= 3 && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        setGameState('title');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, setGameState]);

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center bg-gray-950 overflow-hidden"
      style={{ fontFamily: '"DotGothic16", monospace' }}
    >
      {/* Stars */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: Math.random() * 0.8 + 0.2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center space-y-4 max-w-sm mx-4">
        {phase >= 1 && (
          <div
            className="text-4xl font-bold animate-fade-in"
            style={{
              color: '#ffd700',
              textShadow: '2px 2px 0 #000, 0 0 30px rgba(255,215,0,0.8)',
              fontFamily: '"Press Start 2P", "DotGothic16", monospace',
              fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
            }}
          >
            CONGRATULATIONS!
          </div>
        )}

        {phase >= 2 && (
          <div className="space-y-3 text-sm text-gray-200 leading-relaxed">
            <p>
              {player.name}は「闇の王ヴェイン」を打ち倒した！
            </p>
            <p className="text-yellow-300">
              アストラの大地に再び平和が訪れた。
            </p>
            <p className="text-gray-400 text-xs">
              ルーナ村の人々は勇者の帰還を喜び、<br />
              その名は永遠に語り継がれることだろう。
            </p>
          </div>
        )}

        {phase >= 2 && (
          <div className="bg-gray-900/80 border border-yellow-600/50 p-4 text-xs space-y-1">
            <div className="text-yellow-400 font-bold mb-2">冒険の記録</div>
            <div className="flex justify-between">
              <span className="text-gray-400">レベル</span>
              <span className="text-white">{player.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">HP</span>
              <span className="text-white">{player.hp} / {player.maxHp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">経験値</span>
              <span className="text-white">{player.exp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ゴールド</span>
              <span className="text-white">{player.gold} G</span>
            </div>
          </div>
        )}

        {phase >= 3 && (
          <div className="mt-4">
            <button
              onClick={() => setGameState('title')}
              className="px-6 py-3 bg-yellow-600 border-2 border-yellow-500 text-black font-bold text-sm hover:bg-yellow-500 transition-colors"
            >
              タイトルへもどる
            </button>
            <div className="text-gray-500 text-xs mt-2">Enter でもどる</div>
          </div>
        )}
      </div>
    </div>
  );
}
