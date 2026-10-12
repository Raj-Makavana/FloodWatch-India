/**
 * ========================================================================================
 * FloodWatch India - National Alerts & Emergency Dispatch Module
 * Live emergency advisories feed, email dispatch alerts, threshold preferences & FAQs
 * ========================================================================================
 */

const alertsData = [
  { severity: 'high', title: '🔴 Assam: Brahmaputra River Basin Warning', meta: 'Kamrup & Dibrugarh • Water level 1.8m above danger mark • IMD Red Alert' },
  { severity: 'high', title: '🔴 Bihar: Kosi & Gandak River Inundation Alert', meta: 'Saharsa & Supaul • Embankment surveillance activated • Heavy upstream discharge' },
  { severity: 'med', title: '🟡 Maharashtra: Konkan & Ulhas River Basin Watch', meta: 'Thane & Raigad districts • Low-lying urban waterlogging advisory' },
  { severity: 'med', title: '🟡 Kerala: Periyar & Pamba Catchment Flow Watch', meta: 'Idukki & Ernakulam • Dam spillway regulated outflow active' },
  { severity: 'low', title: '🟢 Gujarat: Narmada River Sardar Sarovar Regulated Flow', meta: 'Bharuch & Vadodara • Riverbed flow within safety threshold' },
  { severity: 'low', title: '🟢 West Bengal: Damodar & Hooghly Catchment', meta: 'Asansol & Howrah • Sluice gates operational, normal monitoring' }
];

let lastAutoAlertDispatchedAt = 0;

function initAlertSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem('floodwatch_alert_settings') || '{}');
    const emailEl = document.getElementById('alertEmailInput');
    const threshEl = document.getElementById('alertThresholdSelect');
    const toggleEl = document.getElementById('autoAlertToggle');

    if (emailEl && (saved.email || (typeof currentUser !== 'undefined' && currentUser?.email))) {
      emailEl.value = saved.email || currentUser?.email || '';
    }
    if (threshEl && saved.threshold) threshEl.value = saved.threshold;
    if (toggleEl && saved.autoActive !== undefined) toggleEl.checked = saved.autoActive;
  } catch (e) {}
  fetchAlertHistory();
}

async function saveAlertSettings() {
  const email = document.getElementById('alertEmailInput')?.value.trim() || '';
  const threshold = document.getElementById('alertThresholdSelect')?.value || '60';
  const autoActive = document.getElementById('autoAlertToggle')?.checked ?? true;

  if (!email) {
    if (typeof showToast === 'function') showToast('Please enter an Email address for automated alerts.', 'warning');
    return;
  }

  const settings = { email, threshold, autoActive };
  localStorage.setItem('floodwatch_alert_settings', JSON.stringify(settings));

  try {
    const res = await fetch(`${NODE_API_BASE}/api/alerts/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        threshold,
        name: (typeof currentUser !== 'undefined' && currentUser?.name) ? currentUser.name : 'Command Center User'
      })
    });
    const data = await res.json();
    if (data.success) {
      if (typeof showToast === 'function') showToast(`Saved! Auto-alerts active for threshold >= ${threshold}%`, 'success');
    }
  } catch (err) {
    if (typeof showToast === 'function') showToast('Alert settings saved locally!', 'info');
  }
}

async function dispatchManualTestAlert() {
  const email = document.getElementById('alertEmailInput')?.value.trim() || ((typeof currentUser !== 'undefined' && currentUser?.email) ? currentUser.email : 'user@floodwatch.org');
  
  const loc = (typeof userLocation !== 'undefined' && userLocation) ? `${userLocation.city || 'Detected GPS Area'}, ${userLocation.state || 'India'}` : 'Live Surveillance Sector';
  const rain = (typeof currentLiveTelemetry !== 'undefined' && currentLiveTelemetry?.live_weather?.rainfall_24h_mm) ? currentLiveTelemetry.live_weather.rainfall_24h_mm : 78.4;
  const flow = (typeof currentLiveTelemetry !== 'undefined' && currentLiveTelemetry?.river_telemetry?.discharge_m3s) ? `${currentLiveTelemetry.river_telemetry.discharge_m3s} m³/s` : '8,400 m³/s (Surge)';

  if (typeof showToast === 'function') showToast('Dispatching Emergency Flood Alert Email...', 'info');

  try {
    const res = await fetch(`${NODE_API_BASE}/api/alerts/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        name: (typeof currentUser !== 'undefined' && currentUser?.name) ? currentUser.name : 'Incident Commander',
        alertData: {
          location: loc,
          state: (typeof userLocation !== 'undefined' && userLocation?.state) ? userLocation.state : 'Regional Catchment',
          district: (typeof userLocation !== 'undefined' && userLocation?.district) ? userLocation.district : 'Central Basin',
          probability: 84.5,
          riskLevel: 'HIGH',
          rainfall: rain,
          riverFlow: flow,
          temp: '27.8°C',
          soilMoisture: '0.41',
          imdAdvisory: 'CRITICAL INUNDATION WARNING: Low-lying catchment surge expected.'
        }
      })
    });

    const data = await res.json();
    if (data.success) {
      if (typeof showToast === 'function') showToast(`🚨 Automated Alert sent to Email (${email})!`, 'success');
      fetchAlertHistory();
    } else {
      if (typeof showToast === 'function') showToast(data.message || 'Alert dispatch failed', 'error');
    }
  } catch (err) {
    if (typeof showToast === 'function') showToast('Alert dispatch failed to connect to server', 'error');
  }
}

async function checkAndAutoDispatchAlert(alertParams) {
  const saved = JSON.parse(localStorage.getItem('floodwatch_alert_settings') || '{}');
  const email = saved.email || ((typeof currentUser !== 'undefined' && currentUser?.email) ? currentUser.email : '');
  const threshold = Number(saved.threshold || 60);
  const autoActive = saved.autoActive !== false;

  if (!autoActive || !email) return;

  const prob = Number(alertParams.probability || 0);
  if (prob < threshold) return;

  const now = Date.now();
  if (now - lastAutoAlertDispatchedAt < 180000) return;
  lastAutoAlertDispatchedAt = now;

  try {
    const res = await fetch(`${NODE_API_BASE}/api/alerts/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        name: (typeof currentUser !== 'undefined' && currentUser?.name) ? currentUser.name : 'Monitored User',
        alertData: alertParams
      })
    });
    const data = await res.json();
    if (data.success) {
      if (typeof showToast === 'function') {
        showToast(`🚨 Automated Email Warning Dispatched (${prob}%)!`, 'warning');
      }
      fetchAlertHistory();
    }
  } catch (e) {
    console.warn('Auto-dispatch error:', e);
  }
}

async function fetchAlertHistory() {
  const tbody = document.getElementById('alertsHistoryBody');
  if (!tbody) return;

  try {
    const res = await fetch(`${NODE_API_BASE}/api/alerts/history`);
    if (!res.ok) return;
    const data = await res.json();
    const logs = data.history || [];

    if (logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="padding:16px; text-align:center; color:#64748b;">No recent alerts dispatched yet. Auto-sensor telemetry active.</td></tr>`;
      return;
    }

    tbody.innerHTML = logs.map(l => {
      const channels = [];
      if (l.emailSent) channels.push(`<span style="background:rgba(56,189,248,0.15); color:#38bdf8; padding:1px 6px; border-radius:3px; font-size:9.5px;">✉️ EMAIL</span>`);
      const sevColor = l.probability >= 70 ? 'var(--red)' : (l.probability >= 40 ? 'var(--orange)' : 'var(--green)');

      return `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
          <td style="padding:8px 12px; font-family:var(--mono); color:var(--blue); font-weight:700;">${l.alertId}</td>
          <td style="padding:8px 12px; color:#fff; font-weight:700;">${l.location}</td>
          <td style="padding:8px 12px; color:${sevColor}; font-weight:800; font-family:var(--mono);">${l.probability}% [${l.riskLevel}]</td>
          <td style="padding:8px 12px; display:flex; gap:4px; align-items:center;">${channels.join(' ') || '<span style="background:rgba(56,189,248,0.15); color:#38bdf8; padding:1px 6px; border-radius:3px; font-size:9.5px;">✉️ EMAIL</span>'}</td>
          <td style="padding:8px 12px; color:#94a3b8; font-size:10px; font-family:var(--mono);">${l.dispatchTime}</td>
          <td style="padding:8px 12px; text-align:right; color:#10b981; font-weight:800; font-size:10px;">DELIVERED ✅</td>
        </tr>
      `;
    }).join('');
  } catch (err) {}
}

function renderAlerts() {
  const list = document.getElementById('alertsList');
  if (!list) return;
  list.innerHTML = alertsData.map((a, i) => `
    <div class="alert-item" style="padding:12px; margin-bottom:8px; animation: fadeInUp 0.4s ease-out ${i * 0.05}s both;" onclick="switchView('view-map')">
      <div class="alert-severity sev-${a.severity}"></div>
      <div style="flex:1;">
        <div style="font-size:12.5px; font-weight:700; color:#fff;">${a.title}</div>
        <div style="font-size:10px; color:var(--text-dim); font-family:var(--mono); margin-top:3px;">${a.meta}</div>
      </div>
      <button class="btn-pop-action bpa-predict" style="width:auto; padding:4px 10px; font-size:9.5px;">View on Map →</button>
    </div>
  `).join('');
}

function toggleDashFaq(el) {
  const ans = el.nextElementSibling;
  const arrow = el.querySelector('span:last-child');
  if (!ans) return;
  const isVisible = ans.style.display === 'block';
  ans.style.display = isVisible ? 'none' : 'block';
  if (arrow) arrow.textContent = isVisible ? '▼' : '▲';
}

function filterDashFaqCat(cat, btn) {
  document.querySelectorAll('.dash-faq-filter').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const items = document.querySelectorAll('.dash-faq-item');
  items.forEach(item => {
    const itemCat = item.getAttribute('data-cat');
    item.style.display = (cat === 'all' || itemCat === cat) ? 'block' : 'none';
  });
}

function filterDashboardFaqs() {
  const q = document.getElementById('dashFaqSearch')?.value.toLowerCase().trim() || '';
  const items = document.querySelectorAll('.dash-faq-item');
  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = (!q || text.includes(q)) ? 'block' : 'none';
  });
}
