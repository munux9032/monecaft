/* js/ui.js - HUD・ホットバー・インベントリ画面 */
'use strict';

let invOpen = false;
function isInvOpen() { return invOpen; }

// ── ホットバー描画 ────────────────────────
function buildHotbarUI() {
  const hotbar = document.getElementById('hotbar');
  hotbar.innerHTML = '';

  for (let i = 0; i < 9; i++) {
    const slot = inventory.hotbar[i];
    const el = makeSlotEl(slot, i === inventory.activeSlot);

    el.addEventListener('click', () => {
      inventory.activeSlot = i;
      buildHotbarUI();
    });
    hotbar.appendChild(el);
  }
}

// ── オフハンドスロット描画 ────────────────
function buildOffhandUI() {
  const slotEl = document.getElementById('offhand-slot');
  refreshSlotEl(slotEl, inventory.offhand);
  slotEl.onclick = () => {
    if (invOpen) return;
    // タップで副手⇔アクティブスロット交換
    swapHandItems();
    buildHotbarUI();
    buildOffhandUI();
  };
}

// ── スロット要素作成 ──────────────────────
function makeSlotEl(slot, isActive) {
  const el = document.createElement('div');
  el.className = 'inv-slot' + (isActive ? ' active' : '');
  populateSlotEl(el, slot);
  return el;
}

function refreshSlotEl(el, slot) {
  el.innerHTML = '';
  populateSlotEl(el, slot);
}

function populateSlotEl(el, slot) {
  if (slot && slot.id !== 0) {
    const slotSize = el.classList.contains('inv-dark') ? 34 : 34;
    const canvas = createItemCanvas(slot.id, slotSize);
    el.appendChild(canvas);
    if (slot.count > 1) {
      const cnt = document.createElement('span');
      cnt.className = 'stack-count';
      cnt.textContent = slot.count;
      el.appendChild(cnt);
    }
  }
}

// ── ヘルスバー ───────────────────────────
function buildHealthBar() {
  const bar = document.getElementById('health-bar');
  bar.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const filled = i < Math.ceil(player.health / 2);
    const half   = (i * 2 + 1 === Math.floor(player.health)) && player.health % 1 !== 0;
    const heart = document.createElement('div');
    heart.style.cssText = [
      'width:10px; height:9px; margin:1px;',
      'display:inline-block;',
      filled
        ? `background:${half ? 'linear-gradient(90deg,#e00 50%,#444 50%)' : '#e00'};`
        : 'background:#444;',
      'clip-path:polygon(25% 0%,75% 0%,100% 30%,100% 55%,50% 100%,0% 55%,0% 30%);',
    ].join('');
    bar.appendChild(heart);
  }
}

// ── フードバー ───────────────────────────
function buildFoodBar() {
  const bar = document.getElementById('food-bar');
  bar.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const filled = i < Math.ceil(player.food / 2);
    const drum = document.createElement('div');
    drum.style.cssText = [
      'width:10px; height:9px; margin:1px;',
      'display:inline-block; border-radius:2px;',
      `background:${filled ? '#a06028' : '#444'};`,
    ].join('');
    bar.appendChild(drum);
  }
}

// ── XPバー ───────────────────────────────
function buildXPBar() {
  const fill = document.getElementById('xp-fill');
  fill.style.width = ((player.xp % 100)) + '%';
}

// ── ブロック名ツールチップ ────────────────
function buildBlockTooltip() {
  const tip = document.getElementById('block-tooltip');
  if (!player) { tip.textContent = ''; return; }
  const hit = getTargetBlock();
  if (hit) {
    tip.textContent = getBlockName(hit.blockId);
  } else {
    const item = inventory.getActiveItem();
    tip.textContent = (item && item.id !== 0) ? getItemName(item.id) : '';
  }
}

// ── インベントリ画面 ──────────────────────
function buildInventoryScreen() {
  buildInvMainSlots();
  buildInvHotbarSlots();
  buildInvOffhandSlot();
  buildDragDisplay();
}

function buildInvMainSlots() {
  const el = document.getElementById('inv-main');
  el.innerHTML = '';
  for (let i = 0; i < 27; i++) {
    const s = document.createElement('div');
    s.className = 'inv-slot inv-dark';
    populateSlotEl(s, inventory.main[i]);
    s.addEventListener('click', () => {
      invSlotClick(inventory.main, i);
      buildInventoryScreen();
    });
    el.appendChild(s);
  }
}

function buildInvHotbarSlots() {
  const el = document.getElementById('inv-hotbar');
  el.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const s = document.createElement('div');
    s.className = 'inv-slot inv-dark' + (i === inventory.activeSlot ? ' active' : '');
    populateSlotEl(s, inventory.hotbar[i]);
    s.addEventListener('click', () => {
      invSlotClick(inventory.hotbar, i);
      buildInventoryScreen();
    });
    el.appendChild(s);
  }
}

function buildInvOffhandSlot() {
  const el = document.getElementById('inv-offhand-slot');
  el.innerHTML = '';
  populateSlotEl(el, inventory.offhand);
  el.onclick = () => {
    invOffhandClick();
    buildInventoryScreen();
  };
}

function buildDragDisplay() {
  const el = document.getElementById('drag-display');
  if (!dragState) {
    el.style.display = 'none';
    return;
  }
  el.style.display = 'block';
  el.innerHTML = '';
  const canvas = createItemCanvas(dragState.id, 36);
  el.appendChild(canvas);
  if (dragState.count > 1) {
    const cnt = document.createElement('span');
    cnt.className = 'stack-count';
    cnt.textContent = dragState.count;
    el.appendChild(cnt);
  }
}

// インベントリ画面でマウス/タッチ移動でドラッグ表示
function setupDragFollow() {
  const el = document.getElementById('drag-display');
  const panel = document.getElementById('inv-panel');

  function onMove(cx, cy) {
    if (!dragState) return;
    el.style.left = cx + 'px';
    el.style.top  = cy + 'px';
  }

  panel.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
  panel.addEventListener('touchmove', (e) => {
    if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
}

// ── インベントリ開閉 ──────────────────────
function toggleInventory() {
  if (invOpen) closeInventory();
  else openInventory();
}

function openInventory() {
  invOpen = true;
  document.getElementById('inv-screen').classList.remove('hidden');
  buildInventoryScreen();
  setupDragFollow();
}

function closeInventory() {
  cancelDrag();
  invOpen = false;
  document.getElementById('inv-screen').classList.add('hidden');
  buildHotbarUI();
  buildOffhandUI();
}

// ── 全UI更新 ─────────────────────────────
function updateHotbarUI() {
  buildHotbarUI();
}

function updateInventoryUI() {
  buildHotbarUI();
  buildOffhandUI();
  if (invOpen) buildInventoryScreen();
}

function updateUI() {
  buildHotbarUI();
  buildOffhandUI();
  buildHealthBar();
  buildFoodBar();
  buildXPBar();
}

function initUI() {
  buildHotbarUI();
  buildOffhandUI();
  buildHealthBar();
  buildFoodBar();
  buildXPBar();
}

// ── フレーム毎更新 ────────────────────────
function updateUIPerFrame() {
  buildBlockTooltip();
}
