// ============================================================
// Dashboard App — Core Logic
// ============================================================

// Global state
let userSettings = {};
let leetcodeData = { profile: null, solved: null, calendar: null };
let githubData = { repo: null, commits: null };
let logStats = {};
let todayLog = { questionsDone: 0 };

// ── Initialize ──
document.addEventListener("DOMContentLoaded", async () => {
  if (!requireAuth()) return;

  try {
    // Load user data
    const meRes = await fetch("/api/auth/me", { headers: getAuthHeaders() });
    const meData = await meRes.json();

    if (!meRes.ok || !meData.user) {
      logout();
      return;
    }

    if (!meData.user.onboardingComplete) {
      window.location.href = "/onboarding.html";
      return;
    }

    userSettings = meData.user;
    updateNavbar(userSettings);
    setupExternalLinks(userSettings);

    // Load all data in parallel
    await Promise.all([
      loadLeetCodeData(),
      loadGitHubData(),
      loadLogStats(),
      loadTodayLog(),
    ]);

    // Render everything
    renderDashboard();
  } catch (err) {
    console.error("Init error:", err);
    showToast("Error loading dashboard. Please refresh.", "error");
  }
});

// ── Data Loading ──
async function loadLeetCodeData() {
  try {
    const [profileRes, solvedRes, calendarRes] = await Promise.all([
      fetch("/api/leetcode/profile", { headers: getAuthHeaders() }),
      fetch("/api/leetcode/solved", { headers: getAuthHeaders() }),
      fetch("/api/leetcode/calendar", { headers: getAuthHeaders() }),
    ]);

    const profileData = await profileRes.json();
    const solvedData = await solvedRes.json();
    const calendarData = await calendarRes.json();

    leetcodeData.profile = profileData.data;
    leetcodeData.solved = solvedData.data;
    leetcodeData.calendar = calendarData.data;
  } catch (err) {
    console.error("LeetCode load error:", err);
  }
}

async function loadGitHubData() {
  try {
    const [repoRes, commitsRes] = await Promise.all([
      fetch("/api/github/repo", { headers: getAuthHeaders() }),
      fetch("/api/github/commits", { headers: getAuthHeaders() }),
    ]);

    const repoData = await repoRes.json();
    const commitsData = await commitsRes.json();

    githubData.repo = repoData.data;
    githubData.commits = commitsData.data;
  } catch (err) {
    console.error("GitHub load error:", err);
  }
}

async function loadLogStats() {
  try {
    const res = await fetch("/api/logs/stats", { headers: getAuthHeaders() });
    const data = await res.json();
    logStats = data.stats || {};
  } catch (err) {
    console.error("Log stats error:", err);
  }
}

async function loadTodayLog() {
  try {
    const res = await fetch("/api/logs/today", { headers: getAuthHeaders() });
    const data = await res.json();
    todayLog = data.log || { questionsDone: 0 };
  } catch (err) {
    console.error("Today log error:", err);
  }
}

// ── Refresh All ──
async function refreshAllData() {
  const btn = document.getElementById("refreshBtn");
  btn.classList.add("refreshing");

  try {
    // Clear server cache
    await fetch("/api/refresh", { method: "POST", headers: getAuthHeaders() });

    // Reload all
    await Promise.all([
      loadLeetCodeData(),
      loadGitHubData(),
      loadLogStats(),
      loadTodayLog(),
    ]);

    renderDashboard();
    showToast("Data refreshed! ✨", "success");
  } catch (err) {
    showToast("Refresh failed. Try again.", "error");
  } finally {
    btn.classList.remove("refreshing");
  }
}

// ── Render Dashboard ──
function renderDashboard() {
  renderStatsCards();
  renderTimeline();
  renderProjection();
  renderLeetCodeCharts();
  renderCategoriesSection();
  renderActivityFeed();
  renderEfficiency();
}

// ── Stats Cards ──
function renderStatsCards() {
  const totalSolved = userSettings.manualSolvedCount || 0;
  const lcSolved = leetcodeData.solved?.solvedProblem || 0;
  const sheetTotal = userSettings.totalSheetProblems || 474;
  const dailyTarget = userSettings.dailyTarget || 5;

  // Today's progress
  const todayDone = todayLog.questionsDone || 0;
  document.getElementById("todayInput").value = todayDone;
  document.getElementById("todayTarget").textContent = dailyTarget;
  updateCircularProgress(todayDone, dailyTarget);

  // Streak
  const streak = leetcodeData.calendar?.streak || logStats.streak || 0;
  document.getElementById("streakValue").textContent = streak;

  // Total solved
  document.getElementById("totalSolved").textContent = totalSolved;
  document.getElementById("totalSolvedSub").textContent =
    `/ ${sheetTotal} sheet • ${lcSolved} LeetCode`;

  // Sheet progress
  const sheetPct =
    sheetTotal > 0 ? Math.round((totalSolved / sheetTotal) * 100) : 0;
  document.getElementById("sheetProgress").textContent = `${sheetPct}%`;
  document.getElementById("sheetBar").style.width = `${sheetPct}%`;

  // Calculate pace & estimates
  const startDate = new Date(userSettings.startDate || Date.now());
  const today = new Date();
  const daysSinceStart = Math.max(
    1,
    Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)),
  );
  const avgPace =
    totalSolved > 0 ? (totalSolved / daysSinceStart).toFixed(1) : 0;

  document.getElementById("paceValue").textContent = avgPace;
  document.getElementById("paceSub").textContent =
    `avg q/day (target: ${dailyTarget})`;

  // Estimated completion
  const remaining = Math.max(0, sheetTotal - totalSolved);
  if (parseFloat(avgPace) > 0) {
    const daysToComplete = Math.ceil(remaining / parseFloat(avgPace));
    const estDate = new Date(today);
    estDate.setDate(estDate.getDate() + daysToComplete);
    document.getElementById("estDate").textContent = formatShortDate(estDate);
    document.getElementById("estSub").textContent =
      `${daysToComplete} days from now`;
  } else if (dailyTarget > 0) {
    const daysToComplete = Math.ceil(remaining / dailyTarget);
    const estDate = new Date(today);
    estDate.setDate(estDate.getDate() + daysToComplete);
    document.getElementById("estDate").textContent = formatShortDate(estDate);
    document.getElementById("estSub").textContent = `at target pace`;
  } else {
    document.getElementById("estDate").textContent = "—";
    document.getElementById("estSub").textContent = "";
  }
}

// ── Timeline ──
function renderTimeline() {
  const startDate = new Date(userSettings.startDate || Date.now());
  const targetDate = userSettings.targetDate
    ? new Date(userSettings.targetDate)
    : null;
  const today = new Date();

  document.getElementById("timelineStart").textContent =
    formatShortDate(startDate);
  document.getElementById("timelineToday").textContent =
    `Today (${formatShortDate(today)})`;

  if (targetDate) {
    document.getElementById("timelineEnd").textContent =
      formatShortDate(targetDate);

    const totalSpan = targetDate - startDate;
    const elapsed = today - startDate;
    const timeProgress =
      totalSpan > 0
        ? Math.min(100, Math.max(0, (elapsed / totalSpan) * 100))
        : 0;

    document.getElementById("timelineProgress").style.width =
      `${timeProgress}%`;

    // Calculate if ahead or behind
    const totalSolved = userSettings.manualSolvedCount || 0;
    const sheetTotal = userSettings.totalSheetProblems || 474;
    const totalDays = Math.ceil(totalSpan / (1000 * 60 * 60 * 24));
    const daysPassed = Math.ceil(elapsed / (1000 * 60 * 60 * 24));
    const idealSolved =
      totalDays > 0 ? Math.round((daysPassed / totalDays) * sheetTotal) : 0;
    const diff = totalSolved - idealSolved;
    const daysLeft = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));

    const badge = document.getElementById("statusBadge");
    if (daysLeft <= 0) {
      if (totalSolved >= sheetTotal) {
        badge.className = "status-badge ahead";
        badge.textContent = "🎉 Completed!";
      } else {
        badge.className = "status-badge behind";
        badge.textContent = `🔴 Deadline passed (${sheetTotal - totalSolved} remaining)`;
      }
    } else if (diff > 5) {
      badge.className = "status-badge ahead";
      badge.textContent = `🟢 Ahead by ~${diff} problems`;
    } else if (diff < -5) {
      badge.className = "status-badge behind";
      badge.textContent = `🔴 Behind by ~${Math.abs(diff)} problems`;
    } else {
      badge.className = "status-badge ontrack";
      badge.textContent = `🟡 On Track (${daysLeft} days left)`;
    }
  } else {
    document.getElementById("timelineEnd").textContent = "No deadline";
    document.getElementById("timelineProgress").style.width = "50%";
    const badge = document.getElementById("statusBadge");
    badge.className = "status-badge ontrack";
    badge.textContent = "🟡 No deadline set";
  }
}

// ── Projection Chart ──
function renderProjection() {
  const startDate = new Date(userSettings.startDate || Date.now());
  startDate.setHours(0, 0, 0, 0);
  const targetDate = userSettings.targetDate
    ? new Date(userSettings.targetDate)
    : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const totalSolved = userSettings.manualSolvedCount || 0;
  const sheetTotal = userSettings.totalSheetProblems || 474;

  const endDate =
    targetDate || new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
  const totalDays = Math.max(
    1,
    Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)),
  );
  const daysPassed = Math.max(
    1,
    Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)),
  );
  const currentPace = totalSolved / daysPassed;

  // Helper: ISO date string for a Date (used as filter key)
  const toISO = (d) => d.toISOString().split("T")[0];
  // Helper: short display label
  const toDisplay = (d) =>
    d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  // ── Ideal line: from startDate to endDate ──
  const idealData = [];
  const numPoints = Math.min(totalDays, 150);
  for (let i = 0; i <= numPoints; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + Math.round((i / numPoints) * totalDays));
    idealData.push({
      label: toISO(d),
      display: toDisplay(d),
      value: Math.round((i / numPoints) * sheetTotal),
    });
  }

  // ── Actual line: one point per day from startDate to TODAY (never past today) ──
  const actualData = [];
  const maxActualDays = Math.min(daysPassed, 180);
  // Use at most 60 points for performance, but always end exactly on today
  const actualStep = Math.max(1, Math.floor(maxActualDays / 60));
  for (let day = 0; day <= maxActualDays; day += actualStep) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + day);
    // Hard cap: never go past today
    if (d > today) {
      d.setTime(today.getTime());
    }
    const fraction =
      maxActualDays > 0 ? Math.min(day, maxActualDays) / maxActualDays : 0;
    actualData.push({
      label: toISO(d),
      display: toDisplay(d),
      value: Math.round(fraction * totalSolved),
    });
    if (d.getTime() === today.getTime()) break;
  }
  // Ensure the last actual point is exactly today with the real total
  if (
    actualData.length === 0 ||
    actualData[actualData.length - 1].label !== toISO(today)
  ) {
    actualData.push({
      label: toISO(today),
      display: toDisplay(today),
      value: totalSolved,
    });
  } else {
    actualData[actualData.length - 1].value = totalSolved;
  }

  // ── Projected line: from today forward at current pace ──
  // Pad with nulls to align with the actual data length
  const projectedData = actualData.map((p) => ({
    label: p.label,
    display: p.display,
    value: null,
  }));
  const remainingDays = Math.max(
    0,
    Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)),
  );
  const projStep = Math.max(1, Math.floor(remainingDays / 60));
  for (let day = 0; day <= remainingDays; day += projStep) {
    const d = new Date(today);
    d.setDate(d.getDate() + day);
    projectedData.push({
      label: toISO(d),
      display: toDisplay(d),
      value: Math.round(totalSolved + currentPace * day),
    });
  }

  renderProjectionChart(idealData, actualData, projectedData);
}

// ── LeetCode Charts ──
function renderLeetCodeCharts() {
  const solved = leetcodeData.solved;
  if (solved) {
    renderDifficultyDonut(
      solved.easySolved || 0,
      solved.mediumSolved || 0,
      solved.hardSolved || 0,
    );
  } else {
    renderDifficultyDonut(0, 0, 0);
  }

  renderHeatmap(leetcodeData.calendar);
}

// ── Categories Section ──
function renderCategoriesSection() {
  // Try to match GitHub folders to categories
  const solvedPerCategory = {};
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
      // If folder exists, assume some progress — this is a rough indicator
      solvedPerCategory[cat.id] =
        matchedFolders.length > 0
          ? Math.min(
              cat.totalProblems,
              Math.max(1, Math.round(cat.totalProblems * 0.3)),
            )
          : 0;
    });
  }

  // Override with manual count distribution if available
  const totalManual = userSettings.manualSolvedCount || 0;
  if (totalManual > 0) {
    // Distribute solved count proportionally across categories that have GitHub folders
    const categoriesWithFolders = STRIVER_SHEET.categories.filter(
      (c) => solvedPerCategory[c.id] > 0,
    );
    const totalInFolders = categoriesWithFolders.reduce(
      (s, c) => s + c.totalProblems,
      0,
    );

    // Smart distribution: fill categories in order
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

  renderCategoryBars(STRIVER_SHEET.categories, solvedPerCategory);
}

// ── Activity Feed ──
function renderActivityFeed() {
  const list = document.getElementById("activityList");
  const items = [];

  // GitHub commits
  if (Array.isArray(githubData.commits)) {
    githubData.commits.slice(0, 10).forEach((commit) => {
      const date = new Date(commit.commit?.author?.date);
      items.push({
        type: "commit",
        message: commit.commit?.message || "Commit",
        time: date,
        icon: "🐙",
      });
    });
  }

  // Sort by time
  items.sort((a, b) => b.time - a.time);

  if (items.length === 0) {
    list.innerHTML =
      '<div style="text-align:center; color:var(--text-muted); padding:20px">No recent activity</div>';
    return;
  }

  list.innerHTML = items
    .map(
      (item) => `
    <div class="activity-item">
      <div class="activity-icon ${item.type}">${item.icon}</div>
      <div class="activity-text">
        <div class="message">${escapeHtml(item.message)}</div>
        <div class="time">${timeAgo(item.time)}</div>
      </div>
    </div>
  `,
    )
    .join("");
}

// ── Efficiency Section ──
function renderEfficiency() {
  const totalSolved = userSettings.manualSolvedCount || 0;
  const sheetTotal = userSettings.totalSheetProblems || 474;
  const remaining = Math.max(0, sheetTotal - totalSolved);
  const dailyTarget = userSettings.dailyTarget || 5;

  const startDate = new Date(userSettings.startDate || Date.now());
  const today = new Date();
  const daysPassed = Math.max(
    1,
    Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)),
  );
  const currentPace = (totalSolved / daysPassed).toFixed(1);

  // Required pace to finish on time
  let requiredPace = dailyTarget;
  if (userSettings.targetDate) {
    const daysLeft = Math.max(
      1,
      Math.ceil(
        (new Date(userSettings.targetDate) - today) / (1000 * 60 * 60 * 24),
      ),
    );
    requiredPace = (remaining / daysLeft).toFixed(1);
    document.getElementById("daysLeft").textContent = daysLeft;
  } else {
    document.getElementById("daysLeft").textContent = "—";
  }

  document.getElementById("gaugeValue").textContent = currentPace;
  document.getElementById("requiredPace").textContent = requiredPace;
  document.getElementById("currentPace").textContent = currentPace;
  document.getElementById("remainingCount").textContent = remaining;

  const daysNeeded =
    parseFloat(currentPace) > 0
      ? Math.ceil(remaining / parseFloat(currentPace))
      : "∞";
  document.getElementById("daysNeeded").textContent = daysNeeded;

  const targetMetRate = logStats.targetMetRate || 0;
  document.getElementById("targetMet").textContent = `${targetMetRate}%`;
}

// ── Save Today's Log ──
async function saveTodayLog() {
  const input = document.getElementById("todayInput");
  const count = parseInt(input.value) || 0;

  try {
    await fetch("/api/logs", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ questionsDone: count }),
    });

    todayLog.questionsDone = count;
    updateCircularProgress(count, userSettings.dailyTarget || 5);
    showToast("Progress saved!", "success");
  } catch (err) {
    showToast("Failed to save. Try again.", "error");
  }
}

// ── Adjust Today via +/- Buttons ──
function adjustToday(delta) {
  const input = document.getElementById("todayInput");
  if (!input) return;
  const current = parseInt(input.value) || 0;
  const target =
    userSettings && userSettings.dailyTarget ? userSettings.dailyTarget : 5;
  const next = Math.max(0, Math.min(50, current + delta));
  input.value = next;

  // Animate the number display
  const numEl = document.getElementById("todayNumDisplay");
  if (numEl) {
    numEl.style.transform =
      delta > 0 ? "translateY(-4px) scale(1.1)" : "translateY(4px) scale(1.1)";
    numEl.style.opacity = "0.5";
    setTimeout(() => {
      numEl.style.transform = "translateY(0) scale(1)";
      numEl.style.opacity = "1";
    }, 180);
  }

  updateCircularProgress(next, target);
  clearTimeout(adjustToday._timer);
  adjustToday._timer = setTimeout(() => saveTodayLog(), 900);
}

// ── Settings Modal ──
function openSettings() {
  document.getElementById("settingsModal").classList.add("open");

  // Populate fields
  document.getElementById("setDailyTarget").value =
    userSettings.dailyTarget || 5;
  document.getElementById("setStartDate").value = userSettings.startDate
    ? new Date(userSettings.startDate).toISOString().split("T")[0]
    : "";
  document.getElementById("setTargetDate").value = userSettings.targetDate
    ? new Date(userSettings.targetDate).toISOString().split("T")[0]
    : "";
  document.getElementById("setTotalProblems").value =
    userSettings.totalSheetProblems || 474;
  document.getElementById("setSolvedCount").value =
    userSettings.manualSolvedCount || 0;
  document.getElementById("setLcUsername").value =
    userSettings.leetcodeUsername || "";
  document.getElementById("setGhUsername").value =
    userSettings.githubUsername || "";
  document.getElementById("setGhRepo").value =
    userSettings.githubStriverRepo || "";
}

function closeSettings() {
  document.getElementById("settingsModal").classList.remove("open");
}

async function saveSettings() {
  const payload = {
    dailyTarget: parseInt(document.getElementById("setDailyTarget").value),
    startDate: document.getElementById("setStartDate").value,
    targetDate: document.getElementById("setTargetDate").value || null,
    totalSheetProblems: parseInt(
      document.getElementById("setTotalProblems").value,
    ),
    manualSolvedCount: parseInt(
      document.getElementById("setSolvedCount").value,
    ),
    leetcodeUsername: document.getElementById("setLcUsername").value.trim(),
    githubUsername: document.getElementById("setGhUsername").value.trim(),
    githubStriverRepo: document.getElementById("setGhRepo").value.trim(),
  };

  try {
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || "Failed to save settings.", "error");
      return;
    }

    userSettings = { ...userSettings, ...data.user };
    closeSettings();
    showToast("Settings saved! Recalibrating... 🔄", "success");

    // Re-render with new settings
    await refreshAllData();
  } catch (err) {
    showToast("Network error. Try again.", "error");
  }
}

// Close modals on overlay click
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("open");
  }
});

// ── Log Modal ──
function openLogModal() {
  document.getElementById("logModal").classList.add("open");
  document.getElementById("logQuestions").value = todayLog.questionsDone || 0;
  document.getElementById("logNotes").value = todayLog.notes || "";

  // Render topic chips
  const chipsEl = document.getElementById("topicChips");
  chipsEl.innerHTML = ALL_TOPICS.map(
    (t) =>
      `<span class="topic-chip" onclick="this.classList.toggle('selected')" data-topic="${t}">${t}</span>`,
  ).join("");
}

function closeLogModal() {
  document.getElementById("logModal").classList.remove("open");
}

async function saveDetailedLog() {
  const questions =
    parseInt(document.getElementById("logQuestions").value) || 0;
  const notes = document.getElementById("logNotes").value.trim();
  const topics = Array.from(
    document.querySelectorAll(".topic-chip.selected"),
  ).map((el) => el.dataset.topic);

  try {
    await fetch("/api/logs", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ questionsDone: questions, notes, topics }),
    });

    todayLog.questionsDone = questions;
    document.getElementById("todayInput").value = questions;
    updateCircularProgress(questions, userSettings.dailyTarget || 5);
    closeLogModal();
    showToast("Daily log saved! 📝", "success");
  } catch (err) {
    showToast("Failed to save log.", "error");
  }
}

// ── UI Helpers ──
function updateNavbar(user) {
  const nameEl = document.getElementById("navName");
  if (nameEl) nameEl.textContent = user.name || "User";

  const avatarEl = document.getElementById("navAvatar");
  if (avatarEl) {
    const initials = (user.name || "U")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    avatarEl.textContent = initials;
  }
}

function setupExternalLinks(user) {
  const row = document.getElementById("linksRow");
  row.style.display = "flex";

  if (user.leetcodeUsername) {
    document.getElementById("linkLeetcode").href =
      `https://leetcode.com/u/${user.leetcodeUsername}/`;
  }
  if (user.githubUsername && user.githubStriverRepo) {
    document.getElementById("linkGithub").href =
      `https://github.com/${user.githubUsername}/${user.githubStriverRepo}`;
  }
}

function formatShortDate(date) {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatChartDate(date) {
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function timeAgo(date) {
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatShortDate(date);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
