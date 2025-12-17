// =====================================================
// Online Stats Solver — Topic 1 (Clean + Robust)
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
    clearCanvas(hctx, histCanvas);
    clearCanvas(bctx, boxCanvas);
    return;
  }

  const stats = computeStats(values);
  resultsBox.textContent = formatSummary(col, values.length, stats);

  drawHistogram(values, col, stats);
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
  const cleaned = String(s).trim().replace(/,/g, "");
  const v = Number(cleaned);
  return Number.isFinite(v) ? v : NaN;
}

function detectNumericColumns(table) {
  return table.headers.filter(h => {
    const nums = table.rows.map(r => toNumber(r[h])).filter(v => Number.isFinite(v));
    return nums.length >= Math.max(3, Math.floor(table.rows.length * 0.6));
  });
}

// Dropdown with placeholder (so "change" always fires)
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

  // Mode (exact frequency)
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

  // Whiskers: min/max within fences
  const inRange = xs.filter(v => v >= lowerFence && v <= upperFence);
  const whiskMin = inRange.length ? inRange[0] : xs[0];
  const whiskMax = inRange.length ? inRange[inRange.length - 1] : xs[n - 1];

  // Skewness
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

function formatTick(v) {
  if (!Number.isFinite(v)) return "";
  return Math.round(v).toLocaleString();
}

function niceTicks(min, max, n = 6) {
  if (min === max) return [min];
  const span = max - min;
  const raw = span / (n - 1);

  const pow10 = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = Math.ceil(raw / pow10) * pow10;

  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;

  const ticks = [];
  for (let v = start; v <= end + 1e-9; v += step) ticks.push(v);
  return ticks;
}

// ---------------- Histogram (frequency) ----------------
function drawHistogram(data, label, s) {
  clearCanvas(hctx, histCanvas);

  const n = data.length;
  const bins = Math.max(5, Math.ceil(1 + Math.log2(n)));

  const min = Math.min(...data);
  const max = Math.max(...data);
  if (min === max) return;

  const mean = s.mean;
  const sd = s.sd;

  const width = (max - min) / bins;
  const counts = Array(bins).fill(0);
  data.forEach(v => {
    let i = Math.floor((v - min) / width);
    if (i >= bins) i = bins - 1;
    if (i < 0) i = 0;
    counts[i]++;
  });

  const padL = 85, padR = 35, padT = 55, padB = 85;
  const w = histCanvas.width;
  const h = histCanvas.height;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const maxCount = Math.max(...counts, 1);
  const barW = plotW / bins;

  // Title + subtitle
  hctx.fillStyle = "#111";
  hctx.font = "13px system-ui";
  hctx.fillText(`Histogram (Frequency): ${label}`, padL, 22);
  hctx.font = "12px system-ui";
  hctx.fillText("Bars show the number of observations in each range", padL, 40);

  // Axes
  hctx.strokeStyle = "#222";
  hctx.beginPath();
  hctx.moveTo(padL, h - padB);
  hctx.lineTo(w - padR, h - padB);
  hctx.moveTo(padL, h - padB);
  hctx.lineTo(padL, padT);
  hctx.stroke();

  // Axis labels
  hctx.fillStyle = "#111";
  hctx.font = "13px system-ui";
  const xLabelY = h - 45;
  hctx.fillText(label, padL + plotW/2 - 30, xLabelY);
  //hctx.fillText(label, padL + plotW/2 - hctx.measureText(label).width / 2, h - 12);
 
  hctx.save();
  hctx.rotate(-Math.PI/2);
  hctx.fillText("Frequency", -(padT + plotH/2 + 25), 22);
  hctx.restore();

  // Y ticks
  const yTicks = niceTicks(0, maxCount, 5);
  hctx.font = "11px system-ui";
  yTicks.forEach(t => {
    const y = (h - padB) - (t / maxCount) * plotH;
    hctx.strokeStyle = "#555";
    hctx.beginPath();
    hctx.moveTo(padL - 6, y);
    hctx.lineTo(padL, y);
    hctx.stroke();
    hctx.fillStyle = "#111";
    hctx.fillText(String(Math.round(t)), padL - 32, y + 4);
  });

  // X ticks
  const xTicks = niceTicks(min, max, 6);
  xTicks.forEach(t => {
    const x = padL + ((t - min) / (max - min)) * plotW;
    hctx.strokeStyle = "#555";
    hctx.beginPath();
    hctx.moveTo(x, h - padB);
    hctx.lineTo(x, h - padB + 6);
    hctx.stroke();
    hctx.fillStyle = "#111";
    hctx.fillText(formatTick(t), x - 16, h - padB + 22);
  });

  // Bars
  hctx.fillStyle = "#4f46e5";
  counts.forEach((c,i) => {
    const barH = (c / maxCount) * plotH;
    hctx.fillRect(padL + i*barW + 1, (h - padB) - barH, barW - 2, barH);
  });

  // Normal curve (visual comparison only)
  if (sd > 0) {
    hctx.strokeStyle = "orange";
    hctx.lineWidth = 2;
    hctx.beginPath();
    for (let px = 0; px <= plotW; px++) {
      const xVal = min + (px/plotW)*(max-min);
      const yVal = (1/(sd*Math.sqrt(2*Math.PI))) * Math.exp(-0.5*((xVal-mean)/sd)**2);
      const yScaled = yVal * n * width; // expected count per bin width
      const yPix = (h - padB) - (yScaled / maxCount) * plotH;
      if (px === 0) hctx.moveTo(padL + px, yPix);
      else hctx.lineTo(padL + px, yPix);
    }
    hctx.stroke();
    hctx.lineWidth = 1;
  }

  // Sentence placed under the x-axis label
  hctx.fillStyle = "#111";
  hctx.font = "12px system-ui";
  hctx.fillText(
    "The normal curve shown uses the same mean and standard deviation as the data and is included only for visual comparison.",
    padL,
    xLabelY + 18
  );
}

// ---------------- Boxplot ----------------
function drawBoxplot(data, s, label) {
  clearCanvas(bctx, boxCanvas);

  const w = boxCanvas.width;
  const h = boxCanvas.height;

  const padL = 85, padR = 35, padT = 45, padB = 85;
  //const y = (padT + (h - padB)) / 2;
  const y = padT + (h - padT - padB) * 0.45;

  const min = Math.min(...data);
  const max = Math.max(...data);
  if (min === max) return;

  const scaleX = v => padL + (v - min) / (max - min) * (w - padL - padR);

  // Title
  bctx.fillStyle = "#111";
  bctx.font = "12px system-ui";
  bctx.fillText(`Box-and-Whisker Plot: ${label}`, padL, 22);

  //bctx.font = "12px system-ui";
  //bctx.fillText("THICK BOX TEST ✅", padL, 42);


  // Axis
  bctx.strokeStyle = "#222";
  bctx.beginPath();
  bctx.moveTo(padL, y);
  bctx.lineTo(w - padR, y);
  bctx.stroke();

  // Key x positions
  const xQ1 = scaleX(s.q1);
  const xQ3 = scaleX(s.q3);
  const xMed = scaleX(s.median);
  const xWMin = scaleX(s.whiskMin);
  const xWMax = scaleX(s.whiskMax);

  // ---- Label Q1, Median (Q2), Q3 on the diagram ----
  bctx.fillStyle = "#111";
  bctx.font = "12px system-ui";

// Put labels just above the box
  bctx.fillText("Q1", xQ1 - 8, y - 38);
  bctx.fillText("Q2", xMed - 8, y - 52);
  bctx.fillText("Q3", xQ3 - 8, y - 38);

// ---- Label LF and UF on the diagram ----
  const xLF = scaleX(s.lowerFence);
  const xUF = scaleX(Math.min(s.upperFence, max));


// draw small tick marks at LF/UF on the axis
  bctx.strokeStyle = "#444";
  bctx.beginPath();
  bctx.moveTo(xLF, y - 10); bctx.lineTo(xLF, y + 10);
  bctx.moveTo(xUF, y - 10); bctx.lineTo(xUF, y + 10);
  bctx.stroke();

// label them above the axis
  bctx.fillText("LF", xLF - 10, y + 30);
  bctx.fillText("UF", xUF - 10, y + 30);
 

  // Whiskers
  bctx.strokeStyle = "#111";
  bctx.lineWidth = 3;
  bctx.beginPath();
  bctx.moveTo(xWMin, y);
  bctx.lineTo(xQ1, y);
  bctx.moveTo(xQ3, y);
  bctx.lineTo(xWMax, y);
  bctx.stroke();

  // Caps
  bctx.beginPath();
  bctx.moveTo(xWMin, y - 14); bctx.lineTo(xWMin, y + 14);
  bctx.moveTo(xWMax, y - 14); bctx.lineTo(xWMax, y + 14);
  bctx.stroke();
  bctx.lineWidth = 1;

  // Box
  bctx.lineWidth = 2;
  bctx.fillStyle = "#c7d2fe";
  bctx.fillRect(xQ1, y - 30, xQ3 - xQ1, 60);
  bctx.strokeRect(xQ1, y - 30, xQ3 - xQ1, 60);

  // Median
  bctx.beginPath();
  bctx.moveTo(xMed, y - 30);
  bctx.lineTo(xMed, y + 30);
  bctx.stroke();
  bctx.lineWidth = 1;

  // Outliers
  bctx.fillStyle = "red";
  s.outliers.forEach(v => {
    const xo = scaleX(v);
    bctx.beginPath();
    bctx.arc(xo, y, 4, 0, 2*Math.PI);
    bctx.fill();
  });

  // Caption (top)
  bctx.fillStyle = "#111";
  bctx.font = "12px system-ui";
  bctx.fillText("Red points indicate unusually large values relative to the rest of the data.", padL, 50);
 }

