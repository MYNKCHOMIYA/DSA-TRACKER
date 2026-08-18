# Goal Description
Replace the total "Platform Breakdown" Doughnut chart with a "Per Day Platform Breakdown" Bar Chart and Data Table. This will show the daily question count for LeetCode vs. Striver Sheet.

## Proposed Changes
### `public/js/app.js`
- Create a new `loadAllLogs()` function to fetch the full history from `/api/logs`.
- Pass this array of logs, along with `leetcodeData.calendar`, into the chart rendering function.

### `public/js/charts.js`
- Modify `renderBreakdownChart` to render a **Bar Chart** instead of a Doughnut Chart.
- Map the last 7 days of dates.
- For each day, calculate LeetCode solved (from `submissionCalendar`) and Striver solved (from `allLogs`).
- Populate the `platformBreakdownTableBody` with a daily breakdown instead of an all-time aggregate.

### `public/dashboard.html`
- Update the table headers to: `Date | LeetCode | Striver | Total`.
