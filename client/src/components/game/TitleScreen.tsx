// ============================================================
// Legend of Astra - TitleScreen Component
// Design: Neo-Retro Pixel Modern
// Title screen with start/continue/help
// ============================================================

import { useState, useEffect } from 'react';
import { useGame } from '@/game/GameContext';

const TITLE_BG = 'https://private-us-east-1.manuscdn.com/sessionFile/8GRMuRtgMFgHGVdehZiQDH/sandbox/pgxAd757nAjFgSe2N6fAZR-img-1_1771766152000_na1fn_dGl0bGUtYmc.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvOEdSTXVSdGdNRmdIR1ZkZWhaaVFESC9zYW5kYm94L3BneEFkNzU3bkFqRmdTZTJONmZBWlItaW1nLTFfMTc3MTc2NjE1MjAwMF9uYTFmbl9kR2wwYkdVdFltYy5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=gfwBDL4Ri8I0eOYOfdsHcBdbmtixrqk4wzXTa~9YvvcNt9riMqtyXn6KqE1N7HZPbA9K9QMaQZlgl1rYNKJPyunK1uzdG4REv6S5hox3zMynxLnRJKllBThPz4aMs-Em3JKqdo3Ur5rGFhUc09E-Vl4umdXcb38aY8Mdemi26ChvxXtgma1g9-yGgM6OcbEfeOkeZlwxezvDAlS18QQWCLChn~a-h2m8TwzlySvULDe0jGvM8OVErdCcA1kx4SwbNGVjB7Ft-gKDQ2GKHs2PP2fLfmO-90J9ACSO1XeY9oaWBveT7cdKJrwf4-VWK9g8iEQ7zvYcPQZC4Y~wE~s-Ug__';

type TitleTab = 'main' | 'help';

export default function TitleScreen() {
  const { startNewGame, loadSavedGame, hasSave } = useGame();
  const [tab, setTab] = useState<TitleTab>('main');
  const [selectedMenu, setSelectedMenu] = useState(0);
  const [blink, setBlink] = useState(true);
  const hasSaveData = hasSave();

  const menuItems = [
    { label: 'はじめから', action: startNewGame },
    ...(hasSaveData ? [{ label: 'つづきから', action: loadSavedGame }] : []),
    { label: 'あそびかた', action: () => setTab('help') },
  ];

  useEffect(() => {
    const interval = setInterval(() => setBlink(b => !b), 600);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (tab === 'help') {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setTab('main');
        }
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault();
        setSelectedMenu(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        e.preventDefault();
        setSelectedMenu(prev => Math.min(menuItems.length - 1, prev + 1));
      } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'z') {
        e.preventDefault();
        menuItems[selectedMenu]?.action();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [tab, selectedMenu, menuItems]);

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
      style={{ fontFamily: '"DotGothic16", monospace' }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${TITLE_BG})` }}
      />
      <div className="absolute inset-0 bg-black/40" />

      {tab === 'main' && (
        <div className="relative z-10 flex flex-col items-center gap-8">
          {/* Title */}
          <div className="text-center">
            <div
              className="text-5xl font-bold mb-2 drop-shadow-lg"
              style={{
                color: '#ffd700',
                textShadow: '2px 2px 0 #000, 4px 4px 0 rgba(0,0,0,0.5)',
                fontFamily: '"Press Start 2P", "DotGothic16", monospace',
                letterSpacing: '0.05em',
                lineHeight: '1.3',
              }}
            >
              Legend
            </div>
            <div
              className="text-3xl font-bold drop-shadow-lg"
              style={{
                color: '#ffd700',
                textShadow: '2px 2px 0 #000, 4px 4px 0 rgba(0,0,0,0.5)',
                fontFamily: '"Press Start 2P", "DotGothic16", monospace',
              }}
            >
              of Astra
            </div>
            <div className="text-gray-300 text-sm mt-2 drop-shadow">
              〜 星の伝説 〜
            </div>
          </div>

          {/* Menu */}
          <div className="bg-gray-950/90 border-2 border-yellow-600/70 px-8 py-4 min-w-[200px]">
            {menuItems.map((item, i) => (
              <button
                key={i}
                onClick={item.action}
                onMouseEnter={() => setSelectedMenu(i)}
                className={`w-full text-left py-2 px-2 text-sm transition-colors ${selectedMenu === i ? 'text-yellow-400 font-bold' : 'text-gray-300 hover:text-white'}`}
              >
                {selectedMenu === i ? '▶ ' : '　'}{item.label}
              </button>
            ))}
          </div>

          <div className={`text-gray-400 text-xs transition-opacity ${blink ? 'opacity-100' : 'opacity-0'}`}>
            Enter / クリック で決定
          </div>
        </div>
      )}

      {tab === 'help' && (
        <div className="relative z-10 bg-gray-950/95 border-2 border-yellow-600/70 p-6 max-w-sm w-full mx-4">
          <h2 className="text-yellow-400 font-bold text-sm mb-4 border-b border-yellow-600/30 pb-2">
            あそびかた
          </h2>
          <div className="space-y-3 text-xs text-gray-300">
            <div>
              <div className="text-yellow-400 mb-1">【移動】</div>
              <div>矢印キー / WASD で移動</div>
              <div>スマホ：スワイプまたは仮想パッド</div>
            </div>
            <div>
              <div className="text-yellow-400 mb-1">【決定・調べる】</div>
              <div>Enter / Space / Z キー</div>
              <div>NPCや宝箱に近づいて押す</div>
            </div>
            <div>
              <div className="text-yellow-400 mb-1">【メニュー】</div>
              <div>ESC / X キー</div>
              <div>ステータス・まほう・どうぐを確認</div>
            </div>
            <div>
              <div className="text-yellow-400 mb-1">【戦闘】</div>
              <div>フィールドを歩くとランダムで発生</div>
              <div>たたかう / まほう / どうぐ / にげる</div>
            </div>
            <div>
              <div className="text-yellow-400 mb-1">【目標】</div>
              <div>「影の洞窟」の奥にいる</div>
              <div>「闇の王ヴェイン」を倒せ！</div>
            </div>
            <div>
              <div className="text-yellow-400 mb-1">【セーブ】</div>
              <div>村の宿屋で泊まるとセーブ</div>
            </div>
          </div>
          <button
            onClick={() => setTab('main')}
            className="w-full mt-4 py-2 bg-yellow-600 text-black font-bold text-xs hover:bg-yellow-500 transition-colors"
          >
            もどる
          </button>
        </div>
      )}

      {/* Version */}
      <div className="absolute bottom-2 right-3 text-gray-600 text-xs z-10">
        v1.0.0 - 100日チャレンジ
      </div>
    </div>
  );
}
