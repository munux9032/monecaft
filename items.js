/* js/items.js - アイテム定義 (20種類) */
'use strict';

// type: 'weapon' | 'tool' | 'food' | 'material' | 'misc' | 'ammo' | 'placeable'
// color: アイコンのメインカラー (CSS色文字列)
// stackable: スタック可能か / maxStack: 最大スタック数
const ITEM_DATA = {
  [ITEM.WOODEN_SWORD]: {
    name: '木の剣', type: 'weapon', damage: 4,
    stackable: false, maxStack: 1,
    color: '#c8a050', color2: '#ddd',
  },
  [ITEM.STONE_PICKAXE]: {
    name: '石のつるはし', type: 'tool', efficiency: 4,
    stackable: false, maxStack: 1,
    color: '#888', color2: '#963',
  },
  [ITEM.IRON_AXE]: {
    name: '鉄の斧', type: 'tool', efficiency: 6,
    stackable: false, maxStack: 1,
    color: '#ccc', color2: '#963',
  },
  [ITEM.WOODEN_SHOVEL]: {
    name: '木のシャベル', type: 'tool', efficiency: 2,
    stackable: false, maxStack: 1,
    color: '#c8a050', color2: '#963',
  },
  [ITEM.BOW]: {
    name: '弓', type: 'weapon', damage: 5,
    stackable: false, maxStack: 1,
    color: '#8B4513', color2: '#ccc',
  },
  [ITEM.ARROW]: {
    name: '矢', type: 'ammo',
    stackable: true, maxStack: 64,
    color: '#888', color2: '#c85',
  },
  [ITEM.APPLE]: {
    name: 'リンゴ', type: 'food', food: 4,
    stackable: true, maxStack: 64,
    color: '#d43022', color2: '#2a5',
  },
  [ITEM.BREAD]: {
    name: 'パン', type: 'food', food: 5,
    stackable: true, maxStack: 64,
    color: '#c8914a', color2: '#a06028',
  },
  [ITEM.COAL]: {
    name: '石炭', type: 'material',
    stackable: true, maxStack: 64,
    color: '#1a1a1a', color2: '#444',
  },
  [ITEM.IRON_INGOT]: {
    name: '鉄インゴット', type: 'material',
    stackable: true, maxStack: 64,
    color: '#c0bdb8', color2: '#888',
  },
  [ITEM.DIAMOND]: {
    name: 'ダイヤモンド', type: 'material',
    stackable: true, maxStack: 64,
    color: '#3be0ff', color2: '#0af',
  },
  [ITEM.GOLD_INGOT]: {
    name: '金インゴット', type: 'material',
    stackable: true, maxStack: 64,
    color: '#ffd700', color2: '#c8a020',
  },
  [ITEM.STICK]: {
    name: '棒', type: 'material',
    stackable: true, maxStack: 64,
    color: '#8B6038', color2: '#a07040',
  },
  [ITEM.TORCH]: {
    name: 'たいまつ', type: 'placeable',
    stackable: true, maxStack: 64,
    color: '#ff6600', color2: '#ffcc00',
  },
  [ITEM.BOOK]: {
    name: '本', type: 'misc',
    stackable: true, maxStack: 64,
    color: '#a03030', color2: '#e0c090',
  },
  [ITEM.MAP]: {
    name: '地図', type: 'misc',
    stackable: false, maxStack: 1,
    color: '#f0a060', color2: '#c07030',
  },
  [ITEM.FISHING_ROD]: {
    name: '釣り竿', type: 'tool',
    stackable: false, maxStack: 1,
    color: '#8B6038', color2: '#4aa',
  },
  [ITEM.BONE]: {
    name: '骨', type: 'material',
    stackable: true, maxStack: 64,
    color: '#e8e4d8', color2: '#ccc8b8',
  },
  [ITEM.FEATHER]: {
    name: '羽根', type: 'material',
    stackable: true, maxStack: 64,
    color: '#f0f0f0', color2: '#b0b0b0',
  },
  [ITEM.STRING]: {
    name: '糸', type: 'material',
    stackable: true, maxStack: 64,
    color: '#e0e0e0', color2: '#c0c0c0',
  },
};

// ── アイテムヘルパー ──────────────────
function getItemName(itemId) {
  if (itemId >= 1 && itemId <= 20) return getBlockName(itemId);
  const d = ITEM_DATA[itemId];
  return d ? d.name : '不明';
}

function isItemStackable(itemId) {
  if (itemId >= 1 && itemId <= 20) return true;
  const d = ITEM_DATA[itemId];
  return d ? (d.stackable !== false) : false;
}

function getItemMaxStack(itemId) {
  if (itemId >= 1 && itemId <= 20) return 64;
  const d = ITEM_DATA[itemId];
  return (d && d.maxStack) ? d.maxStack : 1;
}

function getItemData(itemId) {
  return ITEM_DATA[itemId] || null;
}
