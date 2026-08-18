const fs = require('fs');

let html = fs.readFileSync('public/onboarding.html', 'utf-8');

const regex = /<div class="onboarding-step" id="step2">[\s\S]*?<div class="preview-card" id="goalPreview">/m;

const newContent = `<div class="onboarding-step" id="step2">
            <h2><span style="text-shadow: 0 0 15px rgba(255, 62, 165, 0.6); display: inline-block;">🎯</span> Set Your Goals</h2>
            <p class="step-desc">
              Define your daily target and timeline. You can change these
              anytime.
            </p>

            <div class="form-group" style="background: rgba(255,255,255,0.02); padding: 20px; border-radius: 16px; border: 1px solid var(--glass-border); position: relative; overflow: hidden;">
              <div style="position: absolute; top: -50px; left: -50px; width: 100px; height: 100px; background: var(--accent-pink); filter: blur(50px); opacity: 0.2;"></div>
              
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <label style="margin: 0;">Daily Target <span style="color:var(--text-muted); font-weight:normal; font-size:12px;">(questions per day)</span></label>
                <div class="value-highlight" id="targetValue" style="font-size: 28px; text-shadow: 0 0 15px var(--accent-pink);">5</div>
              </div>
              
              <div class="slider-container" style="margin-bottom: 20px;">
                <input
                  type="range"
                  id="dailyTarget"
                  min="1"
                  max="20"
                  value="5"
                  oninput="updateTargetPreview()"
                  style="cursor: pointer; box-shadow: 0 0 10px rgba(255,62,165,0.3);"
                />
                <div class="slider-value" style="margin-top: 12px; color: var(--text-muted);">
                  <span>1/day</span>
                  <span>20/day</span>
                </div>
              </div>

              <!-- Presets -->
              <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                <button class="nav-btn" type="button" style="padding: 6px 12px; font-size: 12px; border: 1px solid var(--glass-border); border-radius: 20px; background: rgba(255,255,255,0.03);" onclick="document.getElementById('dailyTarget').value=2; updateTargetPreview();">
                  🐢 Casual (2)
                </button>
                <button class="nav-btn" type="button" style="padding: 6px 12px; font-size: 12px; border: 1px solid var(--glass-border); border-radius: 20px; background: rgba(255,255,255,0.03);" onclick="document.getElementById('dailyTarget').value=5; updateTargetPreview();">
                  🔥 Standard (5)
                </button>
                <button class="nav-btn" type="button" style="padding: 6px 12px; font-size: 12px; border: 1px solid var(--glass-border); border-radius: 20px; background: rgba(255,255,255,0.03);" onclick="document.getElementById('dailyTarget').value=10; updateTargetPreview();">
                  🚀 Intense (10)
                </button>
              </div>
            </div>

            <div style="display: flex; gap: 16px;">
              <div class="form-group" style="flex: 1;">
                <label for="startDate">📅 Start Date</label>
                <input type="date" id="startDate" style="background-color: rgba(255,255,255,0.03);" />
              </div>
              <div class="form-group" style="flex: 1;">
                <label for="targetDate">🎯 Target Date</label>
                <input type="date" id="targetDate" style="background-color: rgba(255,255,255,0.03);" />
              </div>
            </div>

            <div class="preview-card" id="goalPreview" style="background: linear-gradient(145deg, rgba(255,62,165,0.05) 0%, rgba(10,5,24,0.95) 100%); border-left: 3px solid var(--accent-pink); box-shadow: 0 4px 20px rgba(255,62,165,0.05);">`;

html = html.replace(regex, newContent);
fs.writeFileSync('public/onboarding.html', html);
console.log('Onboarding UI patched');
