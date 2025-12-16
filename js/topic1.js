// =====================================================
// Online Stats Solver — Topic 1 (Corrected + Robust)
// Descriptive Statistics ONLY
// =====================================================
const resultsBox = document.getElementById("results");
if (resultsBox) resultsBox.textContent = "✅ JavaScript loaded. Now choose a CSV file.";

const fileInput = document.getElementById("fileInput");
const columnSelect = document.getElementById("columnSelect");
const columnNote = document.getElementById("columnNote");
const resultsBox = document.getElementById("results");

const histCanvas = document.getElementById("histCanvas");
const boxCanvas  = document.getElementById("boxCanvas");

const hctx = histCanvas.getContext("2d");
const bctx = boxCanvas.getContext("2d");

let dataTable = null;

fileInput.addEventListener("change", async () => {
  const file = fileInput.files[0];
  if (!file) return;

  const text = await file.text();
  dataTable = parseCSV(text);

  const numericColumns = detectNumericColumns(dataTable);
  populateDropdown(numericColumns);

  resultsBox.textContent =
    `File loaded: ${file.name}\nRows: ${dataTable.rows.length}\n\nSelect a variable to analyse.`;

  clearCanvas(hctx, histCanvas);
  clearCanvas(bctx, boxCanvas);
});

columnSelect.addEventListener("change", () => {
  if (!dataTable) return;

  const col = columnSelect.value;
  const values = getNumericColumn(dataTable, col);

  if (values.length < 3) {
    resultsBox.textContent = `Not enough numeric data in "${col}".`;
    return;
  }

  const stats = computeStats(values);
  resultsBox.textContent = formatSummary(col, values.length, stats);

  drawHistogram(values, col);
  drawBoxplot(values, stats, col);
});

// ---------------- CSV parsing (handles quotes) ----------------
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  const headers = splitCSVLine(lines[0]).map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = splitCSVLine(lines[i]);
    const row = {};
    headers.forEach((h, j) => row[h] = (parts[j] ?? "").trim());
    rows.push(row);
  }
  return { headers, rows };
}

function splitCSVLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') inQuotes = !inQuotes;
    else if (ch === "," && !inQuotes) { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

// ---------------- Numeric handling ----------------
function toNumber(s) {
  if (s == null) return NaN;
  const cleaned = String(s).trim().replace(/,/g, ""); // allow 12,000
  const v = Number(cleaned);
  return Number.isFinite(v) ? v : NaN;
}

function detectNumericColumns(table) {
  return table.headers.filter(h => {
    const nums = table.rows.map(r => toNumber(r[h])).filter(v => Number.isFinite(v));
    return nums.length >= Math.max(3, Math.floor(table.rows.length * 0.6));
  });
}

function populateDropdown(columns) {
  columnSelect.innerHTML = "";

  if (columns.length === 0) {
    columnSelect.disabled = true;
    columnNote.textContent = "No numeric columns detected. Check your CSV.";
    return;
  }

  columnSelect.disabled = false;
  columnNote.textContent = "Numeric variables only.";

  columns.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    columnSelect.appendChild(opt);
  });
}

function getNumericColumn(table, col) {
  return table.rows.map(r => toNumber(r[col])).filter(v => Number.isFinite(v));
}

// ---------------- Stats ----------------
function computeStats(x) {
  const n = x.length;
  const xs = [...x].sort((a,b) => a-b);

  const mean = xs.reduce((a,b) => a + b, 0) / n;

  const median = (n % 2 === 1)
    ? xs[(n - 1) / 2]
    : (xs[n/2 - 1] + xs[n/2]) / 2;

  // Mode (exact match frequency; OK for learner datasets)
  const freq = new Map();
  for (const v of xs) freq.set(v, (freq.get(v) ?? 0) + 1);

  let mode = xs[0], modeCount = 1;
  for (const [v,c] of freq.entries()) {
    if (c > modeCount) { mode = v; modeCount = c; }
  }
  const hasMode = modeCount > 1;

  // Sample SD
  const varS = xs.reduce((s,v) => s + (v - mean) ** 2, 0) / (n - 1);
  const sd = Math.sqrt(varS);

  const q1 = quantile(xs, 0.25);
  const q3 = quantile(xs, 0.75);
  const iqr = q3 - q1;

  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;

  const outliers = xs.filter(v => v < lowerFence || v > upperFence);

  // Whiskers: min/max within fences (standard boxplot convention)
  const inRange = xs.filter(v => v >= lowerFence && v <= upperFence);
  const whiskMin = inRange.length ? inRange[0] : xs[0];
  const whiskMax = inRange.length ? inRange[inRange.length - 1] : xs[n - 1];

  // Skewness guard: if sd == 0, define skewness = 0 (no spread)
  let skewness = 0;
  if (sd > 0) {
    const m3 = xs.reduce((s,v) => s + (v - mean) ** 3, 0) / n;
    skewness = m3 / (sd ** 3);
  }

  return {
    mean, median,
    mode, modeCount, hasMode,
    sd,
    min: xs[0], max: xs[n - 1],
    q1, q3, iqr,
    lowerFence, upperFence,
    whiskMin, whiskMax,
    outliers,
    skewness
  };
}

function quantile(sorted, p) {
  const i = (sorted.length - 1) * p;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (i - lo) * (sorted[hi] - sorted[lo]);
}

function formatSummary(col, n, s) {
  const modeLine = s.hasMode
    ? `Mode    : ${fmt(s.mode)} (appears ${s.modeCount} times)`
    : `Mode    : No repeated value (no clear mode)`;

  return [
    `Variable: ${col}`,
    `Count   : ${n}`,
    ``,
    `--- Centre ---`,
    `Mean    : ${fmt(s.mean)}`,
    `Median  : ${fmt(s.median)}`,
    modeLine,
    ``,
    `--- Spread ---`,
    `Min     : ${fmt(s.min)}`,
    `Max     : ${fmt(s.max)}`,
    `SD      : ${fmt(s.sd)}`,
    `Q1      : ${fmt(s.q1)}`,
    `Q3      : ${fmt(s.q3)}`,
    `IQR     : ${fmt(s.iqr)}`,
    ``,
    `--- Outliers (IQR rule) ---`,
    `Lower fence : ${fmt(s.lowerFence)}`,
    `Upper fence : ${fmt(s.upperFence)}`,
    `Outliers    : ${s.outliers.length}`,
    ``,
    `--- Shape ---`,
    `Skewness : ${fmt(s.skewness)}`
  ].join("\n");
}

function fmt(v) {
  return Number.isFinite(v) ? v.toFixed(3) : String(v);
}

// ---------------- Graphics ----------------
function clearCanvas(ctx, canvas) {
  ctx.clearRect(0,0,canvas.width,canvas.height);
}

// Histogram (frequency). Handles constant data safely.
function drawHistogram(data, label) {
  clearCanvas(hctx, histCanvas);

  const n = data.length;
  const bins = Math.max(5, Math.ceil(1 + Math.log2(n)));

  const min = Math.min(...data);
  const max = Math.max(...data);

  // Constant data guard
  if (max === min) {
    hctx.fillStyle = "#111";
    hctx.font = "16px system-ui";
    hctx.fillText(`Histogram: ${label}`, 40, 24);
    hctx.font = "13px system-ui";
    hctx.fillText("All values are identical — histogram is a single bar.", 40, 48);
    return;
  }

  const width = (max - min) / bins;
  const counts = Array(bins).fill(0);

  for (const v of data) {
    let i = Math.floor((v - min) / width);
    if (i >= bins) i = bins - 1;
    if (i < 0) i = 0;
    counts[i]++;
  }

  const pad = 50;
  const w = histCanvas.width;
  const h = histCanvas.height;
  const plotW = w - 2 * pad;
  const plotH = h - 2 * pad;

  const maxCount = Math.max(...counts, 1);
  const barW = plotW / bins;

  // Title
  hctx.fillStyle = "#111";
  hctx.font = "16px system-ui";
  hctx.fillText(`Histogram (Frequency): ${label}`, pad, 24);

  // Axes
  hctx.strokeStyle = "#222";
  hctx.beginPath();
  hctx.moveTo(pad, h - pad);
  hctx.lineTo(w - pad, h - pad);
  hctx.moveTo(pad, h - pad);
  hctx.lineTo(pad, pad);
  hctx.stroke();

  // Bars
  hctx.fillStyle = "#4f46e5";
  for (let i = 0; i < bins; i++) {
    const barH = (counts[i] / maxCount) * plotH;
    hctx.fillRect(pad + i * barW + 1, h - pad - barH, barW - 2, barH);
  }
}

// Proper boxplot: box, median, whiskers, outliers (red)
function drawBoxplot(data, s, label) {
  clearCanvas(bctx, boxCanvas);

  const w = boxCanvas.width;
  const h = boxCanvas.height;
  const pad = 70;
  const yMid = h / 2;

  // Scale over full data range (includes outliers)
  const min = Math.min(...data);
  const max = Math.max(...data);

  // Guard: constant data
  const denom = (max - min) || 1;
  const scaleX = v => pad + ((v - min) / denom) * (w - 2 * pad);

  // Title
  bctx.fillStyle = "#111";
  bctx.font = "16px system-ui";
  bctx.fillText(`Box-and-Whisker: ${label}`, pad, 22);

  // Axis
  bctx.strokeStyle = "#222";
  bctx.lineWidth = 2;
  bctx.beginPath();
  bctx.moveTo(pad, yMid);
  bctx.lineTo(w - pad, yMid);
  bctx.stroke();

  // Box (Q1 to Q3)
  const xQ1 = scaleX(s.q1);
  const xQ3 = scaleX(s.q3);

  bctx.fillStyle = "#c7d2fe";
  bctx.fillRect(xQ1, yMid - 22, xQ3 - xQ1, 44);
  bctx.strokeStyle = "#111";
  bctx.lineWidth = 1.5;
  bctx.strokeRect(xQ1, yMid - 22, xQ3 - xQ1, 44);

  // Median line
  const xMed = scaleX(s.median);
  bctx.beginPath();
  bctx.moveTo(xMed, yMid - 22);
  bctx.lineTo(xMed, yMid + 22);
  bctx.stroke();

  // Whiskers (within fences)
  const xWMin = scaleX(s.whiskMin);
  const xWMax = scaleX(s.whiskMax);

  bctx.beginPath();
  bctx.moveTo(xWMin, yMid);
  bctx.lineTo(xQ1, yMid);
  bctx.moveTo(xQ3, yMid);
  bctx.lineTo(xWMax, yMid);
  bctx.stroke();

  // Whisker caps
  bctx.beginPath();
  bctx.moveTo(xWMin, yMid - 14); bctx.lineTo(xWMin, yMid + 14);
  bctx.moveTo(xWMax, yMid - 14); bctx.lineTo(xWMax, yMid + 14);
  bctx.stroke();

  // Outliers (red)
  bctx.fillStyle = "red";
  for (const v of s.outliers) {
    const xo = scaleX(v);
    bctx.beginPath();
    bctx.arc(xo, yMid, 4, 0, 2 * Math.PI);
    bctx.fill();
  }

  // Fence labels (learner-friendly)
  bctx.fillStyle = "#111";
  bctx.font = "12px system-ui";
  bctx.fillText(`Lower fence: ${s.lowerFence.toFixed(2)}`, pad, h - 10);
  bctx.fillText(`Upper fence: ${s.upperFence.toFixed(2)}`, w - pad - 160, h - 10);
}
