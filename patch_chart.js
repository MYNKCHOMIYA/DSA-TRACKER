const fs = require('fs');
let code = fs.readFileSync('public/js/charts.js', 'utf-8');

const regex = /function renderBreakdownChart\([\s\S]*?^}/m;
const newFunction = `function renderBreakdownChart(lcCalendarData, allLogs) {
  // 1. Process LeetCode Calendar
  let lcData = {};
  if (lcCalendarData && lcCalendarData.submissionCalendar) {
    const subCal = typeof lcCalendarData.submissionCalendar === "string" 
      ? JSON.parse(lcCalendarData.submissionCalendar) 
      : lcCalendarData.submissionCalendar;
    for (const [timestamp, count] of Object.entries(subCal)) {
      const dateStr = new Date(parseInt(timestamp) * 1000).toISOString().split('T')[0];
      lcData[dateStr] = (lcData[dateStr] || 0) + count;
    }
  }

  // 2. Process Striver Logs
  let striverData = {};
  if (allLogs) {
    for (const log of allLogs) {
      striverData[log.date] = log.questionsDone;
    }
  }

  // 3. Generate last 7 days range
  const dates = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  // 4. Map data arrays
  const lcArray = dates.map(d => lcData[d] || 0);
  const striverArray = dates.map(d => striverData[d] || 0);
  const displayDates = dates.map(d => {
    const dt = new Date(d);
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });

  // 5. Render Chart
  const ctx = document.getElementById("platformBreakdownChart");
  if (!ctx) return;
  if (platformBreakdownChartInstance) platformBreakdownChartInstance.destroy();

  platformBreakdownChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: displayDates,
      datasets: [
        {
          label: "LeetCode",
          data: lcArray,
          backgroundColor: "#ffb84d",
          borderRadius: 4,
        },
        {
          label: "Striver Sheet",
          data: striverArray,
          backgroundColor: "#ff3ea5",
          borderRadius: 4,
        }
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { 
          stacked: true,
          grid: { display: false, drawBorder: false },
          ticks: { color: "#a39bb8" }
        },
        y: { 
          stacked: true,
          beginAtZero: true,
          grid: { color: "rgba(255,255,255,0.05)", drawBorder: false },
          ticks: { color: "#a39bb8", stepSize: 1 }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(10, 5, 24, 0.96)",
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          padding: 12,
          bodyFont: { size: 13, weight: "600", family: "'Inter', sans-serif" },
          mode: "index",
          intersect: false,
        }
      }
    }
  });

  // 6. Populate Table (sort descending)
  const tbody = document.getElementById("platformBreakdownTableBody");
  if (tbody) {
    let rowsHtml = "";
    for (let i = dates.length - 1; i >= 0; i--) {
      const d = displayDates[i];
      const lc = lcArray[i];
      const st = striverArray[i];
      const total = lc + st;
      rowsHtml += \`
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 12px 8px; color: #a39bb8;">\${d}</td>
          <td style="padding: 12px 8px; text-align: right; color: #ffb84d;">\${lc}</td>
          <td style="padding: 12px 8px; text-align: right; color: #ff3ea5;">\${st}</td>
          <td style="padding: 12px 8px; text-align: right; color: white; font-weight: 600;">\${total}</td>
        </tr>
      \`;
    }
    tbody.innerHTML = rowsHtml;
  }
}`;
let updatedCode = code.replace(regex, newFunction);
fs.writeFileSync('public/js/charts.js', updatedCode);
