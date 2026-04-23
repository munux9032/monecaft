/* js/blocks.js - ブロック定義 (20種類) */
'use strict';

// colorTop/Side/Bottom: [r,g,b] 0-1範囲
// hardness: 破壊時間(秒)の係数 / Infinity=破壊不能
// transparent: 向こう側が見える
// solid: 衝突判定あり
const BLOCK_DATA = {
  [BLOCK.GRASS]: {
    name: '草ブロック',
    colorTop:    [0.34, 0.56, 0.18],
    colorSide:   [0.35, 0.25, 0.13],
    colorBottom: [0.35, 0.25, 0.13],
    hardness: 0.9, transparent: false, solid: true,
    dropId: BLOCK.DIRT,
  },
  [BLOCK.DIRT]: {
    name: '土',
    colorTop:    [0.38, 0.27, 0.14],
    colorSide:   [0.38, 0.27, 0.14],
    colorBottom: [0.38, 0.27, 0.14],
    hardness: 0.5, transparent: false, solid: true,
    dropId: BLOCK.DIRT,
  },
  [BLOCK.STONE]: {
    name: '石',
    colorTop:    [0.47, 0.47, 0.47],
    colorSide:   [0.47, 0.47, 0.47],
    colorBottom: [0.47, 0.47, 0.47],
    hardness: 3.0, transparent: false, solid: true,
    dropId: BLOCK.COBBLESTONE,
  },
  [BLOCK.SAND]: {
    name: '砂',
    colorTop:    [0.87, 0.82, 0.58],
    colorSide:   [0.87, 0.82, 0.58],
    colorBottom: [0.87, 0.82, 0.58],
    hardness: 0.6, transparent: false, solid: true,
    dropId: BLOCK.SAND,
  },
  [BLOCK.GRAVEL]: {
    name: '砂利',
    colorTop:    [0.56, 0.54, 0.50],
    colorSide:   [0.56, 0.54, 0.50],
    colorBottom: [0.56, 0.54, 0.50],
    hardness: 0.6, transparent: false, solid: true,
    dropId: BLOCK.GRAVEL,
  },
  [BLOCK.OAK_LOG]: {
    name: 'オークの原木',
    colorTop:    [0.62, 0.52, 0.30],
    colorSide:   [0.38, 0.27, 0.13],
    colorBottom: [0.62, 0.52, 0.30],
    hardness: 2.0, transparent: false, solid: true,
    dropId: BLOCK.OAK_LOG,
  },
  [BLOCK.OAK_PLANKS]: {
    name: 'オーク板材',
    colorTop:    [0.74, 0.60, 0.38],
    colorSide:   [0.74, 0.60, 0.38],
    colorBottom: [0.74, 0.60, 0.38],
    hardness: 2.0, transparent: false, solid: true,
    dropId: BLOCK.OAK_PLANKS,
  },
  [BLOCK.OAK_LEAVES]: {
    name: 'オークの葉',
    colorTop:    [0.24, 0.47, 0.13],
    colorSide:   [0.24, 0.47, 0.13],
    colorBottom: [0.24, 0.47, 0.13],
    hardness: 0.2, transparent: true, solid: false,
    dropId: 0,
  },
  [BLOCK.GLASS]: {
    name: 'ガラス',
    colorTop:    [0.76, 0.91, 1.00],
    colorSide:   [0.76, 0.91, 1.00],
    colorBottom: [0.76, 0.91, 1.00],
    hardness: 0.5, transparent: true, solid: true,
    dropId: 0,
  },
  [BLOCK.COBBLESTONE]: {
    name: '丸石',
    colorTop:    [0.44, 0.43, 0.41],
    colorSide:   [0.44, 0.43, 0.41],
    colorBottom: [0.44, 0.43, 0.41],
    hardness: 3.0, transparent: false, solid: true,
    dropId: BLOCK.COBBLESTONE,
  },
  [BLOCK.BRICK]: {
    name: 'レンガブロック',
    colorTop:    [0.67, 0.33, 0.25],
    colorSide:   [0.67, 0.33, 0.25],
    colorBottom: [0.67, 0.33, 0.25],
    hardness: 3.5, transparent: false, solid: true,
    dropId: BLOCK.BRICK,
  },
  [BLOCK.IRON_ORE]: {
    name: '鉄鉱石',
    colorTop:    [0.56, 0.53, 0.49],
    colorSide:   [0.56, 0.53, 0.49],
    colorBottom: [0.56, 0.53, 0.49],
    hardness: 4.0, transparent: false, solid: true,
    dropId: ITEM.IRON_INGOT,
  },
  [BLOCK.COAL_ORE]: {
    name: '石炭鉱石',
    colorTop:    [0.31, 0.31, 0.31],
    colorSide:   [0.31, 0.31, 0.31],
    colorBottom: [0.31, 0.31, 0.31],
    hardness: 4.0, transparent: false, solid: true,
    dropId: ITEM.COAL,
  },
  [BLOCK.DIAMOND_ORE]: {
    name: 'ダイヤモンド鉱石',
    colorTop:    [0.22, 0.67, 0.77],
    colorSide:   [0.22, 0.67, 0.77],
    colorBottom: [0.22, 0.67, 0.77],
    hardness: 5.0, transparent: false, solid: true,
    dropId: ITEM.DIAMOND,
  },
  [BLOCK.OBSIDIAN]: {
    name: '黒曜石',
    colorTop:    [0.12, 0.09, 0.19],
    colorSide:   [0.12, 0.09, 0.19],
    colorBottom: [0.12, 0.09, 0.19],
    hardness: 50.0, transparent: false, solid: true,
    dropId: BLOCK.OBSIDIAN,
  },
  [BLOCK.SNOW]: {
    name: '雪ブロック',
    colorTop:    [0.93, 0.96, 0.99],
    colorSide:   [0.93, 0.96, 0.99],
    colorBottom: [0.93, 0.96, 0.99],
    hardness: 0.4, transparent: false, solid: true,
    dropId: BLOCK.SNOW,
  },
  [BLOCK.ICE]: {
    name: '氷',
    colorTop:    [0.68, 0.84, 0.97],
    colorSide:   [0.68, 0.84, 0.97],
    colorBottom: [0.68, 0.84, 0.97],
    hardness: 0.7, transparent: true, solid: true,
    dropId: 0,
  },
  [BLOCK.BEDROCK]: {
    name: '岩盤',
    colorTop:    [0.20, 0.19, 0.18],
    colorSide:   [0.20, 0.19, 0.18],
    colorBottom: [0.20, 0.19, 0.18],
    hardness: Infinity, transparent: false, solid: true,
    dropId: 0,
  },
  [BLOCK.GOLD_ORE]: {
    name: '金鉱石',
    colorTop:    [0.84, 0.74, 0.24],
    colorSide:   [0.84, 0.74, 0.24],
    colorBottom: [0.84, 0.74, 0.24],
    hardness: 4.5, transparent: false, solid: true,
    dropId: ITEM.GOLD_INGOT,
  },
  [BLOCK.CRAFTING_TABLE]: {
    name: '作業台',
    colorTop:    [0.56, 0.40, 0.22],
    colorSide:   [0.62, 0.44, 0.26],
    colorBottom: [0.74, 0.60, 0.38],
    hardness: 2.0, transparent: false, solid: true,
    dropId: BLOCK.CRAFTING_TABLE,
  },
};

// ── ブロックヘルパー関数 ──────────────────
function getBlockFaceColor(blockId, faceDir) {
  const d = BLOCK_DATA[blockId];
  if (!d) return [0.5, 0.5, 0.5];
  if (faceDir[1] > 0) return d.colorTop;
  if (faceDir[1] < 0) return d.colorBottom;
  return d.colorSide;
}

function isBlockSolid(blockId) {
  if (blockId === BLOCK.AIR) return false;
  const d = BLOCK_DATA[blockId];
  return d ? d.solid : false;
}

function isBlockTransparent(blockId) {
  if (blockId === BLOCK.AIR) return true;
  const d = BLOCK_DATA[blockId];
  return d ? d.transparent : false;
}

function getBlockHardness(blockId) {
  const d = BLOCK_DATA[blockId];
  return d ? d.hardness : 1;
}

function getBlockName(blockId) {
  const d = BLOCK_DATA[blockId];
  return d ? d.name : '不明';
}

function getBlockDrop(blockId) {
  const d = BLOCK_DATA[blockId];
  return d ? d.dropId : 0;
}
