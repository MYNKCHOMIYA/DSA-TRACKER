const fs = require('fs');

// 1. Dashboard cleanup
let dashboard = fs.readFileSync('public/dashboard.html', 'utf-8');
dashboard = dashboard.replace(
  /<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px">\s*<h3 style="margin: 0">Striver A2Z Breakdown<\/h3>\s*<button class="nav-btn"[^>]+>\s*<span[^>]+><\/span> Edit\s*<\/button>\s*<\/div>/g,
  '<h3 style="margin-bottom: 4px">Striver A2Z Breakdown</h3>'
);

dashboard = dashboard.replace(
  /<!-- Striver Breakdown Edit Modal -->[\s\S]*?<\/div>\s*<\/div>\s*<div class="toast-container" id="toastContainer"><\/div>/,
  '<div class="toast-container" id="toastContainer"></div>'
);
fs.writeFileSync('public/dashboard.html', dashboard);

// 2. App.js cleanup
let app = fs.readFileSync('public/js/app.js', 'utf-8');
const modalRegex = /\/\/ ── Striver Edit Modal ──[\s\S]*$/;
app = app.replace(modalRegex, '');
fs.writeFileSync('public/js/app.js', app);

// 3. User model cleanup
let user = fs.readFileSync('models/User.js', 'utf-8');
user = user.replace(/\s*striverBreakdown: \{ type: Map, of: Number, default: \{\} \},/g, '');
fs.writeFileSync('models/User.js', user);

// 4. settings.js cleanup
let settings = fs.readFileSync('routes/settings.js', 'utf-8');
settings = settings.replace(/\s*striverBreakdown: user\.striverBreakdown \|\| \{\},/g, '');
settings = settings.replace(/'name', 'striverBreakdown'/g, "'name'");
fs.writeFileSync('routes/settings.js', settings);

console.log('Cleanup script finished');
