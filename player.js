/* js/player.js - プレイヤー物理・衝突・ブロック操作 */
'use strict';

const player = {
  // 位置 (feet position)
  pos: { x: 32, y: 20, z: 32 },
  vel: { x: 0,  y: 0,  z: 0  },

  yaw:   0,   // 水平回転 (ラジアン)
  pitch: 0,   // 垂直回転 (ラジアン)

  onGround:   false,
  isSneaking: false,
  isSprinting: false,

  health:    20, maxHealth: 20,
  food:      20, maxFood:   20,
  xp:        0,  xpLevel:   0,

  // ブレーク状態
  breakTarget:   null,  // { x,y,z,blockId }
  breakAccum:    0,     // 経過時間 (秒)
  breakProgress: 0,     // 0.0 ~ 1.0
};

// ── 初期スポーン ──────────────────────────
function initPlayer() {
  const sx = (WORLD_W / 2) | 0;
  const sz = (WORLD_D / 2) | 0;
  const sy = getTerrainHeight(sx, sz) + 2;
  player.pos.x = sx + 0.5;
  player.pos.y = sy;
  player.pos.z = sz + 0.5;
  player.vel.x = 0; player.vel.y = 0; player.vel.z = 0;
  player.yaw = 0; player.pitch = 0;
}

// ── AABB ─────────────────────────────────
function getAABB() {
  const hw = PLAYER_WIDTH * 0.5;
  return {
    x0: player.pos.x - hw, x1: player.pos.x + hw,
    y0: player.pos.y,       y1: player.pos.y + PLAYER_HEIGHT,
    z0: player.pos.z - hw,  z1: player.pos.z + hw,
  };
}

// ── 衝突解決 (1軸ずつ) ─────────────────────
function resolveX() {
  const a = getAABB();
  const x1 = Math.floor(a.x0), x2 = Math.floor(a.x1);
  const y1 = Math.floor(a.y0), y2 = Math.floor(a.y1 - 0.001);
  const z1 = Math.floor(a.z0), z2 = Math.floor(a.z1 - 0.001);

  for (let by = y1; by <= y2; by++) {
    for (let bz = z1; bz <= z2; bz++) {
      for (let bx = x1; bx <= x2; bx++) {
        if (!isBlockSolid(getBlock(bx, by, bz))) continue;
        // X方向のめり込み解消
        if (a.x1 > bx && a.x0 < bx + 1 &&
            a.y1 > by && a.y0 < by + 1 &&
            a.z1 > bz && a.z0 < bz + 1) {
          if (player.vel.x > 0) {
            player.pos.x = bx - PLAYER_WIDTH * 0.5 - 0.001;
          } else if (player.vel.x < 0) {
            player.pos.x = bx + 1 + PLAYER_WIDTH * 0.5 + 0.001;
          }
          player.vel.x = 0;
          return;
        }
      }
    }
  }
}

function resolveY() {
  const a = getAABB();
  const x1 = Math.floor(a.x0 + 0.001), x2 = Math.floor(a.x1 - 0.001);
  const y1 = Math.floor(a.y0), y2 = Math.floor(a.y1);
  const z1 = Math.floor(a.z0 + 0.001), z2 = Math.floor(a.z1 - 0.001);

  for (let bx = x1; bx <= x2; bx++) {
    for (let bz = z1; bz <= z2; bz++) {
      for (let by = y1; by <= y2; by++) {
        if (!isBlockSolid(getBlock(bx, by, bz))) continue;
        if (a.x1 > bx + 0.001 && a.x0 < bx + 0.999 &&
            a.y1 > by          && a.y0 < by + 1     &&
            a.z1 > bz + 0.001 && a.z0 < bz + 0.999) {
          if (player.vel.y > 0) {
            player.pos.y = by - PLAYER_HEIGHT - 0.001;
          } else if (player.vel.y < 0) {
            player.pos.y = by + 1 + 0.001;
            player.onGround = true;
          }
          player.vel.y = 0;
          return;
        }
      }
    }
  }
}

function resolveZ() {
  const a = getAABB();
  const x1 = Math.floor(a.x0), x2 = Math.floor(a.x1 - 0.001);
  const y1 = Math.floor(a.y0), y2 = Math.floor(a.y1 - 0.001);
  const z1 = Math.floor(a.z0), z2 = Math.floor(a.z1);

  for (let by = y1; by <= y2; by++) {
    for (let bx = x1; bx <= x2; bx++) {
      for (let bz = z1; bz <= z2; bz++) {
        if (!isBlockSolid(getBlock(bx, by, bz))) continue;
        if (a.x1 > bx && a.x0 < bx + 1 &&
            a.y1 > by && a.y0 < by + 1 &&
            a.z1 > bz && a.z0 < bz + 1) {
          if (player.vel.z > 0) {
            player.pos.z = bz - PLAYER_WIDTH * 0.5 - 0.001;
          } else if (player.vel.z < 0) {
            player.pos.z = bz + 1 + PLAYER_WIDTH * 0.5 + 0.001;
          }
          player.vel.z = 0;
          return;
        }
      }
    }
  }
}

// ── プレイヤー更新 ────────────────────────
function updatePlayer(dt) {
  const speed = player.isSneaking  ? PLAYER_SNEAK_SPEED :
                player.isSprinting ? PLAYER_SPRINT_SPEED : PLAYER_SPEED;

  // 移動ベクトル (ジョイスティック → ワールド座標)
  const sinY = Math.sin(player.yaw);
  const cosY = Math.cos(player.yaw);
  const jx = controls.joystick.x;
  const jy = controls.joystick.y;

  // forward = (-sinY, 0, -cosY) when yaw=0 → looking -Z
  // right   = ( cosY, 0, -sinY)
  const mvX = (-jy * (-sinY) + jx * cosY) * speed;
  const mvZ = (-jy * (-cosY) + jx * (-sinY)) * speed;

  player.vel.x = mvX;
  player.vel.z = mvZ;

  // 重力
  if (!player.onGround) {
    player.vel.y = Math.max(player.vel.y + GRAVITY * dt, TERMINAL_VELOCITY);
  }

  // ジャンプ
  if (controls.jumpPressed && player.onGround) {
    player.vel.y = JUMP_VELOCITY;
    player.onGround = false;
    controls.jumpPressed = false;
  }
  controls.jumpPressed = false; // 毎フレームリセット (長押しはジャンプ維持しない)

  // onGround リセット (解決時にセット)
  player.onGround = false;

  // 軸ごとに移動 → 衝突解決
  player.pos.x += player.vel.x * dt;
  resolveX();
  player.pos.y += player.vel.y * dt;
  resolveY();
  player.pos.z += player.vel.z * dt;
  resolveZ();

  // ワールド範囲クランプ
  const hw = PLAYER_WIDTH * 0.5 + 0.01;
  player.pos.x = clamp(player.pos.x, hw, WORLD_W - hw);
  player.pos.z = clamp(player.pos.z, hw, WORLD_D - hw);
  if (player.pos.y < -5) {
    // 落下死亡 → リスポーン
    respawnPlayer();
    return;
  }

  // カメラ更新
  camera.position.set(
    player.pos.x,
    player.pos.y + PLAYER_EYE_HEIGHT,
    player.pos.z
  );
  camera.rotation.y = player.yaw;
  camera.rotation.x = player.pitch;

  // ブレーク処理
  updateBreaking(dt);
}

function respawnPlayer() {
  const sx = (WORLD_W / 2) | 0;
  const sz = (WORLD_D / 2) | 0;
  player.pos.x = sx + 0.5;
  player.pos.y = getTerrainHeight(sx, sz) + 3;
  player.pos.z = sz + 0.5;
  player.vel.x = 0; player.vel.y = 0; player.vel.z = 0;
  player.health = player.maxHealth;
}

// ── ブレーク処理 ──────────────────────────
function updateBreaking(dt) {
  const wrap = document.getElementById('break-progress-wrap');
  const fill  = document.getElementById('break-progress-fill');

  if (!controls.isBreaking) {
    player.breakAccum = 0;
    player.breakTarget = null;
    player.breakProgress = 0;
    if (wrap) wrap.style.display = 'none';
    return;
  }

  const hit = getTargetBlock();
  if (!hit) {
    player.breakAccum = 0;
    player.breakTarget = null;
    player.breakProgress = 0;
    if (wrap) wrap.style.display = 'none';
    return;
  }

  // ターゲットが変わったらリセット
  if (!player.breakTarget ||
      player.breakTarget.x !== hit.x ||
      player.breakTarget.y !== hit.y ||
      player.breakTarget.z !== hit.z) {
    player.breakTarget = hit;
    player.breakAccum = 0;
  }

  const hard = getBlockHardness(hit.blockId);
  if (hard === Infinity) {
    if (wrap) wrap.style.display = 'none';
    return;
  }

  player.breakAccum += dt;
  const breakTime = Math.max(0.2, hard * 0.75);
  player.breakProgress = Math.min(player.breakAccum / breakTime, 1);

  if (wrap) {
    wrap.style.display = 'block';
    fill.style.width = (player.breakProgress * 100) + '%';
  }

  if (player.breakProgress >= 1) {
    doBreakBlock(hit.x, hit.y, hit.z, hit.blockId);
    player.breakAccum = 0;
    player.breakTarget = null;
    player.breakProgress = 0;
    if (wrap) wrap.style.display = 'none';
  }
}

function doBreakBlock(bx, by, bz, blockId) {
  setBlock(bx, by, bz, BLOCK.AIR);
  rebuildChunksAroundBlock(bx, by, bz);

  const dropId = getBlockDrop(blockId);
  if (dropId && dropId !== 0) {
    inventory.addItem(dropId, 1);
  }
  updateInventoryUI();
}

function doPlaceBlock() {
  const hit = getTargetBlock();
  if (!hit || !hit.face) return;
  const pos = getPlacePos(hit);
  if (!pos) return;
  if (!inBounds(pos.x, pos.y, pos.z)) return;
  if (getBlock(pos.x, pos.y, pos.z) !== BLOCK.AIR) return;

  const item = inventory.getActiveItem();
  if (!item || item.id === 0) {
    // オフハンドも確認
    const off = inventory.getOffhandItem();
    if (off && off.id >= 1 && off.id <= 20) {
      setBlock(pos.x, pos.y, pos.z, off.id);
      rebuildChunksAroundBlock(pos.x, pos.y, pos.z);
      inventory.consumeOffhand(1);
      updateInventoryUI();
      return;
    }
    return;
  }

  if (item.id < 1 || item.id > 20) return;

  // プレイヤーAABBと重なるか確認
  const hw = PLAYER_WIDTH * 0.5 + 0.05;
  if (pos.x + 1 > player.pos.x - hw && pos.x < player.pos.x + hw &&
      pos.y + 1 > player.pos.y       && pos.y < player.pos.y + PLAYER_HEIGHT &&
      pos.z + 1 > player.pos.z - hw  && pos.z < player.pos.z + hw) {
    return; // プレイヤーの中に設置しない
  }

  setBlock(pos.x, pos.y, pos.z, item.id);
  rebuildChunksAroundBlock(pos.x, pos.y, pos.z);
  inventory.consumeActive(1);
  updateInventoryUI();
}

// ── ターゲットブロック取得 ───────────────
function getTargetBlock() {
  const ex = player.pos.x;
  const ey = player.pos.y + PLAYER_EYE_HEIGHT;
  const ez = player.pos.z;

  const dx = -Math.sin(player.yaw) * Math.cos(player.pitch);
  const dy = -Math.sin(player.pitch);
  const dz = -Math.cos(player.yaw) * Math.cos(player.pitch);

  return raycastWorld(ex, ey, ez, dx, dy, dz, REACH);
}
