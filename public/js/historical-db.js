/**
 * ========================================================================================
 * FloodWatch India - Historical Floods Database Module
 * Connects to Neon PostgreSQL DB & 2000-2026 CWC/NDMA historical disaster archive
 * ========================================================================================
 */

let histDebounceTimer = null;

function filterHistoricalByState(stateName) {
  switchView('view-historical-db');
  const histFilter = document.getElementById("histStateFilter");
  if (histFilter) histFilter.value = stateName;
  applyHistoricalFilters();
  if (typeof showToast === 'function') showToast(`Filtered Historical DB for ${stateName}!`, 'info');
}

function applyHistoricalFiltersDebounced() {
  clearTimeout(histDebounceTimer);
  histDebounceTimer = setTimeout(() => {
    applyHistoricalFilters();
  }, 300);
}

function resetHistoricalFilters() {
  const stateEl = document.getElementById("histStateFilter");
  const distEl = document.getElementById("histDistrictFilter");
  const yearEl = document.getElementById("histYearFilter");
  const causeEl = document.getElementById("histCauseFilter");
  const searchEl = document.getElementById("histSearchInput");

  if (stateEl) stateEl.value = "";
  if (distEl) distEl.value = "";
  if (yearEl) yearEl.value = "all";
  if (causeEl) causeEl.value = "all";
  if (searchEl) searchEl.value = "";

  applyHistoricalFilters();
}

function applyHistoricalFilters() {
  const state = document.getElementById("histStateFilter")?.value || '';
  const district = document.getElementById("histDistrictFilter")?.value || '';
  const year = document.getElementById("histYearFilter")?.value || 'all';
  const cause = document.getElementById("histCauseFilter")?.value || 'all';
  const search = document.getElementById("histSearchInput")?.value || '';

  fetchHistoricalEventsTable(state, district, year, cause, search);
}

async function fetchHistoricalEventsTable(state = '', district = '', year = 'all', cause = 'all', search = '') {
  const tbody = document.getElementById("historicalTableBody");
  const label = document.getElementById("historicalDbLabel");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" style="padding: 24px; text-align: center; color: var(--blue);">🔄 Filtering Historical Disaster Database...</td></tr>`;

  try {
    const params = new URLSearchParams();
    params.set('limit', '100');
    if (state && state.trim() !== '') params.set('state', state.trim());
    if (district && district.trim() !== '') params.set('district', district.trim());
    if (year && year !== 'all') params.set('year', year.trim());
    if (cause && cause !== 'all') params.set('cause', cause.trim());
    if (search && search.trim() !== '') params.set('search', search.trim());

    const res = await fetch(`${NODE_API_BASE}/api/historical-floods?${params.toString()}`);
    if (!res.ok) throw new Error("Neon DB fetch error");
    const json = await res.json();
    const records = json.data || [];

    if (label) {
      label.textContent = `Showing ${records.length} documented flood disaster records`;
    }

    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="padding:28px; text-align:center; color:#94a3b8;">No historical events match the specified filter criteria. Try clearing filters.</td></tr>`;
      return;
    }

    tbody.innerHTML = records.map(r => {
      const isRecent = (r.year >= 2024);
      const yearBadge = isRecent ? `<span style="background:rgba(239,68,68,0.2); color:#ef4444; padding:1px 5px; border-radius:3px; font-size:9px; margin-left:4px;">NEW</span>` : '';
      const fatClass = r.human_fatality > 20 ? '#ef4444' : (r.human_fatality > 0 ? '#facc15' : '#94a3b8');
      const damageText = r.extent_of_damage || 'Substantial agricultural & residential inundation';

      return `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.04); transition:background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
          <td style="padding: 10px 14px; font-weight: 800; color: var(--blue); font-family:var(--mono);">
            ${r.year || 2024}${yearBadge}
          </td>
          <td style="padding: 10px 14px; color: #fff; font-weight:700;">${r.state}</td>
          <td style="padding: 10px 14px; color: #94a3b8;" title="${r.districts}">${r.districts || 'Statewide Catchment'}</td>
          <td style="padding: 10px 14px; color: #cbd5e1;">
            <span style="background:rgba(255,255,255,0.04); padding:2px 6px; border-radius:4px; font-size:10.5px;">${r.main_cause || 'Heavy Monsoon Rain'}</span>
          </td>
          <td style="padding: 10px 14px; color: #94a3b8; max-width:260px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${damageText}">
            ${damageText}
          </td>
          <td style="padding: 10px 14px; text-align: right; color: ${fatClass}; font-weight:800; font-family:var(--mono);">
            ${r.human_fatality || 0}
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="padding:20px; text-align:center; color:#ef4444;">⚠️ Neon PostgreSQL Database Standby</td></tr>`;
  }
}
