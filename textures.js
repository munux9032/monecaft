/* js/textures.js - アイコン描画 (Canvas 2D) */
'use strict';

// roundRect ポリフィル (古いブラウザ対応)
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    r = Math.min(r || 0, w / 2, h / 2);
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y,     x + w, y + h, r);
    this.arcTo(x + w, y + h, x,     y + h, r);
    this.arcTo(x,     y + h, x,     y,     r);
    this.arcTo(x,     y,     x + w, y,     r);
    this.closePath();
    return this;
  };
}

// ── ブロックアイコン (アイソメトリック風) ──
function drawBlockIcon(ctx, blockId, x, y, size) {
  const d = BLOCK_DATA[blockId];
  if (!d) return;

  function toRGB(c, br) {
    return `rgb(${Math.round(c[0]*255*br)},${Math.round(c[1]*255*br)},${Math.round(c[2]*255*br)})`;
  }

  const s = size, h = s * 0.5, q = s * 0.25;

  // 上面
  ctx.fillStyle = toRGB(d.colorTop, 1.0);
  ctx.beginPath();
  ctx.moveTo(x + h, y + q * 0.6);
  ctx.lineTo(x + s - 1, y + h - q * 0.4);
  ctx.lineTo(x + h, y + h + q * 0.2);
  ctx.lineTo(x + 1, y + h - q * 0.4);
  ctx.closePath();
  ctx.fill();

  // 左面
  ctx.fillStyle = toRGB(d.colorSide, 0.68);
  ctx.beginPath();
  ctx.moveTo(x + 1, y + h - q * 0.4);
  ctx.lineTo(x + h, y + h + q * 0.2);
  ctx.lineTo(x + h, y + s - 2);
  ctx.lineTo(x + 1, y + h + q * 1.2);
  ctx.closePath();
  ctx.fill();

  // 右面
  ctx.fillStyle = toRGB(d.colorSide, 0.85);
  ctx.beginPath();
  ctx.moveTo(x + h, y + h + q * 0.2);
  ctx.lineTo(x + s - 1, y + h - q * 0.4);
  ctx.lineTo(x + s - 1, y + h + q * 1.2);
  ctx.lineTo(x + h, y + s - 2);
  ctx.closePath();
  ctx.fill();
}

// ── アイテムアイコン ────────────────────
function drawItemIcon(ctx, itemId, x, y, size) {
  const d = ITEM_DATA[itemId];
  if (!d) return;

  const s = size;
  const c1 = d.color || '#888';
  const c2 = d.color2 || '#666';

  ctx.save();
  ctx.translate(x, y);

  switch (d.type) {
    case 'weapon': {
      if (itemId === ITEM.BOW) {
        // 弓
        ctx.strokeStyle = c1; ctx.lineWidth = s * 0.1;
        ctx.beginPath();
        ctx.arc(s * 0.4, s * 0.5, s * 0.35, -Math.PI * 0.7, Math.PI * 0.7);
        ctx.stroke();
        ctx.strokeStyle = c2; ctx.lineWidth = s * 0.05;
        ctx.beginPath();
        ctx.moveTo(s * 0.55, s * 0.18);
        ctx.lineTo(s * 0.62, s * 0.5);
        ctx.lineTo(s * 0.55, s * 0.82);
        ctx.stroke();
      } else {
        // 剣
        ctx.fillStyle = c1;
        ctx.fillRect(s*0.38, s*0.08, s*0.16, s*0.52); // 柄
        ctx.fillStyle = c2;
        ctx.fillRect(s*0.3, s*0.08, s*0.32, s*0.08);  // ガード
        ctx.fillStyle = c2;
        // 刃
        ctx.beginPath();
        ctx.moveTo(s*0.38, s*0.1);
        ctx.lineTo(s*0.54, s*0.1);
        ctx.lineTo(s*0.48, s*0.72);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case 'tool': {
      if (itemId === ITEM.STONE_PICKAXE) {
        ctx.fillStyle = c2;
        ctx.fillRect(s*0.12, s*0.35, s*0.76, s*0.18); // 柄
        ctx.fillStyle = c1;
        // つるはし頭
        ctx.fillRect(s*0.12, s*0.16, s*0.68, s*0.22);
        ctx.fillRect(s*0.12, s*0.16, s*0.18, s*0.38);
        ctx.fillRect(s*0.62, s*0.16, s*0.18, s*0.38);
      } else if (itemId === ITEM.IRON_AXE) {
        ctx.fillStyle = c2;
        ctx.fillRect(s*0.44, s*0.28, s*0.14, s*0.64); // 柄
        ctx.fillStyle = c1;
        ctx.fillRect(s*0.16, s*0.14, s*0.44, s*0.44);
      } else if (itemId === ITEM.FISHING_ROD) {
        ctx.strokeStyle = c1; ctx.lineWidth = s * 0.09;
        ctx.beginPath();
        ctx.moveTo(s*0.72, s*0.14);
        ctx.lineTo(s*0.24, s*0.86);
        ctx.stroke();
        ctx.strokeStyle = c2; ctx.lineWidth = s * 0.04;
        ctx.beginPath();
        ctx.moveTo(s*0.72, s*0.14);
        ctx.quadraticCurveTo(s*0.9, s*0.3, s*0.76, s*0.72);
        ctx.stroke();
      } else {
        ctx.fillStyle = c2;
        ctx.fillRect(s*0.44, s*0.3, s*0.14, s*0.62);
        ctx.fillStyle = c1;
        ctx.fillRect(s*0.2, s*0.14, s*0.48, s*0.26);
      }
      break;
    }
    case 'food': {
      if (itemId === ITEM.APPLE) {
        ctx.fillStyle = c1;
        ctx.beginPath();
        ctx.arc(s*0.5, s*0.56, s*0.36, 0, Math.PI*2);
        ctx.fill();
        // ハイライト
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.arc(s*0.38, s*0.44, s*0.12, 0, Math.PI*2);
        ctx.fill();
        // 茎と葉
        ctx.fillStyle = c2;
        ctx.fillRect(s*0.46, s*0.15, s*0.08, s*0.18);
        ctx.fillStyle = '#2a6';
        ctx.beginPath();
        ctx.ellipse(s*0.62, s*0.22, s*0.14, s*0.08, 0.4, 0, Math.PI*2);
        ctx.fill();
      } else {
        // パン
        ctx.fillStyle = c1;
        ctx.beginPath();
        ctx.roundRect(s*0.12, s*0.28, s*0.76, s*0.44, s*0.08);
        ctx.fill();
        ctx.fillStyle = c2;
        ctx.beginPath();
        ctx.roundRect(s*0.12, s*0.28, s*0.76, s*0.18, [s*0.08, s*0.08, 0, 0]);
        ctx.fill();
      }
      break;
    }
    case 'material': {
      if (itemId === ITEM.DIAMOND) {
        ctx.fillStyle = c1;
        ctx.beginPath();
        ctx.moveTo(s*0.5, s*0.12);
        ctx.lineTo(s*0.84, s*0.44);
        ctx.lineTo(s*0.5, s*0.88);
        ctx.lineTo(s*0.16, s*0.44);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath();
        ctx.moveTo(s*0.5, s*0.12);
        ctx.lineTo(s*0.7, s*0.32);
        ctx.lineTo(s*0.5, s*0.44);
        ctx.lineTo(s*0.3, s*0.32);
        ctx.closePath();
        ctx.fill();
      } else if (itemId === ITEM.GOLD_INGOT || itemId === ITEM.IRON_INGOT) {
        ctx.fillStyle = c1;
        ctx.beginPath();
        ctx.roundRect(s*0.14, s*0.28, s*0.72, s*0.44, s*0.06);
        ctx.fill();
        ctx.fillStyle = c2;
        ctx.fillRect(s*0.22, s*0.36, s*0.56, s*0.12);
      } else if (itemId === ITEM.COAL) {
        ctx.fillStyle = c1;
        ctx.beginPath();
        ctx.roundRect(s*0.2, s*0.2, s*0.6, s*0.6, s*0.06);
        ctx.fill();
        ctx.fillStyle = c2;
        ctx.fillRect(s*0.28, s*0.28, s*0.18, s*0.18);
        ctx.fillRect(s*0.54, s*0.36, s*0.14, s*0.22);
      } else if (itemId === ITEM.STICK) {
        ctx.strokeStyle = c1; ctx.lineWidth = s * 0.14;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(s*0.26, s*0.74);
        ctx.lineTo(s*0.74, s*0.26);
        ctx.stroke();
        ctx.strokeStyle = c2; ctx.lineWidth = s * 0.06;
        ctx.stroke();
      } else if (itemId === ITEM.BONE) {
        ctx.strokeStyle = c1; ctx.lineWidth = s * 0.12;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(s*0.28, s*0.72);
        ctx.lineTo(s*0.72, s*0.28);
        ctx.stroke();
        ctx.fillStyle = c1;
        ctx.beginPath();
        ctx.arc(s*0.22, s*0.78, s*0.1, 0, Math.PI*2); ctx.fill();
        ctx.beginPath();
        ctx.arc(s*0.34, s*0.66, s*0.08, 0, Math.PI*2); ctx.fill();
        ctx.beginPath();
        ctx.arc(s*0.78, s*0.22, s*0.1, 0, Math.PI*2); ctx.fill();
        ctx.beginPath();
        ctx.arc(s*0.66, s*0.34, s*0.08, 0, Math.PI*2); ctx.fill();
      } else if (itemId === ITEM.FEATHER) {
        ctx.strokeStyle = c1; ctx.lineWidth = s*0.06;
        ctx.beginPath();
        ctx.moveTo(s*0.28, s*0.72);
        ctx.quadraticCurveTo(s*0.5, s*0.3, s*0.78, s*0.18);
        ctx.stroke();
        ctx.fillStyle = c2;
        for (let i = 0; i < 5; i++) {
          const t = i / 4;
          const bx2 = s*(0.28 + t*0.38), by2 = s*(0.72 - t*0.44);
          ctx.save();
          ctx.translate(bx2, by2);
          ctx.rotate(-Math.PI*0.25);
          ctx.beginPath();
          ctx.ellipse(0, 0, s*0.05, s*0.11, 0, 0, Math.PI*2);
          ctx.fill();
          ctx.restore();
        }
      } else if (itemId === ITEM.STRING) {
        ctx.strokeStyle = c1; ctx.lineWidth = s*0.05;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(s*(0.28+i*0.12), s*0.2);
          ctx.lineTo(s*(0.38+i*0.12), s*0.8);
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = c1;
        ctx.beginPath();
        ctx.roundRect(s*0.2, s*0.2, s*0.6, s*0.6, s*0.08);
        ctx.fill();
      }
      break;
    }
    case 'misc': {
      if (itemId === ITEM.BOOK) {
        ctx.fillStyle = c1;
        ctx.beginPath();
        ctx.roundRect(s*0.18, s*0.14, s*0.64, s*0.72, s*0.06);
        ctx.fill();
        ctx.fillStyle = c2;
        ctx.fillRect(s*0.28, s*0.22, s*0.44, s*0.56);
        ctx.fillStyle = '#fff8';
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(s*0.34, s*(0.3+i*0.14), s*0.32, s*0.05);
        }
      } else if (itemId === ITEM.MAP) {
        ctx.fillStyle = c2;
        ctx.beginPath();
        ctx.roundRect(s*0.1, s*0.1, s*0.8, s*0.8, s*0.04);
        ctx.fill();
        ctx.fillStyle = c1;
        ctx.fillRect(s*0.18, s*0.18, s*0.64, s*0.64);
        // マップ模様
        ctx.fillStyle = '#5a8'; ctx.fillRect(s*0.22, s*0.22, s*0.24, s*0.2);
        ctx.fillStyle = '#888'; ctx.fillRect(s*0.5, s*0.28, s*0.28, s*0.28);
        ctx.fillStyle = '#c84'; ctx.fillRect(s*0.26, s*0.5, s*0.2, s*0.24);
      }
      break;
    }
    case 'ammo': {
      // 矢
      ctx.strokeStyle = c1; ctx.lineWidth = s*0.08;
      ctx.beginPath();
      ctx.moveTo(s*0.72, s*0.18);
      ctx.lineTo(s*0.28, s*0.82);
      ctx.stroke();
      ctx.fillStyle = c2;
      ctx.beginPath();
      ctx.moveTo(s*0.72, s*0.18);
      ctx.lineTo(s*0.58, s*0.32);
      ctx.lineTo(s*0.62, s*0.24);
      ctx.closePath();
      ctx.fill();
      // 羽根
      ctx.fillStyle = c2;
      ctx.beginPath();
      ctx.moveTo(s*0.28, s*0.82);
      ctx.lineTo(s*0.18, s*0.72);
      ctx.lineTo(s*0.36, s*0.78);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'placeable': {
      // たいまつ
      ctx.fillStyle = c2;
      ctx.fillRect(s*0.44, s*0.26, s*0.12, s*0.6);
      // 炎
      ctx.fillStyle = c1;
      ctx.beginPath();
      ctx.arc(s*0.5, s*0.24, s*0.14, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#ffff99';
      ctx.beginPath();
      ctx.arc(s*0.5, s*0.22, s*0.07, 0, Math.PI*2);
      ctx.fill();
      break;
    }
    default: {
      ctx.fillStyle = c1;
      ctx.beginPath();
      ctx.roundRect(s*0.18, s*0.18, s*0.64, s*0.64, s*0.1);
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}

// ── キャンバスアイコン生成 ──────────────
function createItemCanvas(itemId, size) {
  size = size || 32;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  canvas.style.width = size + 'px'; canvas.style.height = size + 'px';
  canvas.style.imageRendering = 'pixelated';

  if (!itemId || itemId === 0) return canvas;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);

  if (itemId >= 1 && itemId <= 20) {
    drawBlockIcon(ctx, itemId, 0, 0, size);
  } else {
    drawItemIcon(ctx, itemId, 0, 0, size);
  }

  return canvas;
}
