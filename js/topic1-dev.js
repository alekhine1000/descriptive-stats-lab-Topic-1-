// ==================== GLOBAL STATE ====================  
let dataTable = null;  
let currentStats = null;  
let currentColumn = null;  
let currentData = null;  
  
// Cache all DOM elements in a global object (populated after DOM loads)  
const els = {};  
  
// ==================== SINGLE INITIALIZATION ====================  
document.addEventListener("DOMContentLoaded", () => {  
  console.log("App starting...");  
    
  // Cache ALL element references safely  
  const ids = ['fileInput', 'columnSelect', 'uploadArea', 'chooseFileBtn',   
               'resultsCard', 'chartsCard', 'statsGrid', 'loading',  
               'exportResults', 'clearData', 'resultsTitle', 'alertHost',  
               'noDataMessage', 'dataPreview', 'tableHead', 'tableBody',  
               'histogramChart', 'boxplotChart', 'chartTitle', 'dataTable'];  
    
  for (const id of ids) {  
    els[id] = document.getElementById(id);  
  }  
    
  // Validate CRITICAL file upload elements  
  if (!els.fileInput || !els.uploadArea || !els.chooseFileBtn) {  
    console.error("❌ CRITICAL: Missing file upload elements!", {  
      fileInput: !!els.fileInput,  
      uploadArea: !!els.uploadArea,  
      chooseFileBtn: !!els.chooseFileBtn  
    });  
    alert("Error: Required HTML elements not found. Check IDs: fileInput, uploadArea, chooseFileBtn");  
    return;  
  }  
  
  // ==================== FILE UPLOAD EVENTS ====================  
  els.chooseFileBtn.addEventListener("click", (e) => {  
    e.preventDefault();  
    console.log("📁 Button clicked");  
    els.fileInput.value = "";  
    els.fileInput.click();  
  });  
  
  els.uploadArea.addEventListener("click", () => {  
    console.log("📁 Upload area clicked");  
    els.fileInput.click();  
  });  
  
  els.uploadArea.addEventListener("dragover", (e) => {  
    e.preventDefault();  
    els.uploadArea.classList.add("dragover");  
  });  
  
  els.uploadArea.addEventListener("dragleave", () => {  
    els.uploadArea.classList.remove("dragover");  
  });  
  
  els.uploadArea.addEventListener("drop", (e) => {  
    e.preventDefault();  
    els.uploadArea.classList.remove("dragover");  
    console.log("📥 File dropped");  
    if (e.dataTransfer?.files?.length > 0) {  
      els.fileInput.files = e.dataTransfer.files;  
      handleFileUpload(e.dataTransfer.files[0]);  
    }  
  });  
  
  els.fileInput.addEventListener("change", (e) => {  
    console.log("📥 File input changed");  
    if (e.target.files?.length > 0) {  
      handleFileUpload(e.target.files[0]);  
    }  
  });  
  
  // ==================== OTHER EVENTS ====================  
  if (els.columnSelect) {  
    els.columnSelect.addEventListener('change', handleColumnChange);  
  } else {  
    console.warn("⚠️ columnSelect not found");  
  }  
  
  if (els.exportResults) {  
    els.exportResults.addEventListener('click', exportResults);  
  }  
  
  if (els.clearData) {  
    els.clearData.addEventListener('click', clearAll);  
  }  
  
  // Tab functionality  
  document.querySelectorAll('.tab').forEach(tab => {  
    tab.addEventListener('click', () => {  
      const tabGroup = tab.parentElement;  
      const card = tabGroup?.parentElement;  
      const contents = card?.querySelectorAll('.tab-content') || [];  
        
      tabGroup?.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));  
      contents.forEach(c => c.classList.remove('active'));  
        
      tab.classList.add('active');  
      const target = document.getElementById(tab.dataset.tab);  
      target?.classList.add('active');  
    });  
  });  
  
  console.log("✅ App initialized successfully");  
  showAlert('info', 'Welcome! Upload a CSV file to begin.');  
});  
  
// ==================== COLUMN CHANGE HANDLER ====================  
function handleColumnChange() {  
  if (!dataTable || !els.columnSelect?.value) return;  
    
  console.log("📊 Analyzing column:", els.columnSelect.value);  
  showLoading();  
    
  setTimeout(() => {  
    currentColumn = els.columnSelect.value;  
    currentData = getNumericColumn(dataTable, currentColumn);  
  
    if (currentData.length < 3) {  
      showAlert('warning', `Not enough data in "${currentColumn}". Need ≥3 numeric values.`);  
      hideLoading();  
      return;  
    }  
  
    currentStats = computeStats(currentData);  
    displayResults();  
    displayCharts();  
    hideLoading();  
  }, 80);  
}  
  
// ==================== FILE HANDLING ====================  
async function handleFileUpload(file) {  
  if (!file.name.toLowerCase().endsWith('.csv')) {  
    showAlert('warning', 'Please upload a CSV file (.csv).');  
    return;  
  }  
  
  showLoading();  
  
  try {  
    const text = await file.text();  
    console.log("📄 File loaded, parsing...");  
  
    // Ensure PapaParse is loaded  
    if (typeof Papa === 'undefined') {  
      throw new Error("PapaParse library not loaded. Add: <script src='https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js'></script>");  
    }  
  
    const parsed = Papa.parse(text, {  
      header: true,  
      skipEmptyLines: true,  
      dynamicTyping: false  
    });  
  
    if (parsed.errors?.length > 0) {  
      console.warn("CSV parse warnings:", parsed.errors);  
      showAlert('warning', 'CSV parsed with warnings. Check console (F12).');  
    }  
  
    const rows = (parsed.data || []).filter(r => r && Object.keys(r).length > 0);  
    const headers = parsed.meta?.fields || (rows[0] ? Object.keys(rows[0]) : []);  
  
    if (!headers?.length) {  
      showAlert('warning', 'No headers detected. First row must contain column names.');  
      hideLoading();  
      return;  
    }  
  
    dataTable = { headers, rows };  
    console.log("✅ CSV parsed:", headers.length, "columns,", rows.length, "rows");  
  
    const numericColumns = detectNumericColumns(dataTable);  
    populateDropdown(numericColumns);  
    displayDataPreview();  
  
    showAlert('success', `Loaded: ${file.name} (${rows.length} rows, ${headers.length} columns)`);  
  
    if (numericColumns.length > 0 && els.columnSelect) {  
      els.columnSelect.value = numericColumns[0];  
      handleColumnChange();  
    }  
  
  } catch (err) {  
    console.error("❌ File error:", err);  
    showAlert('error', 'Error: ' + err.message);  
  } finally {  
    hideLoading();  
  }  
}  
  
// ==================== DATA HELPERS ====================  
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
      if (Number.isFinite(toNumber(r[h]))) count++;  
      if (count >= 3) return true;  
    }  
    return false;  
  });  
}  
  
function populateDropdown(columns) {  
  if (!els.columnSelect) return;  
    
  els.columnSelect.innerHTML = '<option value="">Select a variable...</option>';  
    
  if (columns.length === 0) {  
    els.columnSelect.disabled = true;  
    showAlert('warning', 'No numeric columns found. Check data format.');  
    return;  
  }  
  
  els.columnSelect.disabled = false;  
  columns.forEach(c => {  
    const opt = document.createElement('option');  
    opt.value = c;  
    opt.textContent = c;  
    els.columnSelect.appendChild(opt);  
  });  
}  
  
function getNumericColumn(table, col) {  
  return table.rows  
    .map(r => toNumber(r[col]))  
    .filter(v => Number.isFinite(v));  
}  
  
// ==================== STATISTICS ====================  
function computeStats(x) {  
  const n = x.length;  
  const xs = [...x].sort((a,b) => a - b);  
  const mean = xs.reduce((a,b) => a + b, 0) / n;  
  const median = n % 2 ? xs[(n-1)/2] : (xs[n/2-1] + xs[n/2])/2;  
  
  const freq = new Map();  
  for (const v of xs) freq.set(v, (freq.get(v) ?? 0) + 1);  
  let mode = xs[0], modeCount = 1;  
  for (const [v,c] of freq.entries()) {  
    if (c > modeCount) { mode = v; modeCount = c; }  
  }  
  const hasMode = modeCount > 1;  
  
  const varS = n > 1 ? xs.reduce((s,v) => s + (v-mean)**2, 0)/(n-1) : 0;  
  const sd = Math.sqrt(varS);  
  
  const q1 = quantile(xs, 0.25);  
  const q3 = quantile(xs, 0.75);  
  const iqr = q3 - q1;  
  
  const lowerFence = q1 - 1.5 * iqr;  
  const upperFence = q3 + 1.5 * iqr;  
  const outliers = xs.filter(v => v < lowerFence || v > upperFence);  
  
  const inRange = xs.filter(v => v >= lowerFence && v <= upperFence);  
  const whiskMin = inRange.length ? inRange[0] : xs[0];  
  const whiskMax = inRange.length ? inRange[inRange.length-1] : xs[n-1];  
  const range = xs[n-1] - xs[0];  
  
  const varPop = xs.reduce((s,v)=>s + (v-mean)**2, 0)/n;  
  const sdPop = Math.sqrt(varPop);  
  let skewness = 0;  
  if (sdPop > 0) {  
    const m3 = xs.reduce((s,v)=>s + (v-mean)**3, 0)/n;  
    skewness = m3/(sdPop**3);  
  }  
  
  return {  
    mean, median,  
    mode, modeCount, hasMode,  
    sd, varS,  
    min: xs[0], max: xs[n-1], range,  
    q1, q3, iqr,  
    lowerFence, upperFence,  
    whiskMin, whiskMax,  
    outliers,  
    skewness  
  };  
}  
  
function quantile(sorted, p) {  
  const n = sorted.length;  
  const i = (n - 1) * p;  
  const lo = Math.floor(i);  
  const hi = Math.ceil(i);  
  if (lo === hi) return sorted[lo];  
  return sorted[lo] + (i - lo) * (sorted[hi] - sorted[lo]);  
}  
  
// ==================== DISPLAY ====================  
function displayResults() {  
  if (!currentStats || !currentColumn || !els.statsGrid || !els.resultsCard) return;  
    
  console.log("📊 Displaying results...");  
  els.resultsCard.style.display = 'block';  
    
  els.resultsTitle.innerHTML = `<i class="fas fa-calculator"></i> Descriptive Statistics — <span style="color:var(--text); font-weight:900;">${escapeHTML(currentColumn)}</span>`;  
  
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
    { label: 'Skewness', value: fmt(currentStats.skewness), icon: 'fas fa-balance-scale' },  
    { label: 'Outliers', value: currentStats.outliers.length, icon: 'fas fa-exclamation-triangle' },  
    { label: 'Range', value: fmt(currentStats.range), icon: 'fas fa-ruler' }  
  ];  
  
  els.statsGrid.innerHTML = summaryStats.map(stat => `  
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
  els.exportBtn.disabled = false;  
}  
  
function displayCharts() {  
  if (!currentData || !els.histogramChart || !els.boxplotChart || !els.chartsCard) return;  
    
  console.log("📈 Rendering charts...");  
  els.chartsCard.style.display = 'block';  
  
  // Ensure Plotly is loaded  
  if (typeof Plotly === 'undefined') {  
    showAlert('error', 'Plotly not loaded. Add: <script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>');  
    return;  
  }  
    
  createHistogram();  
  createBoxPlot();  
}  
  
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
  
    if (els.chartTitle) els.chartTitle.textContent = 'Histogram (Normal curve shown over ±4 SD)';  
  } else if (els.chartTitle) {  
    els.chartTitle.textContent = 'Histogram';  
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
  
  Plotly.newPlot(els.histogramChart, traces, layout, { responsive: true, displayModeBar: false });  
}  
  
function createBoxPlot() {  
  if (!els.boxplotChart) return;  
  
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
  
  Plotly.newPlot(els.boxplotChart, [trace], layout, { responsive: true, displayModeBar: false });  
}  
  
function normalPDF(x, mean, std) {  
  const coefficient = 1 / (std * Math.sqrt(2 * Math.PI));  
  const exponent = -0.5 * ((x - mean) / std) ** 2;  
  return coefficient * Math.exp(exponent);  
}  
  
function displayDataPreview() {  
  if (!dataTable || !els.tableHead || !els.tableBody) return;  
  
  const noDataMessage = document.getElementById('noDataMessage');  
  const dataPreview = document.getElementById('dataPreview');  
  
  if (noDataMessage) noDataMessage.style.display = 'none';  
  if (dataPreview) dataPreview.style.display = 'block';  
  
  // Clear and rebuild table  
  els.tableHead.innerHTML = '';  
  const trh = document.createElement('tr');  
  for (const header of dataTable.headers) {  
    const th = document.createElement('th');  
    th.textContent = header;  
    trh.appendChild(th);  
  }  
  els.tableHead.appendChild(trh);  
  
  els.tableBody.innerHTML = '';  
  const previewRows = dataTable.rows.slice(0, 10);  
  
  for (const row of previewRows) {  
    const tr = document.createElement('tr');  
    for (const header of dataTable.headers) {  
      const td = document.createElement('td');  
      td.textContent = (row && row[header] != null) ? String(row[header]) : '';  
      tr.appendChild(td);  
    }  
    els.tableBody.appendChild(tr);  
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
  
    els.tableBody.appendChild(tr);  
  }  
}  
  
// ==================== EXPORT ====================  
function exportResults() {  
  if (!currentStats || !currentColumn) return;  
  
  const detailedOutput = document.getElementById('detailedResults')?.textContent;  
  if (!detailedOutput) return;  
  
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
  
// ==================== CLEAR ====================  
function clearAll() {  
  // Reset state  
  dataTable = null;  
  currentStats = null;  
  currentColumn = null;  
  currentData = null;  
    
  // Reset UI  
  if (els.fileInput) els.fileInput.value = '';  
  if (els.columnSelect) {  
    els.columnSelect.innerHTML = '<option value="">Select a variable...</option>';  
    els.columnSelect.disabled = true;  
  }  
    
  // Hide sections  
  if (els.resultsCard) els.resultsCard.style.display = 'none';  
  if (els.chartsCard) els.chartsCard.style.display = 'none';  
  if (els.noDataMessage) els.noDataMessage.style.display = 'block';  
  if (els.dataPreview) els.dataPreview.style.display = 'none';  
    
  // Clear charts  
  if (els.histogramChart) Plotly.purge(els.histogramChart);  
  if (els.boxplotChart) Plotly.purge(els.boxplotChart);  
    
  showAlert('info', 'Data cleared. Ready for new upload.');  
}  
  
// ==================== UTILITIES ====================  
function showLoading() {   
  if (els.loading) els.loading.style.display = 'block';   
}  
  
function hideLoading() {   
  if (els.loading) els.loading.style.display = 'none';   
}  
  
function fmt(v) {  
  if (!Number.isFinite(v)) return String(v);  
  if (Math.abs(v) >= 10000 || (Math.abs(v) > 0 && Math.abs(v) < 0.001)) return v.toExponential(3);  
  return v.toFixed(3);  
}  
  
function escapeHTML(str) {  
  return String(str)  
    .replace(/&/g, '&amp;')  
    .replace(/</g, '&lt;')  
    .replace(/>/g, '&gt;')  
    .replace(/"/g, '&quot;')  
    .replace(/'/g, '&#039;');  
}  
  
function showAlert(type, message) {  
  if (!els.alertHost) {  
    console.warn("Alert host missing:", message);  
    return;  
  }  
    
  const alert = document.createElement('div');  
  alert.className = `alert alert-${type}`;  
    
  const icon = type === 'success' ? 'fa-check-circle'  
    : type === 'warning' ? 'fa-exclamation-triangle'  
    : type === 'error' ? 'fa-exclamation-circle'  
    : 'fa-info-circle';  
    
  alert.innerHTML = `<i class="fas ${icon}"></i> ${escapeHTML(message)}`;  
    
  els.alertHost.prepend(alert);  
    
  setTimeout(() => {  
    alert.style.opacity = '0';  
    alert.style.transition = 'opacity 0.4s ease';  
    setTimeout(() => alert.remove(), 450);  
  }, 4500);  
}  

