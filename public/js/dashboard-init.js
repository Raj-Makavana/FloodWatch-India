/**
 * ========================================================================================
 * FloodWatch India - Dashboard Master Initialization
 * Orchestrates module startup sequence, clock ticker, & telemetry refresh cycles
 * ========================================================================================
 */

function updateClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const el = document.getElementById('lastSync');
  if (el) el.textContent = `${hh}:${mm}:${ss} IST`;
}

document.addEventListener('DOMContentLoaded', async () => {
  if (typeof checkAuth === 'function') checkAuth();
  if (typeof initMap === 'function') initMap();
  if (typeof loadPredictions === 'function') await loadPredictions();
  if (typeof renderAlerts === 'function') renderAlerts();
  if (typeof updateTrendsChart === 'function') updateTrendsChart();
  if (typeof loadStates === 'function') loadStates();
  if (typeof applyHistoricalFilters === 'function') applyHistoricalFilters();
  if (typeof initAlertSettings === 'function') initAlertSettings();

  // Auto-detect user GPS location immediately on load
  if (typeof detectMyLocation === 'function') detectMyLocation(true);

  // Status clock
  updateClock();
  setInterval(updateClock, 1000);

  // Periodically refresh predictions every 10 min
  if (typeof loadPredictions === 'function') {
    setInterval(loadPredictions, 10 * 60 * 1000);
  }

  // Handle URL view routing if query param ?view=... is provided
  const urlParams = new URLSearchParams(window.location.search);
  const requestedView = urlParams.get('view');
  if (requestedView && typeof switchView === 'function') {
    const targetId = requestedView.startsWith('view-') ? requestedView : 'view-' + requestedView;
    switchView(targetId);
  }
});
