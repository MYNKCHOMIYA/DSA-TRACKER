const fs = require('fs');

let app = fs.readFileSync('public/js/app.js', 'utf-8');

const regex = /function renderProjection\(\) \{[\s\S]*?const endDate =/m;

const newContent = `function renderProjection() {
  const startDate = new Date(userSettings.startDate || Date.now());
  startDate.setHours(0, 0, 0, 0);
  const targetDate = userSettings.targetDate
    ? new Date(userSettings.targetDate)
    : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // New Total Solved logic
  const todayDone = todayLog.questionsDone || 0;
  let previousSolved = 0;
  const todayIso = new Date().toISOString().split('T')[0];
  if (Array.isArray(allLogs)) {
    allLogs.forEach(log => {
      if (log.date !== todayIso) {
        previousSolved += log.questionsDone;
      }
    });
  }
  const totalSolved = previousSolved + todayDone;
  
  const sheetTotal = userSettings.totalSheetProblems || 474;

  const endDate =`;

app = app.replace(regex, newContent);

fs.writeFileSync('public/js/app.js', app);
console.log('Projection updated');
