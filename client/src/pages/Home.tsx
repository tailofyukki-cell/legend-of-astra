// ============================================================
// Legend of Astra - Main Page
// Design: Neo-Retro Pixel Modern
// Entry point for the game
// ============================================================

import { useEffect } from 'react';
import { GameProvider, useGame } from '@/game/GameContext';
import TitleScreen from '@/components/game/TitleScreen';
import GameScreen from '@/components/game/GameScreen';
import { GameOverScreen, GameClearScreen } from '@/components/game/EndScreens';

function GameRoot() {
  const { gameState, setMapsData, setEnemiesData, setItemsData } = useGame();

  useEffect(() => {
    // Load game data
    Promise.all([
      fetch('/data/maps.json').then(r => r.json()),
      fetch('/data/enemies.json').then(r => r.json()),
      fetch('/data/items.json').then(r => r.json()),
    ]).then(([maps, enemies, items]) => {
      setMapsData(maps);
      setEnemiesData(enemies);
      setItemsData(items);
    }).catch(err => {
      console.error('Failed to load game data:', err);
    });
  }, []);

  return (
    <div
      className="w-screen h-screen overflow-hidden bg-gray-950"
      style={{ fontFamily: '"DotGothic16", monospace' }}
    >
      {gameState === 'title' && <TitleScreen />}
      {(gameState === 'field' || gameState === 'battle' || gameState === 'dialog' || gameState === 'shop' || gameState === 'inn') && <GameScreen />}
      {gameState === 'gameover' && <GameOverScreen />}
      {gameState === 'gameclear' && <GameClearScreen />}
    </div>
  );
}

export default function Home() {
  return (
    <GameProvider>
      <GameRoot />
    </GameProvider>
  );
}
