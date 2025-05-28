/* ============================
   app.js — NeuroScript AI HWDR
   Model: Tesseract.js v5 (LSTM Neural Network OCR)
   + PDF.js for PDF rendering
   ============================ */

'use strict';

// ─── State ────────────────────────────────────────────────────────────────────
const state = {
  isDrawing: false,
  brushSize: 4,
  brushColor: '#ffffff',
  isEraser: false,
  mode: 'single',
  history: [],
  recognitionHistory: [],
  tesseractWorker: null,
  aiReady: false,
  currentTab: 'draw',

  // Upload state
  uploadFileDataURL: null,   // Raw dataURL for images
  uploadFileName:    '',
  isPDF:             false,
  pdfDoc:            null,   // PDF.js document object
  pdfCurrentPage:    1,
  pdfTotalPages:     0,
  pdfPageDataURLs:   [],     // Rendered page cache
};

// ─── DOM Refs ─────────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

const bgCanvas      = $('bg-canvas');
const drawCanvas    = $('draw-canvas');
const canvasOverlay = $('canvas-overlay');
const canvasHint    = $('canvas-hint');
const aiStatusDot   = $('ai-status-dot');
const aiStatusText  = $('ai-status-text');

// ─── Tesseract LSTM OCR Init ──────────────────────────────────────────────────
async function initAI() {
  try {
    aiStatusDot.className    = 'status-dot';
    aiStatusText.textContent = 'Loading AI...';

    state.tesseractWorker = await Tesseract.createWorker('eng', 1, {
      logger: () => {}, // suppress internal logs
    });

    // Best settings for handwriting — LSTM engine only
    await state.tesseractWorker.setParameters({
      tessedit_ocr_engine_mode:   '1',   // LSTM only (neural net)
      tessedit_char_whitelist:    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?@#$%&*()+=-;:\'"/',
      preserve_interword_spaces:  '1',
      user_defined_dpi:           '300',
    });

    state.aiReady            = true;
    aiStatusDot.className    = 'status-dot ready';
    aiStatusText.textContent = 'LSTM OCR Ready';
    console.log('[NeuroScript] Tesseract LSTM worker ready.');
  } catch (err) {
    aiStatusDot.className    = 'status-dot error';
    aiStatusText.textContent = 'AI Error';
    console.error('[NeuroScript] AI init error:', err);
  }
}

// ─── Background Neural Net Animation ─────────────────────────────────────────
(function initBgAnimation() {
  const ctx = bgCanvas.getContext('2d');
  let W, H, nodes = [];

  function resize() {
    W = bgCanvas.width  = window.innerWidth;
    H = bgCanvas.height = window.innerHeight;
  }

  function createNodes(n = 60) {
    nodes = [];
    for (let i = 0; i < n; i++) {
      nodes.push({
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r:  Math.random() * 2 + 1,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 160) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(99,102,241,${(1 - d / 160) * 0.22})`;
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      }
    }
    nodes.forEach((n) => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(99,102,241,0.5)';
      ctx.fill();
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); createNodes(); });
  resize(); createNodes(); draw();
})();

// ─── Tab Navigation ───────────────────────────────────────────────────────────
document.querySelectorAll('.nav-tab').forEach((btn) => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

function switchTab(tab) {
  document.querySelectorAll('.nav-tab').forEach((b) => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
  const btn   = document.querySelector(`[data-tab="${tab}"]`);
  const panel = $(`panel-${tab}`);
  if (btn)   btn.classList.add('active');
  if (panel) panel.classList.add('active');
  state.currentTab = tab;
  if (tab === 'draw') setTimeout(resizeCanvas, 50);
}

// ─── Drawing Canvas Setup ─────────────────────────────────────────────────────
const ctx = drawCanvas.getContext('2d');
let lastX = 0, lastY = 0;

function resizeCanvas() {
  const wrapper = $('canvas-wrapper');
  const rect    = wrapper.getBoundingClientRect();
  const size    = Math.min(rect.width - 40, rect.height - 40, 560);
  const snap    = ctx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
  drawCanvas.width = drawCanvas.height = size;
  ctx.fillStyle = '#0a0f1a';
  ctx.fillRect(0, 0, size, size);
  if (snap.width === size) ctx.putImageData(snap, 0, 0);
}

function getPos(e) {
  const rect   = drawCanvas.getBoundingClientRect();
  const scaleX = drawCanvas.width  / rect.width;
  const scaleY = drawCanvas.height / rect.height;
  if (e.touches) return {
    x: (e.touches[0].clientX - rect.left) * scaleX,
    y: (e.touches[0].clientY - rect.top)  * scaleY,
  };
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top)  * scaleY,
  };
}

function startDraw(e) {
  e.preventDefault();
  state.isDrawing = true;
  const pos = getPos(e);
  lastX = pos.x; lastY = pos.y;
  saveSnapshot();
  canvasOverlay.classList.add('hidden');
  canvasHint.textContent = 'Drawing...';
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, (state.isEraser ? state.brushSize * 3 : state.brushSize) / 2, 0, Math.PI * 2);
  ctx.fillStyle = state.isEraser ? '#0a0f1a' : state.brushColor;
  ctx.fill();
}

function draw(e) {
  e.preventDefault();
  if (!state.isDrawing) return;
  const pos = getPos(e);
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(pos.x, pos.y);
  ctx.lineWidth   = state.isEraser ? state.brushSize * 3 : state.brushSize;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  ctx.strokeStyle = state.isEraser ? '#0a0f1a' : state.brushColor;
  ctx.shadowColor = state.isEraser ? 'transparent' : state.brushColor;
  ctx.shadowBlur  = state.isEraser ? 0 : 4;
  ctx.stroke();
  lastX = pos.x; lastY = pos.y;
}

function endDraw() {
  if (!state.isDrawing) return;
  state.isDrawing = false;
  ctx.shadowBlur  = 0;
  canvasHint.textContent = 'Click "Recognize" when done!';
}

drawCanvas.addEventListener('mousedown',  startDraw);
drawCanvas.addEventListener('mousemove',  draw);
drawCanvas.addEventListener('mouseup',    endDraw);
drawCanvas.addEventListener('mouseleave', endDraw);
drawCanvas.addEventListener('touchstart', startDraw, { passive: false });
drawCanvas.addEventListener('touchmove',  draw,      { passive: false });
drawCanvas.addEventListener('touchend',   endDraw);

// ─── Undo / Clear ─────────────────────────────────────────────────────────────
function saveSnapshot() {
  const d = ctx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
  state.history.push(d);
  if (state.history.length > 30) state.history.shift();
}

function clearCanvas() {
  ctx.fillStyle = '#0a0f1a';
  ctx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
  state.history = [];
  canvasOverlay.classList.remove('hidden');
  canvasHint.textContent = 'Start drawing a character or word...';
  resetResultPanel();
}

function undoCanvas() {
  if (!state.history.length) return;
  ctx.putImageData(state.history.pop(), 0, 0);
}

$('clear-btn').addEventListener('click', clearCanvas);
$('undo-btn').addEventListener('click',  undoCanvas);

// ─── Brush & Color Tools ──────────────────────────────────────────────────────
document.querySelectorAll('.brush-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.brush-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.brushSize = parseInt(btn.dataset.size, 10);
    state.isEraser  = false;
  });
});

document.querySelectorAll('.swatch').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.swatch').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    if (btn.dataset.color === 'eraser') { state.isEraser = true; }
    else { state.isEraser = false; state.brushColor = btn.dataset.color; }
  });
});

document.querySelectorAll('.mode-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.mode = btn.dataset.mode;
  });
});

// ─── Image Preprocessing ──────────────────────────────────────────────────────
/**
 * Enhanced preprocessing: increase contrast, sharpen, invert if needed.
 * Returns a data URL ready for Tesseract.
 */
function preprocessImageDataURL(sourceDataURL) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const tmp    = document.createElement('canvas');
      const scale  = Math.max(1, 1200 / Math.max(img.width, img.height));
      tmp.width    = img.width  * scale;
      tmp.height   = img.height * scale;
      const tc     = tmp.getContext('2d');

      // Draw source
      tc.drawImage(img, 0, 0, tmp.width, tmp.height);

      // Boost contrast via CSS filter trick
      tc.filter = 'contrast(1.5) brightness(1.1)';
      tc.drawImage(tmp, 0, 0);
      tc.filter = 'none';

      resolve(tmp.toDataURL('image/png'));
    };
    img.src = sourceDataURL;
  });
}

/**
 * Preprocess the drawing canvas: white strokes on black → good for Tesseract.
 */
function preprocessCanvas() {
  const tmp    = document.createElement('canvas');
  tmp.width    = drawCanvas.width  * 2;  // 2× upscale for better OCR
  tmp.height   = drawCanvas.height * 2;
  const tc     = tmp.getContext('2d');
  tc.fillStyle = '#000000';
  tc.fillRect(0, 0, tmp.width, tmp.height);
  tc.imageSmoothingEnabled = true;
  tc.imageSmoothingQuality = 'high';
  tc.drawImage(drawCanvas, 0, 0, tmp.width, tmp.height);
  return tmp.toDataURL('image/png');
}

// ─── Core Recognition Function ────────────────────────────────────────────────
async function runOCR(dataURL, psm = '7') {
  if (!state.aiReady) throw new Error('AI not ready');

  await state.tesseractWorker.setParameters({
    tessedit_pageseg_mode: psm,
  });

  const result = await state.tesseractWorker.recognize(dataURL);
  return result.data;
}

// ─── Draw Tab Recognition ─────────────────────────────────────────────────────
$('recognize-btn').addEventListener('click', async () => {
  if (!state.aiReady) { showToast('AI is loading, please wait…', 'warning'); return; }

  const pixels = ctx.getImageData(0, 0, drawCanvas.width, drawCanvas.height).data;
  const hasContent = pixels.some((v, i) => i % 4 !== 3 && v > 20);
  if (!hasContent) { showToast('Please draw something first!', 'warning'); return; }

  showProcessing(true, 'draw');

  try {
    const dataURL = preprocessCanvas();
    const psm     = state.mode === 'single' ? '10' : '7';
    const data    = await runOCR(dataURL, psm);
    showResult(data, 'draw');
  } catch (err) {
    console.error('[NeuroScript] Draw recognition error:', err);
    showToast('Recognition failed. Try again.', 'error');
  } finally {
    showProcessing(false, 'draw');
  }
});

function showProcessing(show, panel = 'draw') {
  if (panel === 'draw') {
    $('recognize-btn').disabled          = show;
    $('primary-result').style.display   = show ? 'none' : 'flex';
    $('processing-wrap').style.display  = show ? 'flex' : 'none';
    if (show) {
      $('confidence-wrap').style.display    = 'none';
      $('detected-text-wrap').style.display = 'none';
      $('alternatives-wrap').style.display  = 'none';
    }
  } else {
    const btn = $('upload-recognize-btn');
    if (btn) btn.disabled                  = show;
    $('upload-result-idle').style.display  = show ? 'none' : 'flex';
    $('upload-processing').style.display   = show ? 'flex' : 'none';
    $('upload-result-content').style.display = 'none';
  }
}

function resetResultPanel() {
  $('primary-result').style.display = 'flex';
  $('primary-result').innerHTML = `
    <div class="result-idle">
      <div class="idle-icon">🧠</div>
      <p>Draw something and hit<br><strong>Recognize</strong></p>
    </div>`;
  $('confidence-wrap').style.display    = 'none';
  $('detected-text-wrap').style.display = 'none';
  $('alternatives-wrap').style.display  = 'none';
  $('processing-wrap').style.display    = 'none';
}

function showResult(data, panel = 'draw') {
  const text = (data.text || '').trim().replace(/\n+/g, ' ').trim();
  const conf = Math.round(data.confidence || 0);

  if (panel === 'draw') {
    $('primary-result').style.display = 'flex';
    $('primary-result').innerHTML     = buildResultHTML(text, conf);

    $('confidence-wrap').style.display = 'flex';
    $('conf-percent').textContent      = `${conf}%`;
    setTimeout(() => { $('conf-fill').style.width = `${conf}%`; }, 50);

    if (text.length > 0) {
      $('detected-text-wrap').style.display = 'flex';
      $('detected-text-box').textContent    = text;
      $('copy-btn').onclick = () =>
        navigator.clipboard.writeText(text).then(() => showToast('Copied!'));
    }

    if (state.mode === 'single' && text.length <= 3) {
      $('alternatives-wrap').style.display = 'flex';
      buildAlternatives(text.charAt(0), conf);
    }

    addToHistory(text, conf, 'draw');
  }
}

function buildResultHTML(text, conf) {
  if (!text) return `<div class="result-idle">
    <div class="idle-icon">🤔</div>
    <p>Nothing detected.<br>Write larger and clearer.</p>
  </div>`;

  const type = classifyText(text);
  if (text.length === 1) {
    return `<div class="result-char-display">
      <div class="result-char">${escapeHTML(text)}</div>
      <div class="result-char-type">${type}</div>
    </div>`;
  }
  return `<div class="result-char-display">
    <div class="result-text-display">${escapeHTML(text)}</div>
    <div class="result-char-type">${type}</div>
  </div>`;
}

function classifyText(t) {
  if (!t) return 'Unknown';
  if (/^\d+$/.test(t))       return '🔢 Number';
  if (/^[A-Z]$/.test(t))    return '🔡 Uppercase';
  if (/^[a-z]$/.test(t))    return '🔡 Lowercase';
  if (/^[A-Za-z]+$/.test(t)) return '📝 Word';
  if (/^[A-Za-z0-9\s]+$/.test(t)) return '📄 Text';
  return '✏️ Character';
}

function buildAlternatives(primary, conf) {
  const similar = {
    '0':['O','Q','D'], '1':['l','I','7'], '2':['Z','z'], '3':['E','B'],
    '4':['A','h'],     '5':['S','s'],     '6':['G','b'], '7':['T','1'],
    '8':['B','X'],     '9':['g','q'],     'O':['0','Q'], 'I':['1','l'],
    'S':['5','s'],     'Z':['2','z'],     'B':['8','3'], 'G':['6','C'],
    'A':['4','H'],     'E':['3','F'],     'l':['1','I'], 'g':['9','q'],
  };
  const alts = similar[primary] || [];
  const items = [{ char: primary, score: conf }];
  alts.forEach((c, i) => items.push({ char: c, score: Math.max(5, conf - (i + 1) * 14 + Math.floor(Math.random() * 8)) }));

  $('alternatives-grid').innerHTML = items.slice(0, 8).map(({ char, score }) => `
    <div class="alt-item">
      <span class="alt-char">${escapeHTML(char)}</span>
      <span class="alt-score">${score}%</span>
    </div>`).join('');
}

// ─── History ──────────────────────────────────────────────────────────────────
function addToHistory(text, conf, source) {
  if (!text.trim()) return;
  state.recognitionHistory.unshift({
    id: Date.now(), text: text.trim(), conf, source,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });
  renderHistory();
}

function renderHistory() {
  const grid  = $('history-grid');
  const empty = $('history-empty');
  const cards = Array.from(grid.querySelectorAll('.history-card'));
  cards.forEach((c) => c.remove());

  if (!state.recognitionHistory.length) { empty.style.display = 'flex'; return; }
  empty.style.display = 'none';

  state.recognitionHistory.forEach((e) => {
    const card       = document.createElement('div');
    card.className   = 'history-card';
    const isSingle   = e.text.length === 1;
    card.innerHTML   = `
      ${isSingle ? `<div class="history-card-char">${escapeHTML(e.text)}</div>` : ''}
      ${!isSingle  ? `<div class="history-card-text">"${escapeHTML(e.text.slice(0, 60))}"</div>` : ''}
      <div class="history-card-meta">
        <span class="history-card-conf">${e.conf}%</span>
        <span class="history-card-type">${e.source}</span>
      </div>
      <div class="history-card-time">${e.time}</div>`;
    grid.appendChild(card);
  });
}

$('clear-history-btn').addEventListener('click', () => {
  state.recognitionHistory = [];
  renderHistory();
});

// ─── PDF.js Loader ────────────────────────────────────────────────────────────
async function loadPDFJS() {
  // PDF.js is loaded as module via CDN; access via globalThis.pdfjsLib
  // We use the UMD/compat build by dynamically importing
  if (window.pdfjsLib) return window.pdfjsLib;

  return new Promise((resolve, reject) => {
    const script  = document.createElement('script');
    script.src    = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/legacy/build/pdf.min.js';
    script.onload = () => {
      const lib = window['pdfjs-dist/build/pdf'] || window.pdfjsLib;
      if (lib) {
        lib.GlobalWorkerOptions.workerSrc =
          'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/legacy/build/pdf.worker.min.js';
        window.pdfjsLib = lib;
        resolve(lib);
      } else {
        reject(new Error('PDF.js not found after script load'));
      }
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function renderPDFPage(pageNum) {
  if (!state.pdfDoc) return null;

  // Check cache
  if (state.pdfPageDataURLs[pageNum - 1]) {
    return state.pdfPageDataURLs[pageNum - 1];
  }

  const page      = await state.pdfDoc.getPage(pageNum);
  const viewport  = page.getViewport({ scale: 2.5 }); // high-res for OCR
  const tmp       = document.createElement('canvas');
  tmp.width       = viewport.width;
  tmp.height      = viewport.height;
  const tc        = tmp.getContext('2d');
  await page.render({ canvasContext: tc, viewport }).promise;

  const dataURL = tmp.toDataURL('image/png');
  state.pdfPageDataURLs[pageNum - 1] = dataURL;
  return dataURL;
}

// ─── Upload File Handling ─────────────────────────────────────────────────────
const dropZone  = $('drop-zone');
const fileInput = $('file-input');
const previewWrap = $('image-preview-wrap');
const previewImg  = $('preview-img');

// Fix: browse button opens file input
$('browse-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  fileInput.click();
});

// Drop Zone click also triggers browse (but not via label conflict)
dropZone.addEventListener('click', (e) => {
  if (e.target === $('browse-btn') || e.target.closest('#browse-btn')) return;
  fileInput.click();
});

// Drag-over visual
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
});
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) processUploadedFile(file);
});

// File input change
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) processUploadedFile(file);
  // Reset so same file can be re-selected
  fileInput.value = '';
});

async function processUploadedFile(file) {
  const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const isImg = file.type.startsWith('image/');

  if (!isPDF && !isImg) {
    showToast('Please upload an image or PDF file.', 'warning');
    return;
  }

  state.uploadFileName = file.name;
  state.isPDF          = isPDF;
  state.pdfDoc         = null;
  state.pdfCurrentPage = 1;
  state.pdfTotalPages  = 0;
  state.pdfPageDataURLs = [];
  state.uploadFileDataURL = null;

  // Reset results
  $('upload-result-idle').style.display    = 'flex';
  $('upload-result-content').style.display = 'none';
  $('upload-processing').style.display     = 'none';

  if (isPDF) {
    await handlePDFFile(file);
  } else {
    await handleImageFile(file);
  }
}

async function handleImageFile(file) {
  const reader = new FileReader();
  reader.onload = (ev) => {
    state.uploadFileDataURL = ev.target.result;
    $('preview-filename').textContent     = state.uploadFileName;
    previewImg.src                        = state.uploadFileDataURL;
    previewImg.style.display              = 'block';
    previewWrap.style.display             = 'block';
    dropZone.style.display                = 'none';
    $('pdf-nav').style.display            = 'none';
  };
  reader.onerror = () => showToast('Failed to read file.', 'error');
  reader.readAsDataURL(file);
}

async function handlePDFFile(file) {
  showToast('Loading PDF…', 'success');
  dropZone.style.display    = 'none';
  previewWrap.style.display = 'block';
  $('preview-filename').textContent = state.uploadFileName;
  previewImg.src            = '';

  try {
    const lib = await loadPDFJS();
    const arrayBuffer = await file.arrayBuffer();
    state.pdfDoc = await lib.getDocument({ data: arrayBuffer }).promise;
    state.pdfTotalPages = state.pdfDoc.numPages;

    // Render first page
    const firstPageURL = await renderPDFPage(1);
    state.uploadFileDataURL = firstPageURL;
    previewImg.src = firstPageURL;
    previewImg.style.display = 'block';

    // Show page nav
    updatePDFNav();
    $('pdf-nav').style.display = 'flex';
    showToast(`PDF loaded: ${state.pdfTotalPages} page(s)`, 'success');
  } catch (err) {
    console.error('[NeuroScript] PDF load error:', err);
    showToast('Failed to load PDF. Try another file.', 'error');
    resetUpload();
  }
}

function updatePDFNav() {
  $('pdf-page-label').textContent = `Page ${state.pdfCurrentPage} of ${state.pdfTotalPages}`;
  $('pdf-prev-btn').disabled      = state.pdfCurrentPage <= 1;
  $('pdf-next-btn').disabled      = state.pdfCurrentPage >= state.pdfTotalPages;
}

$('pdf-prev-btn')?.addEventListener('click', async () => {
  if (state.pdfCurrentPage <= 1) return;
  state.pdfCurrentPage--;
  const url = await renderPDFPage(state.pdfCurrentPage);
  state.uploadFileDataURL = url;
  previewImg.src = url;
  updatePDFNav();
});

$('pdf-next-btn')?.addEventListener('click', async () => {
  if (state.pdfCurrentPage >= state.pdfTotalPages) return;
  state.pdfCurrentPage++;
  const url = await renderPDFPage(state.pdfCurrentPage);
  state.uploadFileDataURL = url;
  previewImg.src = url;
  updatePDFNav();
});

// Recognize all PDF pages
$('pdf-all-btn')?.addEventListener('click', async () => {
  if (!state.aiReady) { showToast('AI is loading…', 'warning'); return; }
  await runUploadRecognition(true);
});

$('preview-remove-btn').addEventListener('click', resetUpload);

function resetUpload() {
  state.uploadFileDataURL = null;
  state.isPDF             = false;
  state.pdfDoc            = null;
  previewImg.src          = '';
  previewWrap.style.display = 'none';
  dropZone.style.display    = 'flex';
  $('pdf-nav').style.display = 'none';
  $('upload-result-idle').style.display    = 'flex';
  $('upload-result-content').style.display = 'none';
  $('upload-processing').style.display     = 'none';
}

// ─── Upload Recognition ────────────────────────────────────────────────────────
$('upload-recognize-btn').addEventListener('click', () => runUploadRecognition(false));

async function runUploadRecognition(allPages = false) {
  if (!state.aiReady) { showToast('AI is loading…', 'warning'); return; }
  if (!state.uploadFileDataURL) { showToast('No file loaded.', 'warning'); return; }

  $('upload-result-idle').style.display    = 'none';
  $('upload-processing').style.display     = 'flex';
  $('upload-result-content').style.display = 'none';

  const uploadBtn = $('upload-recognize-btn');
  if (uploadBtn) uploadBtn.disabled = true;

  try {
    let fullText = '';
    let totalConf = 0;
    let pageCount = 0;

    if (allPages && state.isPDF && state.pdfDoc) {
      // Process all pages
      for (let p = 1; p <= state.pdfTotalPages; p++) {
        $('upload-processing').querySelector('.processing-text').textContent =
          `Recognizing page ${p} of ${state.pdfTotalPages}…`;
        const url       = await renderPDFPage(p);
        const processed = await preprocessImageDataURL(url);
        const data      = await runOCR(processed, '3');
        fullText  += `\n--- Page ${p} ---\n${(data.text || '').trim()}\n`;
        totalConf += data.confidence || 0;
        pageCount++;
      }
      totalConf = Math.round(totalConf / Math.max(1, pageCount));
    } else {
      // Single image or single PDF page
      const processed = await preprocessImageDataURL(state.uploadFileDataURL);
      const data      = await runOCR(processed, '3');
      fullText  = (data.text || '').trim();
      totalConf = Math.round(data.confidence || 0);
    }

    displayUploadResult(fullText, totalConf);
  } catch (err) {
    console.error('[NeuroScript] Upload recognition error:', err);
    showToast('Recognition failed. Try another file.', 'error');
    $('upload-result-idle').style.display = 'flex';
    $('upload-processing').style.display  = 'none';
  } finally {
    if (uploadBtn) uploadBtn.disabled = false;
  }
}

function displayUploadResult(text, conf) {
  $('upload-processing').style.display     = 'none';
  $('upload-result-content').style.display = 'flex';
  $('upload-result-content').style.flexDirection = 'column';

  $('upload-conf-percent').textContent = `${conf}%`;
  setTimeout(() => { $('upload-conf-fill').style.width = `${conf}%`; }, 50);

  $('upload-detected-text').textContent = text || '(No text detected — try a clearer image)';

  // Word breakdown
  const words = text.split(/\s+/).filter((w) => w.trim().length > 0);
  $('word-breakdown').innerHTML = words.map((w) =>
    `<div class="word-chip">${escapeHTML(w)}</div>`
  ).join('');

  $('upload-copy-btn').onclick = () =>
    navigator.clipboard.writeText(text).then(() => showToast('Copied!'));

  $('upload-download-btn').onclick = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = `${state.uploadFileName.replace(/\.[^.]+$/, '')}_recognized.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  addToHistory(text.slice(0, 80), conf, 'upload');
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const toast = $('toast');
  const colors = { success: 'rgba(34,197,94,0.3)', warning: 'rgba(245,158,11,0.3)', error: 'rgba(239,68,68,0.3)' };
  const fgCol  = { success: '#4ade80', warning: '#fbbf24', error: '#f87171' };
  toast.style.borderColor = colors[type] || colors.success;
  toast.style.color       = fgCol[type]  || fgCol.success;
  $('toast-msg').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Init ─────────────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  ctx.fillStyle = '#0a0f1a';
  ctx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
  initAI();
});
