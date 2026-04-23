/* js/renderer.js - Three.jsレンダラー・チャンクメッシュ */
'use strict';

let scene, camera, renderer;
const chunkMeshes = {};   // "cx,cz" → THREE.Mesh
let highlightMesh = null;

// ── セットアップ ─────────────────────────
function setupRenderer() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x8dc8f0);
  scene.fog = new THREE.Fog(0x8dc8f0, 35, 90);

  const canvas = document.getElementById('game-canvas');
  const W = window.innerWidth, H = window.innerHeight;

  camera = new THREE.PerspectiveCamera(70, W / H, 0.05, 200);
  camera.rotation.order = 'YXZ';

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    powerPreference: 'high-performance',
  });
  renderer.setSize(W, H);
  // モバイルはピクセル比 1.5 に制限してパフォーマンス確保
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.shadowMap.enabled = false;

  // 環境光
  const ambient = new THREE.AmbientLight(0xffffff, 0.50);
  scene.add(ambient);

  // 太陽光 (方向光)
  const sun = new THREE.DirectionalLight(0xfff8e0, 0.85);
  sun.position.set(0.6, 1.0, 0.4).normalize();
  scene.add(sun);

  // ブロックハイライト (ワイヤーフレーム)
  const hlGeo = new THREE.BoxGeometry(1.008, 1.008, 1.008);
  const hlMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    wireframe: true,
    transparent: true,
    opacity: 0.55,
    depthTest: true,
  });
  highlightMesh = new THREE.Mesh(hlGeo, hlMat);
  highlightMesh.visible = false;
  scene.add(highlightMesh);

  window.addEventListener('resize', onResize);
}

function onResize() {
  const W = window.innerWidth, H = window.innerHeight;
  camera.aspect = W / H;
  camera.updateProjectionMatrix();
  renderer.setSize(W, H);
}

// ── チャンクメッシュ構築 ─────────────────
const chunkMaterial = new THREE.MeshLambertMaterial({ vertexColors: true });

function buildChunkMesh(cx, cz) {
  const positions = [];
  const normals   = [];
  const colors    = [];
  const indices   = [];
  let vi = 0;

  const baseX = cx * CHUNK_W;
  const baseZ = cz * CHUNK_D;

  for (let ly = 0; ly < CHUNK_H; ly++) {
    for (let lz = 0; lz < CHUNK_D; lz++) {
      for (let lx = 0; lx < CHUNK_W; lx++) {
        const wx = baseX + lx;
        const wy = ly;
        const wz = baseZ + lz;

        const blockId = getBlock(wx, wy, wz);
        if (blockId === BLOCK.AIR) continue;

        for (let fi = 0; fi < FACE_DATA.length; fi++) {
          const face = FACE_DATA[fi];
          const [nx, ny, nz] = face.dir;
          const nb = getBlock(wx + nx, wy + ny, wz + nz);

          // 隣が不透明ならこの面は不要
          if (!isBlockTransparent(nb)) continue;

          const fc = getBlockFaceColor(blockId, face.dir);
          const br = face.brightness;
          const r = fc[0] * br;
          const g = fc[1] * br;
          const b = fc[2] * br;

          const sv = vi;
          for (let ci = 0; ci < 4; ci++) {
            const corner = face.corners[ci];
            positions.push(
              corner.pos[0] + lx,
              corner.pos[1] + ly,
              corner.pos[2] + lz
            );
            normals.push(nx, ny, nz);
            colors.push(r, g, b);
          }
          // インデックス (三角形 x2)
          indices.push(sv, sv+1, sv+2, sv+2, sv+1, sv+3);
          vi += 4;
        }
      }
    }
  }

  if (positions.length === 0) return null;

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal',   new THREE.Float32BufferAttribute(normals,   3));
  geo.setAttribute('color',    new THREE.Float32BufferAttribute(colors,    3));
  geo.setIndex(indices);

  const mesh = new THREE.Mesh(geo, chunkMaterial);
  mesh.position.set(baseX, 0, baseZ);
  return mesh;
}

// ── チャンク再構築 ───────────────────────
function rebuildChunk(cx, cz) {
  if (cx < 0 || cx >= WORLD_CX || cz < 0 || cz >= WORLD_CZ) return;
  const key = `${cx},${cz}`;

  if (chunkMeshes[key]) {
    scene.remove(chunkMeshes[key]);
    chunkMeshes[key].geometry.dispose();
    delete chunkMeshes[key];
  }

  const mesh = buildChunkMesh(cx, cz);
  if (mesh) {
    scene.add(mesh);
    chunkMeshes[key] = mesh;
  }
}

function buildAllChunks() {
  for (let cz = 0; cz < WORLD_CZ; cz++) {
    for (let cx = 0; cx < WORLD_CX; cx++) {
      rebuildChunk(cx, cz);
    }
  }
}

// ブロック変更後に影響チャンクを再構築
function rebuildChunksAroundBlock(bx, by, bz) {
  const cx = Math.floor(bx / CHUNK_W);
  const cz = Math.floor(bz / CHUNK_D);
  rebuildChunk(cx, cz);
  if (bx % CHUNK_W === 0)           rebuildChunk(cx - 1, cz);
  if (bx % CHUNK_W === CHUNK_W - 1) rebuildChunk(cx + 1, cz);
  if (bz % CHUNK_D === 0)           rebuildChunk(cx, cz - 1);
  if (bz % CHUNK_D === CHUNK_D - 1) rebuildChunk(cx, cz + 1);
}

// ── ハイライト更新 ───────────────────────
function updateHighlight(hit) {
  if (hit) {
    highlightMesh.position.set(hit.x + 0.5, hit.y + 0.5, hit.z + 0.5);
    highlightMesh.visible = true;
  } else {
    highlightMesh.visible = false;
  }
}

// ── 描画 ─────────────────────────────────
function renderFrame() {
  renderer.render(scene, camera);
}
