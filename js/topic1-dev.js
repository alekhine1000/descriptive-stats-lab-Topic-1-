<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Descriptive Statistics Solver</title>

  <!-- Fonts + Icons -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

  <!-- Plotly -->
  <script src="https://cdn.plot.ly/plotly-2.30.0.min.js"></script>

  <!-- Papa Parse (robust CSV parsing) -->
  <script src="https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js"></script>

  <style>
    :root {
      --primary: #2563eb;
      --primary-light: #3b82f6;
      --secondary: #64748b;
      --accent: #f59e0b;
      --success: #10b981;
      --danger: #ef4444;
      --bg: #f1f5f9;
      --bg-card: #ffffff;
      --bg-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      --text: #1e293b;
      --text-light: #64748b;
      --border: #e2e8f0;
      --shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
      --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
      --shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      min-height: 100vh;
    }

    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }

    .header {
      text-align: center;
      margin-bottom: 2rem;
      padding: 3rem 2rem;
      background: var(--bg-gradient);
      color: white;
      border-radius: 20px;
      box-shadow: var(--shadow-xl);
      position: relative;
      overflow: hidden;
    }

    .header::before {
      content: '';
      position: absolute;
      inset: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
      opacity: 0.35;
    }

    .header h1 {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
      position: relative;
      z-index: 1;
    }

    .header p {
      font-size: 1.1rem;
      opacity: 0.92;
      position: relative;
      z-index: 1;
    }

    .main-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .card {
      background: var(--bg-card);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border);
      transition: all 0.25s ease;
      position: relative;
      overflow: hidden;
    }

    .card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 4px;
      background: var(--bg-gradient);
    }

    .card:hover { box-shadow: var(--shadow-xl); transform: translateY(-3px); }

    .card-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--primary);
    }

    .upload-area {
      border: 3px dashed var(--border);
      border-radius: 16px;
      padding: 2.5rem 2rem;
      text-align: center;
      transition: all 0.25s ease;
      cursor: pointer;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      position: relative;
      overflow: hidden;
    }

    .upload-area:hover,
    .upload-area.dragover {
      border-color: var(--primary);
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      transform: scale(1.01);
    }

    .upload-icon {
      font-size: 3.5rem;
      color: var(--primary);
      margin-bottom: 1rem;
      transition: transform 0.25s ease;
    }

    .upload-area:hover .upload-icon { transform: scale(1.08); }

    .file-input { display: none; }

    .btn {
      background: var(--bg-gradient);
      color: white;
      border: none;
      padding: 1rem 1.25rem;
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.25s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1rem;
      box-shadow: var(--shadow);
    }

    .btn:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }

    .btn-secondary {
      background: linear-gradient(135deg, var(--secondary) 0%, #475569 100%);
    }

    .btn-secondary:hover {
      background: linear-gradient(135deg, #475569 0%, #334155 100%);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .form-group { margin-top: 1.5rem; margin-bottom: 1.25rem; }

    .form-label {
      display: block;
      font-weight: 700;
      margin-bottom: 0.75rem;
      color: var(--text);
      font-size: 1.05rem;
    }

    .form-select {
      width: 100%;
      padding: 1rem;
      border: 2px solid var(--border);
      border-radius: 12px;
      font-size: 1rem;
      background: white;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .form-select:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 4px rgba(59,130,246,0.12);
    }

    .help-text {
      color: var(--text-light);
      margin-top: 0.5rem;
      display: block;
      font-size: 0.9rem;
    }

    .export-section { display: flex; gap: 1rem; margin-top: 1.25rem; flex-wrap: wrap; }

    .data-preview {
      max-height: 320px;
      overflow-y: auto;
      border: 1px solid var(--border);
      border-radius: 12px;
      margin-top: 1rem;
      box-shadow: var(--shadow);
      background: white;
    }

    .data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }

    .data-table th, .data-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
    }

    .data-table th {
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      font-weight: 700;
      position: sticky;
      top: 0;
      z-index: 1;
    }

    .data-table tr:hover { background: #f8fafc; }

    .alert {
      padding: 1rem 1.25rem;
      border-radius: 12px;
      margin: 0 0 1rem 0;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      font-weight: 600;
      box-shadow: var(--shadow);
    }

    .alert i { margin-top: 0.2rem; }

    .alert-info {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      color: #1e40af;
      border: 1px solid #bfdbfe;
    }

    .alert-success {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      color: #065f46;
      border: 1px solid #a7f3d0;
    }

    .alert-warning {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      color: #92400e;
      border: 1px solid #fde68a;
    }

    .loading { display: none; text-align: center; padding: 2rem; }
    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid var(--primary);
      border-radius: 50%;
      width: 48px; height: 48px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
      gap: 1rem;
      margin-bottom: 1.25rem;
    }

    .stat-item {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      padding: 1.25rem;
      border-radius: 12px;
      border: 1px solid var(--border);
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
    }

    .stat-item::before {
      content: '';
      position: absolute;
      top: 0; left: 0;
      width: 4px; height: 100%;
      background: var(--bg-gradient);
    }

    .stat-item:hover { transform: translateY(-2px); box-shadow: var(--shadow); }

    .stat-label {
      font-size: 0.9rem;
      color: var(--text-light);
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 650;
    }

    .stat-value { font-size: 1.5rem; font-weight: 800; color: var(--text); }

    .mini-guide {
      background: #f8fafc;
      border: 1px dashed var(--border);
      border-radius: 12px;
      padding: 1rem 1.25rem;
      color: var(--text);
      font-size: 0.95rem;
    }

    .mini-guide ul { margin-left: 1.2rem; margin-top: 0.5rem; }
    .mini-guide li { margin: 0.25rem 0; }
    .mini-guide b { color: var(--primary); }

    .results-area {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 12px;
      padding: 1.25rem;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      font-size: 0.92rem;
      line-height: 1.8;
      border: 1px solid var(--border);
      max-height: 420px;
      overflow-y: auto;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
      white-space: pre-wrap;
    }

    .chart-container {
      height: 520px;
      margin-bottom: 1rem;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: var(--shadow);
      background: white;
    }

    .chart-title {
      text-align: center;
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--text);
      margin-bottom: 1rem;
      padding: 0.9rem 1rem;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 12px;
      border: 1px solid var(--border);
    }

    .tabs {
      display: flex;
      border-bottom: 2px solid var(--border);
      margin-bottom: 1.25rem;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .tab {
      padding: 0.9rem 1.15rem;
      background: none;
      border: none;
      cursor: pointer;
      font-weight: 800;
      color: var(--text-light);
      border-bottom: 3px solid transparent;
      transition: all 0.2s ease;
      border-radius: 10px 10px 0 0;
    }

    .tab:hover { background: #f8fafc; color: var(--primary); }

    .tab.active {
      color: var(--primary);
      border-bottom-color: var(--primary);
      background: #f8fafc;
    }

    .tab-content { display: none; }
    .tab-content.active { display: block; }

    @media (max-width: 768px) {
      .container { padding: 1rem; }
      .main-grid { grid-template-columns: 1fr; gap: 1rem; }
      .header h1 { font-size: 2rem; }
      .card { padding: 1.25rem; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
  </style>
</head>

<body>
  <div class="container">

    <div class="header">
      <h1><i class="fas fa-chart-bar"></i> Descriptive Statistics Solver</h1>
      <p>Upload a CSV, pick a numeric variable, and get simple stats + clear charts.</p>
    </div>

    <div id="alertHost"></div>

    <div class="main-grid">
      <!-- Left: Controls -->
      <div class="card">
        <h2 class="card-title"><i class="fas fa-cog"></i> Data Input</h2>

        <div class="upload-area" id="uploadArea" aria-label="Upload CSV">
          <div class="upload-icon"><i class="fas fa-cloud-upload-alt"></i></div>
          <h3>Drop your CSV file here</h3>
          <p>or click to browse</p>

          <input type="file" id="fileInput" class="file-input" accept=".csv" />
          <button class="btn" id="chooseFileBtn" type="button">
            <i class="fas fa-folder-open"></i> Choose File
          </button>
        </div>

        <div class="form-group">
          <label class="form-label" for="columnSelect">
            <i class="fas fa-list"></i> Select Variable
          </label>
          <select id="columnSelect" class="form-select" disabled>
            <option value="">Select a variable to analyze</option>
          </select>
          <small class="help-text" id="numericRuleNote">
            Tip: A column must have at least <b>3 valid numbers</b>. Blank cells are okay.
          </small>
        </div>

        <div class="export-section">
          <button class="btn" id="exportResults" disabled type="button">
            <i class="fas fa-download"></i> Export Results
          </button>
          <button class="btn btn-secondary" id="clearData" type="button">
            <i class="fas fa-trash"></i> Clear All
          </button>
        </div>
      </div>

      <!-- Right: Preview -->
      <div class="card">
        <h2 class="card-title"><i class="fas fa-table"></i> Data Preview</h2>

        <div id="dataPreview" class="data-preview" style="display:none;">
          <table class="data-table" id="dataTable">
            <thead id="tableHead"></thead>
            <tbody id="tableBody"></tbody>
          </table>
        </div>

        <div id="noDataMessage" class="alert alert-info">
          <i class="fas fa-info-circle"></i>
          <div>
            Upload a CSV file to see a preview here.
            <div style="margin-top:0.25rem; font-weight:600; opacity:0.95;">
              Example CSV: <code>name,score</code>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div class="card" id="resultsCard" style="display:none;">
      <h2 class="card-title" id="resultsTitle">
        <i class="fas fa-calculator"></i> Descriptive Statistics
      </h2>

      <div class="tabs">
        <button class="tab active" data-tab="summary" type="button">Summary</button>
        <button class="tab" data-tab="detailed" type="button">Detailed View</button>
        <button class="tab" data-tab="raw" type="button">Raw Output</button>
      </div>

      <div class="tab-content active" id="summary">
        <div class="stats-grid" id="statsGrid"></div>

        <div class="mini-guide">
          <div><b>Quick reading guide (for beginners):</b></div>
          <ul>
            <li><b>Mean</b> = average.</li>
            <li><b>Median</b> = middle value (after sorting).</li>
            <li><b>IQR</b> = spread of the middle 50% of the data.</li>
            <li><b>Outliers</b> = unusual values using the 1.5×IQR rule.</li>
            <li><b>Mode</b> is most useful for repeated/discrete values. Continuous data often has “no mode”.</li>
          </ul>
        </div>
      </div>

      <div class="tab-content" id="detailed">
        <div class="results-area" id="detailedResults"></div>
      </div>

      <div class="tab-content" id="raw">
        <div class="results-area" id="rawResults"></div>
      </div>
    </div>

    <!-- Charts -->
    <div class="card" id="chartsCard" style="display:none;">
      <h2 class="card-title"><i class="fas fa-chart-line"></i> Visualizations</h2>

      <div class="chart-title" id="chartTitle">Histogram (with optional Normal Curve)</div>
      <div class="chart-container" id="histogramChart"></div>

      <div class="chart-title" style="margin-top: 1.25rem;">Box Plot</div>
      <div class="chart-container" id="boxplotChart"></div>
    </div>

    <!-- Loading -->
    <div class="loading" id="loading">
      <div class="spinner"></div>
      <p style="font-weight:700;">Processing your data...</p>
    </div>
  </div>

  <script>
    // -----------------------------
    // State
    // -----------------------------
    let dataTable = null;      // { headers: [], rows: [] }
    let currentStats = null;
    let currentColumn = null;
    let currentData = null;

    // DOM
    const fileInput = document.getElementById('fileInput');
    const columnSelect = document.getElementById('columnSelect');
    const uploadArea = document.getElementById('uploadArea');
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
          // Non-fatal: still try to use the data
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

        // Auto-select first numeric column for beginner friendliness
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
      // Beginner rule: at least 3 numbers (missing is okay)
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

      // Mode (exact repeat)
      const freq = new Map();
      for (const v of xs) freq.set(v, (freq.get(v) ?? 0) + 1);

      let mode = xs[0], modeCount = 1;
      for (const [v,c] of freq.entries()) {
        if (c > modeCount) { mode = v; modeCount = c; }
      }
      const hasMode = modeCount > 1;

      // Sample variance / SD (common in intro stats)
      const varS = n > 1 ? xs.reduce((s,v) => s + (v - mean) ** 2, 0) / (n - 1) : 0;
      const sd = Math.sqrt(varS);

      // Quartiles via linear interpolation
      const q1 = quantile(xs, 0.25);
      const q3 = quantile(xs, 0.75);
      const iqr = q3 - q1;

      const lowerFence = q1 - 1.5 * iqr;
      const upperFence = q3 + 1.5 * iqr;

      const outliers = xs.filter(v => v < lowerFence || v > upperFence);

      // Whiskers (min/max within fences)
      const inRange = xs.filter(v => v >= lowerFence && v <= upperFence);
      const whiskMin = inRange.length ? inRange[0] : xs[0];
      const whiskMax = inRange.length ? inRange[inRange.length - 1] : xs[n - 1];

      // Range
      const range = xs[n-1] - xs[0];

      // Skewness: simple population-moment based estimate (label as "simple")
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

    // Replace your createHistogram() with this version (±4σ normal curve extension)

 function createHistogram() {
  const n = currentData.length;
  const bins = Math.max(8, Math.ceil(1 + Math.log2(n))); // beginner-friendly

  const dataMin = Math.min(...currentData);
  const dataMax = Math.max(...currentData);

  const range = dataMax - dataMin;
  const width = range === 0 ? 1 : range / bins;

  // --- Histogram counts (same idea as before) ---
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

  // --- Normal curve extension to ±4σ ---
  const mean = currentStats.mean;
  const std = currentStats.sd;

  // Only draw if it makes sense
  const canDrawNormal = (std > 1e-6) && (range > 0);

  if (canDrawNormal) {
    const xMin = mean - 4 * std;
    const xMax = mean + 4 * std;

    // Sample smoothly
    const steps = 240;
    const step = (xMax - xMin) / steps;

    const normalX = [];
    const normalY = [];

    for (let k = 0; k <= steps; k++) {
      const x = xMin + k * step;
      // Scale density to expected frequency per bin
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

    // Optional: update the title text element if you use it
    const titleEl = document.getElementById('chartTitle');
    if (titleEl) titleEl.textContent = 'Histogram (Normal curve shown over ±4 SD)';
  } else {
    const titleEl = document.getElementById('chartTitle');
    if (titleEl) titleEl.textContent = 'Histogram';
  }

  const layout = {
    title: { text: `Histogram: ${currentColumn}`, font: { size: 18, family: 'Inter' } },
    xaxis: {
      title: currentColumn,
      gridcolor: '#f1f5f9',
      showgrid: true
    },
    yaxis: {
      title: 'Frequency',
      gridcolor: '#f1f5f9',
      showgrid: true,
      side: 'left'
    },
    yaxis2: {
      title: 'Theoretical frequency',
      overlaying: 'y',
      side: 'right',
      showgrid: false
    },
    legend: {
      x: 0.02,
      y: 0.98,
      bgcolor: 'rgba(255,255,255,0.85)',
      bordercolor: '#e2e8f0',
      borderwidth: 1
    },
    margin: { t: 60, b: 80, l: 80, r: 80 },
    plot_bgcolor: '#fafafa',
    paper_bgcolor: 'white'
  };

  Plotly.newPlot('histogramChart', traces, layout, {
    responsive: true,
    displayModeBar: false
  });
}

    function createBoxPlot() {
      // FIX: single marker (no overwriting)
      const trace = {
        y: currentData,
        type: 'box',
        name: currentColumn,
        boxpoints: 'outliers',
        jitter: 0.3,
        pointpos: 0,
        fillcolor: 'rgba(59, 130, 246, 0.12)',
        line: { width: 2 },
        marker: { size: 7 } // points
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

      // Header
      tableHead.innerHTML = '';
      const trh = document.createElement('tr');
      for (const header of dataTable.headers) {
        const th = document.createElement('th');
        th.textContent = header;
        trh.appendChild(th);
      }
      tableHead.appendChild(trh);

      // Body (first 10 rows)
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

      // Clean plots (optional)
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
  </script>
</body>
</html>
