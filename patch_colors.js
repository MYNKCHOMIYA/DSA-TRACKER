const fs = require('fs');

// 1. Update style.css
let css = fs.readFileSync('public/css/style.css', 'utf-8');

// Replace CSS Variables
const rootRegex = /:root\s*\{([\s\S]*?)\}/;
const newRoot = `:root {
  --bg-primary: #252525;
  --bg-secondary: #202020;
  --bg-card: rgba(84, 50, 76, 0.4);
  --bg-card-hover: rgba(84, 50, 76, 0.65);
  --bg-input: rgba(244, 244, 244, 0.05);
  --bg-input-focus: rgba(244, 244, 244, 0.1);
  --glass-border: rgba(244, 244, 244, 0.08);
  --glass-border-hover: rgba(244, 244, 244, 0.18);
  --glass-blur: blur(28px);
  
  --text-primary: #F4F4F4;
  --text-secondary: #c5b9c1;
  --text-muted: #948690;
  
  --accent-pink: #7A3E54;
  --accent-blue: #54324C;
  --accent-gold: #9f657a;
  --accent-green: #678d6b;
  --accent-cyan: #54324C;
  --accent-red: #7A3E54;
  --accent-orange: #9f657a;
  
  --glow-pink: rgba(122, 62, 84, 0.35);
  --glow-blue: rgba(84, 50, 76, 0.3);
  --glow-gold: rgba(159, 101, 122, 0.3);
  
  --gradient-primary: linear-gradient(135deg, #7A3E54 0%, #54324C 100%);
  --gradient-fire: linear-gradient(135deg, #7A3E54 0%, #9f657a 100%);
  --gradient-blue: linear-gradient(135deg, #54324C 0%, #7A3E54 100%);
  --gradient-success: linear-gradient(135deg, #678d6b 0%, #54324C 100%);
  --gradient-bg: #252525;
  
  --status-ahead: #678d6b;
  --status-behind: #7A3E54;
  --status-ontrack: #9f657a;
  
  --radius-xs: 6px;
  --radius-sm: 10px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --radius-xl: 24px;
  --radius-2xl: 32px;
  --radius-full: 9999px;
  
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 8px 32px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 20px 60px rgba(0, 0, 0, 0.5);
  --shadow-glow-pink: 0 0 30px rgba(122, 62, 84, 0.3);
  --shadow-glow-blue: 0 0 30px rgba(84, 50, 76, 0.25);
  
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 280ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 600ms cubic-bezier(0.4, 0, 0.2, 1);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --nav-height: 68px;
  --bottom-nav-height: 68px;
}`;
css = css.replace(rootRegex, newRoot);

// Hardcoded neon colors in CSS
css = css.replace(/#ff3ea5/gi, '#7A3E54');
css = css.replace(/#37b7ff/gi, '#54324C');
css = css.replace(/#ffd34f/gi, '#9f657a');
// Hardcoded rgba glows in CSS
css = css.replace(/rgba\(255,\s*62,\s*165/g, 'rgba(122, 62, 84');
css = css.replace(/rgba\(55,\s*183,\s*255/g, 'rgba(84, 50, 76');
css = css.replace(/rgba\(255,\s*211,\s*79/g, 'rgba(159, 101, 122');

fs.writeFileSync('public/css/style.css', css);


// 2. Update charts.js
let charts = fs.readFileSync('public/js/charts.js', 'utf-8');

// Colors
charts = charts.replace(/#ff3ea5/gi, '#7A3E54');
charts = charts.replace(/#37b7ff/gi, '#8c5970'); // lighter plum for contrast
charts = charts.replace(/#ffd34f/gi, '#9f657a');

charts = charts.replace(/rgba\(255,\s*62,\s*165/g, 'rgba(122, 62, 84');
charts = charts.replace(/rgba\(55,\s*183,\s*255/g, 'rgba(140, 89, 112'); // lighter plum

fs.writeFileSync('public/js/charts.js', charts);

console.log("Colors patched successfully.");
