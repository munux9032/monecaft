/* js/controls.js - タッチ操作 & キーボード */
'use strict';

const controls = {
  joystick:     { x: 0, y: 0 },  // -1〜1
  jumpPressed:  false,
  isBreaking:   false,
  isSprinting:  false,
};

// ── タッチ追跡 ────────────────────────────
let joystickTouchId = null;
let joystickOrigin  = { x: 0, y: 0 };
const JOYSTICK_R    = 52;

let rightTouchId   = null;
let rightLastX     = 0, rightLastY = 0;
let rightTouchTime = 0;
const LOOK_SENS    = 0.0038; // カメラ感度

// ── セットアップ ─────────────────────────
function setupControls() {
  const leftZone  = document.getElementById('touch-left');
  const rightZone = document.getElementById('touch-right');

  // 左ゾーン: ジョイスティック
  leftZone.addEventListener('touchstart',  onJoyStart,  { passive: false });
  leftZone.addEventListener('touchmove',   onJoyMove,   { passive: false });
  leftZone.addEventListener('touchend',    onJoyEnd,    { passive: false });
  leftZone.addEventListener('touchcancel', onJoyEnd,    { passive: false });

  // 右ゾーン: カメラ操作
  rightZone.addEventListener('touchstart',  onLookStart, { passive: false });
  rightZone.addEventListener('touchmove',   onLookMove,  { passive: false });
  rightZone.addEventListener('touchend',    onLookEnd,   { passive: false });
  rightZone.addEventListener('touchcancel', onLookEnd,   { passive: false });

  // ─ アクションボタン ─
  const btnJump  = document.getElementById('btn-jump');
  const btnSneak = document.getElementById('btn-sneak');
  const btnSprint = document.getElementById('btn-sprint');
  const btnBreak = document.getElementById('btn-break');
  const btnPlace = document.getElementById('btn-place');
  const btnInv   = document.getElementById('btn-inv');
  const btnSwap  = document.getElementById('btn-swap');

  btnJump.addEventListener('touchstart', (e) => {
    e.preventDefault(); controls.jumpPressed = true;
  }, { passive: false });

  btnSneak.addEventListener('touchstart', (e) => {
    e.preventDefault(); player.isSneaking = true;
  }, { passive: false });
  btnSneak.addEventListener('touchend', (e) => {
    e.preventDefault(); player.isSneaking = false;
  }, { passive: false });
  btnSneak.addEventListener('touchcancel', (e) => {
    e.preventDefault(); player.isSneaking = false;
  }, { passive: false });

  btnSprint.addEventListener('touchstart', (e) => {
    e.preventDefault(); controls.isSprinting = true; player.isSprinting = true;
  }, { passive: false });
  btnSprint.addEventListener('touchend', (e) => {
    e.preventDefault(); controls.isSprinting = false; player.isSprinting = false;
  }, { passive: false });
  btnSprint.addEventListener('touchcancel', (e) => {
    e.preventDefault(); controls.isSprinting = false; player.isSprinting = false;
  }, { passive: false });

  btnBreak.addEventListener('touchstart', (e) => {
    e.preventDefault(); controls.isBreaking = true;
  }, { passive: false });
  btnBreak.addEventListener('touchend', (e) => {
    e.preventDefault(); controls.isBreaking = false;
  }, { passive: false });
  btnBreak.addEventListener('touchcancel', (e) => {
    e.preventDefault(); controls.isBreaking = false;
  }, { passive: false });

  btnPlace.addEventListener('touchstart', (e) => {
    e.preventDefault(); doPlaceBlock();
  }, { passive: false });
  btnPlace.addEventListener('click', () => doPlaceBlock());

  btnInv.addEventListener('click', () => toggleInventory());

  btnSwap.addEventListener('click', () => {
    swapHandItems();
    updateInventoryUI();
  });

  // インベントリ閉じるボタン
  document.getElementById('inv-close').addEventListener('click', () => closeInventory());

  // ホットバータップでスロット選択
  setupHotbarTap();

  // キーボード (PCデバッグ用)
  setupKeyboard();
}

// ── ジョイスティック ─────────────────────
function onJoyStart(e) {
  e.preventDefault();
  if (joystickTouchId !== null) return;
  const t = e.changedTouches[0];
  joystickTouchId = t.identifier;
  joystickOrigin.x = t.clientX;
  joystickOrigin.y = t.clientY;
  controls.joystick.x = 0;
  controls.joystick.y = 0;

  const ring = document.getElementById('joystick-ring');
  ring.style.display = 'block';
  ring.style.left = (t.clientX - 55) + 'px';
  ring.style.top  = (t.clientY - 55) + 'px';
}

function onJoyMove(e) {
  e.preventDefault();
  for (const t of e.changedTouches) {
    if (t.identifier !== joystickTouchId) continue;
    const dx = t.clientX - joystickOrigin.x;
    const dy = t.clientY - joystickOrigin.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const clamped = Math.min(dist, JOYSTICK_R);
    const ang = Math.atan2(dy, dx);
    const nx = (clamped / JOYSTICK_R) * Math.cos(ang);
    const ny = (clamped / JOYSTICK_R) * Math.sin(ang);
    controls.joystick.x = nx;
    controls.joystick.y = ny;

    const dot = document.getElementById('joystick-dot');
    const relX = nx * (JOYSTICK_R - 22);
    const relY = ny * (JOYSTICK_R - 22);
    dot.style.transform = `translate(calc(-50% + ${relX}px), calc(-50% + ${relY}px))`;
  }
}

function onJoyEnd(e) {
  e.preventDefault();
  for (const t of e.changedTouches) {
    if (t.identifier !== joystickTouchId) continue;
    joystickTouchId = null;
    controls.joystick.x = 0;
    controls.joystick.y = 0;
    const ring = document.getElementById('joystick-ring');
    ring.style.display = 'none';
    document.getElementById('joystick-dot').style.transform = 'translate(-50%, -50%)';
  }
}

// ── 右ゾーン: カメラ操作 ─────────────────
function onLookStart(e) {
  e.preventDefault();
  if (rightTouchId !== null) return;
  const t = e.changedTouches[0];
  rightTouchId = t.identifier;
  rightLastX = t.clientX;
  rightLastY = t.clientY;
  rightTouchTime = Date.now();
}

function onLookMove(e) {
  e.preventDefault();
  for (const t of e.changedTouches) {
    if (t.identifier !== rightTouchId) continue;
    const dx = t.clientX - rightLastX;
    const dy = t.clientY - rightLastY;
    player.yaw   -= dx * LOOK_SENS;
    player.pitch -= dy * LOOK_SENS;
    player.pitch  = clamp(player.pitch, -Math.PI * 0.499, Math.PI * 0.499);
    rightLastX = t.clientX;
    rightLastY = t.clientY;
  }
}

function onLookEnd(e) {
  e.preventDefault();
  for (const t of e.changedTouches) {
    if (t.identifier !== rightTouchId) continue;
    rightTouchId = null;
  }
}

// ── ホットバータップ ─────────────────────
function setupHotbarTap() {
  const hotbarEl = document.getElementById('hotbar-container');
  hotbarEl.addEventListener('touchstart', (e) => {
    // インベントリが開いてたら無視
    if (!document.getElementById('inv-screen').classList.contains('hidden')) return;
    // スロット番号クリック
  }, { passive: true });
}

// ── キーボード (PC) ─────────────────────
const keys = {};
let mouseLocked = false;

function setupKeyboard() {
  window.addEventListener('keydown', (e) => {
    if (keys[e.code]) return;
    keys[e.code] = true;
    switch (e.code) {
      case 'Space': e.preventDefault(); controls.jumpPressed = true; break;
      case 'KeyE':  toggleInventory(); break;
      case 'KeyF':  swapHandItems(); updateInventoryUI(); break;
      case 'ShiftLeft': case 'ShiftRight': player.isSneaking = true; break;
      case 'ControlLeft': player.isSprinting = true; break;
      case 'Escape': if (isInvOpen()) closeInventory(); break;
    }
    for (let i = 1; i <= 9; i++) {
      if (e.code === `Digit${i}`) {
        inventory.activeSlot = i - 1;
        updateHotbarUI();
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') player.isSneaking = false;
    if (e.code === 'ControlLeft') player.isSprinting = false;
  });

  // マウス操作 (ポインターロック)
  const canvas = document.getElementById('game-canvas');
  canvas.addEventListener('click', () => {
    if (!isInvOpen() && !mouseLocked) {
      canvas.requestPointerLock();
    }
  });

  document.addEventListener('pointerlockchange', () => {
    mouseLocked = !!document.pointerLockElement;
    if (mouseLocked) {
      document.addEventListener('mousemove', onMouseMove);
    } else {
      document.removeEventListener('mousemove', onMouseMove);
    }
  });

  canvas.addEventListener('mousedown', (e) => {
    if (!mouseLocked) return;
    if (e.button === 0) controls.isBreaking = true;
    if (e.button === 2) { e.preventDefault(); doPlaceBlock(); }
  });
  canvas.addEventListener('mouseup', (e) => {
    if (e.button === 0) controls.isBreaking = false;
  });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  // ホイールでホットバー選択
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const dir = e.deltaY > 0 ? 1 : -1;
    inventory.activeSlot = (inventory.activeSlot + dir + 9) % 9;
    updateHotbarUI();
  }, { passive: false });
}

function onMouseMove(e) {
  if (!mouseLocked || isInvOpen()) return;
  player.yaw   -= e.movementX * 0.0025;
  player.pitch -= e.movementY * 0.0025;
  player.pitch  = clamp(player.pitch, -Math.PI * 0.499, Math.PI * 0.499);
}

// ── WASDキーボード入力をジョイスティックへ ─
function updateKeyboardMovement() {
  if (mouseLocked && !isInvOpen()) {
    const fwd = (keys['KeyW'] ? 1 : 0) - (keys['KeyS'] ? 1 : 0);
    const str = (keys['KeyD'] ? 1 : 0) - (keys['KeyA'] ? 1 : 0);
    if (fwd !== 0 || str !== 0) {
      const len = Math.sqrt(fwd*fwd + str*str);
      controls.joystick.x = str / len;
      controls.joystick.y = -fwd / len; // y: 上(前進)=-1
    } else if (joystickTouchId === null) {
      controls.joystick.x = 0;
      controls.joystick.y = 0;
    }
    player.isSprinting = !!(keys['ControlLeft']);
  } else if (joystickTouchId === null) {
    // キーボードロックなし・タッチ操作なし → ゼロ
    if (!controls.isSprinting) {
      controls.joystick.x = 0;
      controls.joystick.y = 0;
    }
  }
}
