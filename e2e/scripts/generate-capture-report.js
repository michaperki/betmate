/**
 * Generates an HTML report from capture data
 */
const fs = require('fs');
const path = require('path');

// Get capture tag from command line args
const args = process.argv.slice(2);
let captureTag = args[0];

if (!captureTag) {
  // If no tag provided, try to find the most recent one
  const capturesDir = path.join(process.cwd(), 'captures');
  if (fs.existsSync(capturesDir)) {
    const dirs = fs.readdirSync(capturesDir).filter(f => {
      const stat = fs.statSync(path.join(capturesDir, f));
      return stat.isDirectory();
    });
    
    if (dirs.length > 0) {
      // Sort by creation time (most recent first)
      dirs.sort((a, b) => {
        const statA = fs.statSync(path.join(capturesDir, a));
        const statB = fs.statSync(path.join(capturesDir, b));
        return statB.birthtime - statA.birthtime;
      });
      captureTag = dirs[0];
    }
  }
}

if (!captureTag) {
  console.error('Error: No capture tag provided and no captures found');
  process.exit(1);
}

const captureDir = path.join(process.cwd(), 'captures', captureTag);
const indexPath = path.join(captureDir, 'index.json');

if (!fs.existsSync(indexPath)) {
  console.error(`Error: No index.json found for tag ${captureTag}`);
  process.exit(1);
}

// Read the root manifest
const rootManifest = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

// Read category manifests
const categoryManifests = [];
if (fs.existsSync(path.join(captureDir, 'manifests'))) {
  const manifestFiles = fs.readdirSync(path.join(captureDir, 'manifests'));
  for (const file of manifestFiles) {
    if (file.endsWith('.json')) {
      const manifestPath = path.join(captureDir, 'manifests', file);
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      categoryManifests.push(manifest);
    }
  }
}

// Read summary if available
let summary = null;
const summaryPath = path.join(captureDir, 'summary.json');
if (fs.existsSync(summaryPath)) {
  summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
}

// Helper to create relative paths for images
function makeRelativePath(filePath) {
  return filePath.replace(process.cwd(), '').replace(/\\/g, '/');
}

// Generate HTML report
function generateReport() {
  const timestamp = new Date().toLocaleString();
  
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UI Capture Report - ${captureTag}</title>
  <style>
    :root {
      --bg-color: #f5f5f5;
      --card-bg: #ffffff;
      --text-color: #333333;
      --border-color: #dddddd;
      --accent-color: #3f51b5;
      --accent-light: #e8eaf6;
      --success-color: #4caf50;
      --warning-color: #ff9800;
      --error-color: #f44336;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg-color);
      color: var(--text-color);
      line-height: 1.6;
      margin: 0;
      padding: 20px;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    header {
      background-color: var(--card-bg);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    h1 {
      margin-top: 0;
      color: var(--accent-color);
    }
    
    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .meta-item {
      background-color: var(--accent-light);
      border-radius: 4px;
      padding: 8px 16px;
    }
    
    .stats {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .stat-card {
      background-color: var(--card-bg);
      border-radius: 8px;
      padding: 15px;
      flex: 1;
      min-width: 200px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .stat-card h3 {
      margin-top: 0;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 8px;
    }
    
    .categories {
      margin-bottom: 30px;
    }
    
    .category {
      background-color: var(--card-bg);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    
    .category-title {
      margin: 0;
      color: var(--accent-color);
    }
    
    .shot-count {
      background-color: var(--accent-color);
      color: white;
      border-radius: 20px;
      padding: 4px 12px;
      font-size: 0.9rem;
    }
    
    .viewports {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }
    
    .viewport {
      background-color: var(--accent-light);
      border-radius: 4px;
      padding: 6px 12px;
      font-size: 0.9rem;
      cursor: pointer;
    }
    
    .viewport.active {
      background-color: var(--accent-color);
      color: white;
    }
    
    .shots {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 15px;
    }
    
    .shot {
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border-color);
      transition: transform 0.2s;
    }
    
    .shot:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    .shot-img-container {
      height: 200px;
      overflow: hidden;
      position: relative;
      background-color: #f0f0f0;
    }
    
    .shot-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
      transition: object-position 0.3s;
    }
    
    .shot-img:hover {
      object-position: center center;
    }
    
    .shot-info {
      padding: 12px;
    }
    
    .shot-name {
      margin: 0 0 8px 0;
      font-size: 1rem;
      font-weight: 600;
    }
    
    .shot-description {
      margin: 0;
      font-size: 0.9rem;
      color: #666;
    }
    
    .shot-meta {
      margin-top: 8px;
      font-size: 0.8rem;
      color: #888;
    }
    
    .tab-nav {
      display: flex;
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 20px;
    }
    
    .tab {
      padding: 10px 20px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
    }
    
    .tab.active {
      border-bottom-color: var(--accent-color);
      color: var(--accent-color);
      font-weight: 600;
    }
    
    .tab-content {
      display: none;
    }
    
    .tab-content.active {
      display: block;
    }
    
    @media (max-width: 768px) {
      .shots {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>UI Capture Report - ${captureTag}</h1>
      <div class="meta">
        <div class="meta-item">Generated: ${timestamp}</div>
        <div class="meta-item">Tag: ${captureTag}</div>
        <div class="meta-item">Total Shots: ${rootManifest.allShots.length}</div>
      </div>
    </header>
    
    <div class="tab-nav">
      <div class="tab active" data-tab="overview">Overview</div>
      <div class="tab" data-tab="categories">Categories</div>
      <div class="tab" data-tab="viewports">Viewports</div>
      <div class="tab" data-tab="all">All Screenshots</div>
    </div>
    
    <div class="tab-content active" id="overview">
      <div class="stats">
        <div class="stat-card">
          <h3>Categories</h3>
          <ul>
            ${categoryManifests.map(m => `
              <li>${m.category} - ${m.shots.length} screenshots</li>
            `).join('')}
          </ul>
        </div>
        
        <div class="stat-card">
          <h3>Viewports</h3>
          <ul>
            ${Object.entries(rootManifest.viewports).map(([name, dims]) => `
              <li>${name} (${dims.width}×${dims.height}) - ${rootManifest.allShots.filter(s => s.viewport === `${dims.width}x${dims.height}`).length} screenshots</li>
            `).join('')}
          </ul>
        </div>
        
        <div class="stat-card">
          <h3>Details</h3>
          <p>Capture Time: ${rootManifest.generatedAt}</p>
          ${summary ? `<p>Status: ${summary.captureComplete ? 'Complete' : 'Partial'}</p>` : ''}
        </div>
      </div>
      
      <h2>Recent Captures</h2>
      <div class="shots">
        ${rootManifest.allShots.slice(0, 8).map(shot => `
          <div class="shot">
            <div class="shot-img-container">
              <img src="${makeRelativePath(shot.file)}" alt="${shot.description || 'Screenshot'}" class="shot-img">
            </div>
            <div class="shot-info">
              <h3 class="shot-name">${shot.file.split('/').pop().replace('.png', '')}</h3>
              <p class="shot-description">${shot.description || 'No description'}</p>
              <div class="shot-meta">
                ${shot.viewport} • ${shot.route}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="tab-content" id="categories">
      <div class="categories">
        ${categoryManifests.map(category => `
          <div class="category">
            <div class="category-header">
              <h2 class="category-title">${category.category}</h2>
              <span class="shot-count">${category.shots.length} Screenshots</span>
            </div>
            
            <div class="viewports" data-category="${category.categoryKey}">
              ${Object.keys(rootManifest.viewports).map((vp, i) => `
                <div class="viewport ${i === 0 ? 'active' : ''}" data-viewport="${vp}">${vp}</div>
              `).join('')}
            </div>
            
            ${Object.keys(rootManifest.viewports).map((vp, i) => `
              <div class="shots" data-category="${category.categoryKey}" data-viewport="${vp}" style="${i === 0 ? '' : 'display: none;'}">
                ${category.shots
                  .filter(s => s.viewport === `${rootManifest.viewports[vp].width}x${rootManifest.viewports[vp].height}`)
                  .map(shot => `
                    <div class="shot">
                      <div class="shot-img-container">
                        <img src="${makeRelativePath(shot.file)}" alt="${shot.description || 'Screenshot'}" class="shot-img">
                      </div>
                      <div class="shot-info">
                        <h3 class="shot-name">${shot.file.split('/').pop().replace('.png', '')}</h3>
                        <p class="shot-description">${shot.description || 'No description'}</p>
                        <div class="shot-meta">
                          ${shot.route}
                        </div>
                      </div>
                    </div>
                  `).join('')}
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="tab-content" id="viewports">
      ${Object.entries(rootManifest.viewports).map(([vpName, dims]) => `
        <div class="category">
          <div class="category-header">
            <h2 class="category-title">${vpName} (${dims.width}×${dims.height})</h2>
            <span class="shot-count">${rootManifest.allShots.filter(s => s.viewport === `${dims.width}x${dims.height}`).length} Screenshots</span>
          </div>
          
          <div class="shots">
            ${rootManifest.allShots
              .filter(s => s.viewport === `${dims.width}x${dims.height}`)
              .map(shot => `
                <div class="shot">
                  <div class="shot-img-container">
                    <img src="${makeRelativePath(shot.file)}" alt="${shot.description || 'Screenshot'}" class="shot-img">
                  </div>
                  <div class="shot-info">
                    <h3 class="shot-name">${shot.file.split('/').pop().replace('.png', '')}</h3>
                    <p class="shot-description">${shot.description || 'No description'}</p>
                    <div class="shot-meta">
                      ${shot.route}
                    </div>
                  </div>
                </div>
              `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
    
    <div class="tab-content" id="all">
      <div class="category">
        <div class="category-header">
          <h2 class="category-title">All Screenshots</h2>
          <span class="shot-count">${rootManifest.allShots.length} Screenshots</span>
        </div>
        
        <div class="shots">
          ${rootManifest.allShots.map(shot => `
            <div class="shot">
              <div class="shot-img-container">
                <img src="${makeRelativePath(shot.file)}" alt="${shot.description || 'Screenshot'}" class="shot-img">
              </div>
              <div class="shot-info">
                <h3 class="shot-name">${shot.file.split('/').pop().replace('.png', '')}</h3>
                <p class="shot-description">${shot.description || 'No description'}</p>
                <div class="shot-meta">
                  ${shot.viewport} • ${shot.route}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </div>
  
  <script>
    // Tab navigation
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        // Deactivate all tabs
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Activate selected tab
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
      });
    });
    
    // Viewport switching
    document.querySelectorAll('.viewport').forEach(vp => {
      vp.addEventListener('click', () => {
        const category = vp.parentElement.dataset.category;
        const viewport = vp.dataset.viewport;
        
        // Update active viewport button
        document.querySelectorAll(\`[data-category="\${category}"] .viewport\`).forEach(v => {
          v.classList.remove('active');
        });
        vp.classList.add('active');
        
        // Show matching shots
        document.querySelectorAll(\`[data-category="\${category}"].shots\`).forEach(shotsEl => {
          shotsEl.style.display = shotsEl.dataset.viewport === viewport ? 'grid' : 'none';
        });
      });
    });
  </script>
</body>
</html>
  `;
  
  const reportPath = path.join(captureDir, 'report.html');
  fs.writeFileSync(reportPath, html);
  
  console.log(`Report generated: ${reportPath}`);
  console.log(`Open with: file://${reportPath}`);
}

generateReport();