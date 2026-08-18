const fs = require('fs');
let code = fs.readFileSync('public/js/app.js', 'utf-8');

const regex = /function renderCategoriesSection\([\s\S]*?renderCategoryBars\(STRIVER_SHEET\.categories, solvedPerCategory\);\n}/m;

const newFunction = `function renderCategoriesSection() {
  const solvedPerCategory = {};

  if (userSettings.striverBreakdown && Object.keys(userSettings.striverBreakdown).length > 0) {
    // 1. Use EXACT manual breakdown if it exists
    STRIVER_SHEET.categories.forEach((cat) => {
      solvedPerCategory[cat.id] = userSettings.striverBreakdown[cat.id] || 0;
    });
  } else {
    // 2. Fallback to guessing if no manual breakdown
    const repoFolders = githubData.repo;
    if (Array.isArray(repoFolders)) {
      STRIVER_SHEET.categories.forEach((cat) => {
        const mappedFolders = TOPIC_FOLDER_MAP[cat.id] || [];
        const matchedFolders = repoFolders.filter(
          (f) =>
            f.type === "dir" &&
            mappedFolders.some((m) =>
              f.name.toLowerCase().includes(m.toLowerCase()),
            ),
        );
        solvedPerCategory[cat.id] =
          matchedFolders.length > 0
            ? Math.min(
                cat.totalProblems,
                Math.max(1, Math.round(cat.totalProblems * 0.3)),
              )
            : 0;
      });
    }

    const totalManual = userSettings.manualSolvedCount || 0;
    if (totalManual > 0) {
      let remaining = totalManual;
      STRIVER_SHEET.categories.forEach((cat) => {
        if (remaining <= 0) {
          solvedPerCategory[cat.id] = 0;
          return;
        }
        const catSolved = Math.min(cat.totalProblems, remaining);
        solvedPerCategory[cat.id] = catSolved;
        remaining -= catSolved;
      });
    }
  }

  renderCategoryBars(STRIVER_SHEET.categories, solvedPerCategory);
}`;

let updatedCode = code.replace(regex, newFunction);

// Add the modal functions at the end of the file
updatedCode += `\n
// ── Striver Edit Modal ──
function openStriverModal() {
  const modal = document.getElementById("striverModal");
  const content = document.getElementById("striverModalContent");
  
  let html = "";
  STRIVER_SHEET.categories.forEach(cat => {
    const val = (userSettings.striverBreakdown && userSettings.striverBreakdown[cat.id]) || 0;
    html += \`
      <div class="form-group" style="margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
        <label for="cat_\${cat.id}" style="margin: 0; flex: 1;">\${cat.name} <span style="color:var(--text-muted); font-size:11px;">(Max \${cat.totalProblems})</span></label>
        <input type="number" id="cat_\${cat.id}" min="0" max="\${cat.totalProblems}" value="\${val}" style="width: 80px; margin: 0;" />
      </div>
    \`;
  });
  
  content.innerHTML = html;
  modal.classList.add("open");
}

function closeStriverModal() {
  document.getElementById("striverModal").classList.remove("open");
}

async function saveStriverBreakdown() {
  const striverBreakdown = {};
  let totalSum = 0;
  
  STRIVER_SHEET.categories.forEach(cat => {
    const el = document.getElementById(\`cat_\${cat.id}\`);
    if (el) {
      const val = parseInt(el.value) || 0;
      striverBreakdown[cat.id] = Math.min(val, cat.totalProblems);
      totalSum += striverBreakdown[cat.id];
    }
  });

  try {
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ striverBreakdown, manualSolvedCount: totalSum }),
    });

    if (!res.ok) throw new Error("Failed to save");

    userSettings.striverBreakdown = striverBreakdown;
    userSettings.manualSolvedCount = totalSum;
    
    closeStriverModal();
    showToast("Breakdown saved! ✨", "success");
    refreshAllData(); // Update all UI charts and counters
  } catch (err) {
    showToast("Failed to save breakdown.", "error");
  }
}
`;

fs.writeFileSync('public/js/app.js', updatedCode);
