// ============================================================
// Legend of Astra - MenuScreen Component
// Design: Neo-Retro Pixel Modern
// Status / Magic / Item menu
// ============================================================

import { useEffect } from 'react';
import { useGame } from '@/game/GameContext';

export default function MenuScreen() {
  const { player, menuOpen, menuTab, closeMenu, setMenuTab, useItemFromMenu, itemsData } = useGame();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!menuOpen) return;
      if (e.key === 'Escape' || e.key === 'x') {
        e.preventDefault();
        closeMenu();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [menuOpen, closeMenu]);

  if (!menuOpen) return null;

  const playerItems = Object.entries(player.inventory).filter(([, qty]) => (qty as number) > 0);

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/60"
      style={{ fontFamily: '"DotGothic16", monospace' }}
    >
      <div className="bg-gray-950 border-2 border-yellow-600/70 w-80 max-w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-yellow-600/30">
          <h2 className="text-yellow-400 font-bold text-sm">メニュー</h2>
          <button onClick={closeMenu} className="text-gray-400 hover:text-white text-xs">ESC / とじる</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {(['status', 'magic', 'item'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setMenuTab(tab)}
              className={`flex-1 py-2 text-xs font-bold transition-colors ${menuTab === tab ? 'bg-yellow-600 text-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              {tab === 'status' ? 'ステータス' : tab === 'magic' ? 'まほう' : 'どうぐ'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {menuTab === 'status' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-900 border border-blue-600 flex items-center justify-center text-2xl">
                  ⚔️
                </div>
                <div>
                  <div className="text-white font-bold text-sm">{player.name}</div>
                  <div className="text-yellow-400 text-xs">Lv. {player.level}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <StatBar label="HP" current={player.hp} max={player.maxHp} color="#22c55e" />
                <StatBar label="MP" current={player.mp} max={player.maxMp} color="#3b82f6" />
              </div>
              
              <div className="bg-gray-900 border border-gray-700 p-3 space-y-1.5">
                <StatRow label="こうげき" value={player.attack} />
                <StatRow label="ぼうぎょ" value={player.defense} />
                <StatRow label="すばやさ" value={player.speed} />
                <div className="border-t border-gray-700 pt-1.5 mt-1.5">
                  <StatRow label="けいけんち" value={`${player.exp} / ${player.nextExp}`} />
                  <StatRow label="ゴールド" value={`${player.gold} G`} />
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-700 p-2">
                <div className="text-gray-400 text-xs mb-1">つぎのレベルまで</div>
                <div className="w-full h-3 bg-gray-700 border border-gray-600">
                  <div
                    className="h-full bg-yellow-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, (player.exp / player.nextExp) * 100)}%` }}
                  />
                </div>
                <div className="text-right text-xs text-gray-400 mt-0.5">
                  {Math.max(0, player.nextExp - player.exp)} EXP
                </div>
              </div>
            </div>
          )}

          {menuTab === 'magic' && (
            <div className="space-y-2">
              <div className="text-blue-400 text-xs mb-2">MP: {player.mp} / {player.maxMp}</div>
              {player.spells.length === 0 ? (
                <div className="text-gray-500 text-xs text-center py-8">まほうを覚えていない</div>
              ) : (
                player.spells.map(spellId => {
                  const spell = itemsData?.spells?.[spellId];
                  if (!spell) return null;
                  const canUse = player.mp >= spell.mpCost;
                  return (
                    <div
                      key={spellId}
                      className={`flex items-center justify-between p-2 border ${canUse ? 'border-blue-700/50 bg-blue-950/30' : 'border-gray-700 bg-gray-900/30 opacity-50'}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{spell.icon}</span>
                        <div>
                          <div className="text-white text-xs font-bold">{spell.name}</div>
                          <div className="text-gray-400 text-xs">{spell.description}</div>
                        </div>
                      </div>
                      <div className="text-blue-400 text-xs">{spell.mpCost}MP</div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {menuTab === 'item' && (
            <div className="space-y-2">
              {playerItems.length === 0 ? (
                <div className="text-gray-500 text-xs text-center py-8">アイテムを持っていない</div>
              ) : (
                playerItems.map(([itemId, qty]) => {
                  const item = itemsData?.items?.[itemId];
                  if (!item) return null;
                  return (
                    <div
                      key={itemId}
                      className="flex items-center justify-between p-2 border border-green-700/40 bg-green-950/20 hover:bg-green-900/30 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.icon}</span>
                        <div>
                          <div className="text-white text-xs font-bold">{item.name}</div>
                          <div className="text-gray-400 text-xs">{item.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 text-xs">×{qty as number}</span>
                        <button
                          onClick={() => useItemFromMenu(itemId)}
                          className="px-2 py-0.5 bg-green-700 text-white text-xs hover:bg-green-600 transition-colors"
                        >
                          つかう
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBar({ label, current, max, color }: { label: string; current: number; max: number; color: string }) {
  return (
    <div className="bg-gray-900 border border-gray-700 p-2">
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color }}>{label}</span>
        <span className="text-white">{current}/{max}</span>
      </div>
      <div className="w-full h-2 bg-gray-700">
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${(current / max) * 100}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-gray-400">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}
