const fs = require('fs');

// 1. Dashboard HTML
let dashboard = fs.readFileSync('public/dashboard.html', 'utf-8');

// Add global loader right after body
const loaderHTML = `
    <!-- Global Loading Overlay -->
    <div id="globalLoader" style="position: fixed; inset: 0; background: var(--bg-dark); z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: opacity 0.4s ease;">
      <div class="loader" style="width: 48px; height: 48px; border-width: 4px; border-bottom-color: var(--accent-pink);"></div>
      <p style="margin-top: 16px; color: var(--text-muted); font-size: 14px; animation: pulse 1.5s infinite;">Synchronizing Data...</p>
    </div>
`;
dashboard = dashboard.replace('<body>', '<body>\n' + loaderHTML);

// Increase chart height
dashboard = dashboard.replace(
  /<div class="chart-container" style="height: 320px; margin-bottom: 16px">/,
  '<div class="chart-container" style="height: 480px; margin-bottom: 16px">'
);

fs.writeFileSync('public/dashboard.html', dashboard);

// 2. App.js
let app = fs.readFileSync('public/js/app.js', 'utf-8');

// Hide loader after render
const initRegex = /\/\/ Render everything\s*renderDashboard\(\);\s*\}/m;
app = app.replace(initRegex, `// Render everything
    renderDashboard();
    
    // Hide loader
    const loader = document.getElementById("globalLoader");
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => loader.style.display = "none", 400);
    }
  }`);

// Auto refresh after saveTodayLog
const saveLogRegex = /updateCircularProgress\(count, userSettings\.dailyTarget \|\| 5\);\s*showToast\("Progress saved!", "success"\);\s*\}/m;
app = app.replace(saveLogRegex, `updateCircularProgress(count, userSettings.dailyTarget || 5);
    showToast("Progress saved! Refreshing...", "success");
    await refreshAllData();
  }`);

fs.writeFileSync('public/js/app.js', app);
console.log('UI enhancements applied');
