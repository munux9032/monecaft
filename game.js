/* js/game.js - メインゲームループ・初期化 */
'use strict';

let lastTime = 0;
let frameCount = 0;

// ── ローディング進捗 ─────────────────────
function setLoading(pct, msg) {
  document.getElementById('loading-fill').style.width = pct + '%';
  document.getElementById('loading-msg').textContent = msg;
}

// ── 初期化 (非同期) ──────────────────────
async function init() {
  // Three.js ロードチェック
  if (typeof THREE === 'undefined') {
    document.getElementById('loading-msg').textContent =
      'エラー: Three.js が読み込まれていません';
    return;
  }

  setLoading(10, 'レンダラー初期化中...');
  await tick();

  setupRenderer();

  setLoading(25, 'ワールド生成中...');
  await tick();

  generateWorld();

  setLoading(55, 'プレイヤー設定...');
  await tick();

  initPlayer();
  initInventory();

  setLoading(65, 'チャンクメッシュ構築中...');
  await tick();

  buildAllChunks();

  setLoading(88, 'コントロール & UI 初期化...');
  await tick();

  setupControls();
  initUI();

  setLoading(100, '準備完了!');
  await new Promise(r => setTimeout(r, 600));

  // ローディング非表示 → ゲーム表示
  document.getElementById('loading-screen').style.display = 'none';
  document.getElementById('game-container').style.display = 'block';

  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

// 次のマイクロタスクまで待機 (UI更新のため)
function tick() {
  return new Promise(r => setTimeout(r, 16));
}

// ── メインゲームループ ────────────────────
function gameLoop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  frameCount++;

  // キーボード入力反映
  updateKeyboardMovement();

  // インベントリが開いているときはプレイヤーを動かさない
  if (!isInvOpen()) {
    updatePlayer(dt);
  }

  // ハイライト更新
  const hit = getTargetBlock ? getTargetBlock() : null;
  updateHighlight(hit);

  // UIの軽量更新 (毎フレーム)
  updateUIPerFrame();

  // 描画
  renderFrame();

  requestAnimationFrame(gameLoop);
}

// ── 起動 ─────────────────────────────────
window.addEventListener('load', () => {
  init().catch(err => {
    console.error('初期化エラー:', err);
    document.getElementById('loading-msg').textContent =
      'エラーが発生しました: ' + err.message;
  });
});
