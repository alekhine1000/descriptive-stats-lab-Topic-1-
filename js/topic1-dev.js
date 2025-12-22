// -----------------------------
// State
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {

let dataTable = null;      // { headers: [], rows: [] }
let currentStats = null;
let currentColumn = null;
let currentData = null;

// DOM
// DOM (declare ONCE)
const fileInput = document.getElementById("fileInput");
const columnSelect = document.getElementById("columnSelect");
const uploadArea = document.getElementById("uploadArea");
const chooseFileBtn = document.getElementById("chooseFileBtn");

const resultsCard = document.getElementById("resultsCard");
const chartsCard = document.getElementById("chartsCard");
const statsGrid = document.getElementById("statsGrid");
const loading = document.getElementById("loading");
const exportBtn = document.getElementById("exportResults");
const clearBtn = document.getElementById("clearData");
const resultsTitle = document.getElementById("resultsTitle");

// Safety check
if (!fileInput || !chooseFileBtn || !uploadArea) {
  console.error("Missing #fileInput or #chooseFileBtn or #uploadArea");
} else {
  // Choose File button
  chooseFileBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    fileInput.value = "";      // allows selecting same file again
    fileInput.click();
  });

  // Clicking the upload area also opens the file picker
  uploadArea.addEventListener("click", () => fileInput.click());

  // Drag & drop support
  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("dragover");
  });

  uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("dragover");
  });

  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("dragover");

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      fileInput.files = files;
      handleFileUpload(files[0]);
    }
  });

  // When user picks a file
  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  });
}





const chooseFileBtn = document.getElementById('chooseFileBtn');
const resultsCard = document.getElementById('resultsCard');
const chartsCard = document.getElementById('chartsCard');
const statsGrid = document.getElementById('statsGrid');
const loading = document.getElementById('loading');
const exportBtn = document.getElementById('exportResults');
const clearBtn = document.getElementById('clearData');
const resultsTitle = document.getElementById('resultsTitle');

// -----------------------------
// Events: Upload area
// -----------------------------
chooseFileBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  fileInput.click();
});

uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    fileInput.files = files;
    handleFileUpload(files[0]);
  }
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) handleFileUpload(e.target.files[0]);
});

// -----------------------------
// Events: Column selection
// -----------------------------
columnSelect.addEventListener('change', () => {
  if (!dataTable || !columnSelect.value) return;

  showLoading();
  setTimeout(() => {
    currentColumn = columnSelect.value;
    currentData = getNumericColumn(dataTable, currentColumn);

    if (currentData.length < 3) {
      showAlert('warning', `Not enough numeric data in "${currentColumn}". Need at least 3 values.`);
      hideLoading();
      return;
    }

    currentStats = computeStats(currentData);
    displayResults();
    displayCharts();
    hideLoading();
  }, 80);
});

// Tabs
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabGroup = tab.parentElement;
    const card = tabGroup.parentElement;
    const contents = card.querySelectorAll('.tab-content');

    tabGroup.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));

    tab.classList.add('active');
    const target = document.getElementById(tab.dataset.tab);
    if (target) target.classList.add('active');
  });
});

exportBtn.addEventListener('click', exportResults);
clearBtn.addEventListener('click', clearAll);

// -----------------------------
// CSV Parsing (PapaParse)
// -----------------------------
async function handleFileUpload(file) {
  if (!file.name.toLowerCase().endsWith('.csv')) {
    showAlert('warning', 'Please upload a CSV file (.csv).');
    return;
  }

  showLoading();

  try {
    const text = await file.text();

    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false
    });

    if (parsed.errors && parsed.errors.length > 0) {
      console.warn(parsed.errors);
      showAlert('warning', 'CSV parsed with warnings. If results look odd, check your CSV formatting.');
    }

    const rows = (parsed.data || []).filter(r => r && Object.keys(r).length > 0);
    const headers = parsed.meta && parsed.meta.fields ? parsed.meta.fields : (rows[0] ? Object.keys(rows[0]) : []);

    if (!headers || headers.length === 0) {
      showAlert('warning', 'Could not detect headers. Make sure the first row contains column names.');
      hideLoading();
      return;
    }

    dataTable = { headers, rows };

    const numericColumns = detectNumericColumns(dataTable);
    populateDropdown(numericColumns);

    displayDataPreview();

    showAlert('success', `Loaded: ${file.name} (${dataTable.rows.length} rows, ${dataTable.headers.length} columns)`);

    if (numericColumns.length > 0) {
      columnSelect.value = numericColumns[0];
      columnSelect.dispatchEvent(new Event('change'));
    }

  } catch (err) {
    showAlert('warning', 'Error reading file: ' + err.message);
  } finally {
    hideLoading();
  }
}

// -----------------------------
// Data helpers
// -----------------------------
function toNumber(s) {
  if (s == null) return NaN;
  const cleaned = String(s).trim().replace(/,/g, "");
  if (cleaned === "") return NaN;
  const v = Number(cleaned);
  return Number.isFinite(v) ? v : NaN;
}

function detectNumericColumns(table) {
  return table.headers.filter(h => {
    let count = 0;
    for (const r of table.rows) {
      const v = toNumber(r[h]);
      if (Number.isFinite(v)) count++;
      if (count >= 3) return true;
    }
    return false;
  });
}

function populateDropdown(columns) {
  columnSelect.innerHTML = '<option value="">Select a variable to analyze</option>';

  if (columns.length === 0) {
    columnSelect.disabled = true;
    showAlert('warning', 'No numeric columns detected. Check your CSV (numbers may be in text form).');
    return;
  }

  columnSelect.disabled = false;

  for (const c of columns) {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    columnSelect.appendChild(opt);
  }
}

function getNumericColumn(table, col) {
  return table.rows
    .map(r => toNumber(r[col]))
    .filter(v => Number.isFinite(v));
}

// -----------------------------
// Statistics
// -----------------------------
function computeStats(x) {
  const n = x.length;
  const xs = [...x].sort((a,b) => a - b);

  const mean = xs.reduce((a,b) => a + b, 0) / n;

  const median = (n % 2 === 1)
    ? xs[(n - 1) / 2]
    : (xs[n/2 - 1] + xs[n/2]) / 2;

  const freq = new Map();
  for (const v of xs) freq.set(v, (freq.get(v) ?? 0) + 1);

  let mode = xs[0], modeCount = 1;
  for (const [v,c] of freq.entries()) {
    if (c > modeCount) { mode = v; modeCount = c; }
  }
  const hasMode = modeCount > 1;

  const varS = n > 1 ? xs.reduce((s,v) => s + (v - mean) ** 2, 0) / (n - 1) : 0;
  const sd = Math.sqrt(varS);

  const q1 = quantile(xs, 0.25);
  const q3 = quantile(xs, 0.75);
  const iqr = q3 - q1;

  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;

  const outliers = xs.filter(v => v < lowerFence || v > upperFence);

  const inRange = xs.filter(v => v >= lowerFence && v <= upperFence);
  const whiskMin = inRange.length ? inRange[0] : xs[0];
  const whiskMax = inRange.length ? inRange[inRange.length - 1] : xs[n - 1];

  const range = xs[n-1] - xs[0];

  const varPop = xs.reduce((s,v)=>s + (v - mean) ** 2, 0) / n;
  const sdPop = Math.sqrt(varPop);
  let skewness = 0;
  if (sdPop > 0) {
    const m3 = xs.reduce((s,v)=>s + (v - mean) ** 3, 0) / n;
    skewness = m3 / (sdPop ** 3);
  }

  return {
    mean, median,
    mode, modeCount, hasMode,
    sd, varS,
    min: xs[0], max: xs[n - 1], range,
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

// -----------------------------
// Display: Results
// -----------------------------
function displayResults() {
  if (!currentStats || !currentColumn) return;

  resultsCard.style.display = 'block';
  resultsTitle.innerHTML = `<i class="fas fa-calculator"></i> Descriptive Statistics — <span style="color:var(--text); font-weight:900;">${escapeHTML(currentColumn)}</span>`;

  const summaryStats = [
    { label: 'Sample Size (n)', value: currentData.length, icon: 'fas fa-hashtag' },
    { label: 'Mean', value: fmt(currentStats.mean), icon: 'fas fa-calculator' },
    { label: 'Median', value: fmt(currentStats.median), icon: 'fas fa-arrows-alt-h' },
    { label: 'Std Dev (sample)', value: fmt(currentStats.sd), icon: 'fas fa-chart-line' },
    { label: 'Min', value: fmt(currentStats.min), icon: 'fas fa-arrow-down' },
    { label: 'Max', value: fmt(currentStats.max), icon: 'fas fa-arrow-up' },
    { label: 'Q1', value: fmt(currentStats.q1), icon: 'fas fa-chart-bar' },
    { label: 'Q3', value: fmt(currentStats.q3), icon: 'fas fa-chart-bar' },
    { label: 'IQR', value: fmt(currentStats.iqr), icon: 'fas fa-expand-arrows-alt' },
    { label: 'Skewness (simple)', value: fmt(currentStats.skewness), icon: 'fas fa-balance-scale' },
    { label: 'Outliers', value: currentStats.outliers.length, icon: 'fas fa-exclamation-triangle' },
    { label: 'Range', value: fmt(currentStats.range), icon: 'fas fa-ruler' }
  ];

  statsGrid.innerHTML = summaryStats.map(stat => `
    <div class="stat-item">
      <div class="stat-label"><i class="${stat.icon}"></i> ${stat.label}</div>
      <div class="stat-value">${stat.value}</div>
    </div>
  `).join('');

  const modeLine = currentStats.hasMode
    ? `Mode    : ${fmt(currentStats.mode)} (appears ${currentStats.modeCount} times)`
    : `Mode    : No mode (all values are unique)`;

  const detailedOutput = [
    `Variable: ${currentColumn}`,
    `Count (n): ${currentData.length}`,
    ``,
    `--- Centre ---`,
    `Mean     : ${fmt(currentStats.mean)}`,
    `Median   : ${fmt(currentStats.median)}`,
    modeLine,
    ``,
    `--- Spread ---`,
    `Min      : ${fmt(currentStats.min)}`,
    `Max      : ${fmt(currentStats.max)}`,
    `Range    : ${fmt(currentStats.range)}`,
    `SD (s)   : ${fmt(currentStats.sd)}   (sample SD)`,
    `Variance : ${fmt(currentStats.varS)} (sample variance)`,
    `Q1       : ${fmt(currentStats.q1)}`,
    `Q3       : ${fmt(currentStats.q3)}`,
    `IQR      : ${fmt(currentStats.iqr)}`,
    ``,
    `--- Outliers (1.5×IQR rule) ---`,
    `Lower fence : ${fmt(currentStats.lowerFence)}`,
    `Upper fence : ${fmt(currentStats.upperFence)}`,
    `Outliers    : ${currentStats.outliers.length}${currentStats.outliers.length ? '  ->  ' + currentStats.outliers.map(fmt).join(', ') : ''}`,
    ``,
    `--- Shape ---`,
    `Skewness (simple) : ${fmt(currentStats.skewness)}`,
  ].join("\n");

  document.getElementById('detailedResults').textContent = detailedOutput;
  document.getElementById('rawResults').textContent = detailedOutput;

  exportBtn.disabled = false;
}

// -----------------------------
// Display: Charts
// -----------------------------
function displayCharts() {
  if (!currentData || !currentStats) return;
  chartsCard.style.display = 'block';

  createHistogram();
  createBoxPlot();
}

// Histogram with ±4σ normal curve extension
function createHistogram() {
  const n = currentData.length;
  const bins = Math.max(8, Math.ceil(1 + Math.log2(n)));

  const dataMin = Math.min(...currentData);
  const dataMax = Math.max(...currentData);

  const range = dataMax - dataMin;
  const width = range === 0 ? 1 : range / bins;

  const counts = Array(bins).fill(0);
  const binCenters = [];

  for (let i = 0; i < bins; i++) {
    const binStart = dataMin + i * width;
    const binEnd = dataMin + (i + 1) * width;
    binCenters.push((binStart + binEnd) / 2);
  }

  for (const v of currentData) {
    let i = range === 0 ? 0 : Math.floor((v - dataMin) / width);
    if (i >= bins) i = bins - 1;
    if (i < 0) i = 0;
    counts[i]++;
  }

  const histogramTrace = {
    x: binCenters,
    y: counts,
    type: 'bar',
    name: 'Data',
    marker: { opacity: 0.85 },
    width: width * 0.9
  };

  const traces = [histogramTrace];

  const mean = currentStats.mean;
  const std = currentStats.sd;

  const canDrawNormal = (std > 1e-6) && (range > 0);

  if (canDrawNormal) {
    const xMin = mean - 4 * std;
    const xMax = mean + 4 * std;

    const steps = 240;
    const step = (xMax - xMin) / steps;

    const normalX = [];
    const normalY = [];

    for (let k = 0; k <= steps; k++) {
      const x = xMin + k * step;
      const y = (n * width) * normalPDF(x, mean, std);
      normalX.push(x);
      normalY.push(y);
    }

    const normalTrace = {
      x: normalX,
      y: normalY,
      type: 'scatter',
      mode: 'lines',
      name: 'Normal curve (±4σ)',
      yaxis: 'y2'
    };

    traces.push(normalTrace);

    const titleEl = document.getElementById('chartTitle');
    if (titleEl) titleEl.textContent = 'Histogram (Normal curve shown over ±4 SD)';
  } else {
    const titleEl = document.getElementById('chartTitle');
    if (titleEl) titleEl.textContent = 'Histogram';
  }

  const layout = {
    title: { text: `Histogram: ${currentColumn}`, font: { size: 18, family: 'Inter' } },
    xaxis: { title: currentColumn, gridcolor: '#f1f5f9', showgrid: true },
    yaxis: { title: 'Frequency', gridcolor: '#f1f5f9', showgrid: true, side: 'left' },
    yaxis2: { title: 'Theoretical frequency', overlaying: 'y', side: 'right', showgrid: false },
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(255,255,255,0.85)', bordercolor: '#e2e8f0', borderwidth: 1 },
    margin: { t: 60, b: 80, l: 80, r: 80 },
    plot_bgcolor: '#fafafa',
    paper_bgcolor: 'white'
  };

  Plotly.newPlot('histogramChart', traces, layout, { responsive: true, displayModeBar: false });
}

function createBoxPlot() {
  const trace = {
    y: currentData,
    type: 'box',
    name: currentColumn,
    boxpoints: 'outliers',
    jitter: 0.3,
    pointpos: 0,
    fillcolor: 'rgba(59, 130, 246, 0.12)',
    line: { width: 2 },
    marker: { size: 7 }
  };

  const layout = {
    title: { text: `Box Plot: ${currentColumn}`, font: { size: 18, family: 'Inter' } },
    yaxis: { title: currentColumn, gridcolor: '#f1f5f9', showgrid: true },
    showlegend: false,
    margin: { t: 60, b: 60, l: 80, r: 40 },
    plot_bgcolor: '#fafafa',
    paper_bgcolor: 'white',
    annotations: [
      {
        x: 0.5,
        y: currentStats.median,
        xref: 'paper',
        yref: 'y',
        text: `Median: ${fmt(currentStats.median)}`,
        showarrow: true,
        arrowhead: 2,
        arrowsize: 1,
        arrowwidth: 2,
        ax: 30,
        ay: -30,
        bgcolor: 'rgba(255,255,255,0.92)',
        borderwidth: 1,
        font: { size: 12 }
      }
    ]
  };

  Plotly.newPlot('boxplotChart', [trace], layout, { responsive: true, displayModeBar: false });
}

function normalPDF(x, mean, std) {
  const coefficient = 1 / (std * Math.sqrt(2 * Math.PI));
  const exponent = -0.5 * ((x - mean) / std) ** 2;
  return coefficient * Math.exp(exponent);
}

// -----------------------------
// Preview table (SAFE rendering)
// -----------------------------
function displayDataPreview() {
  if (!dataTable) return;

  const noDataMessage = document.getElementById('noDataMessage');
  const dataPreview = document.getElementById('dataPreview');
  const tableHead = document.getElementById('tableHead');
  const tableBody = document.getElementById('tableBody');

  noDataMessage.style.display = 'none';
  dataPreview.style.display = 'block';

  tableHead.innerHTML = '';
  const trh = document.createElement('tr');
  for (const header of dataTable.headers) {
    const th = document.createElement('th');
    th.textContent = header;
    trh.appendChild(th);
  }
  tableHead.appendChild(trh);

  tableBody.innerHTML = '';
  const previewRows = dataTable.rows.slice(0, 10);

  for (const row of previewRows) {
    const tr = document.createElement('tr');
    for (const header of dataTable.headers) {
      const td = document.createElement('td');
      td.textContent = (row && row[header] != null) ? String(row[header]) : '';
      tr.appendChild(td);
    }
    tableBody.appendChild(tr);
  }

  if (dataTable.rows.length > 10) {
    const tr = document.createElement('tr');
    tr.style.background = '#f1f5f9';
    tr.style.fontStyle = 'italic';

    const td = document.createElement('td');
    td.colSpan = dataTable.headers.length;
    td.style.textAlign = 'center';
    td.textContent = `... and ${dataTable.rows.length - 10} more rows`;
    tr.appendChild(td);

    tableBody.appendChild(tr);
  }
}

// -----------------------------
// Export
// -----------------------------
function exportResults() {
  if (!currentStats || !currentColumn) return;

  const detailedOutput = document.getElementById('detailedResults').textContent;
  const blob = new Blob([detailedOutput], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `statistics_${currentColumn.replace(/\s+/g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// -----------------------------
// Clear
// -----------------------------
function clearAll() {
  dataTable = null;
  currentStats = null;
  currentColumn = null;
  currentData = null;

  fileInput.value = '';
  columnSelect.innerHTML = '<option value="">Select a variable to analyze</option>';
  columnSelect.disabled = true;

  document.getElementById('noDataMessage').style.display = 'block';
  document.getElementById('dataPreview').style.display = 'none';
  resultsCard.style.display = 'none';
  chartsCard.style.display = 'none';

  exportBtn.disabled = true;

  try { Plotly.purge('histogramChart'); } catch(e) {}
  try { Plotly.purge('boxplotChart'); } catch(e) {}

  showAlert('info', 'All data cleared. Ready for a new upload.');
}

// -----------------------------
// Utilities
// -----------------------------
function showLoading() { loading.style.display = 'block'; }
function hideLoading() { loading.style.display = 'none'; }

function fmt(v) {
  if (!Number.isFinite(v)) return String(v);
  if (Math.abs(v) >= 10000 || (Math.abs(v) > 0 && Math.abs(v) < 0.001)) return v.toExponential(3);
  return v.toFixed(3);
}

function escapeHTML(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function showAlert(type, message) {
  const host = document.getElementById('alertHost');

  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;

  const icon = type === 'success' ? 'fa-check-circle'
    : type === 'warning' ? 'fa-exclamation-triangle'
    : 'fa-info-circle';

  const iconEl = document.createElement('i');
  iconEl.className = `fas ${icon}`;

  const msg = document.createElement('div');
  msg.textContent = message;

  alert.appendChild(iconEl);
  alert.appendChild(msg);

  host.prepend(alert);

  setTimeout(() => {
    alert.style.opacity = '0';
    alert.style.transition = 'opacity 0.4s ease';
    setTimeout(() => alert.remove(), 450);
  }, 4500);
}

// -----------------------------
// Init
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {
  showAlert('info', 'Welcome! Upload a CSV file to begin.');
});
