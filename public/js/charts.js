// ============================================================
// Charts Module — All Chart.js Rendering + Custom SVG Donut
// ============================================================

let projectionChartInstance = null;
let _fullIdealData = [], _fullActualData = [], _fullProjectedData = [];
let _activeIdealData = [], _activeActualData = [], _activeProjectedData = [];

// Chart.js global defaults
Chart.defaults.color = '#6b6280';
Chart.defaults.borderColor = 'rgba(255,255,255,0.05)';
Chart.defaults.font.family = "'Inter', system-ui, sans-serif";

// ── Projection Line Chart ──
function renderProjectionChart(idealData, actualData, projectedData) {
  _fullIdealData = idealData;
  _fullActualData = actualData;
  _fullProjectedData = projectedData;
  _activeIdealData = idealData;
  _activeActualData = actualData;
  _activeProjectedData = projectedData;
  _drawProjectionChart(idealData, actualData, projectedData);
}

function _drawProjectionChart(idealData, actualData, projectedData) {
  const ctx = document.getElementById('projectionChart');
  if (!ctx) return;
  if (projectionChartInstance) projectionChartInstance.destroy();

  // Merge all unique ISO labels into a single sorted timeline
  const labelSet = new Set([
    ...idealData.map(d => d.label),
    ...actualData.map(d => d.label),
    ...projectedData.map(d => d.label),
  ]);
  const allLabels = [...labelSet].sort();

  // Map each dataset onto the full timeline (null for missing points)
  const mapToTimeline = (data) => {
    const m = new Map(data.map(d => [d.label, d.value]));
    return allLabels.map(l => m.has(l) ? m.get(l) : null);
  };

  // Display labels: use .display if available, else format from ISO
  const displayLabels = allLabels.map(iso => {
    const found = idealData.find(d => d.label === iso) ||
                  actualData.find(d => d.label === iso) ||
                  projectedData.find(d => d.label === iso);
    if (found && found.display) return found.display;
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  });

  projectionChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: displayLabels,
      datasets: [
        {
          label: 'Ideal Pace',
          data: mapToTimeline(idealData),
          borderColor: 'rgba(255, 62, 165, 0.35)',
          borderDash: [6, 4],
          borderWidth: 1.5,
          fill: { target: 'origin', above: 'rgba(255, 62, 165, 0.05)' },
          pointRadius: 0,
          tension: 0.2,
          spanGaps: true,
        },
        {
          label: 'Actual Progress',
          data: mapToTimeline(actualData),
          borderColor: '#37b7ff',
          borderWidth: 2.5,
          fill: { target: 'origin', above: 'rgba(55, 183, 255, 0.06)' },
          pointRadius: 3,
          pointBackgroundColor: '#37b7ff',
          pointBorderColor: 'rgba(55,183,255,0.3)',
          pointBorderWidth: 4,
          pointHoverRadius: 5,
          tension: 0.35,
          spanGaps: false,
        },
        {
          label: 'Projected',
          data: mapToTimeline(projectedData),
          borderColor: 'rgba(255, 211, 79, 0.55)',
          borderDash: [4, 4],
          borderWidth: 1.5,
          fill: false,
          pointRadius: 0,
          tension: 0.35,
          spanGaps: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: {
          position: 'top',
          labels: { usePointStyle: true, pointStyle: 'circle', padding: 18, font: { size: 11, weight: '600' }, color: '#a39bb8' },
        },
        tooltip: {
          backgroundColor: 'rgba(10, 5, 24, 0.96)',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          padding: 14,
          titleFont: { size: 12, weight: '700' },
          bodyFont: { size: 12, weight: '500' },
          bodySpacing: 6,
          cornerRadius: 10,
          callbacks: {
            title: (items) => `📅 Date: ${items[0].label}`,
            label: (context) => {
              const ds = context.dataset.label;
              const val = context.parsed.y;
              if (ds === 'Ideal Pace') return `🎯 Target: You should have solved ${val} problems`;
              if (ds === 'Actual Progress') return `🚀 Actual: You solved ${val} problems`;
              if (ds === 'Projected') return `📈 Projected: If you keep this pace, you'll reach ${val}`;
              return `${ds}: ${val}`;
            }
          }
        },
        annotation: {
          // Custom inline plugin for "Today" vertical line
          id: 'todayLine',
          afterDraw: (chart) => {
            const todayISO = new Date().toISOString().split('T')[0];
            const ctx = chart.ctx;
            const xAxis = chart.scales.x;
            const yAxis = chart.scales.y;
            
            // Find the index of today's label if it exists in the data
            const todayIndex = chart.data.labels.findIndex((label, i) => {
              // We compare against the original ISO labels which we mapped to display
              // Wait, the x-axis uses displayLabels. Let's find today's display label.
              const todayDisplay = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
              return label === todayDisplay;
            });

            if (todayIndex !== -1) {
              const x = xAxis.getPixelForValue(todayIndex);
              ctx.save();
              ctx.beginPath();
              ctx.moveTo(x, yAxis.top);
              ctx.lineTo(x, yAxis.bottom);
              ctx.lineWidth = 1.5;
              ctx.strokeStyle = 'rgba(255, 62, 165, 0.5)';
              ctx.setLineDash([4, 4]);
              ctx.stroke();
              
              // Draw "TODAY" badge
              ctx.fillStyle = 'rgba(255, 62, 165, 0.9)';
              ctx.fillRoundRect = function(x,y,w,h,r) {
                this.beginPath(); this.moveTo(x+r,y); this.lineTo(x+w-r,y); this.quadraticCurveTo(x+w,y,x+w,y+r); this.lineTo(x+w,y+h-r); this.quadraticCurveTo(x+w,y+h,x+w-r,y+h); this.lineTo(x+r,y+h); this.quadraticCurveTo(x,y+h,x,y+h-r); this.lineTo(x,y+r); this.quadraticCurveTo(x,y,x+r,y); this.closePath(); this.fill();
              };
              const text = 'TODAY';
              ctx.font = 'bold 9px sans-serif';
              const textWidth = ctx.measureText(text).width;
              ctx.fillRoundRect(x - textWidth/2 - 6, yAxis.top + 4, textWidth + 12, 16, 4);
              ctx.fillStyle = '#fff';
              ctx.fillText(text, x - textWidth/2, yAxis.top + 15);
              ctx.restore();
            }
          }
        }
      },
      scales: {
        x: { grid: { display: false }, border: { display: false }, ticks: { maxTicksLimit: 8, font: { size: 10 }, color: '#6b6280' } },
        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.03)' }, border: { display: false, dash: [4, 4] }, ticks: { font: { size: 10 }, color: '#6b6280' } },
      },
    },
    plugins: [{
      id: 'todayLine',
      afterDraw: (chart) => {
        if(chart.config.options.plugins.annotation.afterDraw) {
          chart.config.options.plugins.annotation.afterDraw(chart);
        }
      }
    }]
  });
}

// ── Chart Timeline Filters ──
function zoomChartWithSlider(percent) {
  if (!_activeIdealData || _activeIdealData.length === 0) return;
  
  const totalPoints = _activeIdealData.length;
  // min zoom = 10% (or at least 7 points), max = 100%
  const pct = parseInt(percent);
  let pointsToShow = Math.max(7, Math.floor((pct / 100) * totalPoints));
  
  const slicedIdeal = _activeIdealData.slice(-pointsToShow);
  const cutoffLabel = slicedIdeal[0].label;
  
  const filter = (arr) => arr.filter(d => d.label >= cutoffLabel);
  _drawProjectionChart(filter(_activeIdealData), filter(_activeActualData), filter(_activeProjectedData));
}

function filterChart(range, btn) {
  // Update active button
  document.querySelectorAll('.chart-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  
  // Reset slider visual to max
  const slider = document.getElementById('chartZoomSlider');
  if (slider) slider.value = 100;

  if (!_fullIdealData.length) return;

  const now = new Date();
  let cutoff;

  if (range === '1M') {
    cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth() - 1);
  } else if (range === '3M') {
    cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth() - 3);
  } else if (range === '6M') {
    cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth() - 6);
  } else {
    _activeIdealData = _fullIdealData;
    _activeActualData = _fullActualData;
    _activeProjectedData = _fullProjectedData;
    _drawProjectionChart(_fullIdealData, _fullActualData, _fullProjectedData);
    return;
  }

  const cutoffStr = cutoff.toISOString().split('T')[0];
  const filter = (arr) => arr.filter(d => d.label >= cutoffStr);
  _activeIdealData = filter(_fullIdealData);
  _activeActualData = filter(_fullActualData);
  _activeProjectedData = filter(_fullProjectedData);
  _drawProjectionChart(_activeIdealData, _activeActualData, _activeProjectedData);
}

function filterChartByDates() {
  // Reset slider visual to max
  const slider = document.getElementById('chartZoomSlider');
  if (slider) slider.value = 100;

  const startEl = document.getElementById('chartStartDate');
  const endEl = document.getElementById('chartEndDate');
  if (!startEl || !endEl) return;
  const start = startEl.value;
  const end = endEl.value;
  if (!start && !end) {
    _activeIdealData = _fullIdealData;
    _activeActualData = _fullActualData;
    _activeProjectedData = _fullProjectedData;
    _drawProjectionChart(_fullIdealData, _fullActualData, _fullProjectedData);
    return;
  }
  const filter = (arr) => arr.filter(d => {
    if (start && d.label < start) return false;
    if (end && d.label > end) return false;
    return true;
  });
  _activeIdealData = filter(_fullIdealData);
  _activeActualData = filter(_fullActualData);
  _activeProjectedData = filter(_fullProjectedData);
  _drawProjectionChart(_activeIdealData, _activeActualData, _activeProjectedData);
}

// ── Custom SVG Donut Chart ──
function renderDifficultyDonut(easy, medium, hard) {
  const total = easy + medium + hard;

  // Update center
  const centerNum = document.getElementById('donutCenterNum');
  const centerLabel = document.getElementById('donutCenterLabel');
  if (centerNum) centerNum.textContent = total || '—';
  if (centerLabel) centerLabel.textContent = 'Total';

  const legend = document.getElementById('donutLegend');
  const svg = document.getElementById('donutSvg');
  if (!legend || !svg) return;

  const cx = 60, cy = 60, r = 46;
  const circumference = 2 * Math.PI * r;
  const gap = 4; // gap in degrees between arcs

  const segments = [
    { label: 'Easy',   count: easy,   color: '#37b7ff', shadow: 'rgba(55,183,255,0.4)' },
    { label: 'Medium', count: medium, color: '#ffd34f', shadow: 'rgba(255,211,79,0.4)' },
    { label: 'Hard',   count: hard,   color: '#ff3ea5', shadow: 'rgba(255,62,165,0.4)' },
  ];

  // Build SVG arcs
  let svgHTML = `
    <defs>
      <filter id="arcGlow">
        <feGaussianBlur stdDeviation="2.5" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="10"/>
  `;

  // Calculate angles
  let currentAngle = -90;
  const gapAngle = total > 0 ? (gap / 360) * 360 : 0;

  segments.forEach((seg, i) => {
    const fraction = total > 0 ? seg.count / total : 0;
    const angleDeg = fraction * 360 - (total > 0 ? gapAngle : 0);
    const angleRad = (angleDeg / 360) * circumference;
    const offset = circumference - angleRad;
    const startAngleRad = (currentAngle * Math.PI) / 180;

    if (fraction > 0) {
      svgHTML += `
        <circle
          cx="${cx}" cy="${cy}" r="${r}"
          fill="none"
          stroke="${seg.color}"
          stroke-width="10"
          stroke-linecap="round"
          stroke-dasharray="${angleRad} ${circumference}"
          stroke-dashoffset="${-((currentAngle + 90) / 360) * circumference}"
          filter="url(#arcGlow)"
          class="donut-arc"
          data-idx="${i}"
          style="transition: stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1), opacity 0.3s; cursor:pointer; opacity:1;"
        />
      `;
      currentAngle += angleDeg + gapAngle;
    }
  });

  svg.innerHTML = svgHTML;

  // Build Legend
  const pct = (n) => total > 0 ? Math.round((n / total) * 100) : 0;
  legend.innerHTML = segments.map((seg, i) => `
    <div class="donut-legend-item" style="--item-color: ${seg.color}" data-idx="${i}" onclick="donutFocus(${i}, ${seg.count}, '${seg.label}')">
      <div class="donut-legend-dot"></div>
      <span class="donut-legend-name">${seg.label}</span>
      <span class="donut-legend-count">${seg.count}</span>
      <span class="donut-legend-pct">${pct(seg.count)}%</span>
    </div>
  `).join('');

  // Arc hover effects
  svg.querySelectorAll('.donut-arc').forEach(arc => {
    arc.addEventListener('mouseenter', () => {
      arc.style.strokeWidth = '12';
    });
    arc.addEventListener('mouseleave', () => {
      arc.style.strokeWidth = '10';
    });
    arc.addEventListener('click', () => {
      const idx = parseInt(arc.dataset.idx);
      donutFocus(idx, segments[idx].count, segments[idx].label);
    });
  });
}

function donutFocus(idx, count, label) {
  // Update center
  const centerNum = document.getElementById('donutCenterNum');
  const centerLabel = document.getElementById('donutCenterLabel');
  if (centerNum) centerNum.textContent = count;
  if (centerLabel) centerLabel.textContent = label;

  // Toggle active on legend items
  document.querySelectorAll('.donut-legend-item').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
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
    if (pct >= 80) color = '#34d399';
    else if (pct >= 50) color = '#37b7ff';
    else if (pct >= 20) color = '#ffd34f';
    else color = '#ff3ea5';

    return `
      <div class="category-item">
        <div class="category-header">
          <span class="category-name">${cat.name}</span>
          <span class="category-count">${solved}/${total}</span>
        </div>
        <div class="category-bar">
          <div class="fill" style="width:${pct}%; background:${color}; box-shadow: 0 0 6px ${color}44"></div>
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

  const cells = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (20 * 7));
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

    cells.push(`<div class="heatmap-cell ${level}" title="${dateStr}: ${count} submission${count !== 1 ? 's' : ''}"></div>`);
    current.setDate(current.getDate() + 1);
  }

  grid.innerHTML = cells.join('');
}

// ── Circular Progress (Today's Card — New Ring) ──
function updateCircularProgress(done, target) {
  const pct = target > 0 ? Math.min(100, Math.round((done / target) * 100)) : 0;
  const pctEl = document.getElementById('todayPct');
  const arcEl = document.getElementById('todayArc');

  if (pctEl) pctEl.textContent = `${pct}%`;

  // New SVG ring: circumference = 2 * PI * 26 = 163.36
  if (arcEl && arcEl.tagName === 'circle') {
    const circ = 163.36;
    const filled = (pct / 100) * circ;
    arcEl.setAttribute('stroke-dasharray', `${filled} ${circ}`);
  }

  // Update motivation text
  const motEl = document.getElementById('todayMotivation');
  const numEl = document.getElementById('todayNumDisplay');
  if (numEl) numEl.textContent = done;
  if (motEl) {
    if (done === 0) { motEl.className = 'today-motivation start'; motEl.textContent = "Let's go!"; }
    else if (pct < 50) { motEl.className = 'today-motivation start'; motEl.textContent = "Keep going!"; }
    else if (pct < 100) { motEl.className = 'today-motivation half'; motEl.textContent = "Halfway there!"; }
    else { motEl.className = 'today-motivation done'; motEl.textContent = "Crushed it!"; }
  }
}
