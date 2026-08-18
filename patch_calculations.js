const fs = require('fs');

let app = fs.readFileSync('public/js/app.js', 'utf-8');

// 1. Replace renderStatsCards
const statsRegex = /function renderStatsCards\(\) \{[\s\S]*?\n\}\n/m;
const newStats = `function renderStatsCards() {
  const sheetTotal = userSettings.totalSheetProblems || 474;
  const dailyTarget = userSettings.dailyTarget || 5;

  // Today's progress
  const todayDone = todayLog.questionsDone || 0;
  document.getElementById("todayInput").value = todayDone;
  document.getElementById("todayTarget").textContent = dailyTarget;
  updateCircularProgress(todayDone, dailyTarget);

  // Previous Solved calculation
  // "after the day ends previous solved = previous solved+today's progress and todays progress resets = 0"
  // This means previousSolved is sum of all historical logs EXCEPT today's.
  let previousSolved = 0;
  const todayIso = new Date().toISOString().split('T')[0];
  allLogs.forEach(log => {
    if (log.date !== todayIso) {
      previousSolved += log.questionsDone;
    }
  });

  // Total question is sum of previous + today
  const totalSolved = previousSolved + todayDone;

  // Streak comes from LeetCode
  const streak = leetcodeData.calendar?.streak || 0;
  document.getElementById("streakValue").textContent = streak;
  document.getElementById("streakSub").textContent = "day LeetCode streak";

  // Total solved
  const lcSolved = leetcodeData.solved?.solvedProblem || 0;
  document.getElementById("totalSolved").textContent = totalSolved;
  document.getElementById("totalSolvedSub").textContent = \`/ \${sheetTotal} sheet • \${lcSolved} LeetCode\`;

  // Sheet progress
  const sheetPct = sheetTotal > 0 ? ((totalSolved / sheetTotal) * 100).toFixed(1) : 0;
  document.getElementById("sheetProgress").textContent = \`\${sheetPct}%\`;
  document.getElementById("sheetBar").style.width = \`\${sheetPct}%\`;

  // Daily Pace
  const startDate = new Date(userSettings.startDate || Date.now());
  const today = new Date();
  const daysPassed = Math.max(1, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));
  const avgPace = totalSolved > 0 ? (totalSolved / daysPassed).toFixed(1) : 0;

  document.getElementById("paceValue").textContent = avgPace;
  document.getElementById("paceSub").textContent = \`avg q/day (target: \${dailyTarget})\`;

  // Estimated completion
  const remaining = Math.max(0, sheetTotal - totalSolved);
  if (parseFloat(avgPace) > 0) {
    const daysToComplete = Math.ceil(remaining / parseFloat(avgPace));
    const estDate = new Date(today);
    estDate.setDate(estDate.getDate() + daysToComplete);
    document.getElementById("estDate").textContent = formatShortDate(estDate);
    document.getElementById("estSub").textContent = \`\${daysToComplete} days from now\`;
  } else {
    document.getElementById("estDate").textContent = "—";
    document.getElementById("estSub").textContent = "";
  }
}
`;
app = app.replace(statsRegex, newStats);

// 2. Replace renderTimeline
const timelineRegex = /function renderTimeline\(\) \{[\s\S]*?\n\}\n/m;
const newTimeline = `function renderTimeline() {
  const startDate = new Date(userSettings.startDate || Date.now());
  const targetDate = userSettings.targetDate ? new Date(userSettings.targetDate) : null;
  const today = new Date();

  document.getElementById("timelineStart").textContent = formatShortDate(startDate);
  document.getElementById("timelineToday").textContent = \`Today (\${formatShortDate(today)})\`;

  if (targetDate) {
    document.getElementById("timelineEnd").textContent = formatShortDate(targetDate);

    const totalDays = Math.max(1, Math.ceil((targetDate - startDate) / (1000 * 60 * 60 * 24)));
    const daysPassed = Math.max(0, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, totalDays - daysPassed);

    const timeProgress = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
    document.getElementById("timelineProgress").style.width = \`\${timeProgress}%\`;

    const badge = document.getElementById("statusBadge");
    if (daysRemaining <= 0) {
      badge.className = "status-badge behind";
      badge.textContent = "Target Date Passed";
    } else {
      badge.className = "status-badge ontrack";
      badge.textContent = \`\${daysPassed} days passed • \${daysRemaining} days remaining\`;
    }
  } else {
    document.getElementById("timelineEnd").textContent = "No Target";
    document.getElementById("timelineProgress").style.width = "0%";
    const badge = document.getElementById("statusBadge");
    badge.className = "status-badge ontrack";
    const daysPassed = Math.max(0, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));
    badge.textContent = \`\${daysPassed} days passed\`;
  }
}
`;
app = app.replace(timelineRegex, newTimeline);

// 3. Update Platform Breakdown Chart Call
// We need to pass the correctly calculated totalSolved from inside renderDashboard, wait no, 
// renderBreakdownChart takes (lcCalendarData, allLogs).
// But user requested "Daily Platform Breakdown leetcode question comes from the leetcode api and manual todays progress"
// We already implemented this! The bar chart reads from lcCalendarData and allLogs per date!

// 4. Striver Categories Recursive Render
const catRegex = /function renderCategoriesSection\(\) \{[\s\S]*?\n\}\n/m;
const newCat = `function renderCategoriesSection() {
  const container = document.getElementById("categoriesContainer");
  const tree = githubData.repo; // Flat array from Git Tree API
  if (!Array.isArray(tree)) {
    container.innerHTML = '<div style="color:var(--text-muted)">Connect GitHub to see repo structure.</div>';
    return;
  }

  // 1. Build a nested tree structure
  const root = { name: "Root", path: "", children: {}, files: 0, totalFiles: 0 };
  
  tree.forEach(item => {
    const parts = item.path.split('/');
    let current = root;
    
    // Create folders
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current.children[part]) {
        current.children[part] = { name: part, path: parts.slice(0, i+1).join('/'), children: {}, files: 0, totalFiles: 0 };
      }
      current = current.children[part];
    }
    
    // It's a file
    if (item.type === "blob") {
      const filename = parts[parts.length - 1];
      if (!current.children[filename]) {
        current.children[filename] = { name: filename, path: item.path, isFile: true };
        // Increment files for the immediate parent
        current.files += 1;
      }
    }
  });

  // Calculate deep total files recursively
  function calcTotals(node) {
    let sum = node.files || 0;
    for (const key in node.children) {
      if (!node.children[key].isFile) {
        sum += calcTotals(node.children[key]);
      }
    }
    node.totalFiles = sum;
    return sum;
  }
  calcTotals(root);

  // 2. Generate Recursive HTML Accordions
  function renderNode(node, depth) {
    let html = "";
    const sortedKeys = Object.keys(node.children).sort((a, b) => {
      const nodeA = node.children[a];
      const nodeB = node.children[b];
      if (nodeA.isFile && !nodeB.isFile) return 1;
      if (!nodeA.isFile && nodeB.isFile) return -1;
      return a.localeCompare(b);
    });

    for (const key of sortedKeys) {
      const child = node.children[key];
      if (child.isFile) {
        html += \`
          <div style="padding: 6px 0; padding-left: \${depth * 16}px; color: var(--text-muted); font-size: 13px; display: flex; align-items: center; gap: 8px; border-left: 1px solid rgba(255,255,255,0.05); margin-left: 8px;">
            <span style="color: var(--accent-blue)">📄</span> \${child.name}
          </div>
        \`;
      } else {
        // Render folder accordion
        const color = depth === 1 ? "var(--accent-pink)" : depth === 2 ? "var(--accent-cyan)" : "var(--accent-orange)";
        // We will assume 100 items max for a folder just for the progress bar if we don't have a strict target. 
        // But since this is just showing what IS there, percentage is tricky. 
        // We can just show the count. The user asked "how much percentage a directory have".
        // Without knowing the TARGET number for a directory, we can't show percentage, just "100%" of what's there, 
        // OR we can compare to a default like 30 per topic?
        // Let's just show a full bar with the count, or skip the bar and just show count.
        // Actually, user said "in the also shows with different colors progress bar how much perteacentage a directory have". 
        // I'll make a bar that fills 100% and displays the count.

        html += \`
          <div style="margin-top: 8px;">
            <div 
              style="padding: 10px; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: var(--radius-sm); cursor: pointer; display: flex; justify-content: space-between; align-items: center;"
              onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none';"
            >
              <div style="display: flex; align-items: center; gap: 8px; font-weight: 600;">
                <span>📁</span> \${child.name}
              </div>
              <div style="font-size: 12px; color: var(--text-muted); background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 12px;">
                \${child.totalFiles} files
              </div>
            </div>
            <div style="display: none; padding-left: 12px; border-left: 1px solid rgba(255,255,255,0.05); margin-left: 16px; margin-top: 4px;">
              \${renderNode(child, depth + 1)}
            </div>
          </div>
        \`;
      }
    }
    return html;
  }

  const resultHtml = renderNode(root, 1);
  container.innerHTML = resultHtml || '<div style="color:var(--text-muted)">No folders found in repo.</div>';
}
`;
app = app.replace(catRegex, newCat);

fs.writeFileSync('public/js/app.js', app);
console.log('Calculations updated');
