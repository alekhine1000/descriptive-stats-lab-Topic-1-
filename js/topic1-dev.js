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
               'histogramChart', 'boxplotChart'];  
    
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
  // These MUST be inside DOMContentLoaded to ensure elements exist  
    
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
      throw new Error("PapaParse library not loaded. Add: <script src='https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js'></script>");  
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
    
  // ... (rest of your stats code) ...  
  // Simplified for brevity - use your original function  
  const varS = n > 1 ? xs.reduce((s,v) => s + (v-mean)**2, 0)/(n-1) : 0;  
  const sd = Math.sqrt(varS);  
    
  return { mean, median, sd, /*...*/ };  
}  
  
// ==================== DISPLAY ====================  
function displayResults() {  
  if (!currentStats || !currentColumn || !els.statsGrid) return;  
    
  console.log("📊 Displaying results...");  
  els.resultsCard.style.display = 'block';  
    
  // ... your display code ...  
}  
  
function displayCharts() {  
  if (!currentData || !els.histogramChart) return;  
  console.log("📈 Rendering charts...");  
  chartsCard.style.display = 'block';  
    
  // Ensure Plotly is loaded  
  if (typeof Plotly === 'undefined') {  
    showAlert('error', 'Plotly not loaded. Add: <script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>');  
    return;  
  }  
    
  // ... your chart code ...  
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
  
function showAlert(type, message) {  
  if (!els.alertHost) {  
    console.warn("Alert host missing:", message);  
    return;  
  }  
    
  const alert = document.createElement('div');  
  alert.className = `alert alert-${type}`;  
  alert.innerHTML = `<i class="fas ${type==='success'?'fa-check-circle':type==='warning'?'fa-exclamation-triangle':'fa-info-circle'}"></i> ${message}`;  
    
  els.alertHost.prepend(alert);  
    
  setTimeout(() => {  
    alert.style.opacity = '0';  
    alert.style.transition = 'opacity 0.4s ease';  
    setTimeout(() => alert.remove(), 450);  
  }, 4500);  
}  
  
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
