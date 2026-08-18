const fs = require('fs');

// 1. Update style.css
let css = fs.readFileSync('public/css/style.css', 'utf-8');

// Replace CSS Variables
const rootRegex = /:root\s*\{([\s\S]*?)\}/;
const newRoot = `:root {
  --bg-primary: #211D1C;
  --bg-secondary: #1a1716;
  --bg-card: rgba(0, 33, 71, 0.85);
  --bg-card-hover: rgba(0, 33, 71, 1);
  --bg-input: rgba(242, 240, 240, 0.05);
  --bg-input-focus: rgba(242, 240, 240, 0.1);
  --glass-border: rgba(185, 214, 242, 0.15);
  --glass-border-hover: rgba(185, 214, 242, 0.3);
  --glass-blur: blur(28px);
  
  --text-primary: #F2F0F0;
  --text-secondary: #E4F0EF;
  --text-muted: #8a99a8;
  
  --accent-pink: #994636;
  --accent-blue: #B9D6F2;
  --accent-gold: #CBA135;
  --accent-green: #4a7c59;
  --accent-cyan: #B9D6F2;
  --accent-red: #994636;
  --accent-orange: #CBA135;
  
  --glow-pink: rgba(153, 70, 54, 0.4);
  --glow-blue: rgba(185, 214, 242, 0.3);
  --glow-gold: rgba(203, 161, 53, 0.3);
  
  --gradient-primary: linear-gradient(135deg, #994636 0%, #B9D6F2 100%);
  --gradient-fire: linear-gradient(135deg, #994636 0%, #CBA135 100%);
  --gradient-blue: linear-gradient(135deg, #B9D6F2 0%, #002147 100%);
  --gradient-success: linear-gradient(135deg, #4a7c59 0%, #B9D6F2 100%);
  --gradient-bg: #211D1C;
  
  --status-ahead: #4a7c59;
  --status-behind: #994636;
  --status-ontrack: #CBA135;
  
  --radius-xs: 6px;
  --radius-sm: 10px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --radius-xl: 24px;
  --radius-2xl: 32px;
  --radius-full: 9999px;
  
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 8px 32px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 20px 60px rgba(0, 0, 0, 0.6);
  --shadow-glow-pink: 0 0 30px rgba(153, 70, 54, 0.3);
  --shadow-glow-blue: 0 0 30px rgba(185, 214, 242, 0.25);
  
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 280ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 600ms cubic-bezier(0.4, 0, 0.2, 1);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --nav-height: 68px;
  --bottom-nav-height: 68px;
}`;
css = css.replace(rootRegex, newRoot);

fs.writeFileSync('public/css/style.css', css);

// 2. Update charts.js
let charts = fs.readFileSync('public/js/charts.js', 'utf-8');

charts = charts.replace(/#7A3E54/gi, '#994636'); // Replace burgundy with Sienna
charts = charts.replace(/#8c5970/gi, '#B9D6F2'); // Replace light plum with Sky Blue
charts = charts.replace(/#54324C/gi, '#B9D6F2'); // Replace plum with Sky Blue
charts = charts.replace(/#9f657a/gi, '#CBA135'); // Replace gold accent with Oxford Gold

charts = charts.replace(/rgba\(122,\s*62,\s*84/g, 'rgba(153, 70, 54'); // Sienna glow
charts = charts.replace(/rgba\(140,\s*89,\s*112/g, 'rgba(185, 214, 242'); // Sky Blue glow
charts = charts.replace(/rgba\(84,\s*50,\s*76/g, 'rgba(185, 214, 242'); // Sky Blue glow

fs.writeFileSync('public/js/charts.js', charts);

console.log("Oxford colors patched successfully.");
