// ============================================================
// Legend of Astra - BattleScreen Component
// Design: Neo-Retro Pixel Modern
// Command-based turn battle system
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '@/game/GameContext';

const DUNGEON_BG = 'https://private-us-east-1.manuscdn.com/sessionFile/8GRMuRtgMFgHGVdehZiQDH/sandbox/pgxAd757nAjFgSe2N6fAZR-img-2_1771766156000_na1fn_YmF0dGxlLWJnLWR1bmdlb24.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvOEdSTXVSdGdNRmdIR1ZkZWhaaVFESC9zYW5kYm94L3BneEFkNzU3bkFqRmdTZTJONmZBWlItaW1nLTJfMTc3MTc2NjE1NjAwMF9uYTFmbl9ZbUYwZEd4bExXSm5MV1IxYm1kbGIyNC5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=KaD6rZi~WZArjaaFcNvdRvmWqzwJI1tiZMCyweyMcfMvkwCdH-jOyjG14mcxKN9-mfGJrQ4Vx2WzbdUZlZDxThPsuSbDGyawxfRnT-94Uh-sIWsm-vN0JoMGvBiU6GlxlneMMilj28FRPHIWNisH2YU6Vq9N~UBT11q~C6DQLbdEA-hP31Y094CvwxOwIhCBixS1N21P1ZViB9RdoXgrRvP0zDz5iOndsDrg~uQ99THuyBanpuBPYw0YYj9ODBzkS6y0WFrbeoFEbyiqNcH3baJ9PN1Aqs9-MIt~27TY4ldEar5UGKjOGrVd0OL0mVcCu33rf2nyFZ3H77DGKMvqQQ__';
const FIELD_BG = 'https://private-us-east-1.manuscdn.com/sessionFile/8GRMuRtgMFgHGVdehZiQDH/sandbox/pgxAd757nAjFgSe2N6fAZR-img-3_1771766147000_na1fn_YmF0dGxlLWJnLWZpZWxk.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvOEdSTXVSdGdNRmdIR1ZkZWhaaVFESC9zYW5kYm94L3BneEFkNzU3bkFqRmdTZTJONmZBWlItaW1nLTNfMTc3MTc2NjE0NzAwMF9uYTFmbl9ZbUYwZEd4bExXSm5MV1pwWld4ay5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=l9~6~ec0lPjVrY7jHaywUfnbXOQ2UE4XE6sX2Ttx6FITD6xUoVdN5mVVI-1OsPmaQBPKuq95Ef5uj8rgHijZhKjN260cFU3i~HbImQcmxks4ivGOy0sJrx52ITcRppaCA27PdK52HVUsQVBkPphxC8MW0ywqrunO1-kMrWAaom5uE4~CGE~TWr~yDu8GD2wdD26UZry0XJThwJTjO3J1GDOQR3njEZcRAariYdOHuZWIhTnv2cI0XpOSkw1XQguf8faL1KOCBR25acydXWmG6XxD-vx3UTJuoKdRWdwW-ksUHQ9ixXR1sNVepTgKiEfgq3VlAJrl4-uo8pJ~J3YlxQ__';

type BattlePhase = 'command' | 'magic' | 'item' | 'result' | 'enemy_action';

export default function BattleScreen() {
  const { player, battleState, executePlayerAction, itemsData, currentMap, setGameState } = useGame();
  const { endBattle } = useGame();
  const [selectedCmd, setSelectedCmd] = useState(0);
  const [selectedMagic, setSelectedMagic] = useState(0);
  const [selectedItem, setSelectedItem] = useState(0);
  const [selectedEnemy, setSelectedEnemy] = useState(0);
  const [phase, setPhase] = useState<BattlePhase>('command');
  const [showEnemySelect, setShowEnemySelect] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ action: string; subTarget?: string } | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const commands = ['たたかう', 'まほう', 'どうぐ', 'にげる'];
  const aliveEnemies = battleState?.enemies.filter(e => e.hp > 0) || [];
  const playerItems = Object.entries(player.inventory).filter(([, qty]) => qty > 0);
  const playerSpells = player.spells;

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [battleState?.log]);

  useEffect(() => {
    if (battleState?.phase === 'result') {
      setPhase('result');
    } else if (battleState?.phase === 'enemy_action') {
      setPhase('enemy_action');
    } else if (battleState?.phase === 'command') {
      setPhase('command');
      setSelectedCmd(0);
      setShowEnemySelect(false);
    }
  }, [battleState?.phase]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!battleState) return;

    if (phase === 'result') {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        endBattle(battleState.result || 'escape');
      }
      return;
    }

    if (phase === 'enemy_action') return;

    if (showEnemySelect) {
      if (e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault();
        setSelectedEnemy(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        e.preventDefault();
        setSelectedEnemy(prev => Math.min(aliveEnemies.length - 1, prev + 1));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (pendingAction) {
          executePlayerAction(pendingAction.action, selectedEnemy, pendingAction.subTarget);
          setShowEnemySelect(false);
          setPendingAction(null);
          setPhase('enemy_action');
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowEnemySelect(false);
        setPhase('command');
      }
      return;
    }

    if (phase === 'command') {
      if (e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault();
        setSelectedCmd(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        e.preventDefault();
        setSelectedCmd(prev => Math.min(commands.length - 1, prev + 1));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (selectedCmd === 0) {
          // Attack - select enemy
          if (aliveEnemies.length === 1) {
            executePlayerAction('attack', 0);
            setPhase('enemy_action');
          } else {
            setPendingAction({ action: 'attack' });
            setShowEnemySelect(true);
          }
        } else if (selectedCmd === 1) {
          setPhase('magic');
          setSelectedMagic(0);
        } else if (selectedCmd === 2) {
          setPhase('item');
          setSelectedItem(0);
        } else if (selectedCmd === 3) {
          executePlayerAction('escape');
          setPhase('enemy_action');
        }
      }
    } else if (phase === 'magic') {
      if (e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault();
        setSelectedMagic(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        e.preventDefault();
        setSelectedMagic(prev => Math.min(playerSpells.length - 1, prev + 1));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const spellId = playerSpells[selectedMagic];
        const spell = itemsData?.spells?.[spellId];
        if (spell) {
          if (spell.type === 'heal') {
            executePlayerAction('magic', 0, spellId);
            setPhase('enemy_action');
          } else if (aliveEnemies.length === 1) {
            executePlayerAction('magic', 0, spellId);
            setPhase('enemy_action');
          } else {
            setPendingAction({ action: 'magic', subTarget: spellId });
            setShowEnemySelect(true);
          }
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setPhase('command');
      }
    } else if (phase === 'item') {
      if (e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault();
        setSelectedItem(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        e.preventDefault();
        setSelectedItem(prev => Math.min(playerItems.length - 1, prev + 1));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const [itemId] = playerItems[selectedItem] || [];
        if (itemId) {
          executePlayerAction('item', 0, itemId);
          setPhase('enemy_action');
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setPhase('command');
      }
    }
  }, [battleState, phase, showEnemySelect, selectedCmd, selectedMagic, selectedItem, selectedEnemy, aliveEnemies, playerSpells, playerItems, pendingAction, executePlayerAction, endBattle]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!battleState) return null;

  const bgImage = currentMap?.battleBg === 'dungeon' ? DUNGEON_BG : FIELD_BG;
  const hpPercent = (player.hp / player.maxHp) * 100;
  const mpPercent = (player.mp / player.maxMp) * 100;

  return (
    <div className="relative w-full h-full flex flex-col" style={{ fontFamily: '"DotGothic16", monospace' }}>
      {/* Battle Background */}
      <div
        className="relative flex-1 flex flex-col"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: 0,
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
        
        {/* Enemy area */}
        <div className="relative z-10 flex-1 flex items-center justify-center gap-8 py-4">
          {battleState.enemies.map((enemy, idx) => {
            const isAlive = enemy.hp > 0;
            const isSelected = showEnemySelect && aliveEnemies.indexOf(enemy) === selectedEnemy;
            return (
              <div
                key={idx}
                className={`flex flex-col items-center transition-all duration-200 ${!isAlive ? 'opacity-0' : ''} ${isSelected ? 'scale-110' : ''}`}
              >
                {isSelected && (
                  <div className="text-yellow-400 text-lg mb-1 animate-bounce">▼</div>
                )}
                {/* Enemy sprite (pixel art style) */}
                <EnemySprite enemy={enemy} />
                <div className="mt-2 text-center">
                  <div className="text-white text-xs font-bold">{enemy.name}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-green-400 text-xs">HP</span>
                    <div className="w-20 h-2 bg-gray-800 border border-gray-600">
                      <div
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Battle UI bottom */}
      <div className="bg-gray-900 border-t-2 border-yellow-600/50 p-2">
        {/* Player status */}
        <div className="flex items-center gap-4 mb-2 px-2 py-1 bg-gray-800/80 border border-yellow-600/30">
          <span className="text-yellow-400 font-bold text-sm">{player.name}</span>
          <span className="text-gray-400 text-xs">Lv.{player.level}</span>
          <div className="flex items-center gap-1">
            <span className="text-green-400 text-xs">HP</span>
            <div className="w-24 h-3 bg-gray-700 border border-gray-600">
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
            <div className="w-16 h-3 bg-gray-700 border border-gray-600">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${mpPercent}%` }}
              />
            </div>
            <span className="text-white text-xs">{player.mp}/{player.maxMp}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Battle log */}
          <div
            ref={logRef}
            className="flex-1 bg-gray-950 border border-gray-700 p-2 h-24 overflow-y-auto text-xs text-gray-200 leading-relaxed"
          >
            {battleState.log.slice(-8).map((line, i) => (
              <div key={i} className={i === battleState.log.slice(-8).length - 1 ? 'text-white' : 'text-gray-400'}>
                {line}
              </div>
            ))}
          </div>

          {/* Command panel */}
          <div className="w-40 bg-gray-950 border border-yellow-600/50 p-2">
            {phase === 'command' && !showEnemySelect && (
              <div>
                <div className="text-yellow-400 text-xs mb-1 border-b border-yellow-600/30 pb-1">コマンド</div>
                {commands.map((cmd, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedCmd(i);
                      if (i === 0) {
                        if (aliveEnemies.length === 1) { executePlayerAction('attack', 0); setPhase('enemy_action'); }
                        else { setPendingAction({ action: 'attack' }); setShowEnemySelect(true); }
                      } else if (i === 1) { setPhase('magic'); setSelectedMagic(0); }
                      else if (i === 2) { setPhase('item'); setSelectedItem(0); }
                      else if (i === 3) { executePlayerAction('escape'); setPhase('enemy_action'); }
                    }}
                    className={`w-full text-left px-2 py-1 text-xs transition-colors ${selectedCmd === i ? 'bg-yellow-600 text-black font-bold' : 'text-white hover:bg-gray-800'}`}
                  >
                    {selectedCmd === i ? '▶ ' : '　'}{cmd}
                  </button>
                ))}
              </div>
            )}

            {phase === 'magic' && (
              <div>
                <div className="text-blue-400 text-xs mb-1 border-b border-blue-600/30 pb-1">まほう</div>
                {playerSpells.length === 0 ? (
                  <div className="text-gray-500 text-xs">魔法がない</div>
                ) : (
                  playerSpells.map((spellId, i) => {
                    const spell = itemsData?.spells?.[spellId];
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedMagic(i);
                          if (spell) {
                            if (spell.type === 'heal') { executePlayerAction('magic', 0, spellId); setPhase('enemy_action'); }
                            else if (aliveEnemies.length === 1) { executePlayerAction('magic', 0, spellId); setPhase('enemy_action'); }
                            else { setPendingAction({ action: 'magic', subTarget: spellId }); setShowEnemySelect(true); }
                          }
                        }}
                        className={`w-full text-left px-1 py-0.5 text-xs transition-colors ${selectedMagic === i ? 'bg-blue-700 text-white font-bold' : 'text-white hover:bg-gray-800'}`}
                      >
                        <span className="mr-1">{spell?.icon || '✨'}</span>
                        <span>{spell?.name || spellId}</span>
                        <span className="text-blue-400 ml-1">{spell?.mpCost}MP</span>
                      </button>
                    );
                  })
                )}
                <button onClick={() => setPhase('command')} className="w-full text-left px-2 py-0.5 text-xs text-gray-400 hover:text-white mt-1">← もどる</button>
              </div>
            )}

            {phase === 'item' && (
              <div>
                <div className="text-green-400 text-xs mb-1 border-b border-green-600/30 pb-1">どうぐ</div>
                {playerItems.length === 0 ? (
                  <div className="text-gray-500 text-xs">アイテムがない</div>
                ) : (
                  playerItems.map(([itemId, qty], i) => {
                    const item = itemsData?.items?.[itemId];
                    return (
                      <button
                        key={i}
                        onClick={() => { setSelectedItem(i); executePlayerAction('item', 0, itemId); setPhase('enemy_action'); }}
                        className={`w-full text-left px-1 py-0.5 text-xs transition-colors ${selectedItem === i ? 'bg-green-700 text-white font-bold' : 'text-white hover:bg-gray-800'}`}
                      >
                        <span className="mr-1">{item?.icon || '📦'}</span>
                        <span>{item?.name || itemId}</span>
                        <span className="text-gray-400 ml-1">×{qty}</span>
                      </button>
                    );
                  })
                )}
                <button onClick={() => setPhase('command')} className="w-full text-left px-2 py-0.5 text-xs text-gray-400 hover:text-white mt-1">← もどる</button>
              </div>
            )}

            {showEnemySelect && (
              <div>
                <div className="text-yellow-400 text-xs mb-1 border-b border-yellow-600/30 pb-1">対象を選べ</div>
                {aliveEnemies.map((enemy, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedEnemy(i);
                      if (pendingAction) {
                        executePlayerAction(pendingAction.action, i, pendingAction.subTarget);
                        setShowEnemySelect(false);
                        setPendingAction(null);
                        setPhase('enemy_action');
                      }
                    }}
                    className={`w-full text-left px-2 py-1 text-xs transition-colors ${selectedEnemy === i ? 'bg-yellow-600 text-black font-bold' : 'text-white hover:bg-gray-800'}`}
                  >
                    {selectedEnemy === i ? '▶ ' : '　'}{enemy.name}
                  </button>
                ))}
                <button onClick={() => { setShowEnemySelect(false); setPhase('command'); }} className="w-full text-left px-2 py-0.5 text-xs text-gray-400 hover:text-white mt-1">← もどる</button>
              </div>
            )}

            {phase === 'enemy_action' && (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-400 text-xs animate-pulse">敵のターン...</div>
              </div>
            )}

            {phase === 'result' && (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                {battleState.result === 'win' && (
                  <div className="text-yellow-400 text-sm font-bold text-center">勝利！</div>
                )}
                {battleState.result === 'lose' && (
                  <div className="text-red-400 text-sm font-bold text-center">敗北...</div>
                )}
                {battleState.result === 'escape' && (
                  <div className="text-gray-300 text-sm font-bold text-center">逃走！</div>
                )}
                <button
                  onClick={() => endBattle(battleState.result || 'escape')}
                  className="px-3 py-1 bg-yellow-600 text-black text-xs font-bold hover:bg-yellow-500 transition-colors"
                >
                  つづける
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EnemySprite({ enemy }: { enemy: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, 64, 80);
      drawEnemySprite(ctx, enemy, frame);
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [enemy]);

  return (
    <canvas
      ref={canvasRef}
      width={64}
      height={80}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}

function drawEnemySprite(ctx: CanvasRenderingContext2D, enemy: any, frame: number) {
  const f = Math.floor(frame / 20) % 2;
  const bob = f === 0 ? 0 : 2;
  const id = enemy.id;

  if (id === 'goblin') {
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(20, 10 + bob, 24, 30);
    ctx.fillStyle = '#86efac';
    ctx.fillRect(22, 4 + bob, 20, 14);
    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(26, 8 + bob, 4, 4);
    ctx.fillRect(34, 8 + bob, 4, 4);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(28, 14 + bob, 8, 3);
    ctx.fillStyle = '#166534';
    ctx.fillRect(16, 14 + bob, 6, 16);
    ctx.fillRect(42, 14 + bob, 6, 16);
    ctx.fillRect(22, 38 + bob, 8, 8);
    ctx.fillRect(34, 38 + bob, 8, 8);
  } else if (id === 'bat') {
    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(22, 20 + bob, 20, 16);
    ctx.fillStyle = '#6d28d9';
    ctx.fillRect(4, 16 + bob, 20, 10);
    ctx.fillRect(40, 16 + bob, 20, 10);
    ctx.fillStyle = '#a78bfa';
    ctx.fillRect(4, 16 + bob, 8, 4);
    ctx.fillRect(52, 16 + bob, 8, 4);
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(26, 22 + bob, 4, 4);
    ctx.fillRect(34, 22 + bob, 4, 4);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(28, 28 + bob, 8, 3);
  } else if (id === 'wolf') {
    ctx.fillStyle = '#6b7280';
    ctx.fillRect(12, 20 + bob, 40, 24);
    ctx.fillRect(20, 10 + bob, 24, 16);
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(22, 12 + bob, 20, 12);
    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(24, 16 + bob, 4, 4);
    ctx.fillRect(36, 16 + bob, 4, 4);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(26, 22 + bob, 12, 3);
    ctx.fillRect(12, 40 + bob, 8, 12);
    ctx.fillRect(24, 40 + bob, 8, 12);
    ctx.fillRect(32, 40 + bob, 8, 12);
    ctx.fillRect(44, 40 + bob, 8, 12);
    ctx.fillStyle = '#374151';
    ctx.fillRect(44, 16 + bob, 8, 6);
  } else if (id === 'skeleton') {
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(22, 16 + bob, 20, 28);
    ctx.fillRect(20, 6 + bob, 24, 14);
    ctx.fillStyle = '#374151';
    ctx.fillRect(24, 10 + bob, 5, 5);
    ctx.fillRect(35, 10 + bob, 5, 5);
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(14, 18 + bob, 10, 4);
    ctx.fillRect(40, 18 + bob, 10, 4);
    ctx.fillRect(22, 42 + bob, 8, 12);
    ctx.fillRect(34, 42 + bob, 8, 12);
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(26, 28 + bob, 12, 3);
    ctx.fillRect(26, 34 + bob, 12, 3);
  } else if (id === 'shadow') {
    ctx.fillStyle = 'rgba(88, 28, 135, 0.8)';
    ctx.fillRect(16, 16 + bob, 32, 36);
    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(20, 8 + bob, 24, 16);
    ctx.fillStyle = '#c4b5fd';
    ctx.fillRect(24, 12 + bob, 5, 5);
    ctx.fillRect(35, 12 + bob, 5, 5);
    ctx.fillStyle = '#4c1d95';
    ctx.fillRect(10, 10 + bob, 12, 30);
    ctx.fillRect(42, 10 + bob, 12, 30);
  } else if (id === 'golem') {
    ctx.fillStyle = '#6b7280';
    ctx.fillRect(10, 14 + bob, 44, 40);
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(14, 6 + bob, 36, 16);
    ctx.fillStyle = '#374151';
    ctx.fillRect(18, 10 + bob, 8, 8);
    ctx.fillRect(38, 10 + bob, 8, 8);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(20, 12 + bob, 4, 4);
    ctx.fillRect(40, 12 + bob, 4, 4);
    ctx.fillStyle = '#4b5563';
    ctx.fillRect(6, 16 + bob, 10, 24);
    ctx.fillRect(48, 16 + bob, 10, 24);
    ctx.fillRect(18, 52 + bob, 12, 16);
    ctx.fillRect(34, 52 + bob, 12, 16);
  } else if (id === 'vein') {
    // Boss - Vein
    ctx.fillStyle = '#1a0a2e';
    ctx.fillRect(16, 14 + bob, 32, 36);
    ctx.fillStyle = '#4c1d95';
    ctx.fillRect(8, 14 + bob, 10, 36);
    ctx.fillRect(46, 14 + bob, 10, 36);
    ctx.fillStyle = '#1a0a2e';
    ctx.fillRect(18, 4 + bob, 28, 14);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(18, 2 + bob, 6, 6);
    ctx.fillRect(27, 0 + bob, 10, 8);
    ctx.fillRect(40, 2 + bob, 6, 6);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(22, 8 + bob, 6, 6);
    ctx.fillRect(36, 8 + bob, 6, 6);
    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(54, 6 + bob, 4, 28);
    ctx.fillStyle = '#a78bfa';
    ctx.fillRect(50, 12 + bob, 12, 4);
    ctx.fillStyle = '#4c1d95';
    ctx.fillRect(20, 48 + bob, 10, 16);
    ctx.fillRect(34, 48 + bob, 10, 16);
  } else {
    // Default enemy
    ctx.fillStyle = enemy.color || '#6b7280';
    ctx.fillRect(20, 10 + bob, 24, 30);
    ctx.fillRect(22, 4 + bob, 20, 14);
    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(26, 8 + bob, 4, 4);
    ctx.fillRect(34, 8 + bob, 4, 4);
  }
}
