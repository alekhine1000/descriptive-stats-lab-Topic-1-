// =====================================================
// Online Stats Solver — Topic 1 (Corrected + Robust)
// Descriptive Statistics ONLY
// =====================================================

// --- DEBUG: confirm JS is running ---
const resultsBox = document.getElementById("results");
if (resultsBox) resultsBox.textContent = "✅ JavaScript loaded. Now choose a CSV file.";

// HTML elements
const fileInput = document.getElementById("fileInput");
const columnSelect = document.getElementById("columnSelect");
const columnNote = document.getElementById("columnNote");

const histCanvas = document.getElementById("histCanvas");
const boxCanvas  = document.getElementById("boxCanvas");

const hctx = histCanvas.getContext("2d");
const bctx = boxCanvas.getContext("2d");

let dataTable = null;

// =====================================================
// 1) CSV Upload
// =====================================================
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

// =====================================================
// 2) Variable Selection
// =====================================================
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

// =====================================================
// CSV Parsing (basic quotes support)
// =====================================================
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

// =====================================================
// Numeric handling
// =====================================================
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

// ✅ This version includes a placeholder so change always fires
function populateDropdown(columns) {
  columnSelect.innerHTML = "";

  if (columns.length === 0) {
    columnSelect.disabled = true;
    columnNote.textContent = "No numeric columns detected. Check your CSV.";
    return;
  }

  columnSelect.disabled = false;
  columnNote.textContent = "Numeric variables only.";

  const placeholder = document.createElement("option");
  placeholder.textContent = "Select a variable";
  placeholder.disabled = true;
  placeholder.selected = true;
  columnSelect.appendChild(placeholder);

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

// =====================================================
// Descriptive statistics
// =====================================================
function computeStats(x) {
  const n = x.length;
  const xs = [...x].sort((a,b) => a-b);

  const mean = xs.reduce((a,b) => a + b, 0) / n;

  const median = (n % 2 === 1)
    ? xs[(n - 1) / 2]
    : (xs[n/2 - 1] + xs[n/2]) / 2;

  // Mode (exact match frequency)
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

  // Whiskers: min/max within fences (standard convention)
  const inRange = xs.filter(v => v >= lowerFence && v <= upperFence);
  const whiskMin = inRange.length ? inRange[0] : xs[0];
  const whiskMax = inRange.length ? inRange[inRange.length - 1] : xs[n - 1];

  // Skewness guard
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

function fmt(v) {
  return Number.isFinite(v) ? v.toFixed(3) : String(v);
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

// =====================================================
// Graphics helpers
// =====================================================
function clearCanvas(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ---------------- Histogram (frequency) ----------------
function drawHistogram(data, label) {
  clearCanvas(hctx, histCanvas);

  const n = data.length;
  const bins = Math.max(5, Math.ceil(1 + Math.log2(n)));

  const min = Math.min(...data);
  const max = Math.max(...data);
  if (min === max) return;

  const mean = data.reduce((a,b)=>a+b,0)/n;
  const sd = Math.sqrt(data.reduce((s,v)=>s+(v-mean)**2,0)/(n-1));

  const width = (max - min) / bins;
  const counts = Array(bins).fill(0);
  data.forEach(v => {
    let i = Math.floor((v - min) / width);
    if (i >= bins) i = bins - 1;
    counts[i]++;
  });

  const pad = 70;
  const w = histCanvas.width;
  const h = histCanvas.height;
  const plotW = w - 2*pad;
  const plotH = h - 2*pad;

  const maxCount = Math.max(...counts);
  const barW = plotW / bins;

  // Title
  hctx.fillStyle = "#111";
  hctx.font = "16px system-ui";
  hctx.fillText(`Histogram (Frequency): ${label}`, pad, 24);

  // Subtitle
  hctx.font = "12px system-ui";
  hctx.fillText("Bars show number of observations in each range", pad, 42);

  // Axes
  hctx.strokeStyle = "#222";
  hctx.beginPath();
  hctx.moveTo(pad, h-pad);
  hctx.lineTo(w-pad, h-pad);
  hctx.moveTo(pad, h-pad);
  hctx.lineTo(pad, pad);
  hctx.stroke();

  // Axis labels
  hctx.font = "13px system-ui";
  hctx.fillText("Salary (RM)", w/2 - 30, h - 10);
  hctx.save();
  hctx.rotate(-Math.PI/2);
  hctx.fillText("Frequency", -h/2 - 30, 20);
  hctx.restore();

  // Bars
  hctx.fillStyle = "#4f46e5";
  counts.forEach((c,i) => {
    const barH = (c / maxCount) * plotH;
    hctx.fillRect(pad + i*barW + 1, h - pad - barH, barW - 2, barH);
  });

  // Normal curve (visual comparison only)
  hctx.strokeStyle = "orange";
  hctx.beginPath();
  for (let px = 0; px <= plotW; px++) {
    const xVal = min + (px/plotW)*(max-min);
    const yVal = (1/(sd*Math.sqrt(2*Math.PI))) *
                 Math.exp(-0.5*((xVal-mean)/sd)**2);
    const yScaled = yVal * maxCount * width;
    const yPix = h - pad - (yScaled/maxCount)*plotH;
    if (px === 0) hctx.moveTo(pad+px, yPix);
    else hctx.lineTo(pad+px, yPix);
  }
  hctx.stroke();

  // Caption
  hctx.font = "12px system-ui";
  hctx.fillStyle = "#111";
  hctx.fillText(
    "Normal curve uses same mean and SD (visual comparison only)",
    pad, h - pad + 18
  );
}

  
// ---------------- Boxplot ----------------
function drawBoxplot(data, s, label) {
  clearCanvas(bctx, boxCanvas);

  const w = boxCanvas.width;
  const h = boxCanvas.height;
  const pad = 70;
  const y = h/2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const scaleX = v => pad + (v-min)/(max-min)*(w-2*pad);

  // Title
  bctx.fillStyle = "#111";
  bctx.font = "16px system-ui";
  bctx.fillText(`Box-and-Whisker Plot: ${label}`, pad, 24);

  // Axis
  bctx.strokeStyle = "#222";
  bctx.beginPath();
  bctx.moveTo(pad, y);
  bctx.lineTo(w-pad, y);
  bctx.stroke();

  // Box
  const xQ1 = scaleX(s.q1);
  const xQ3 = scaleX(s.q3);
  bctx.fillStyle = "#c7d2fe";
  bctx.fillRect(xQ1, y-20, xQ3-xQ1, 40);
  bctx.strokeRect(xQ1, y-20, xQ3-xQ1, 40);

  // Median
  const xMed = scaleX(s.median);
  bctx.beginPath();
  bctx.moveTo(xMed, y-20);
  bctx.lineTo(xMed, y+20);
  bctx.stroke();

  // Labels
  bctx.font = "12px system-ui";
  bctx.fillText("Q1", xQ1-10, y+35);
  bctx.fillText("Median (Q2)", xMed-22, y-25);
  bctx.fillText("Q3", xQ3-10, y+35);

  // Whiskers
  bctx.beginPath();
  bctx.moveTo(scaleX(s.whiskMin), y);
  bctx.lineTo(xQ1, y);
  bctx.moveTo(xQ3, y);
  bctx.lineTo(scaleX(s.whiskMax), y);
  bctx.stroke();

  // Outliers
  bctx.fillStyle = "red";
  s.outliers.forEach(v => {
    bctx.beginPath();
    bctx.arc(scaleX(v), y, 4, 0, 2*Math.PI);
    bctx.fill();
  });

  // Caption
  bctx.fillStyle = "#111";
  bctx.font = "12px system-ui";
  bctx.fillText(
    "Red points indicate unusually large salaries relative to the rest of the data",
    pad, h - 10
  );
}


  
