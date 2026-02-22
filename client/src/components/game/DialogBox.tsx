// ============================================================
// Legend of Astra - DialogBox Component
// Design: Neo-Retro Pixel Modern
// NPC dialog, shop, inn UI
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/game/GameContext';
import { saveGame } from '@/game/GameEngine';

export default function DialogBox() {
  const { gameState, dialogState, player, itemsData, advanceDialog, setGameState, updatePlayer } = useGame();
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [shopTab, setShopTab] = useState<'buy' | 'sell'>('buy');
  const [shopMessage, setShopMessage] = useState('');

  const currentLine = dialogState?.lines[dialogState.currentLine] || '';

  // Typewriter effect
  useEffect(() => {
    if (!dialogState || gameState !== 'dialog') return;
    setDisplayedText('');
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < currentLine.length) {
        setDisplayedText(currentLine.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [dialogState?.currentLine, currentLine, gameState]);

  const handleAdvance = useCallback(() => {
    if (isTyping) {
      setDisplayedText(currentLine);
      setIsTyping(false);
      return;
    }
    advanceDialog();
  }, [isTyping, currentLine, advanceDialog]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameState === 'dialog') {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'z') {
          e.preventDefault();
          handleAdvance();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState, handleAdvance]);

  if (gameState === 'shop') {
    return <ShopScreen />;
  }

  if (gameState === 'inn') {
    return <InnScreen />;
  }

  if (gameState !== 'dialog' || !dialogState) return null;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-50"
      style={{ fontFamily: '"DotGothic16", monospace' }}
    >
      <div
        className="mx-2 mb-2 bg-gray-950 border-2 border-yellow-600/70 p-3 cursor-pointer"
        onClick={handleAdvance}
      >
        {dialogState.speaker && (
          <div className="text-yellow-400 text-xs font-bold mb-1 border-b border-yellow-600/30 pb-1">
            {dialogState.speaker}
          </div>
        )}
        <div className="text-white text-sm leading-relaxed min-h-[3em] whitespace-pre-line">
          {displayedText}
          {isTyping && <span className="animate-pulse">▌</span>}
        </div>
        <div className="text-right mt-1">
          {!isTyping && (
            <span className="text-yellow-400 text-xs animate-bounce inline-block">
              {dialogState.currentLine < dialogState.lines.length - 1 ? '▼ つぎへ' : '▼ とじる'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ShopScreen() {
  const { player, itemsData, setGameState, updatePlayer } = useGame();
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [message, setMessage] = useState('いらっしゃいませ！何を買いますか？');
  const [selectedBuy, setSelectedBuy] = useState(0);
  const [selectedSell, setSelectedSell] = useState(0);

  const shopItems = itemsData?.shopInventory?.village || [];
  const playerItems = Object.entries(player.inventory).filter(([, qty]) => (qty as number) > 0);

  const buyItem = (itemId: string) => {
    const item = itemsData?.items?.[itemId];
    if (!item) return;
    if (player.gold < item.price) {
      setMessage('ゴールドが足りません！');
      return;
    }
    const newInventory = { ...player.inventory, [itemId]: (player.inventory[itemId] || 0) + 1 };
    const newPlayer = { ...player, gold: player.gold - item.price, inventory: newInventory };
    updatePlayer(newPlayer);
    setMessage(`${item.name}を買った！（残り${newPlayer.gold}G）`);
  };

  const sellItem = (itemId: string) => {
    const item = itemsData?.items?.[itemId];
    if (!item) return;
    const newInventory = { ...player.inventory, [itemId]: (player.inventory[itemId] || 0) - 1 };
    if (newInventory[itemId] <= 0) delete newInventory[itemId];
    const newPlayer = { ...player, gold: player.gold + item.sellPrice, inventory: newInventory };
    updatePlayer(newPlayer);
    setMessage(`${item.name}を売った！（${item.sellPrice}G）`);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setGameState('field');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setGameState]);

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/70"
      style={{ fontFamily: '"DotGothic16", monospace' }}
    >
      <div className="bg-gray-950 border-2 border-yellow-600/70 p-4 w-80 max-w-full">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-yellow-400 font-bold text-sm">🏪 道具屋</h2>
          <span className="text-yellow-300 text-xs">💰 {player.gold}G</span>
        </div>
        
        <div className="text-gray-300 text-xs mb-3 bg-gray-900 p-2 border border-gray-700">
          {message}
        </div>

        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setTab('buy')}
            className={`flex-1 py-1 text-xs font-bold border ${tab === 'buy' ? 'bg-yellow-600 text-black border-yellow-500' : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700'}`}
          >
            かう
          </button>
          <button
            onClick={() => setTab('sell')}
            className={`flex-1 py-1 text-xs font-bold border ${tab === 'sell' ? 'bg-yellow-600 text-black border-yellow-500' : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700'}`}
          >
            うる
          </button>
        </div>

        {tab === 'buy' && (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {shopItems.map((itemId: string, i: number) => {
              const item = itemsData?.items?.[itemId];
              if (!item) return null;
              const canAfford = player.gold >= item.price;
              return (
                <button
                  key={i}
                  onClick={() => buyItem(itemId)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 text-xs border transition-colors ${canAfford ? 'border-gray-700 hover:bg-gray-800 text-white' : 'border-gray-800 text-gray-600 cursor-not-allowed'}`}
                >
                  <span>{item.icon} {item.name}</span>
                  <span className={canAfford ? 'text-yellow-400' : 'text-gray-600'}>{item.price}G</span>
                </button>
              );
            })}
          </div>
        )}

        {tab === 'sell' && (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {playerItems.length === 0 ? (
              <div className="text-gray-500 text-xs text-center py-4">売るものがない</div>
            ) : (
              playerItems.map(([itemId, qty], i) => {
                const item = itemsData?.items?.[itemId];
                if (!item) return null;
                return (
                  <button
                    key={i}
                    onClick={() => sellItem(itemId)}
                    className="w-full flex items-center justify-between px-2 py-1.5 text-xs border border-gray-700 hover:bg-gray-800 text-white transition-colors"
                  >
                    <span>{item.icon} {item.name} ×{qty as number}</span>
                    <span className="text-yellow-400">{item.sellPrice}G</span>
                  </button>
                );
              })
            )}
          </div>
        )}

        <button
          onClick={() => setGameState('field')}
          className="w-full mt-3 py-1.5 bg-gray-800 border border-gray-600 text-gray-300 text-xs hover:bg-gray-700 transition-colors"
        >
          ESC / とじる
        </button>
      </div>
    </div>
  );
}

function InnScreen() {
  const { player, setGameState, updatePlayer } = useGame();
  const [healed, setHealed] = useState(false);
  const cost = 10;

  const rest = () => {
    if (player.gold < cost) return;
    const newPlayer = {
      ...player,
      hp: player.maxHp,
      mp: player.maxMp,
      gold: player.gold - cost,
    };
    updatePlayer(newPlayer);
    saveGame(newPlayer);
    setHealed(true);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setGameState('field');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setGameState]);

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/70"
      style={{ fontFamily: '"DotGothic16", monospace' }}
    >
      <div className="bg-gray-950 border-2 border-yellow-600/70 p-6 w-72 text-center">
        <h2 className="text-yellow-400 font-bold text-sm mb-3">🌙 星月亭</h2>
        
        {healed ? (
          <div>
            <div className="text-green-400 text-sm mb-3 whitespace-pre-line">{`ぐっすり眠れた！
HPとMPが全回復した！`}</div>
            <div className="text-gray-400 text-xs">セーブしました。</div>
            <button onClick={() => setGameState('field')} className="w-full mt-3 py-1.5 bg-yellow-600 text-black text-xs font-bold hover:bg-yellow-500">フィールドへ</button>
          </div>
        ) : (
          <>
            <div className="text-gray-300 text-xs mb-4">
              一泊{cost}ゴールドです。<br />お泊まりになりますか？
            </div>
            <div className="text-yellow-300 text-xs mb-4">所持金: {player.gold}G</div>
            <div className="flex gap-2">
              <button
                onClick={rest}
                disabled={player.gold < cost}
                className={`flex-1 py-2 text-xs font-bold border ${player.gold >= cost ? 'bg-yellow-600 text-black border-yellow-500 hover:bg-yellow-500' : 'bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed'}`}
              >
                はい ({cost}G)
              </button>
              <button
                onClick={() => setGameState('field')}
                className="flex-1 py-2 text-xs font-bold bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700"
              >
                いいえ
              </button>
            </div>
          </>
        )}
        
        <button
          onClick={() => setGameState('field')}
          className="w-full mt-3 py-1 bg-transparent border border-gray-700 text-gray-500 text-xs hover:text-gray-300"
        >
          ESC / もどる
        </button>
      </div>
    </div>
  );
}
