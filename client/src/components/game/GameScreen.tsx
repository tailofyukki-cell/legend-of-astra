// ============================================================
// Legend of Astra - GameScreen Component
// Design: Neo-Retro Pixel Modern
// Main game screen with map, HUD, and keyboard controls
// ============================================================

import { useEffect, useRef, useCallback, useState } from 'react';
import { useGame } from '@/game/GameContext';
import MapCanvas from './MapCanvas';
import BattleScreen from './BattleScreen';
import DialogBox from './DialogBox';
import MenuScreen from './MenuScreen';

export default function GameScreen() {
  const {
    gameState, player, battleState, currentMap,
    movePlayer, openMenu, menuOpen
  } = useGame();
  const { handleInteract } = useGame();
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [dpadPressed, setDpadPressed] = useState<string | null>(null);
  const moveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (menuOpen || gameState === 'dialog' || gameState === 'battle' || gameState === 'shop' || gameState === 'inn') return;
    if (gameState !== 'field') return;

    switch (e.key) {
      case 'ArrowUp': case 'w': case 'W':
        e.preventDefault();
        movePlayer(0, -1);
        break;
      case 'ArrowDown': case 's': case 'S':
        e.preventDefault();
        movePlayer(0, 1);
        break;
      case 'ArrowLeft': case 'a': case 'A':
        e.preventDefault();
        movePlayer(-1, 0);
        break;
      case 'ArrowRight': case 'd': case 'D':
        e.preventDefault();
        movePlayer(1, 0);
        break;
      case 'Enter': case ' ': case 'z': case 'Z':
        e.preventDefault();
        handleInteract?.();
        break;
      case 'Escape': case 'x': case 'X':
        e.preventDefault();
        openMenu('status');
        break;
    }
  }, [gameState, menuOpen, movePlayer, handleInteract, openMenu]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Touch/swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    
    if (Math.max(absDx, absDy) < 20) {
      // Tap = interact
      handleInteract?.();
      return;
    }
    
    if (absDx > absDy) {
      movePlayer(dx > 0 ? 1 : -1, 0);
    } else {
      movePlayer(0, dy > 0 ? 1 : -1);
    }
    setTouchStart(null);
  };

  const startDpad = (dir: string) => {
    if (gameState !== 'field' || menuOpen) return;
    setDpadPressed(dir);
    const move = () => {
      if (dir === 'up') movePlayer(0, -1);
      else if (dir === 'down') movePlayer(0, 1);
      else if (dir === 'left') movePlayer(-1, 0);
      else if (dir === 'right') movePlayer(1, 0);
    };
    move();
    moveIntervalRef.current = setInterval(move, 200);
  };

  const stopDpad = () => {
    setDpadPressed(null);
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }
  };

  const hpPercent = (player.hp / player.maxHp) * 100;
  const mpPercent = (player.mp / player.maxMp) * 100;

  return (
    <div
      className="relative w-full h-full flex flex-col bg-gray-950"
      style={{ fontFamily: '"DotGothic16", monospace' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top HUD */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-900 border-b border-yellow-600/30 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-yellow-400 font-bold text-xs">{player.name}</span>
          <span className="text-gray-400 text-xs">Lv.{player.level}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-green-400 text-xs">HP</span>
            <div className="w-20 h-2.5 bg-gray-700 border border-gray-600">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${hpPercent}%`,
                  backgroundColor: hpPercent > 50 ? '#22c55e' : hpPercent > 25 ? '#eab308' : '#ef4444',
                }}
              />
            </div>
            <span className="text-white text-xs">{player.hp}/{player.maxHp}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-blue-400 text-xs">MP</span>
            <div className="w-14 h-2.5 bg-gray-700 border border-gray-600">
              <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${mpPercent}%` }} />
            </div>
            <span className="text-white text-xs">{player.mp}/{player.maxMp}</span>
          </div>
          <span className="text-yellow-300 text-xs">💰{player.gold}G</span>
        </div>
        <button
          onClick={() => openMenu('status')}
          className="px-2 py-0.5 bg-gray-700 border border-gray-600 text-gray-300 text-xs hover:bg-gray-600 transition-colors"
        >
          メニュー
        </button>
      </div>

      {/* Main game area */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center min-h-0">
        {(gameState === 'field' || gameState === 'dialog' || gameState === 'shop' || gameState === 'inn') && (
          <MapCanvas />
        )}
        {gameState === 'battle' && battleState && (
          <div className="absolute inset-0">
            <BattleScreen />
          </div>
        )}
        
        {/* Dialog overlay */}
        {(gameState === 'dialog' || gameState === 'shop' || gameState === 'inn') && (
          <div className="absolute inset-0">
            <DialogBox />
          </div>
        )}

        {/* Menu overlay */}
        {menuOpen && (
          <div className="absolute inset-0">
            <MenuScreen />
          </div>
        )}
      </div>

      {/* Bottom controls (mobile) */}
      <div className="shrink-0 bg-gray-900 border-t border-gray-700 p-2 flex items-center justify-between md:hidden">
        {/* D-pad */}
        <div className="relative w-28 h-28">
          {/* Up */}
          <button
            onPointerDown={() => startDpad('up')}
            onPointerUp={stopDpad}
            onPointerLeave={stopDpad}
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-9 h-9 border-2 flex items-center justify-center text-white font-bold transition-colors ${dpadPressed === 'up' ? 'bg-yellow-600 border-yellow-500' : 'bg-gray-700 border-gray-600'}`}
          >▲</button>
          {/* Down */}
          <button
            onPointerDown={() => startDpad('down')}
            onPointerUp={stopDpad}
            onPointerLeave={stopDpad}
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-9 h-9 border-2 flex items-center justify-center text-white font-bold transition-colors ${dpadPressed === 'down' ? 'bg-yellow-600 border-yellow-500' : 'bg-gray-700 border-gray-600'}`}
          >▼</button>
          {/* Left */}
          <button
            onPointerDown={() => startDpad('left')}
            onPointerUp={stopDpad}
            onPointerLeave={stopDpad}
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 border-2 flex items-center justify-center text-white font-bold transition-colors ${dpadPressed === 'left' ? 'bg-yellow-600 border-yellow-500' : 'bg-gray-700 border-gray-600'}`}
          >◀</button>
          {/* Right */}
          <button
            onPointerDown={() => startDpad('right')}
            onPointerUp={stopDpad}
            onPointerLeave={stopDpad}
            className={`absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 border-2 flex items-center justify-center text-white font-bold transition-colors ${dpadPressed === 'right' ? 'bg-yellow-600 border-yellow-500' : 'bg-gray-700 border-gray-600'}`}
          >▶</button>
          {/* Center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-gray-800 border-2 border-gray-600" />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 items-end">
          <button
            onPointerDown={() => handleInteract?.()}
            className="w-14 h-10 bg-yellow-600 border-2 border-yellow-500 text-black font-bold text-xs hover:bg-yellow-500 active:bg-yellow-700"
          >
            決定
          </button>
          <button
            onPointerDown={() => openMenu('status')}
            className="w-14 h-10 bg-gray-700 border-2 border-gray-600 text-white text-xs hover:bg-gray-600 active:bg-gray-800"
          >
            メニュー
          </button>
        </div>
      </div>

      {/* Keyboard hint (desktop) */}
      <div className="hidden md:flex shrink-0 items-center justify-center gap-4 py-1.5 bg-gray-900/50 border-t border-gray-800">
        <span className="text-gray-500 text-xs">矢印/WASD: 移動</span>
        <span className="text-gray-500 text-xs">Enter/Z: 決定・調べる</span>
        <span className="text-gray-500 text-xs">ESC/X: メニュー</span>
      </div>
    </div>
  );
}
