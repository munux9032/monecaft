/* js/inventory.js - インベントリ管理 (オフハンド対応) */
'use strict';

// スロット: { id: number, count: number }
// id=0 が空スロット

const inventory = {
  hotbar:     Array.from({ length: 9 },  () => ({ id: 0, count: 0 })),
  main:       Array.from({ length: 27 }, () => ({ id: 0, count: 0 })),
  offhand:    { id: 0, count: 0 },
  activeSlot: 0,
};

// ── 初期アイテム ─────────────────────────
function initInventory() {
  // ホットバー初期アイテム
  const hotbarInit = [
    { id: ITEM.STONE_PICKAXE,  count: 1  },
    { id: ITEM.WOODEN_SWORD,   count: 1  },
    { id: ITEM.WOODEN_SHOVEL,  count: 1  },
    { id: BLOCK.DIRT,          count: 32 },
    { id: BLOCK.STONE,         count: 32 },
    { id: BLOCK.OAK_PLANKS,    count: 32 },
    { id: BLOCK.GLASS,         count: 16 },
    { id: BLOCK.CRAFTING_TABLE,count: 1  },
    { id: ITEM.APPLE,          count: 8  },
  ];
  hotbarInit.forEach((it, i) => {
    inventory.hotbar[i].id    = it.id;
    inventory.hotbar[i].count = it.count;
  });

  // メインインベントリ初期アイテム
  const mainInit = [
    { id: BLOCK.COBBLESTONE, count: 32 },
    { id: BLOCK.BRICK,       count: 32 },
    { id: BLOCK.SAND,        count: 16 },
    { id: BLOCK.OBSIDIAN,    count: 8  },
    { id: ITEM.COAL,         count: 12 },
    { id: ITEM.IRON_INGOT,   count: 6  },
    { id: ITEM.DIAMOND,      count: 3  },
    { id: ITEM.GOLD_INGOT,   count: 4  },
    { id: ITEM.STICK,        count: 16 },
    { id: ITEM.BOW,          count: 1  },
    { id: ITEM.ARROW,        count: 32 },
    { id: ITEM.BREAD,        count: 4  },
    { id: ITEM.BOOK,         count: 1  },
    { id: ITEM.MAP,          count: 1  },
    { id: ITEM.BONE,         count: 3  },
    { id: ITEM.FEATHER,      count: 5  },
    { id: ITEM.STRING,       count: 8  },
    { id: ITEM.FISHING_ROD,  count: 1  },
  ];
  mainInit.forEach((it, i) => {
    inventory.main[i].id    = it.id;
    inventory.main[i].count = it.count;
  });

  // オフハンド: たいまつ (Java Edition 風)
  inventory.offhand.id    = ITEM.TORCH;
  inventory.offhand.count = 16;
}

// ── アクセサ ─────────────────────────────
function getActiveItem()  { return inventory.hotbar[inventory.activeSlot]; }
function getOffhandItem() { return inventory.offhand; }

function setActiveSlot(idx) {
  inventory.activeSlot = clamp(idx, 0, 8);
}

// ── アイテム追加 ──────────────────────────
function addItemToSlotArray(arr, itemId, count) {
  const maxStack = getItemMaxStack(itemId);

  // 既存スタックに積む
  for (const slot of arr) {
    if (slot.id === itemId && slot.count < maxStack) {
      const add = Math.min(count, maxStack - slot.count);
      slot.count += add;
      count -= add;
      if (count <= 0) return 0;
    }
  }
  // 空きスロットを使う
  for (const slot of arr) {
    if (slot.id === 0) {
      const add = Math.min(count, maxStack);
      slot.id    = itemId;
      slot.count = add;
      count -= add;
      if (count <= 0) return 0;
    }
  }
  return count; // 残り (インベントリが満杯)
}

function addItem(itemId, count) {
  if (!itemId || itemId === 0 || count <= 0) return;
  // ホットバー → メインの順に追加
  let rem = addItemToSlotArray(inventory.hotbar, itemId, count);
  if (rem > 0) addItemToSlotArray(inventory.main, itemId, rem);
}

// ── 消費 ──────────────────────────────────
function consumeSlot(slot, count) {
  slot.count -= count;
  if (slot.count <= 0) { slot.id = 0; slot.count = 0; }
}

function consumeActive(count) {
  consumeSlot(inventory.hotbar[inventory.activeSlot], count);
}

function consumeOffhand(count) {
  consumeSlot(inventory.offhand, count);
}

// ── 副手交換 (Java Edition の F キー相当) ──
function swapHandItems() {
  const active = inventory.hotbar[inventory.activeSlot];
  const tmpId    = active.id;
  const tmpCount = active.count;
  active.id    = inventory.offhand.id;
  active.count = inventory.offhand.count;
  inventory.offhand.id    = tmpId;
  inventory.offhand.count = tmpCount;
}

// ── スロット移動 (インベントリ画面用) ────────
// type: 'hotbar' | 'main' | 'offhand'
// idx: スロットインデックス (offhand は無視)
let dragState = null; // { id, count, srcArr, srcIdx, srcType } または null

function invSlotClick(slotArr, idx) {
  const slot = slotArr[idx];

  if (!dragState) {
    // ピックアップ
    if (slot.id !== 0) {
      dragState = {
        id: slot.id, count: slot.count,
        srcArr: slotArr, srcIdx: idx,
      };
      slot.id = 0; slot.count = 0;
    }
  } else {
    // 置く
    if (slot.id === 0) {
      slot.id    = dragState.id;
      slot.count = dragState.count;
      dragState = null;
    } else if (slot.id === dragState.id && isItemStackable(dragState.id)) {
      const add = Math.min(dragState.count, getItemMaxStack(dragState.id) - slot.count);
      slot.count += add;
      dragState.count -= add;
      if (dragState.count <= 0) dragState = null;
    } else {
      // スワップ
      const tmpId = slot.id, tmpCnt = slot.count;
      slot.id    = dragState.id;
      slot.count = dragState.count;
      dragState = { id: tmpId, count: tmpCnt, srcArr: slotArr, srcIdx: idx };
    }
  }
}

function invOffhandClick() {
  const slot = inventory.offhand;
  if (!dragState) {
    if (slot.id !== 0) {
      dragState = { id: slot.id, count: slot.count, srcArr: null, srcIdx: -1 };
      slot.id = 0; slot.count = 0;
    }
  } else {
    if (slot.id === 0) {
      slot.id    = dragState.id;
      slot.count = dragState.count;
      dragState = null;
    } else {
      const tmpId = slot.id, tmpCnt = slot.count;
      slot.id    = dragState.id;
      slot.count = dragState.count;
      dragState = { id: tmpId, count: tmpCnt, srcArr: null, srcIdx: -1 };
    }
  }
}

function cancelDrag() {
  if (dragState && dragState.srcArr && dragState.srcIdx >= 0) {
    // 元に戻す
    const s = dragState.srcArr[dragState.srcIdx];
    if (s.id === 0) {
      s.id    = dragState.id;
      s.count = dragState.count;
    } else {
      // 他の空きに戻す
      addItem(dragState.id, dragState.count);
    }
  } else if (dragState) {
    addItem(dragState.id, dragState.count);
  }
  dragState = null;
}
