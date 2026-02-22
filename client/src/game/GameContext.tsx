// ============================================================
// Legend of Astra - Game Context
// Design: Neo-Retro Pixel Modern
// ============================================================

import React, { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import {
  GameState, PlayerStats, BattleState, DialogState, MapData, MapObject, EnemyInstance,
  createInitialPlayer, calculateDamage, calculateMagicDamage, getNextExp,
  getStatGrowth, saveGame, loadGame, hasSaveData
} from './GameEngine';

interface GameContextType {
  gameState: GameState;
  player: PlayerStats;
  battleState: BattleState | null;
  dialogState: DialogState | null;
  currentMap: MapData | null;
  mapsData: { [key: string]: MapData } | null;
  enemiesData: any;
  itemsData: any;
  stepCount: number;
  menuOpen: boolean;
  menuTab: 'status' | 'magic' | 'item';
  
  setGameState: (state: GameState) => void;
  updatePlayer: (player: PlayerStats) => void;
  startNewGame: () => void;
  loadSavedGame: () => void;
  movePlayer: (dx: number, dy: number) => void;
  startBattle: (enemies: EnemyInstance[], isBoss?: boolean) => void;
  executePlayerAction: (action: string, target?: number, subTarget?: string) => void;
  advanceDialog: () => void;
  openMenu: (tab?: 'status' | 'magic' | 'item') => void;
  closeMenu: () => void;
  setMenuTab: (tab: 'status' | 'magic' | 'item') => void;
  useItemFromMenu: (itemId: string) => void;
  setMapsData: (data: any) => void;
  setEnemiesData: (data: any) => void;
  setItemsData: (data: any) => void;
  hasSave: () => boolean;
  endBattle: (result: 'win' | 'lose' | 'escape') => void;
  handleInteract: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

interface GameStore {
  gameState: GameState;
  player: PlayerStats;
  battleState: BattleState | null;
  dialogState: DialogState | null;
  currentMap: MapData | null;
  mapsData: { [key: string]: MapData } | null;
  enemiesData: any;
  itemsData: any;
  stepCount: number;
  menuOpen: boolean;
  menuTab: 'status' | 'magic' | 'item';
}

type GameAction =
  | { type: 'SET_GAME_STATE'; payload: GameState }
  | { type: 'SET_PLAYER'; payload: PlayerStats }
  | { type: 'SET_BATTLE_STATE'; payload: BattleState | null }
  | { type: 'SET_DIALOG_STATE'; payload: DialogState | null }
  | { type: 'SET_CURRENT_MAP'; payload: MapData | null }
  | { type: 'SET_MAPS_DATA'; payload: any }
  | { type: 'SET_ENEMIES_DATA'; payload: any }
  | { type: 'SET_ITEMS_DATA'; payload: any }
  | { type: 'SET_STEP_COUNT'; payload: number }
  | { type: 'SET_MENU_OPEN'; payload: boolean }
  | { type: 'SET_MENU_TAB'; payload: 'status' | 'magic' | 'item' };

function gameReducer(state: GameStore, action: GameAction): GameStore {
  switch (action.type) {
    case 'SET_GAME_STATE': return { ...state, gameState: action.payload };
    case 'SET_PLAYER': return { ...state, player: action.payload };
    case 'SET_BATTLE_STATE': return { ...state, battleState: action.payload };
    case 'SET_DIALOG_STATE': return { ...state, dialogState: action.payload };
    case 'SET_CURRENT_MAP': return { ...state, currentMap: action.payload };
    case 'SET_MAPS_DATA': return { ...state, mapsData: action.payload };
    case 'SET_ENEMIES_DATA': return { ...state, enemiesData: action.payload };
    case 'SET_ITEMS_DATA': return { ...state, itemsData: action.payload };
    case 'SET_STEP_COUNT': return { ...state, stepCount: action.payload };
    case 'SET_MENU_OPEN': return { ...state, menuOpen: action.payload };
    case 'SET_MENU_TAB': return { ...state, menuTab: action.payload };
    default: return state;
  }
}

const initialState: GameStore = {
  gameState: 'title',
  player: createInitialPlayer(),
  battleState: null,
  dialogState: null,
  currentMap: null,
  mapsData: null,
  enemiesData: null,
  itemsData: null,
  stepCount: 0,
  menuOpen: false,
  menuTab: 'status',
};

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const setGameState = useCallback((gs: GameState) => {
    dispatch({ type: 'SET_GAME_STATE', payload: gs });
  }, []);

  const updatePlayer = useCallback((player: PlayerStats) => {
    dispatch({ type: 'SET_PLAYER', payload: player });
  }, []);

  const setMapsData = useCallback((data: any) => {
    dispatch({ type: 'SET_MAPS_DATA', payload: data.maps });
    const fieldMap = data.maps['field'] as MapData;
    dispatch({ type: 'SET_CURRENT_MAP', payload: fieldMap });
  }, []);

  const setEnemiesData = useCallback((data: any) => {
    dispatch({ type: 'SET_ENEMIES_DATA', payload: data });
  }, []);

  const setItemsData = useCallback((data: any) => {
    dispatch({ type: 'SET_ITEMS_DATA', payload: data });
  }, []);

  const startNewGame = useCallback(() => {
    const player = createInitialPlayer();
    dispatch({ type: 'SET_PLAYER', payload: player });
    dispatch({ type: 'SET_STEP_COUNT', payload: 0 });
    const maps = stateRef.current.mapsData;
    if (maps) {
      dispatch({ type: 'SET_CURRENT_MAP', payload: maps['field'] });
    }
    dispatch({ type: 'SET_GAME_STATE', payload: 'field' });
  }, []);

  const loadSavedGame = useCallback(() => {
    const saved = loadGame();
    if (saved) {
      dispatch({ type: 'SET_PLAYER', payload: saved });
      const maps = stateRef.current.mapsData;
      if (maps && saved.currentMap) {
        dispatch({ type: 'SET_CURRENT_MAP', payload: maps[saved.currentMap] });
      }
      dispatch({ type: 'SET_GAME_STATE', payload: 'field' });
    }
  }, []);

  const checkEncounter = useCallback((map: MapData) => {
    if (map.encounterRate <= 0) return false;
    if (map.type === 'village') return false;
    return Math.random() < map.encounterRate;
  }, []);

  const createEnemyInstance = useCallback((enemyId: string): EnemyInstance | null => {
    const enemiesData = stateRef.current.enemiesData;
    if (!enemiesData) return null;
    const base = enemiesData.enemies[enemyId];
    if (!base) return null;
    return {
      ...base,
      hp: base.hp,
      maxHp: base.hp,
      mp: base.mp,
      maxMp: base.mp,
      phaseTriggered: false,
      defenseDebuffed: false,
    };
  }, []);

  const startBattle = useCallback((enemies: EnemyInstance[], isBoss: boolean = false) => {
    const battleState: BattleState = {
      enemies,
      turn: 'player',
      phase: 'command',
      log: isBoss ? ['ボスが現れた！'] : [`${enemies.map(e => e.name).join('と')}が現れた！`],
      selectedCommand: 0,
      selectedMagic: 0,
      selectedItem: 0,
      selectedEnemy: 0,
      animating: false,
      isBoss,
    };
    dispatch({ type: 'SET_BATTLE_STATE', payload: battleState });
    dispatch({ type: 'SET_GAME_STATE', payload: 'battle' });
  }, []);

  const movePlayer = useCallback((dx: number, dy: number) => {
    const { player, currentMap, mapsData, stepCount, gameState } = stateRef.current;
    if (gameState !== 'field' || !currentMap || !mapsData) return;

    const newX = player.x + dx;
    const newY = player.y + dy;

    // Check transitions
    const transition = currentMap.transitions.find(t => t.x === newX && t.y === newY);
    if (transition) {
      const targetMap = mapsData[transition.targetMap];
      if (targetMap) {
        const newPlayer = {
          ...player,
          currentMap: transition.targetMap,
          x: transition.targetX,
          y: transition.targetY,
        };
        dispatch({ type: 'SET_PLAYER', payload: newPlayer });
        dispatch({ type: 'SET_CURRENT_MAP', payload: targetMap });
        return;
      }
    }

    // Boundary check
    if (newX < 0 || newX >= currentMap.width || newY < 0 || newY >= currentMap.height) return;

    // Tile passability
    const tileId = currentMap.tiles[newY]?.[newX];
    if (tileId === undefined) return;

    const passableTiles = [2, 5, 8];
    if (!passableTiles.includes(tileId)) return;

    // Check objects at new position (blocking objects)
    const obj = currentMap.objects.find(o => o.x === newX && o.y === newY);
    if (obj && (obj.type === 'npc' || obj.type === 'chest' || obj.type === 'boss' || obj.type === 'sign')) {
      return;
    }

    const newPlayer = { ...player, x: newX, y: newY };
    const newStepCount = stepCount + 1;
    dispatch({ type: 'SET_PLAYER', payload: newPlayer });
    dispatch({ type: 'SET_STEP_COUNT', payload: newStepCount });

    // Check encounter
    if (checkEncounter(currentMap)) {
      const enemiesData = stateRef.current.enemiesData;
      if (!enemiesData) return;
      const groups = enemiesData.encounterGroups[currentMap.type];
      if (!groups || groups.length === 0) return;
      
      const totalWeight = groups.reduce((sum: number, g: any) => sum + g.weight, 0);
      let rand = Math.random() * totalWeight;
      let selectedGroup = groups[0];
      for (const group of groups) {
        rand -= group.weight;
        if (rand <= 0) {
          selectedGroup = group;
          break;
        }
      }
      
      const enemyInstances = selectedGroup.enemies
        .map((eid: string) => createEnemyInstance(eid))
        .filter(Boolean) as EnemyInstance[];
      if (enemyInstances.length > 0) {
        startBattle(enemyInstances, false);
      }
    }
  }, [checkEncounter, createEnemyInstance, startBattle]);

  const interactWithObject = useCallback((obj: MapObject) => {
    const { player } = stateRef.current;
    
    if (obj.type === 'sign') {
      dispatch({
        type: 'SET_DIALOG_STATE',
        payload: {
          lines: [obj.message || ''],
          currentLine: 0,
          onComplete: () => {
            dispatch({ type: 'SET_DIALOG_STATE', payload: null });
            dispatch({ type: 'SET_GAME_STATE', payload: 'field' });
          },
        },
      });
      dispatch({ type: 'SET_GAME_STATE', payload: 'dialog' });
    } else if (obj.type === 'npc') {
      const messages = obj.messages || [obj.message || ''];
      if (obj.quest && !player.questAccepted) {
        const newPlayer = { ...player, questAccepted: true };
        dispatch({ type: 'SET_PLAYER', payload: newPlayer });
      }
      dispatch({
        type: 'SET_DIALOG_STATE',
        payload: {
          lines: messages,
          currentLine: 0,
          speaker: obj.name,
          showShop: obj.shop,
          showInn: obj.inn,
          innCost: obj.cost,
          onComplete: () => {
            if (obj.shop) {
              dispatch({ type: 'SET_DIALOG_STATE', payload: null });
              dispatch({ type: 'SET_GAME_STATE', payload: 'shop' });
            } else if (obj.inn) {
              dispatch({ type: 'SET_DIALOG_STATE', payload: null });
              dispatch({ type: 'SET_GAME_STATE', payload: 'inn' });
            } else {
              dispatch({ type: 'SET_DIALOG_STATE', payload: null });
              dispatch({ type: 'SET_GAME_STATE', payload: 'field' });
            }
          },
        },
      });
      dispatch({ type: 'SET_GAME_STATE', payload: 'dialog' });
    } else if (obj.type === 'chest') {
      if (player.openedChests.includes(obj.id || '')) {
        dispatch({
          type: 'SET_DIALOG_STATE',
          payload: {
            lines: ['この宝箱はすでに開けられている。'],
            currentLine: 0,
            onComplete: () => {
              dispatch({ type: 'SET_DIALOG_STATE', payload: null });
              dispatch({ type: 'SET_GAME_STATE', payload: 'field' });
            },
          },
        });
        dispatch({ type: 'SET_GAME_STATE', payload: 'dialog' });
        return;
      }
      const newInventory = { ...player.inventory };
      if (obj.item) {
        newInventory[obj.item] = (newInventory[obj.item] || 0) + (obj.quantity || 1);
      }
      const newOpenedChests = [...player.openedChests, obj.id || ''];
      const newPlayer = { ...player, inventory: newInventory, openedChests: newOpenedChests };
      dispatch({ type: 'SET_PLAYER', payload: newPlayer });
      dispatch({
        type: 'SET_DIALOG_STATE',
        payload: {
          lines: [obj.message || '宝箱を開けた！'],
          currentLine: 0,
          onComplete: () => {
            dispatch({ type: 'SET_DIALOG_STATE', payload: null });
            dispatch({ type: 'SET_GAME_STATE', payload: 'field' });
          },
        },
      });
      dispatch({ type: 'SET_GAME_STATE', payload: 'dialog' });
    } else if (obj.type === 'boss') {
      if (player.defeatedBoss) {
        dispatch({
          type: 'SET_DIALOG_STATE',
          payload: {
            lines: ['ヴェインはすでに倒された。\n平和が戻った。'],
            currentLine: 0,
            onComplete: () => {
              dispatch({ type: 'SET_DIALOG_STATE', payload: null });
              dispatch({ type: 'SET_GAME_STATE', payload: 'field' });
            },
          },
        });
        dispatch({ type: 'SET_GAME_STATE', payload: 'dialog' });
        return;
      }
      const enemyInstance = createEnemyInstance(obj.enemyId || '');
      if (enemyInstance) {
        dispatch({
          type: 'SET_DIALOG_STATE',
          payload: {
            lines: [obj.message || 'ボスが現れた！'],
            currentLine: 0,
            onComplete: () => {
              dispatch({ type: 'SET_DIALOG_STATE', payload: null });
              startBattle([enemyInstance], true);
            },
          },
        });
        dispatch({ type: 'SET_GAME_STATE', payload: 'dialog' });
      }
    }
  }, [createEnemyInstance, startBattle]);

  const handleInteract = useCallback(() => {
    const { player, currentMap, gameState } = stateRef.current;
    if (gameState !== 'field' || !currentMap) return;

    const checkPositions = [
      { x: player.x, y: player.y - 1 },
      { x: player.x, y: player.y + 1 },
      { x: player.x - 1, y: player.y },
      { x: player.x + 1, y: player.y },
      { x: player.x, y: player.y },
    ];

    for (const pos of checkPositions) {
      const obj = currentMap.objects.find(o => o.x === pos.x && o.y === pos.y);
      if (obj) {
        interactWithObject(obj);
        return;
      }
    }
  }, [interactWithObject]);

  const advanceDialog = useCallback(() => {
    const { dialogState } = stateRef.current;
    if (!dialogState) return;

    if (dialogState.currentLine < dialogState.lines.length - 1) {
      dispatch({
        type: 'SET_DIALOG_STATE',
        payload: { ...dialogState, currentLine: dialogState.currentLine + 1 },
      });
    } else {
      if (dialogState.onComplete) {
        dialogState.onComplete();
      } else {
        dispatch({ type: 'SET_DIALOG_STATE', payload: null });
        dispatch({ type: 'SET_GAME_STATE', payload: 'field' });
      }
    }
  }, []);

  const executeEnemyTurn = useCallback(() => {
    const { battleState, player } = stateRef.current;
    if (!battleState) return;

    const aliveEnemies = battleState.enemies.filter(e => e.hp > 0);
    if (aliveEnemies.length === 0) return;

    const logs: string[] = [];
    let newPlayer = { ...player };
    let newEnemies = [...battleState.enemies];

    for (const enemy of aliveEnemies) {
      if (newPlayer.hp <= 0) break;

      const enemyIdx = newEnemies.findIndex(e => e.id === enemy.id && e.hp > 0);
      if (enemyIdx === -1) continue;

      // Check phase trigger
      if (enemy.phases && !enemy.phaseTriggered) {
        const phase = enemy.phases[0];
        if (enemy.hp / enemy.maxHp <= phase.hpThreshold) {
          newEnemies[enemyIdx] = { ...newEnemies[enemyIdx], phaseTriggered: true };
          logs.push(phase.message);
        }
      }

      const totalWeight = enemy.actions.reduce((sum: number, a: any) => sum + a.weight, 0);
      let rand = Math.random() * totalWeight;
      let selectedAction = enemy.actions[0];
      for (const action of enemy.actions) {
        rand -= action.weight;
        if (rand <= 0) { selectedAction = action; break; }
      }

      const phaseBoost = (newEnemies[enemyIdx].phaseTriggered && enemy.phases?.[0]?.attackBoost) ? enemy.phases[0].attackBoost : 1;

      if (selectedAction.type === 'attack') {
        const dmg = calculateDamage(Math.floor(enemy.attack * phaseBoost), newPlayer.defense);
        newPlayer = { ...newPlayer, hp: Math.max(0, newPlayer.hp - dmg) };
        logs.push(`${enemy.name}の攻撃！ ${newPlayer.name}に${dmg}のダメージ！`);
      } else if (selectedAction.type === 'attack_strong') {
        const dmg = calculateDamage(Math.floor(enemy.attack * (selectedAction.multiplier || 1.5) * phaseBoost), newPlayer.defense);
        newPlayer = { ...newPlayer, hp: Math.max(0, newPlayer.hp - dmg) };
        logs.push(`${enemy.name}の${selectedAction.message || '強攻撃'}！ ${newPlayer.name}に${dmg}のダメージ！`);
      } else if (selectedAction.type === 'attack_double') {
        const dmg1 = calculateDamage(Math.floor(enemy.attack * (selectedAction.multiplier || 0.7) * phaseBoost), newPlayer.defense);
        const dmg2 = calculateDamage(Math.floor(enemy.attack * (selectedAction.multiplier || 0.7) * phaseBoost), newPlayer.defense);
        newPlayer = { ...newPlayer, hp: Math.max(0, newPlayer.hp - dmg1 - dmg2) };
        logs.push(`${enemy.name}の${selectedAction.message || '2回攻撃'}！ ${dmg1}+${dmg2}のダメージ！`);
      } else if (selectedAction.type === 'magic_attack') {
        const dmg = calculateMagicDamage(selectedAction.power || 20, Math.floor(newPlayer.defense / 2));
        newPlayer = { ...newPlayer, hp: Math.max(0, newPlayer.hp - dmg) };
        logs.push(`${enemy.name}の${selectedAction.message || '魔法攻撃'}！ ${newPlayer.name}に${dmg}のダメージ！`);
      } else if (selectedAction.type === 'debuff_defense') {
        logs.push(`${enemy.name}の${selectedAction.message || '呪い'}！ ${newPlayer.name}の防御力が下がった！`);
        newPlayer = { ...newPlayer, defense: Math.max(0, newPlayer.defense - 3) };
      } else if (selectedAction.type === 'heal_self') {
        const heal = selectedAction.power || 30;
        newEnemies[enemyIdx] = {
          ...newEnemies[enemyIdx],
          hp: Math.min(newEnemies[enemyIdx].maxHp, newEnemies[enemyIdx].hp + heal),
        };
        logs.push(`${enemy.name}の${selectedAction.message || '回復'}！ ${heal}回復した！`);
      }
    }

    const isPlayerDead = newPlayer.hp <= 0;
    dispatch({ type: 'SET_PLAYER', payload: newPlayer });
    dispatch({
      type: 'SET_BATTLE_STATE',
      payload: {
        ...battleState,
        enemies: newEnemies,
        log: [...battleState.log, ...logs],
        turn: 'player',
        phase: isPlayerDead ? 'result' : 'command',
        result: isPlayerDead ? 'lose' : undefined,
      },
    });
  }, []);

  const executePlayerAction = useCallback((action: string, target: number = 0, subTarget: string = '') => {
    const { battleState, player, itemsData } = stateRef.current;
    if (!battleState) return;

    const aliveEnemies = battleState.enemies.filter(e => e.hp > 0);
    
    const handleWin = (newEnemies: EnemyInstance[], extraLogs: string[], isBoss: boolean) => {
      const expGain = battleState.enemies.reduce((sum, e) => sum + e.exp, 0);
      const goldGain = battleState.enemies.reduce((sum, e) => sum + e.gold, 0);
      let newPlayer = { ...player, exp: player.exp + expGain, gold: player.gold + goldGain };
      const levelUpLogs: string[] = [`${expGain}の経験値を得た！`, `${goldGain}ゴールドを手に入れた！`];
      
      while (newPlayer.exp >= getNextExp(newPlayer.level) && newPlayer.level < 20) {
        newPlayer.level++;
        const growth = getStatGrowth(newPlayer.level);
        newPlayer.maxHp += growth.hp;
        newPlayer.hp = newPlayer.maxHp;
        newPlayer.maxMp += growth.mp;
        newPlayer.mp = newPlayer.maxMp;
        newPlayer.attack += growth.attack;
        newPlayer.defense += growth.defense;
        newPlayer.speed += growth.speed;
        levelUpLogs.push(`レベルが ${newPlayer.level} に上がった！`);
        levelUpLogs.push(`最大HP+${growth.hp} 最大MP+${growth.mp} 攻撃+${growth.attack} 防御+${growth.defense}`);
        const spellsToLearn = itemsData?.levelUpSpells?.[newPlayer.level.toString()] || [];
        for (const spellId of spellsToLearn) {
          if (!newPlayer.spells.includes(spellId)) {
            newPlayer.spells = [...newPlayer.spells, spellId];
            const spellName = itemsData?.spells?.[spellId]?.name || spellId;
            levelUpLogs.push(`${spellName}を覚えた！`);
          }
        }
      }
      newPlayer.nextExp = getNextExp(newPlayer.level);
      if (isBoss) newPlayer.defeatedBoss = true;
      
      dispatch({ type: 'SET_PLAYER', payload: newPlayer });
      dispatch({
        type: 'SET_BATTLE_STATE',
        payload: {
          ...battleState,
          enemies: newEnemies,
          log: [...battleState.log, ...extraLogs, '全ての敵を倒した！', ...levelUpLogs].filter(Boolean),
          phase: 'result',
          result: 'win',
        },
      });
    };

    if (action === 'attack') {
      const enemy = aliveEnemies[target] || aliveEnemies[0];
      if (!enemy) return;
      const dmg = calculateDamage(player.attack, enemy.defense);
      const enemyIdx = battleState.enemies.indexOf(enemy);
      const newEnemies = battleState.enemies.map((e, i) =>
        i === enemyIdx ? { ...e, hp: Math.max(0, e.hp - dmg) } : e
      );
      const newAliveEnemies = newEnemies.filter(e => e.hp > 0);
      const log = `${player.name}の攻撃！ ${enemy.name}に${dmg}のダメージ！`;
      const killLog = newEnemies[enemyIdx].hp <= 0 ? `${enemy.name}を倒した！` : '';
      
      if (newAliveEnemies.length === 0) {
        handleWin(newEnemies, [log, killLog].filter(Boolean), battleState.isBoss);
      } else {
        dispatch({
          type: 'SET_BATTLE_STATE',
          payload: {
            ...battleState,
            enemies: newEnemies,
            log: [...battleState.log, log, killLog].filter(Boolean),
            turn: 'enemy',
            phase: 'enemy_action',
          },
        });
        setTimeout(() => executeEnemyTurn(), 1200);
      }
    } else if (action === 'magic') {
      const spellId = subTarget || player.spells[target];
      const spell = itemsData?.spells?.[spellId];
      if (!spell) return;
      if (player.mp < spell.mpCost) {
        dispatch({
          type: 'SET_BATTLE_STATE',
          payload: { ...battleState, log: [...battleState.log, 'MPが足りない！'], phase: 'command' },
        });
        return;
      }
      
      let newPlayer = { ...player, mp: player.mp - spell.mpCost };
      let newEnemies = [...battleState.enemies];
      const logs: string[] = [`${player.name}は${spell.name}を唱えた！`];
      
      if (spell.type === 'heal') {
        const healAmt = spell.effect.minValue + Math.floor(Math.random() * (spell.effect.maxValue - spell.effect.minValue + 1));
        newPlayer = { ...newPlayer, hp: Math.min(newPlayer.maxHp, newPlayer.hp + healAmt) };
        logs.push(`HPが${healAmt}回復した！`);
        dispatch({ type: 'SET_PLAYER', payload: newPlayer });
        dispatch({
          type: 'SET_BATTLE_STATE',
          payload: { ...battleState, log: [...battleState.log, ...logs], turn: 'enemy', phase: 'enemy_action' },
        });
        setTimeout(() => executeEnemyTurn(), 1200);
      } else if (spell.type === 'attack') {
        const enemy = aliveEnemies[target] || aliveEnemies[0];
        if (!enemy) return;
        const dmg = calculateMagicDamage(spell.effect.power, Math.floor(enemy.defense / 4));
        const enemyIdx = battleState.enemies.indexOf(enemy);
        newEnemies = battleState.enemies.map((e, i) =>
          i === enemyIdx ? { ...e, hp: Math.max(0, e.hp - dmg) } : e
        );
        logs.push(`${enemy.name}に${dmg}のダメージ！`);
        const newAlive = newEnemies.filter(e => e.hp > 0);
        dispatch({ type: 'SET_PLAYER', payload: newPlayer });
        if (newAlive.length === 0) {
          handleWin(newEnemies, logs, battleState.isBoss);
        } else {
          dispatch({
            type: 'SET_BATTLE_STATE',
            payload: { ...battleState, enemies: newEnemies, log: [...battleState.log, ...logs], turn: 'enemy', phase: 'enemy_action' },
          });
          setTimeout(() => executeEnemyTurn(), 1200);
        }
      } else if (spell.type === 'attack_all') {
        for (let i = 0; i < newEnemies.length; i++) {
          if (newEnemies[i].hp > 0) {
            const dmg = calculateMagicDamage(spell.effect.power, Math.floor(newEnemies[i].defense / 4));
            newEnemies[i] = { ...newEnemies[i], hp: Math.max(0, newEnemies[i].hp - dmg) };
            logs.push(`${newEnemies[i].name}に${dmg}のダメージ！`);
          }
        }
        const newAlive = newEnemies.filter(e => e.hp > 0);
        dispatch({ type: 'SET_PLAYER', payload: newPlayer });
        if (newAlive.length === 0) {
          handleWin(newEnemies, logs, battleState.isBoss);
        } else {
          dispatch({
            type: 'SET_BATTLE_STATE',
            payload: { ...battleState, enemies: newEnemies, log: [...battleState.log, ...logs], turn: 'enemy', phase: 'enemy_action' },
          });
          setTimeout(() => executeEnemyTurn(), 1200);
        }
      }
    } else if (action === 'item') {
      const itemId = subTarget;
      const item = itemsData?.items?.[itemId];
      if (!item) return;
      if (!player.inventory[itemId] || player.inventory[itemId] <= 0) return;
      
      let newPlayer = { ...player };
      const newInventory = { ...player.inventory, [itemId]: player.inventory[itemId] - 1 };
      if (newInventory[itemId] <= 0) delete newInventory[itemId];
      newPlayer.inventory = newInventory;
      
      const logs: string[] = [`${player.name}は${item.name}を使った！`];
      
      if (item.effect.type === 'heal_hp') {
        newPlayer.hp = Math.min(newPlayer.maxHp, newPlayer.hp + item.effect.value);
        logs.push(`HPが${item.effect.value}回復した！`);
      } else if (item.effect.type === 'heal_mp') {
        newPlayer.mp = Math.min(newPlayer.maxMp, newPlayer.mp + item.effect.value);
        logs.push(`MPが${item.effect.value}回復した！`);
      } else if (item.effect.type === 'full_restore') {
        newPlayer.hp = newPlayer.maxHp;
        newPlayer.mp = newPlayer.maxMp;
        logs.push('HPとMPが全回復した！');
      }
      
      dispatch({ type: 'SET_PLAYER', payload: newPlayer });
      dispatch({
        type: 'SET_BATTLE_STATE',
        payload: { ...battleState, log: [...battleState.log, ...logs], turn: 'enemy', phase: 'enemy_action' },
      });
      setTimeout(() => executeEnemyTurn(), 1200);
    } else if (action === 'escape') {
      if (battleState.isBoss) {
        dispatch({
          type: 'SET_BATTLE_STATE',
          payload: { ...battleState, log: [...battleState.log, 'ボス戦からは逃げられない！'], phase: 'command' },
        });
        return;
      }
      const escapeChance = 0.5 + (player.speed - 10) * 0.02;
      if (Math.random() < escapeChance) {
        dispatch({
          type: 'SET_BATTLE_STATE',
          payload: { ...battleState, log: [...battleState.log, 'うまく逃げ出した！'], phase: 'result', result: 'escape' },
        });
      } else {
        dispatch({
          type: 'SET_BATTLE_STATE',
          payload: { ...battleState, log: [...battleState.log, '逃げられなかった！'], turn: 'enemy', phase: 'enemy_action' },
        });
        setTimeout(() => executeEnemyTurn(), 1200);
      }
    }
  }, [executeEnemyTurn]);

  const endBattle = useCallback((result: 'win' | 'lose' | 'escape') => {
    const { player, battleState } = stateRef.current;
    dispatch({ type: 'SET_BATTLE_STATE', payload: null });
    
    if (result === 'win' && battleState?.isBoss) {
      dispatch({ type: 'SET_GAME_STATE', payload: 'gameclear' });
    } else if (result === 'lose') {
      const newPlayer = { ...player, hp: Math.max(1, Math.floor(player.maxHp / 2)) };
      dispatch({ type: 'SET_PLAYER', payload: newPlayer });
      dispatch({ type: 'SET_GAME_STATE', payload: 'gameover' });
    } else {
      dispatch({ type: 'SET_GAME_STATE', payload: 'field' });
    }
  }, []);

  const openMenu = useCallback((tab: 'status' | 'magic' | 'item' = 'status') => {
    dispatch({ type: 'SET_MENU_TAB', payload: tab });
    dispatch({ type: 'SET_MENU_OPEN', payload: true });
  }, []);

  const closeMenu = useCallback(() => {
    dispatch({ type: 'SET_MENU_OPEN', payload: false });
  }, []);

  const setMenuTab = useCallback((tab: 'status' | 'magic' | 'item') => {
    dispatch({ type: 'SET_MENU_TAB', payload: tab });
  }, []);

  const useItemFromMenu = useCallback((itemId: string) => {
    const { player, itemsData } = stateRef.current;
    const item = itemsData?.items?.[itemId];
    if (!item) return;
    if (!player.inventory[itemId] || player.inventory[itemId] <= 0) return;
    
    let newPlayer = { ...player };
    const newInventory = { ...player.inventory, [itemId]: player.inventory[itemId] - 1 };
    if (newInventory[itemId] <= 0) delete newInventory[itemId];
    newPlayer.inventory = newInventory;
    
    if (item.effect.type === 'heal_hp') {
      newPlayer.hp = Math.min(newPlayer.maxHp, newPlayer.hp + item.effect.value);
    } else if (item.effect.type === 'heal_mp') {
      newPlayer.mp = Math.min(newPlayer.maxMp, newPlayer.mp + item.effect.value);
    } else if (item.effect.type === 'full_restore') {
      newPlayer.hp = newPlayer.maxHp;
      newPlayer.mp = newPlayer.maxMp;
    }
    
    dispatch({ type: 'SET_PLAYER', payload: newPlayer });
  }, []);

  const value: GameContextType = {
    gameState: state.gameState,
    player: state.player,
    battleState: state.battleState,
    dialogState: state.dialogState,
    currentMap: state.currentMap,
    mapsData: state.mapsData,
    enemiesData: state.enemiesData,
    itemsData: state.itemsData,
    stepCount: state.stepCount,
    menuOpen: state.menuOpen,
    menuTab: state.menuTab,
    setGameState,
    updatePlayer,
    startNewGame,
    loadSavedGame,
    movePlayer,
    startBattle,
    executePlayerAction,
    advanceDialog,
    openMenu,
    closeMenu,
    setMenuTab,
    useItemFromMenu,
    setMapsData,
    setEnemiesData,
    setItemsData,
    hasSave: hasSaveData,
    endBattle,
    handleInteract,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
