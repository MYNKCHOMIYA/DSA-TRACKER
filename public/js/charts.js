// ============================================================
// Charts Module — All Chart.js Rendering
// ============================================================

let projectionChartInstance = null;
let difficultyChartInstance = null;

// Chart.js global config for dark theme
Chart.defaults.color = '#8b95b0';
Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
Chart.defaults.font.family = "'Inter', sans-serif";

// ── Projection Line Chart ──
function renderProjectionChart(idealData, actualData, projectedData) {
  const ctx = document.getElementById('projectionChart');
  if (!ctx) return;

  if (projectionChartInstance) projectionChartInstance.destroy();

  projectionChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: idealData.map(d => d.label),
      datasets: [
        {
          label: 'Ideal Pace',
          data: idealData.map(d => d.value),
          borderColor: 'rgba(79, 142, 255, 0.4)',
          borderDash: [6, 4],
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
          tension: 0,
        },
        {
          label: 'Actual Progress',
          data: actualData.map(d => d.value),
          borderColor: '#06d6a0',
          borderWidth: 3,
          fill: {
            target: 'origin',
            above: 'rgba(6, 214, 160, 0.08)',
          },
          pointRadius: 2,
          pointBackgroundColor: '#06d6a0',
          tension: 0.3,
        },
        {
          label: 'Projected',
          data: projectedData.map(d => d.value),
          borderColor: 'rgba(245, 158, 11, 0.5)',
          borderDash: [4, 4],
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 16,
            font: { size: 11 },
          },
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          padding: 12,
          titleFont: { size: 12, weight: '600' },
          bodyFont: { size: 11 },
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            maxTicksLimit: 10,
            font: { size: 10 },
          },
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { font: { size: 10 } },
        },
      },
    },
  });
}

// ── Difficulty Donut Chart ──
function renderDifficultyDonut(easy, medium, hard) {
  const ctx = document.getElementById('difficultyChart');
  if (!ctx) return;

  if (difficultyChartInstance) difficultyChartInstance.destroy();

  difficultyChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Easy', 'Medium', 'Hard'],
      datasets: [{
        data: [easy, medium, hard],
        backgroundColor: [
          'rgba(6, 214, 160, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(6, 214, 160, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 16,
            font: { size: 12 },
          },
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? Math.round((ctx.raw / total) * 100) : 0;
              return ` ${ctx.label}: ${ctx.raw} (${pct}%)`;
            },
          },
        },
      },
    },
  });
}

// ── Category Progress Bars ──
function renderCategoryBars(categories, solvedPerCategory) {
  const container = document.getElementById('categoriesContainer');
  if (!container) return;

  container.innerHTML = categories.map(cat => {
    const solved = solvedPerCategory[cat.id] || 0;
    const total = cat.totalProblems;
    const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

    let color;
    if (pct >= 80) color = 'var(--accent-cyan)';
    else if (pct >= 50) color = 'var(--accent-yellow)';
    else if (pct >= 20) color = 'var(--accent-orange)';
    else color = 'var(--accent-red)';

    return `
      <div class="category-item">
        <div class="category-header">
          <span class="category-name">${cat.name}</span>
          <span class="category-count">${solved}/${total}</span>
        </div>
        <div class="category-bar">
          <div class="fill" style="width:${pct}%; background:${color}"></div>
        </div>
      </div>
    `;
  }).join('');
}

// ── Submission Heatmap ──
function renderHeatmap(calendarData) {
  const grid = document.getElementById('heatmapGrid');
  if (!grid) return;

  const submissions = {};
  if (calendarData && calendarData.submissionCalendar) {
    try {
      const cal = typeof calendarData.submissionCalendar === 'string'
        ? JSON.parse(calendarData.submissionCalendar)
        : calendarData.submissionCalendar;

      Object.entries(cal).forEach(([ts, count]) => {
        const date = new Date(parseInt(ts) * 1000).toISOString().split('T')[0];
        submissions[date] = count;
      });
    } catch (e) {
      console.error('Heatmap parse error:', e);
    }
  }

  // Generate last 20 weeks
  const cells = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (20 * 7));

  // Align to start of week (Sunday)
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const current = new Date(startDate);
  while (current <= today) {
    const dateStr = current.toISOString().split('T')[0];
    const count = submissions[dateStr] || 0;

    let level = '';
    if (count >= 7) level = 'level-4';
    else if (count >= 4) level = 'level-3';
    else if (count >= 2) level = 'level-2';
    else if (count >= 1) level = 'level-1';

    cells.push(`<div class="heatmap-cell ${level}" title="${dateStr}: ${count} submissions"></div>`);
    current.setDate(current.getDate() + 1);
  }

  grid.innerHTML = cells.join('');
}

// ── Circular Progress (Today's Card) ──
function updateCircularProgress(done, target) {
  const pct = target > 0 ? Math.min(100, Math.round((done / target) * 100)) : 0;
  const arc = document.getElementById('todayArc');
  const pctEl = document.getElementById('todayPct');

  if (arc) arc.setAttribute('stroke-dasharray', `${pct}, 100`);
  if (pctEl) pctEl.textContent = `${pct}%`;
}
