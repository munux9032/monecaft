/* js/config.js - 定数・設定 */
'use strict';

// ── ワールドサイズ ─────────────────────
const CHUNK_W = 16;   // チャンク幅 (X)
const CHUNK_H = 32;   // チャンク高 (Y)
const CHUNK_D = 16;   // チャンク深 (Z)
const WORLD_CX = 4;   // X方向チャンク数
const WORLD_CZ = 4;   // Z方向チャンク数
const WORLD_W = CHUNK_W * WORLD_CX;  // 64
const WORLD_H = CHUNK_H;             // 32
const WORLD_D = CHUNK_D * WORLD_CZ;  // 64

// ── プレイヤー ────────────────────────
const PLAYER_HEIGHT      = 1.8;
const PLAYER_EYE_HEIGHT  = 1.62;
const PLAYER_WIDTH       = 0.6;
const PLAYER_SPEED       = 4.8;
const PLAYER_SPRINT_SPEED = 7.5;
const PLAYER_SNEAK_SPEED  = 2.0;
const JUMP_VELOCITY      = 8.0;
const GRAVITY            = -24.0;
const REACH              = 5.0;
const TERMINAL_VELOCITY  = -55.0;

// ── ブロックID ────────────────────────
const BLOCK = Object.freeze({
  AIR:           0,
  GRASS:         1,
  DIRT:          2,
  STONE:         3,
  SAND:          4,
  GRAVEL:        5,
  OAK_LOG:       6,
  OAK_PLANKS:    7,
  OAK_LEAVES:    8,
  GLASS:         9,
  COBBLESTONE:   10,
  BRICK:         11,
  IRON_ORE:      12,
  COAL_ORE:      13,
  DIAMOND_ORE:   14,
  OBSIDIAN:      15,
  SNOW:          16,
  ICE:           17,
  BEDROCK:       18,
  GOLD_ORE:      19,
  CRAFTING_TABLE: 20,
});

// ── アイテムID (101〜) ──────────────────
const ITEM = Object.freeze({
  WOODEN_SWORD:   101,
  STONE_PICKAXE:  102,
  IRON_AXE:       103,
  WOODEN_SHOVEL:  104,
  BOW:            105,
  ARROW:          106,
  APPLE:          107,
  BREAD:          108,
  COAL:           109,
  IRON_INGOT:     110,
  DIAMOND:        111,
  GOLD_INGOT:     112,
  STICK:          113,
  TORCH:          114,
  BOOK:           115,
  MAP:            116,
  FISHING_ROD:    117,
  BONE:           118,
  FEATHER:        119,
  STRING:         120,
});

// ── フェースデータ (チャンクメッシュ用) ──────
// dir: 法線方向, brightness: 面ごとの明るさ
// corners: 4頂点 (反時計回り順), uv: UV座標
const FACE_DATA = Object.freeze([
  { // -X (西)
    dir: [-1, 0, 0], brightness: 0.78,
    corners: [
      { pos: [0,1,0], uv: [0,1] }, { pos: [0,0,0], uv: [0,0] },
      { pos: [0,1,1], uv: [1,1] }, { pos: [0,0,1], uv: [1,0] },
    ],
  },
  { // +X (東)
    dir: [1, 0, 0], brightness: 0.78,
    corners: [
      { pos: [1,1,1], uv: [0,1] }, { pos: [1,0,1], uv: [0,0] },
      { pos: [1,1,0], uv: [1,1] }, { pos: [1,0,0], uv: [1,0] },
    ],
  },
  { // -Y (下)
    dir: [0,-1, 0], brightness: 0.52,
    corners: [
      { pos: [1,0,1], uv: [1,0] }, { pos: [0,0,1], uv: [0,0] },
      { pos: [1,0,0], uv: [1,1] }, { pos: [0,0,0], uv: [0,1] },
    ],
  },
  { // +Y (上)
    dir: [0, 1, 0], brightness: 1.0,
    corners: [
      { pos: [0,1,1], uv: [1,1] }, { pos: [1,1,1], uv: [0,1] },
      { pos: [0,1,0], uv: [1,0] }, { pos: [1,1,0], uv: [0,0] },
    ],
  },
  { // -Z (北)
    dir: [0, 0,-1], brightness: 0.88,
    corners: [
      { pos: [1,0,0], uv: [0,0] }, { pos: [0,0,0], uv: [1,0] },
      { pos: [1,1,0], uv: [0,1] }, { pos: [0,1,0], uv: [1,1] },
    ],
  },
  { // +Z (南)
    dir: [0, 0, 1], brightness: 0.88,
    corners: [
      { pos: [0,0,1], uv: [0,0] }, { pos: [1,0,1], uv: [1,0] },
      { pos: [0,1,1], uv: [0,1] }, { pos: [1,1,1], uv: [1,1] },
    ],
  },
]);

// ── ユーティリティ ────────────────────
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
function smoothstep(t) { return t * t * (3 - 2 * t); }
