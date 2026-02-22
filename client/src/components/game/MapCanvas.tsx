// ============================================================
// Legend of Astra - MapCanvas Component
// Design: Neo-Retro Pixel Modern
// Renders tile-based map with player and objects using Canvas
// ============================================================

import { useEffect, useRef, useCallback } from 'react';
import { useGame } from '@/game/GameContext';

const TILE_SIZE = 32;
const VIEWPORT_COLS = 15;
const VIEWPORT_ROWS = 11;

// Tile color definitions
const TILE_COLORS: { [key: number]: { bg: string; border?: string; pattern?: string } } = {
  1: { bg: '#374151', border: '#4b5563' },   // mountain
  2: { bg: '#166534', border: '#15803d' },   // grass
  3: { bg: '#14532d', border: '#166534' },   // tree (dark green)
  4: { bg: '#1e40af', border: '#2563eb' },   // water
  5: { bg: '#6b7280', border: '#9ca3af' },   // stone floor
  6: { bg: '#78350f', border: '#92400e' },   // building
  7: { bg: '#1f2937', border: '#374151' },   // dungeon wall
  8: { bg: '#312e81', border: '#3730a3' },   // dungeon floor
};

// Tile decorations
function drawTile(ctx: CanvasRenderingContext2D, tileId: number, px: number, py: number, size: number) {
  const colors = TILE_COLORS[tileId] || { bg: '#111827' };
  ctx.fillStyle = colors.bg;
  ctx.fillRect(px, py, size, size);
  
  if (colors.border) {
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 0.5;
    ctx.strokeRect(px + 0.5, py + 0.5, size - 1, size - 1);
  }
  
  // Extra details
  if (tileId === 2) {
    // Grass texture dots
    ctx.fillStyle = '#15803d';
    ctx.fillRect(px + 4, py + 6, 2, 2);
    ctx.fillRect(px + 12, py + 10, 2, 2);
    ctx.fillRect(px + 20, py + 4, 2, 2);
    ctx.fillRect(px + 26, py + 14, 2, 2);
  } else if (tileId === 3) {
    // Tree
    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.moveTo(px + size / 2, py + 4);
    ctx.lineTo(px + size - 4, py + size - 4);
    ctx.lineTo(px + 4, py + size - 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#14532d';
    ctx.fillRect(px + size / 2 - 3, py + size - 8, 6, 8);
  } else if (tileId === 4) {
    // Water shimmer
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(px + 4, py + 8, size - 8, 2);
    ctx.fillRect(px + 6, py + 16, size - 12, 2);
    ctx.fillRect(px + 4, py + 24, size - 8, 2);
  } else if (tileId === 1) {
    // Mountain peaks
    ctx.fillStyle = '#4b5563';
    ctx.beginPath();
    ctx.moveTo(px + size / 2, py + 4);
    ctx.lineTo(px + size - 6, py + size - 4);
    ctx.lineTo(px + 6, py + size - 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#9ca3af';
    ctx.beginPath();
    ctx.moveTo(px + size / 2, py + 4);
    ctx.lineTo(px + size / 2 + 6, py + 14);
    ctx.lineTo(px + size / 2 - 6, py + 14);
    ctx.closePath();
    ctx.fill();
  } else if (tileId === 6) {
    // Building
    ctx.fillStyle = '#92400e';
    ctx.fillRect(px + 2, py + 2, size - 4, size - 4);
    // Roof
    ctx.fillStyle = '#b45309';
    ctx.fillRect(px + 2, py + 2, size - 4, 8);
    // Window
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(px + 8, py + 14, 6, 6);
    ctx.fillRect(px + size - 14, py + 14, 6, 6);
    // Door
    ctx.fillStyle = '#451a03';
    ctx.fillRect(px + size / 2 - 4, py + size - 10, 8, 10);
  } else if (tileId === 7) {
    // Dungeon wall - stone blocks
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 2, py + 2, size / 2 - 2, size / 2 - 2);
    ctx.strokeRect(px + size / 2, py + 2, size / 2 - 2, size / 2 - 2);
    ctx.strokeRect(px + 2, py + size / 2, size / 2 - 2, size / 2 - 2);
    ctx.strokeRect(px + size / 2, py + size / 2, size / 2 - 2, size / 2 - 2);
  } else if (tileId === 8) {
    // Dungeon floor - subtle pattern
    ctx.fillStyle = '#3730a3';
    ctx.fillRect(px + 2, py + 2, 4, 4);
    ctx.fillRect(px + size - 6, py + size - 6, 4, 4);
  } else if (tileId === 5) {
    // Stone floor - cobblestone
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(px + 2, py + 2, size / 2 - 2, size / 2 - 2);
    ctx.strokeRect(px + size / 2, py + 2, size / 2 - 2, size / 2 - 2);
    ctx.strokeRect(px + 2, py + size / 2, size / 2 - 2, size / 2 - 2);
    ctx.strokeRect(px + size / 2, py + size / 2, size / 2 - 2, size / 2 - 2);
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, px: number, py: number, size: number, frame: number) {
  const f = frame % 2;
  // Body
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(px + 8, py + 12, 16, 14);
  // Head
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(px + 10, py + 4, 12, 10);
  // Hair
  ctx.fillStyle = '#92400e';
  ctx.fillRect(px + 10, py + 2, 12, 4);
  // Eyes
  ctx.fillStyle = '#1e3a5f';
  ctx.fillRect(px + 12, py + 8, 3, 3);
  ctx.fillRect(px + 17, py + 8, 3, 3);
  // Cape
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(px + 6, py + 12, 4, 12);
  ctx.fillRect(px + 22, py + 12, 4, 12);
  // Legs
  ctx.fillStyle = '#1e40af';
  if (f === 0) {
    ctx.fillRect(px + 10, py + 24, 5, 6);
    ctx.fillRect(px + 17, py + 24, 5, 6);
  } else {
    ctx.fillRect(px + 9, py + 24, 5, 6);
    ctx.fillRect(px + 18, py + 24, 5, 6);
  }
  // Sword
  ctx.fillStyle = '#e5e7eb';
  ctx.fillRect(px + 24, py + 10, 3, 14);
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(px + 22, py + 14, 7, 3);
}

function drawNPC(ctx: CanvasRenderingContext2D, px: number, py: number, size: number, npcId: string) {
  if (npcId === 'elder') {
    // Elder - white robe, staff
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(px + 8, py + 12, 16, 14);
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(px + 10, py + 4, 12, 10);
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(px + 10, py + 2, 12, 4);
    ctx.fillStyle = '#374151';
    ctx.fillRect(px + 12, py + 8, 3, 3);
    ctx.fillRect(px + 17, py + 8, 3, 3);
    // Staff
    ctx.fillStyle = '#78350f';
    ctx.fillRect(px + 4, py + 6, 3, 22);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(px + 2, py + 4, 7, 4);
  } else if (npcId === 'merchant') {
    // Merchant - green clothes, bag
    ctx.fillStyle = '#166534';
    ctx.fillRect(px + 8, py + 12, 16, 14);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(px + 10, py + 4, 12, 10);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(px + 10, py + 2, 12, 4);
    ctx.fillStyle = '#374151';
    ctx.fillRect(px + 12, py + 8, 3, 3);
    ctx.fillRect(px + 17, py + 8, 3, 3);
    // Bag
    ctx.fillStyle = '#78350f';
    ctx.fillRect(px + 22, py + 14, 6, 8);
  } else {
    // Default NPC - innkeeper, pink dress
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(px + 8, py + 12, 16, 14);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(px + 10, py + 4, 12, 10);
    ctx.fillStyle = '#be185d';
    ctx.fillRect(px + 10, py + 2, 12, 4);
    ctx.fillStyle = '#374151';
    ctx.fillRect(px + 12, py + 8, 3, 3);
    ctx.fillRect(px + 17, py + 8, 3, 3);
  }
}

function drawChest(ctx: CanvasRenderingContext2D, px: number, py: number, size: number, opened: boolean) {
  if (opened) {
    ctx.fillStyle = '#78350f';
    ctx.fillRect(px + 4, py + 14, 24, 14);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(px + 4, py + 10, 24, 6);
    ctx.fillStyle = '#6b7280';
    ctx.fillRect(px + 13, py + 12, 6, 4);
  } else {
    ctx.fillStyle = '#92400e';
    ctx.fillRect(px + 4, py + 10, 24, 18);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(px + 4, py + 10, 24, 8);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(px + 13, py + 12, 6, 4);
    // Lock
    ctx.fillStyle = '#d97706';
    ctx.fillRect(px + 14, py + 20, 4, 4);
  }
}

function drawBoss(ctx: CanvasRenderingContext2D, px: number, py: number, size: number) {
  // Vein - dark lord
  ctx.fillStyle = '#1a0a2e';
  ctx.fillRect(px + 4, py + 8, 24, 20);
  // Cloak
  ctx.fillStyle = '#4c1d95';
  ctx.fillRect(px + 2, py + 8, 4, 20);
  ctx.fillRect(px + 26, py + 8, 4, 20);
  // Head
  ctx.fillStyle = '#1a0a2e';
  ctx.fillRect(px + 8, py + 2, 16, 10);
  // Crown
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(px + 8, py + 0, 3, 4);
  ctx.fillRect(px + 13, py + 0, 3, 6);
  ctx.fillRect(px + 18, py + 0, 3, 4);
  // Eyes (glowing red)
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(px + 10, py + 5, 4, 4);
  ctx.fillRect(px + 18, py + 5, 4, 4);
  // Sword
  ctx.fillStyle = '#7c3aed';
  ctx.fillRect(px + 28, py + 6, 3, 20);
  ctx.fillStyle = '#a78bfa';
  ctx.fillRect(px + 25, py + 10, 9, 3);
}

function drawSign(ctx: CanvasRenderingContext2D, px: number, py: number, size: number) {
  ctx.fillStyle = '#78350f';
  ctx.fillRect(px + 14, py + 16, 4, 14);
  ctx.fillStyle = '#92400e';
  ctx.fillRect(px + 6, py + 8, 20, 12);
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(px + 8, py + 10, 16, 8);
}

export default function MapCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const { player, currentMap, gameState } = useGame();

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentMap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    frameCountRef.current++;
    const frame = Math.floor(frameCountRef.current / 30);

    // Calculate viewport offset (center on player)
    const halfCols = Math.floor(VIEWPORT_COLS / 2);
    const halfRows = Math.floor(VIEWPORT_ROWS / 2);
    let camX = player.x - halfCols;
    let camY = player.y - halfRows;
    camX = Math.max(0, Math.min(camX, currentMap.width - VIEWPORT_COLS));
    camY = Math.max(0, Math.min(camY, currentMap.height - VIEWPORT_ROWS));

    const canvasW = VIEWPORT_COLS * TILE_SIZE;
    const canvasH = VIEWPORT_ROWS * TILE_SIZE;
    canvas.width = canvasW;
    canvas.height = canvasH;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvasW, canvasH);

    // Draw tiles
    for (let row = 0; row < VIEWPORT_ROWS; row++) {
      for (let col = 0; col < VIEWPORT_COLS; col++) {
        const mapX = camX + col;
        const mapY = camY + row;
        if (mapX < 0 || mapX >= currentMap.width || mapY < 0 || mapY >= currentMap.height) continue;
        const tileId = currentMap.tiles[mapY]?.[mapX];
        if (tileId === undefined) continue;
        const px = col * TILE_SIZE;
        const py = row * TILE_SIZE;
        drawTile(ctx, tileId, px, py, TILE_SIZE);
      }
    }

    // Draw objects
    for (const obj of currentMap.objects) {
      const screenX = obj.x - camX;
      const screenY = obj.y - camY;
      if (screenX < 0 || screenX >= VIEWPORT_COLS || screenY < 0 || screenY >= VIEWPORT_ROWS) continue;
      const px = screenX * TILE_SIZE;
      const py = screenY * TILE_SIZE;

      if (obj.type === 'sign') {
        drawSign(ctx, px, py, TILE_SIZE);
      } else if (obj.type === 'npc') {
        drawNPC(ctx, px, py, TILE_SIZE, obj.id || '');
        // Name tag
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(px - 4, py - 14, (obj.name?.length || 4) * 7 + 8, 13);
        ctx.fillStyle = '#fbbf24';
        ctx.font = '9px "DotGothic16", monospace';
        ctx.fillText(obj.name || '', px, py - 3);
      } else if (obj.type === 'chest') {
        const opened = player.openedChests.includes(obj.id || '');
        drawChest(ctx, px, py, TILE_SIZE, opened);
      } else if (obj.type === 'boss') {
        if (!player.defeatedBoss) {
          drawBoss(ctx, px, py, TILE_SIZE);
        }
      }
    }

    // Draw player
    const playerScreenX = player.x - camX;
    const playerScreenY = player.y - camY;
    if (playerScreenX >= 0 && playerScreenX < VIEWPORT_COLS && playerScreenY >= 0 && playerScreenY < VIEWPORT_ROWS) {
      drawPlayer(ctx, playerScreenX * TILE_SIZE, playerScreenY * TILE_SIZE, TILE_SIZE, frame);
    }

    // Map name overlay (top)
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, canvasW, 20);
    ctx.fillStyle = '#fbbf24';
    ctx.font = '11px "DotGothic16", monospace';
    ctx.fillText(currentMap.name, 8, 14);

    animFrameRef.current = requestAnimationFrame(render);
  }, [player, currentMap, gameState]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      width={VIEWPORT_COLS * TILE_SIZE}
      height={VIEWPORT_ROWS * TILE_SIZE}
      style={{
        imageRendering: 'pixelated',
        display: 'block',
      }}
      className="border-2 border-yellow-600/50"
    />
  );
}
