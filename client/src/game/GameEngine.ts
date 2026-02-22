// ============================================================
// Legend of Astra - Game Engine
// Design: Neo-Retro Pixel Modern
// Colors: Deep night sky bg, gold/green/purple accents
// ============================================================

export type GameState = 'title' | 'field' | 'battle' | 'dialog' | 'menu' | 'shop' | 'inn' | 'gameover' | 'gameclear';

export interface PlayerStats {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
  exp: number;
  nextExp: number;
  gold: number;
  spells: string[];
  inventory: { [itemId: string]: number };
  currentMap: string;
  x: number;
  y: number;
  openedChests: string[];
  defeatedBoss: boolean;
  questAccepted: boolean;
}

export interface EnemyInstance {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
  exp: number;
  gold: number;
  color: string;
  isBoss?: boolean;
  sprite: string;
  actions: any[];
  phases?: any[];
  phaseTriggered?: boolean;
  defenseDebuffed?: boolean;
}

export interface BattleState {
  enemies: EnemyInstance[];
  turn: 'player' | 'enemy';
  phase: 'command' | 'magic' | 'item' | 'result' | 'enemy_action' | 'animation';
  log: string[];
  selectedCommand: number;
  selectedMagic: number;
  selectedItem: number;
  selectedEnemy: number;
  result?: 'win' | 'lose' | 'escape';
  animating: boolean;
  isBoss: boolean;
}

export interface DialogState {
  lines: string[];
  currentLine: number;
  speaker?: string;
  onComplete?: () => void;
  showShop?: boolean;
  showInn?: boolean;
  innCost?: number;
}

export interface MapObject {
  type: string;
  id?: string;
  x: number;
  y: number;
  name?: string;
  messages?: string[];
  message?: string;
  quest?: string;
  shop?: boolean;
  inn?: boolean;
  cost?: number;
  item?: string;
  quantity?: number;
  enemyId?: string;
}

export interface MapTransition {
  x: number;
  y: number;
  targetMap: string;
  targetX: number;
  targetY: number;
  direction: string;
}

export interface MapData {
  id: string;
  name: string;
  type: string;
  width: number;
  height: number;
  tileSize: number;
  battleBg: string;
  encounterRate: number;
  tiles: number[][];
  objects: MapObject[];
  transitions: MapTransition[];
  playerStart: { x: number; y: number };
}

export interface TileType {
  name: string;
  passable: boolean;
  color: string;
}

// Level up experience table
export const EXP_TABLE: number[] = [
  0, 0, 30, 80, 150, 250, 400, 600, 850, 1150, 1500,
  1900, 2400, 3000, 3700, 4500, 5400, 6400, 7500, 8700, 10000
];

export function getNextExp(level: number): number {
  if (level >= EXP_TABLE.length - 1) return 99999;
  return EXP_TABLE[level + 1];
}

export function createInitialPlayer(): PlayerStats {
  return {
    name: 'アルス',
    level: 1,
    hp: 30,
    maxHp: 30,
    mp: 12,
    maxMp: 12,
    attack: 10,
    defense: 8,
    speed: 10,
    exp: 0,
    nextExp: getNextExp(1),
    gold: 50,
    spells: ['heal'],
    inventory: { potion: 2 },
    currentMap: 'field',
    x: 10,
    y: 7,
    openedChests: [],
    defeatedBoss: false,
    questAccepted: false,
  };
}

export function calculateLevelUp(player: PlayerStats): { leveled: boolean; newLevel: number; messages: string[]; newSpells: string[] } {
  let leveled = false;
  let newLevel = player.level;
  const messages: string[] = [];
  const newSpells: string[] = [];

  while (player.exp >= player.nextExp && newLevel < 20) {
    newLevel++;
    leveled = true;
    messages.push(`レベルが ${newLevel} に上がった！`);
  }

  return { leveled, newLevel, messages, newSpells };
}

export function getStatGrowth(level: number): { hp: number; mp: number; attack: number; defense: number; speed: number } {
  return {
    hp: 8 + Math.floor(level * 1.5),
    mp: 3 + Math.floor(level * 0.8),
    attack: 2 + Math.floor(level * 0.5),
    defense: 1 + Math.floor(level * 0.4),
    speed: 1 + Math.floor(level * 0.3),
  };
}

export function calculateDamage(attackerAtk: number, defenderDef: number, variance: number = 0.2): number {
  const base = Math.max(1, attackerAtk - Math.floor(defenderDef / 2));
  const v = 1 - variance / 2 + Math.random() * variance;
  return Math.max(1, Math.floor(base * v));
}

export function calculateMagicDamage(power: number, defenderDef: number, variance: number = 0.15): number {
  const base = Math.max(1, power - Math.floor(defenderDef / 4));
  const v = 1 - variance / 2 + Math.random() * variance;
  return Math.max(1, Math.floor(base * v));
}

export function saveGame(player: PlayerStats): void {
  try {
    localStorage.setItem('legend_of_astra_save', JSON.stringify({
      player,
      savedAt: new Date().toISOString(),
    }));
  } catch (e) {
    console.error('Save failed:', e);
  }
}

export function loadGame(): PlayerStats | null {
  try {
    const data = localStorage.getItem('legend_of_astra_save');
    if (!data) return null;
    const parsed = JSON.parse(data);
    return parsed.player;
  } catch (e) {
    console.error('Load failed:', e);
    return null;
  }
}

export function hasSaveData(): boolean {
  return localStorage.getItem('legend_of_astra_save') !== null;
}

export function deleteSaveData(): void {
  localStorage.removeItem('legend_of_astra_save');
}
