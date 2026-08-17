// ============================================================
// Onboarding Wizard Logic
// ============================================================

let currentStep = 1;
let verifiedLeetcode = false;

// Auth guard
if (!requireAuth()) {
  // Redirected by auth.js
}

// Set default dates
document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("startDate").value = today;

  // Default target: 3 months from now
  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + 3);
  document.getElementById("targetDate").value = targetDate
    .toISOString()
    .split("T")[0];

  updateTargetPreview();

  // Auto-verify LeetCode username on blur
  document
    .getElementById("lcUsername")
    .addEventListener("blur", verifyLeetCode);
});

// Navigate between steps
function goToStep(step) {
  // Validate current step before proceeding
  if (step > currentStep) {
    if (!validateStep(currentStep)) return;
  }

  currentStep = step;

  // Update step dots
  for (let i = 1; i <= 4; i++) {
    const dot = document.getElementById(`dot${i}`);
    const stepEl = document.getElementById(`step${i}`);
    dot.classList.remove("active", "completed");
    stepEl.classList.remove("active");

    if (i < step) dot.classList.add("completed");
    if (i === step) dot.classList.add("active");
    if (i === step) stepEl.classList.add("active");
  }

  // Update lines
  for (let i = 1; i <= 3; i++) {
    const line = document.getElementById(`line${i}`);
    line.classList.toggle("completed", i < step);
  }

  // Fill summary on step 4
  if (step === 4) fillSummary();
}

// Validate step
function validateStep(step) {
  if (step === 2) {
    const start = document.getElementById("startDate").value;
    const target = document.getElementById("targetDate").value;
    if (!start) {
      showToast("Please set a start date.", "error");
      return false;
    }
    if (target && new Date(target) <= new Date(start)) {
      showToast("Target date must be after start date.", "error");
      return false;
    }
  }
  return true;
}

// Verify LeetCode username
async function verifyLeetCode() {
  const username = document.getElementById("lcUsername").value.trim();
  const verifyEl = document.getElementById("lcVerify");

  if (!username) {
    verifyEl.innerHTML = "";
    verifiedLeetcode = false;
    return;
  }

  verifyEl.innerHTML =
    '<span class="verify-badge loading">⏳ Verifying...</span>';

  try {
    const token = localStorage.getItem("dsa_token");
    // Try direct API first since we're in onboarding (proxy needs username saved first)
    const res = await fetch(
      `https://alfa-leetcode-api.onrender.com/${username}`,
    );
    const data = await res.json();

    if (data && data.username) {
      verifyEl.innerHTML = `<span class="verify-badge success">✅ Found: ${data.name || data.username}</span>`;
      verifiedLeetcode = true;
    } else {
      verifyEl.innerHTML =
        '<span class="verify-badge error">❌ Username not found</span>';
      verifiedLeetcode = false;
    }
  } catch (err) {
    verifyEl.innerHTML =
      '<span class="verify-badge error">⚠️ Could not verify (API may be slow)</span>';
  }
}

// Update target preview
function updateTargetPreview() {
  const target = parseInt(document.getElementById("dailyTarget").value);
  const total =
    parseInt(document.getElementById("totalProblems")?.value) || 474;
  const solved = parseInt(document.getElementById("solvedCount")?.value) || 0;
  const remaining = Math.max(0, total - solved);
  const days = Math.ceil(remaining / target);

  document.getElementById("targetValue").textContent = target;
  document.getElementById("previewRate").textContent = target;
  document.getElementById("previewDays").textContent = days;
}

// Fill summary card
function fillSummary() {
  const grid = document.getElementById("summaryGrid");
  const lcUser =
    document.getElementById("lcUsername").value.trim() || "Not set";
  const ghUser =
    document.getElementById("ghUsername").value.trim() || "Not set";
  const ghRepo =
    document.getElementById("ghStriverRepo").value.trim() || "Not set";
  const target = document.getElementById("dailyTarget").value;
  const startDate = document.getElementById("startDate").value;
  const targetDate =
    document.getElementById("targetDate").value || "Auto-calculate";
  const solved = document.getElementById("solvedCount").value || "0";
  const total = document.getElementById("totalProblems").value || "474";

  grid.innerHTML = `
    <div class="summary-item">
      <div class="label">LeetCode</div>
      <div class="value">${lcUser}</div>
    </div>
    <div class="summary-item">
      <div class="label">GitHub</div>
      <div class="value">${ghUser}</div>
    </div>
    <div class="summary-item">
      <div class="label">Daily Target</div>
      <div class="value">${target} questions/day</div>
    </div>
    <div class="summary-item">
      <div class="label">Striver Repo</div>
      <div class="value">${ghRepo}</div>
    </div>
    <div class="summary-item">
      <div class="label">Start Date</div>
      <div class="value">${formatDate(startDate)}</div>
    </div>
    <div class="summary-item">
      <div class="label">Target Date</div>
      <div class="value">${targetDate !== "Auto-calculate" ? formatDate(targetDate) : targetDate}</div>
    </div>
    <div class="summary-item">
      <div class="label">Already Solved</div>
      <div class="value">${solved} / ${total}</div>
    </div>
    <div class="summary-item">
      <div class="label">Remaining</div>
      <div class="value">${Math.max(0, parseInt(total) - parseInt(solved))}</div>
    </div>
  `;
}

// Format date for display
function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Complete onboarding
async function completeOnboarding() {
  const btn = document.getElementById("finishBtn");
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div> Setting up...';

  const payload = {
    leetcodeUsername: document.getElementById("lcUsername").value.trim(),
    githubUsername: document.getElementById("ghUsername").value.trim(),
    githubStriverRepo: document.getElementById("ghStriverRepo").value.trim(),
    githubLeetcodeRepo: document.getElementById("ghLeetcodeRepo").value.trim(),
    dailyTarget: parseInt(document.getElementById("dailyTarget").value),
    startDate: document.getElementById("startDate").value,
    totalSheetProblems:
      parseInt(document.getElementById("totalProblems").value) || 474,
    manualSolvedCount:
      parseInt(document.getElementById("solvedCount").value) || 0,
  };

  const targetDate = document.getElementById("targetDate").value;
  if (targetDate) {
    payload.targetDate = targetDate;
  }

  try {
    const res = await fetch("/api/settings/onboarding", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || "Failed to save settings.", "error");
      return;
    }

    showToast("Setup complete! Loading your dashboard... 🎉", "success");
    setTimeout(() => {
      window.location.href = "/dashboard.html";
    }, 1000);
  } catch (err) {
    showToast("Network error. Please try again.", "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = "Start Tracking 🚀";
  }
}
