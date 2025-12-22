console.log("✅ topic1-dev.js loaded");
document.body.insertAdjacentHTML(
  "afterbegin",
  "<div style='background:#ffeb3b;padding:6px;font-weight:bold'>DEV JS RUNNING</div>"
);

<!DOCTYPE html>  
<html lang="en">  
<head>  
    <meta charset="UTF-8">  
    <meta name="viewport" content="width=device-width, initial-scale=1.0">  
    <title>Descriptive Statistics Solver</title>  
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">  
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">  
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>  
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
            --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);  
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);  
            --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);  
        }  
  
        * {  
            margin: 0;  
            padding: 0;  
            box-sizing: border-box;  
        }  
  
        body {  
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;  
            background: var(--bg);  
            color: var(--text);  
            line-height: 1.6;  
            min-height: 100vh;  
        }  
  
        .container {  
            max-width: 1200px;  
            margin: 0 auto;  
            padding: 2rem;  
        }  
  
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
            top: 0;  
            left: 0;  
            right: 0;  
            bottom: 0;  
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');  
            opacity: 0.3;  
        }  
  
        .header h1 {  
            font-size: 2.5rem;  
            font-weight: 700;  
            margin-bottom: 0.5rem;  
            position: relative;  
            z-index: 1;  
        }  
  
        .header p {  
            font-size: 1.1rem;  
            opacity: 0.9;  
            position: relative;  
            z-index: 1;  
        }  
  
        .main-grid {  
            display: grid;  
            grid-template-columns: 1fr;  
            gap: 2rem;  
            margin-bottom: 2rem;  
        }  
  
        .card {  
            background: var(--bg-card);  
            border-radius: 16px;  
            padding: 2rem;  
            box-shadow: var(--shadow-lg);  
            border: 1px solid var(--border);  
            transition: all 0.3s ease;  
            position: relative;  
            overflow: hidden;  
        }  
  
        .card::before {  
            content: '';  
            position: absolute;  
            top: 0;  
            left: 0;  
            right: 0;  
            height: 4px;  
            background: var(--bg-gradient);  
        }  
  
        .card:hover {  
            box-shadow: var(--shadow-xl);  
            transform: translateY(-4px);  
        }  
  
        .card-title {  
            font-size: 1.5rem;  
            font-weight: 600;  
            margin-bottom: 1.5rem;  
            display: flex;  
            align-items: center;  
            gap: 0.75rem;  
            color: var(--primary);  
        }  
  
        .upload-area {  
            border: 3px dashed var(--border);  
            border-radius: 16px;  
            padding: 3rem 2rem;  
            text-align: center;  
            transition: all 0.3s ease;  
            cursor: pointer;  
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);  
            position: relative;  
            overflow: hidden;  
        }  
  
        .upload-area::before {  
            content: '';  
            position: absolute;  
            top: 0;  
            left: 0;  
            right: 0;  
            bottom: 0;  
            background: var(--bg-gradient);  
            opacity: 0;  
            transition: opacity 0.3s ease;  
        }  
  
        .upload-area:hover {  
            border-color: var(--primary);  
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);  
            transform: scale(1.02);  
        }  
  
        .upload-area:hover::before {  
            opacity: 0.05;  
        }  
  
        .upload-icon {  
            font-size: 4rem;  
            color: var(--primary);  
            margin-bottom: 1.5rem;  
            position: relative;  
            z-index: 1;  
            transition: transform 0.3s ease;  
        }  
  
        .upload-area:hover .upload-icon {  
            transform: scale(1.1);  
        }  
  
        .file-input {  
            display: none;  
        }  
  
        .btn {  
            background: var(--bg-gradient);  
            color: white;  
            border: none;  
            padding: 1rem 2rem;  
            border-radius: 12px;  
            font-weight: 600;  
            cursor: pointer;  
            transition: all 0.3s ease;  
            display: inline-flex;  
            align-items: center;  
            gap: 0.5rem;  
            font-size: 1rem;  
            position: relative;  
            z-index: 1;  
            box-shadow: var(--shadow);  
        }  
  
        .btn:hover {  
            transform: translateY(-2px);  
            box-shadow: var(--shadow-lg);  
        }  
  
        .btn-secondary {  
            background: linear-gradient(135deg, var(--secondary) 0%, #475569 100%);  
        }  
  
        .btn-secondary:hover {  
            background: linear-gradient(135deg, #475569 0%, #334155 100%);  
        }  
  
        .form-group {  
            margin-bottom: 1.5rem;  
        }  
  
        .form-label {  
            display: block;  
            font-weight: 600;  
            margin-bottom: 0.75rem;  
            color: var(--text);  
            font-size: 1.1rem;  
        }  
  
        .form-select {  
            width: 100%;  
            padding: 1rem;  
            border: 2px solid var(--border);  
            border-radius: 12px;  
            font-size: 1rem;  
            background: white;  
            cursor: pointer;  
            transition: all 0.3s ease;  
            font-family: inherit;  
        }  
  
        .form-select:focus {  
            outline: none;  
            border-color: var(--primary);  
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);  
        }  
  
        .stats-grid {  
            display: grid;  
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));  
            gap: 1rem;  
            margin-bottom: 2rem;  
        }  
  
        .stat-item {  
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);  
            padding: 1.5rem;  
            border-radius: 12px;  
            border: 1px solid var(--border);  
            transition: all 0.3s ease;  
            position: relative;  
            overflow: hidden;  
        }  
  
        .stat-item::before {  
            content: '';  
            position: absolute;  
            top: 0;  
            left: 0;  
            width: 4px;  
            height: 100%;  
            background: var(--bg-gradient);  
        }  
  
        .stat-item:hover {  
            transform: translateY(-2px);  
            box-shadow: var(--shadow);  
        }  
  
        .stat-label {  
            font-size: 0.9rem;  
            color: var(--text-light);  
            margin-bottom: 0.5rem;  
            display: flex;  
            align-items: center;  
            gap: 0.5rem;  
        }  
  
        .stat-value {  
            font-size: 1.5rem;  
            font-weight: 700;  
            color: var(--text);  
        }  
  
        .chart-container {  
            height: 450px;  
            margin-bottom: 1rem;  
            border-radius: 12px;  
            overflow: hidden;  
            box-shadow: var(--shadow);  
        }  
  
        .results-area {  
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);  
            border-radius: 12px;  
            padding: 2rem;  
            font-family: 'Monaco', 'Menlo', 'Consolas', monospace;  
            font-size: 0.9rem;  
            line-height: 1.8;  
            border: 1px solid var(--border);  
            max-height: 400px;  
            overflow-y: auto;  
            box-shadow: inset 0 2px 4px rgba(0, 0, 0.05);  
        }  
  
        .data-preview {  
            max-height: 300px;  
            overflow-y: auto;  
            border: 1px solid var(--border);  
            border-radius: 12px;  
            margin-top: 1rem;  
            box-shadow: var(--shadow);  
        }  
  
        .data-table {  
            width: 100%;  
            border-collapse: collapse;  
            font-size: 0.875rem;  
        }  
  
        .data-table th,  
        .data-table td {  
            padding: 0.75rem;  
            text-align: left;  
            border-bottom: 1px solid var(--border);  
        }  
  
        .data-table th {  
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);  
            font-weight: 600;  
            position: sticky;  
            top: 0;  
            z-index: 1;  
        }  
  
        .data-table tr:hover {  
            background: #f8fafc;  
        }  
  
        .alert {  
            padding: 1.25rem;  
            border-radius: 12px;  
            margin-bottom: 1rem;  
            display: flex;  
            align-items: center;  
            gap: 0.75rem;  
            font-weight: 500;  
            box-shadow: var(--shadow);  
        }  
  
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
  
        .export-section {  
            display: flex;  
            gap: 1rem;  
            margin-top: 1.5rem;  
            flex-wrap: wrap;  
        }  
  
        .loading {  
            display: none;  
            text-align: center;  
            padding: 3rem;  
        }  
  
        .spinner {  
            border: 4px solid #f3f3f3;  
            border-top: 4px solid var(--primary);  
            border-radius: 50%;  
            width: 50px;  
            height: 50px;  
            animation: spin 1s linear infinite;  
            margin: 0 auto 1rem;  
        }  
  
        @keyframes spin {  
            0% { transform: rotate(0deg); }  
            100% { transform: rotate(360deg); }  
        }  
  
        .tabs {  
            display: flex;  
            border-bottom: 2px solid var(--border);  
            margin-bottom: 2rem;  
            gap: 0.5rem;  
        }  
  
        .tab {  
            padding: 1rem 1.5rem;  
            background: none;  
            border: none;  
            cursor: pointer;  
            font-weight: 600;  
            color: var(--text-light);  
            border-bottom: 3px solid transparent;  
            transition: all 0.3s ease;  
            border-radius: 8px 8px 0 0;  
        }  
  
        .tab:hover {  
            background: #f8fafc;  
            color: var(--primary);  
        }  
  
        .tab.active {  
            color: var(--primary);  
            border-bottom-color: var(--primary);  
            background: #f8fafc;  
        }  
  
        .tab-content {  
            display: none;  
        }  
  
        .tab-content.active {  
            display: block;  
        }  
  
        @media (max-width: 768px) {  
            .container {  
                padding: 1rem;  
            }  
              
            .main-grid {  
                grid-template-columns: 1fr;  
                gap: 1rem;  
            }  
              
            .header h1 {  
                font-size: 2rem;  
            }  
              
            .stats-grid {  
                grid-template-columns: repeat(2, 1fr);  
            }  
              
            .card {  
                padding: 1.5rem;  
            }  
        }  
  
        .tooltip {  
            position: relative;  
            cursor: help;  
        }  
  
        .tooltip:hover::after {  
            content: attr(data-tooltip);  
            position: absolute;  
            bottom: 100%;  
            left: 50%;  
            transform: translateX(-50%);  
            background: #1e293b;  
            color: white;  
            padding: 0.5rem;  
            border-radius: 6px;  
            font-size: 0.8rem;  
            white-space: nowrap;  
            z-index: 1000;  
        }  
  
        .chart-title {  
            text-align: center;  
            font-size: 1.25rem;  
            font-weight: 600;  
            color: var(--text);  
            margin-bottom: 1rem;  
            padding: 1rem;  
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);  
            border-radius: 12px;  
            border: 1px solid var(--border);  
        }  
    </style>  
    <base target="_blank">  
</head>  
<body>  
    <div class="container">  
        <div class="header">  
            <h1><i class="fas fa-chart-bar"></i> Descriptive Statistics Solver</h1>  
            <p>Upload your data and explore comprehensive statistical analysis with beautiful visualizations</p>  
        </div>  
  
        <div class="main-grid">  
            <!-- Left Panel - Controls -->  
            <div class="card">  
                <h2 class="card-title">  
                    <i class="fas fa-cog"></i>  
                    Data Input  
                </h2>  
                  
                <div class="upload-area" id="uploadArea">  
                    <div class="upload-icon">  
                        <i class="fas fa-cloud-upload-alt"></i>  
                    </div>  
                    <h3>Drop your CSV file here</h3>  
                    <p>or click to browse</p>  
                    <input type="file" id="fileInput" class="file-input" accept=".csv">  
                    <button class="btn" onclick="document.getElementById('fileInput').click()">  
                        <i class="fas fa-folder-open"></i>  
                        Choose File  
                    </button>  
                </div>  
  
                <div class="form-group">  
                    <label class="form-label" for="columnSelect">  
                        <i class="fas fa-list"></i>  
                        Select Variable  
                    </label>  
                    <select id="columnSelect" class="form-select" disabled>  
                        <option value="">Select a variable to analyze</option>  
                    </select>  
                    <small style="color: var(--text-light); margin-top: 0.5rem; display: block;">  
                        Only numeric variables with sufficient data are shown  
                    </small>  
                </div>  
  
                <div class="export-section">  
                    <button class="btn" id="exportResults" disabled>  
                        <i class="fas fa-download"></i>  
                        Export Results  
                    </button>  
                    <button class="btn btn-secondary" id="clearData">  
                        <i class="fas fa-trash"></i>  
                        Clear All  
                    </button>  
                </div>  
            </div>  
  
            <!-- Right Panel - Data Preview -->  
            <div class="card">  
                <h2 class="card-title">  
                    <i class="fas fa-table"></i>  
                    Data Preview  
                </h2>  
                <div id="dataPreview" class="data-preview" style="display: none;">  
                    <table class="data-table" id="dataTable">  
                        <thead id="tableHead"></thead>  
                        <tbody id="tableBody"></tbody>  
                    </table>  
                </div>  
                <div id="noDataMessage" class="alert alert-info">  
                    <i class="fas fa-info-circle"></i>  
                    Upload a CSV file to see data preview  
                </div>  
            </div>  
        </div>  
  
        <!-- Statistics Results -->  
        <div class="card" id="resultsCard">  
            <h2 class="card-title">  
                <i class="fas fa-calculator"></i>  
                Descriptive Statistics  
            </h2>  
              
            <div class="tabs">  
                <button class="tab active" data-tab="summary">Summary</button>  
                <button class="tab" data-tab="detailed">Detailed View</button>  
                <button class="tab" data-tab="raw">Raw Output</button>  
            </div>  
  
            <div class="tab-content active" id="summary">  
                <div class="stats-grid" id="statsGrid"></div>  
            </div>  
  
            <div class="tab-content" id="detailed">  
                <div class="results-area" id="detailedResults"></div>  
            </div>  
  
            <div class="tab-content" id="raw">  
                <div class="results-area" id="rawResults"></div>  
            </div>  
        </div>  
  
        <!-- Visualizations -->  
        <div class="card" id="chartsCard">  
            <h2 class="card-title">  
                <i class="fas fa-chart-line"></i>  
                Visualizations  
            </h2>  
              
            <div class="chart-title" id="chartTitle">Histogram with Normal Distribution Overlay</div>  
            <div class="chart-container" id="histogramChart"></div>  
              
            <div class="chart-title" style="margin-top: 2rem;">Box Plot Analysis</div>  
            <div class="chart-container" id="boxplotChart"></div>  
        </div>  
          
        <!-- Loading Indicator -->  
        <div class="loading" id="loading">  
            <div class="spinner"></div>  
            <p>Processing your data...</p>  
        </div>  
    </div>  
  
    <script>  
        // Global variables  
        let dataTable = null;  
        let currentStats = null;  
        let currentColumn = null;  
        let currentData = null;  
  
        // DOM elements  
        const fileInput = document.getElementById('fileInput');  
        const columnSelect = document.getElementById('columnSelect');  
        const uploadArea = document.getElementById('uploadArea');  
        const resultsCard = document.getElementById('resultsCard');  
        const chartsCard = document.getElementById('chartsCard');  
        const statsGrid = document.getElementById('statsGrid');  
        const loading = document.getElementById('loading');  
  
        // File upload handling  
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
            if (e.target.files.length > 0) {  
                handleFileUpload(e.target.files[0]);  
            }  
        });  
  
        // Column selection  
        columnSelect.addEventListener('change', (e) => {  
            if (!dataTable || !e.target.value) return;  
              
            showLoading();  
            setTimeout(() => {  
                currentColumn = e.target.value;  
                currentData = getNumericColumn(dataTable, currentColumn);  
                  
                if (currentData.length < 3) {  
                    document.getElementById('noDataMessage').textContent = `Not enough numeric data in "${currentColumn}". Need at least 3 values.`;  
                    document.getElementById('noDataMessage').className = 'alert alert-warning';  
                    document.getElementById('noDataMessage').style.display = 'block';  
                    hideLoading();  
                    return;  
                }  
                  
                document.getElementById('noDataMessage').style.display = 'none';  
                currentStats = computeStats(currentData);  
                displayResults();  
                displayCharts();  
                hideLoading();  
            }, 100);  
        });  
  
        // Tab handling  
        document.querySelectorAll('.tab').forEach(tab => {  
            tab.addEventListener('click', () => {  
                const tabGroup = tab.parentElement;  
                const tabContents = tabGroup.parentElement.querySelectorAll('.tab-content');  
                  
                // Remove active class from all tabs and contents  
                tabGroup.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));  
                tabContents.forEach(tc => tc.classList.remove('active'));  
                  
                // Add active class to clicked tab and corresponding content  
                tab.classList.add('active');  
                const targetContent = document.getElementById(tab.dataset.tab);  
                if (targetContent) {  
                    targetContent.classList.add('active');  
                }  
            });  
        });  
  
        // Export functionality  
        document.getElementById('exportResults').addEventListener('click', exportResults);  
        document.getElementById('clearData').addEventListener('click', clearAll);  
  
        // Core functions  
        async function handleFileUpload(file) {  
            if (!file.name.endsWith('.csv')) {  
                showAlert('warning', 'Please upload a CSV file.');  
                return;  
            }  
  
            showLoading();  
              
            try {  
                const text = await file.text();  
                dataTable = parseCSV(text);  
                  
                const numericColumns = detectNumericColumns(dataTable);  
                populateDropdown(numericColumns);  
                  
                displayDataPreview();  
                  
                showAlert('success', `File loaded: ${file.name} (${dataTable.rows.length} rows, ${dataTable.headers.length} columns)`);  
                  
            } catch (error) {  
                showAlert('warning', 'Error reading file: ' + error.message);  
            } finally {  
                hideLoading();  
            }  
        }  
  
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
                else if (ch === "," && !inQuotes) {   
                    out.push(cur);   
                    cur = "";   
                }  
                else cur += ch;  
            }  
            out.push(cur);  
            return out;  
        }  
  
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
  
        function populateDropdown(columns) {  
            columnSelect.innerHTML = '<option value="">Select a variable to analyze</option>';  
              
            if (columns.length === 0) {  
                columnSelect.disabled = true;  
                showAlert('warning', 'No numeric columns detected. Check your CSV.');  
                return;  
            }  
  
            columnSelect.disabled = false;  
              
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
  
        function computeStats(x) {  
            const n = x.length;  
            const xs = [...x].sort((a,b) => a-b);  
  
            const mean = xs.reduce((a,b) => a + b, 0) / n;  
  
            const median = (n % 2 === 1)  
                ? xs[(n - 1) / 2]  
                : (xs[n/2 - 1] + xs[n/2]) / 2;  
  
            // Mode (exact frequency)  
            const freq = new Map();  
            for (const v of x) {  
                freq.set(v, (freq.get(v) ?? 0) + 1);  
            }  
  
            let mode = x[0], modeCount = 1;  
            for (const [v,c] of freq.entries()) {  
                if (c > modeCount) {   
                    mode = v;   
                    modeCount = c;  
                }  
            }  
            const hasMode = modeCount > 1;  
  
            // Sample SD (using n-1)  
            const varS = xs.reduce((s,v) => s + (v - mean) ** 2, 0) / (n - 1);  
            const sd = Math.sqrt(varS);  
  
            const q1 = quantile(xs, 0.25);  
            const q3 = quantile(xs, 0.75);  
            const iqr = q3 - q1;  
  
            const lowerFence = q1 - 1.5 * iqr;  
            const upperFence = q3 + 1.5 * iqr;  
  
            const outliers = x.filter(v => v < lowerFence || v > upperFence);  
  
            const inRange = x.filter(v => v >= lowerFence && v <= upperFence);  
            const whiskMin = inRange.length ? inRange[0] : x[0];  
            const whiskMax = inRange.length ? inRange[inRange.length - 1] : x[n - 1];  
  
            // Skewness (using Pearson's median skewness formula)  
            let skewness = 0;  
            if (sd > 0) {  
                skewness = 3 * (mean - median) / sd;  
            }  
  
            const range = x[n-1] - x[0];  
  
            return {  
                mean,   
                median,  
                mode,   
                modeCount: modeCount,   
                hasMode,  
                sd,   
                varS,  
                min: x[0],   
                max: x[n - 1],   
                range,  
                q1,   
                q3,   
                iqr,  
                lowerFence,   
                upperFence,  
                whiskMin,   
                whiskMax,  
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
  
        function displayResults() {  
            if (!currentStats || !currentColumn) return;  
  
            resultsCard.style.display = 'block';  
              
            // Summary grid  
            const summaryStats = [  
                { label: 'Sample Size', value: currentData.length, icon: 'fas fa-hashtag' },  
                { label: 'Mean', value: fmt(currentStats.mean), icon: 'fas fa-calculator' },  
                { label: 'Median', value: fmt(currentStats.median), icon: 'fas fa-arrows-alt-h' },  
                { label: 'Std Dev (s)', value: fmt(currentStats.sd), icon: 'fas fa-chart-line' },  
                { label: 'Min', value: fmt(currentStats.min), icon: 'fas fa-arrow-down' },  
                { label: 'Max', value: fmt(currentStats.max), icon: 'fas fa-arrow-up' },  
                { label: 'Q1', value: fmt(currentStats.q1), icon: 'fas fa-chart-bar' },  
                { label: 'Q3', value: fmt(currentStats.q3), icon: 'fas fa-chart-bar' },  
                { label: 'IQR', value: fmt(currentStats.iqr), icon: 'fas fa-expand-arrows-alt' },  
                { label: 'Skewness', value: fmt(currentStats.skewness), icon: 'fas fa-balance-scale' },  
                { label: 'Outliers', value: currentStats.outliers.length, icon: 'fas fa-exclamation-triangle' },  
                { label: 'Range', value: fmt(currentStats.range), icon: 'fas fa-ruler' }  
            ];  
  
            statsGrid.innerHTML = summaryStats.map(stat => `  
                <div class="stat-item">  
                    <div class="stat-label">  
                        <i class="${stat.icon}"></i> ${stat.label}  
                    </div>  
                    <div class="stat-value">${stat.value}</div>  
                </div>  
            `).join('');  
  
            // Detailed results  
            const modeLine = currentStats.hasMode  
                ? `Mode    : ${fmt(currentStats.mode)} (appears ${currentStats.modeCount} times)`  
                : `Mode    : No repeated value (no clear mode)`;  
  
            const detailedOutput = [  
                `Variable: ${currentColumn}`,  
                `Count   : ${currentData.length}`,  
                ``,  
                `--- Centre ---`,  
                `Mean    : ${fmt(currentStats.mean)}`,  
                `Median  : ${fmt(currentStats.median)}`,  
                modeLine,  
                ``,  
                `--- Spread ---`,  
                `Min     : ${fmt(currentStats.min)}`,  
                `Max     : ${fmt(currentStats.max)}`,  
                `Range   : ${fmt(currentStats.range)}`,  
                `SD      : ${fmt(currentStats.sd)}`,  
                `Variance: ${fmt(currentStats.varS)}`,  
                `Q1      : ${fmt(currentStats.q1)}`,  
                `Q3      : ${fmt(currentStats.q3)}`,  
                `IQR     : ${fmt(currentStats.iqr)}`,  
                ``,  
                `--- Outliers (IQR rule) ---`,  
                `Lower fence : ${fmt(currentStats.lowerFence)}`,  
                `Upper fence : ${fmt(currentStats.upperFence)}`,  
                `Outliers    : ${currentStats.outliers.length}`,  
                ``,  
                `--- Shape ---`,  
                `Skewness : ${fmt(currentStats.skewness)}`  
            ].join("\n");  
  
            document.getElementById('detailedResults').textContent = detailedOutput;  
            document.getElementById('rawResults').textContent = detailedOutput;  
  
            // Enable export button  
            document.getElementById('exportResults').disabled = false;  
        }  
  
        function displayCharts() {  
            if (!currentData || !currentStats) return;  
  
            chartsCard.style.display = 'block';  
              
            // Create histogram with normal curve  
            createHistogram();  
              
            // Create box plot  
            createBoxPlot();  
        }  
  
        function createHistogram() {  
            if (!currentData || !currentStats) return;  
  
            const n = currentData.length;  
            const std = currentStats.sd;  
            const mean = currentStats.mean;  
              
            // Extended range for normal curve (4 std from mean)  
            const rangeMin = mean - 4 * std;  
            const rangeMax = mean + 4 * std;  
              
            // Number of bins using Sturges' formula  
            const bins = Math.max(8, Math.ceil(1 + Math.log2(n)));  
            const binWidth = (rangeMax - rangeMin) / bins;  
  
            // Create bin centers and count  
            const binCenters = [];  
            const counts = [];  
            let maxCount = 0;  
  
            for (let i = 0; i < bins; i++) {  
                const center = rangeMin + (i + 0.5) * binWidth;  
                binCenters.push(center);  
  
                const start = rangeMin + i * binWidth;  
                const end = start + binWidth;  
                const count = currentData.filter(v => v >= start && v < end).length;  
                counts.push(count);  
                if (count > maxCount) maxCount = count;  
            }  
  
            // Generate normal curve  
            const normalX = [];  
            const normalY = [];  
            for (let i = 0; i <= 100; i++) {  
                const x = rangeMin + (rangeMax - rangeMin) * (i / 100);  
                const y = (n * binWidth) * normalPDF(x, mean, std);  
                normalX.push(x);  
                normalY.push(y);  
            }  
  
            // Find max values for y-axis  
            const maxNormal = Math.max(...normalY);  
            const yMax = Math.max(maxCount * 1.1, maxNormal * 1.1);  
  
            // Histogram trace  
            const histogramTrace = {  
                x: binCenters,  
                y: counts,  
                type: 'bar',  
                name: 'Data',  
                marker: {  
                    color: '#3182ce',  
                    opacity: 0.85,  
                    line: {  
                        color: '#2b6cb0',  
                        width: 1  
                    }  
                },  
                width: binWidth * 0.95, // 5% gap between bars  
                marker: {  
                    color: '#2c5282',  
                    outliercolor: '#c53030',  
                    opacity: 0.8  
                }  
            };  
  
            // Normal curve trace  
            const normalTrace = {  
                x: normalX,  
                y: normalY,  
                type: 'scatter',  
                mode: 'lines',  
                name: 'Normal Distribution',  
                line: {  
                    color: '#e53e3e',  
                    width: 3.5,  
                    shape: 'spline'  
                },  
                fill: 'tonexty',  
                fillcolor: 'rgba(236, 72, 153, 0.2)'  
            };  
  
            const layout = {  
                title: {  
                    text: `Histogram: ${currentColumn}`,  
                    font: { size: 16, color: '#2d3748' }  
                },  
                xaxis: {   
                    title: currentColumn,  
                    gridcolor: '#edf2f7',  
                    showgrid: true,  
                    range: [rangeMin, rangeMax],  
                    zeroline: false  
                },  
                yaxis: {   
                    title: 'Frequency',  
                    gridcolor: '#edf2f7',  
                    showgrid: true,  
                    side: 'left',  
                    range: [0, yMax]  
                },  
                showlegend: true,  
                legend: {  
                    x: 0.02,  
                    y: 0.98,  
                    bgcolor: 'rgba(255,255,255,0.8)',  
                    bordercolor: '#e2e8f0',  
                    borderwidth: 1  
                },  
                margin: { t: 40, b: 60, l: 60, r: 40 },  
                plot_bgcolor: '#f8fafc',  
                paper_bgcolor: '#ffffff',  
                hovermode: 'x unified',  
                hoverlabel: {  
                    bgcolor: '#1a202c',  
                    font: {  
                        family: 'Inter',  
                        size: 12,  
                        color: 'white'  
                    }  
                }  
            };  
  
            Plotly.newPlot('histogramChart', [histogramTrace, normalTrace], layout, {responsive: true});  
        }  
  
        function createBoxPlot() {  
            const trace = {  
                y: currentData,  
                type: 'box',  
                name: currentColumn,  
                marker: {  
                    color: '#2b6cb0',  
                    size: 8  
                },  
                line: {  
                    color: '#1a202c',  
                    width: 2  
                },  
                fillcolor: 'rgba(59, 120, 240, 0.1)',  
                boxpoints: 'outliers',  
                pointpos: 0,  
                jitter: 0.3,  
                marker: {  
                    color: '#c53030',  
                    size: 8,  
                    symbol: 'circle'  
                }  
            };  
  
            const layout = {  
                title: {  
                    text: `Box Plot: ${currentColumn}`,  
                    font: { size: 16, color: '#2d3748' }  
                },  
                yaxis: {  
                    gridcolor: '#edf2f7',  
                    visible: false  
                },  
                xaxis: {  
                    visible: false  
                },  
                plot_bgcolor: '#f8fafc',  
                paper_bgcolor: '#ffffff',  
                hovermode: 'closest',  
                margin: { t: 40, b: 60, l: 60, r: 40 },  
                boxmode: 'group'  
            };  
  
            Plotly.newPlot('boxplotChart', [trace], layout, {responsive: true});  
        }  
  
        function normalPDF(x, mean, std) {  
            const coefficient = 1 / (std * Math.sqrt(2 * Math.PI));  
            const exponent = -0.5 * Math.pow((x - mean) / std, 2);  
            return coefficient * Math.exp(exponent);  
        }  
  
        function displayDataPreview() {  
            if (!dataTable) return;  
  
            const noDataMessage = document.getElementById('noDataMessage');  
            const dataPreview = document.getElementById('dataPreview');  
            const tableHead = document.getElementById('tableHead');  
            const tableBody = document.getElementById('tableBody');  
  
            noDataMessage.style.display = 'none';  
            dataPreview.style.display = 'block';  
  
            // Create header  
            tableHead.innerHTML = `  
                <tr>  
                    ${dataTable.headers.map(header => `<th>${header}</th>`).join('')}  
                </tr>  
            `;  
  
            // Create body (show first 10 rows)  
            const previewRows = dataTable.rows.slice(0, 10);  
            tableBody.innerHTML = previewRows.map(row => `  
                <tr>  
                    ${dataTable.headers.map(header => `<td>${row[header] || ''}</td>`).join('')}  
                </tr>  
            `).join('');  
  
            if (dataTable.rows.length > 10) {  
                tableBody.innerHTML += `  
                    <tr style="background: #edf2f7; font-style: italic;">  
                        <td colspan="${dataTable.headers.length}" style="text-align: center;">  
                            ... and ${dataTable.rows.length - 10} more rows  
                        </td>  
                    </tr>  
                `;  
            }  
        }  
  
        function fmt(v) {  
            if (v === null || v === undefined) return '';  
            if (!Number.isFinite(v)) return String(v);  
            return v.toLocaleString(undefined, {  
                minimumFractionDigits: 2,  
                maximumFractionDigits: 3  
            });  
        }  
  
        function exportResults() {  
            if (!currentStats || !currentColumn) return;  
  
            let detailedOutput = `Descriptive Statistics for ${currentColumn}\n`;  
            detailedOutput += `====================================================================\n\n`;  
            detailedOutput += formatDetailedStats(currentStats, currentColumn);  
  
            const blob = new Blob([detailedOutput], { type: 'text/plain' });  
            const url = URL.createObjectURL(blob);  
              
            const a = document.createElement('a');  
            a.href = url;  
            a.download = `statistics_${currentColumn.replace(/\s+/g, '_')}.txt`;  
            document.body.appendChild(a);  
            a.click();  
            document.body.removeChild(a);  
            URL.revokeObjectURL(url);  
        }  
  
        function formatDetailedStats(stats, column) {  
            return `  
Variable: ${column}  
----------------------------------------  
Measurement Count: ${stats.n}  
Mean:            ${fmt(stats.mean)}  
Median:          ${fmt(stats.median)}  
Mode:            ${stats.hasMode ? fmt(stats.mode) : 'N/A'}  
Standard Deviation (s): ${fmt(stats.sd)}  
Variance (s²):    ${fmt(stats.varS)}  
  
Minimum:         ${fmt(stats.min)}  
Maximum:         ${fmt(stats.max)}  
Range:           ${fmt(stats.range)}  
  
First Quartile (Q1): ${fmt(stats.q1)}  
Third Quartile (Q3): ${fmt(stats.q3)}  
Interquartile Range (IQR): ${fmt(stats.iqr)}  
Lower Fence:     ${fmt(stats.lowerFence)}  
Upper Fence:     ${fmt(stats.upperFence)}  
Outliers:        ${stats.outliers.length}  
  
Skewness:        ${fmt(stats.skewness)}  
`.replace(/\s+/g, ' ').trim();  
        }  
  
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
              
            document.getElementById('exportResults').disabled = true;  
              
            showAlert('info', 'All data cleared. Ready for new upload.');  
        }  
  
        function showLoading() {  
            loading.style.display = 'block';  
        }  
  
        function hideLoading() {  
            loading.style.display = 'none';  
        }  
  
        function showAlert(type, message) {  
            const alertClass = `alert-${type}`;  
            const icon = type === 'success' ? 'fa-check-circle' :   
                        type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';  
              
            const alert = document.createElement('div');  
            alert.className = `alert ${alertClass} mb-4`;  
            alert.innerHTML = `<i class="fas ${icon} mr-2"></i>${message}`;  
              
            const container = document.querySelector('.container');  
            container.insertBefore(alert, container.firstChild);  
              
            setTimeout(() => {  
                alert.remove();  
            }, 5000);  
        }  
  
        // Initialize  
        document.addEventListener('DOMContentLoaded', () => {  
            resultsCard.style.display = 'none';  
            chartsCard.style.display = 'none';  
              
            showAlert('info', 'Welcome! Upload a CSV file to get started with descriptive statistics analysis.');  
        });  
    </script>  
</body>  
</html>  
