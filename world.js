/* js/world.js - ワールドデータ・生成・レイキャスト */
'use strict';

// ── ワールドデータ (Uint8Array) ───────────
let worldData = null;

function worldIdx(x, y, z) {
  return (y * WORLD_D + z) * WORLD_W + x;
}

function inBounds(x, y, z) {
  return x >= 0 && x < WORLD_W &&
         y >= 0 && y < WORLD_H &&
         z >= 0 && z < WORLD_D;
}

function getBlock(x, y, z) {
  const xi = x | 0, yi = y | 0, zi = z | 0;
  if (!inBounds(xi, yi, zi)) return BLOCK.AIR;
  return worldData[worldIdx(xi, yi, zi)];
}

function setBlock(x, y, z, id) {
  const xi = x | 0, yi = y | 0, zi = z | 0;
  if (!inBounds(xi, yi, zi)) return;
  worldData[worldIdx(xi, yi, zi)] = id;
}

// ── シードノイズ ─────────────────────────
function hashNoise2(x, z) {
  let n = (((x * 1619) ^ (z * 31337)) + 1013904223) | 0;
  n = (Math.imul(n ^ (n >>> 16), 0x45d9f3b)) | 0;
  n = (n ^ (n >>> 16)) | 0;
  return ((n >>> 0) / 0xffffffff);
}

function interpNoise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z);
  const fx = x - ix, fz = z - iz;
  const sx = smoothstep(fx), sz = smoothstep(fz);
  return lerp(
    lerp(hashNoise2(ix, iz),   hashNoise2(ix+1, iz),   sx),
    lerp(hashNoise2(ix, iz+1), hashNoise2(ix+1, iz+1), sx),
    sz
  );
}

function getTerrainHeight(x, z) {
  let h = 0;
  h += interpNoise(x / 22.0, z / 22.0) * 8.0;
  h += interpNoise(x / 10.0, z / 10.0) * 3.5;
  h += interpNoise(x / 5.0,  z / 5.0)  * 1.5;
  return Math.floor(h + 11); // base 11, range ≈ 3–24
}

// ── ワールド生成 ─────────────────────────
function generateWorld() {
  worldData = new Uint8Array(WORLD_W * WORLD_H * WORLD_D);

  for (let bz = 0; bz < WORLD_D; bz++) {
    for (let bx = 0; bx < WORLD_W; bx++) {
      const sy = clamp(getTerrainHeight(bx, bz), 2, WORLD_H - 3);

      // 岩盤 (y=0)
      setBlock(bx, 0, bz, BLOCK.BEDROCK);

      // 石・鉱石層 (y=1 〜 sy-4)
      for (let y = 1; y < sy - 3; y++) {
        const r = hashNoise2(bx * 7 + y * 13, bz * 11 + y * 3);
        if (y <= 8  && r < 0.012) setBlock(bx, y, bz, BLOCK.DIAMOND_ORE);
        else if (r < 0.025)       setBlock(bx, y, bz, BLOCK.COAL_ORE);
        else if (r < 0.040)       setBlock(bx, y, bz, BLOCK.IRON_ORE);
        else if (y <= 14 && r < 0.048) setBlock(bx, y, bz, BLOCK.GOLD_ORE);
        else                      setBlock(bx, y, bz, BLOCK.STONE);
      }

      // 土層 (sy-3 〜 sy-1)
      const dirtStart = Math.max(1, sy - 3);
      for (let y = dirtStart; y < sy; y++) {
        setBlock(bx, y, bz, BLOCK.DIRT);
      }

      // 表面 (sy)
      if (sy < WORLD_H) {
        if (sy >= 22)      setBlock(bx, sy, bz, BLOCK.SNOW);
        else if (sy <= 8)  setBlock(bx, sy, bz, BLOCK.SAND);
        else               setBlock(bx, sy, bz, BLOCK.GRASS);
      }
    }
  }

  // 木を植える
  for (let bz = 4; bz < WORLD_D - 4; bz++) {
    for (let bx = 4; bx < WORLD_W - 4; bx++) {
      const r = hashNoise2(bx * 23 + 41, bz * 17 + 89);
      if (r < 0.018) {
        const sy = getTerrainHeight(bx, bz);
        if (sy >= 9 && sy <= 20 && getBlock(bx, sy, bz) === BLOCK.GRASS) {
          placeTree(bx, sy + 1, bz);
        }
      }
    }
  }
}

function placeTree(bx, by, bz) {
  const trunkH = 4 + (hashNoise2(bx, bz) < 0.5 ? 1 : 0);

  // 幹
  for (let y = 0; y < trunkH; y++) {
    if (by + y < WORLD_H) setBlock(bx, by + y, bz, BLOCK.OAK_LOG);
  }

  // 葉 (下2層: 半径2、上2層: 半径1)
  for (let dy = -1; dy <= 2; dy++) {
    const ly = by + trunkH - 1 + dy;
    if (ly < 0 || ly >= WORLD_H) continue;
    const radius = dy <= 0 ? 2 : 1;
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dz = -radius; dz <= radius; dz++) {
        if (Math.abs(dx) === radius && Math.abs(dz) === radius) continue;
        const lx = bx + dx, lz = bz + dz;
        if (lx >= 0 && lx < WORLD_W && lz >= 0 && lz < WORLD_D) {
          if (getBlock(lx, ly, lz) === BLOCK.AIR) {
            setBlock(lx, ly, lz, BLOCK.OAK_LEAVES);
          }
        }
      }
    }
  }
  // 最頂上の葉
  const topY = by + trunkH + 1;
  if (topY < WORLD_H) setBlock(bx, topY, bz, BLOCK.OAK_LEAVES);
}

// ── DDAレイキャスト ──────────────────────
// 戻り値: { x,y,z, blockId, face, dist } または null
function raycastWorld(ox, oy, oz, dx, dy, dz, maxDist) {
  // 正規化
  const len = Math.sqrt(dx*dx + dy*dy + dz*dz);
  if (len < 1e-8) return null;
  dx /= len; dy /= len; dz /= len;

  let x = Math.floor(ox);
  let y = Math.floor(oy);
  let z = Math.floor(oz);

  const stepX = dx > 0 ? 1 : -1;
  const stepY = dy > 0 ? 1 : -1;
  const stepZ = dz > 0 ? 1 : -1;

  const tDx = Math.abs(dx) > 1e-8 ? Math.abs(1 / dx) : Infinity;
  const tDy = Math.abs(dy) > 1e-8 ? Math.abs(1 / dy) : Infinity;
  const tDz = Math.abs(dz) > 1e-8 ? Math.abs(1 / dz) : Infinity;

  let tMaxX = tDx < Infinity
    ? (dx > 0 ? (x + 1 - ox) : (ox - x)) * tDx
    : Infinity;
  let tMaxY = tDy < Infinity
    ? (dy > 0 ? (y + 1 - oy) : (oy - y)) * tDy
    : Infinity;
  let tMaxZ = tDz < Infinity
    ? (dz > 0 ? (z + 1 - oz) : (oz - z)) * tDz
    : Infinity;

  // 境界ぴったりのとき1ステップ先へ
  if (tMaxX < 1e-8) tMaxX += tDx;
  if (tMaxY < 1e-8) tMaxY += tDy;
  if (tMaxZ < 1e-8) tMaxZ += tDz;

  let face = null;
  let t = 0;

  for (let step = 0; step < 200; step++) {
    if (t > maxDist) break;

    if (inBounds(x, y, z)) {
      const b = worldData[worldIdx(x, y, z)];
      if (b !== BLOCK.AIR && !isBlockTransparent(b)) {
        return { x, y, z, blockId: b, face, dist: t };
      }
    }

    if (tMaxX < tMaxY && tMaxX < tMaxZ) {
      t = tMaxX; x += stepX; tMaxX += tDx;
      face = stepX > 0 ? 'west' : 'east';
    } else if (tMaxY < tMaxZ) {
      t = tMaxY; y += stepY; tMaxY += tDy;
      face = stepY > 0 ? 'down' : 'up';
    } else {
      t = tMaxZ; z += stepZ; tMaxZ += tDz;
      face = stepZ > 0 ? 'north' : 'south';
    }
  }
  return null;
}

// ── ブロック設置位置の計算 ──────────────
const FACE_OFFSETS = Object.freeze({
  west:  [-1, 0, 0],
  east:  [ 1, 0, 0],
  down:  [ 0,-1, 0],
  up:    [ 0, 1, 0],
  north: [ 0, 0,-1],
  south: [ 0, 0, 1],
});

function getPlacePos(hit) {
  if (!hit || !hit.face) return null;
  const off = FACE_OFFSETS[hit.face];
  if (!off) return null;
  return { x: hit.x + off[0], y: hit.y + off[1], z: hit.z + off[2] };
}
