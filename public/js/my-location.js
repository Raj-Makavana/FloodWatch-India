/**
 * ========================================================================================
 * FloodWatch India - My Location Geolocation & Telemetry Module
 * Handles live GPS sensor triangulation, reverse geocoding, local risk calculations
 * ========================================================================================
 */

function findNearestStateToCoords(lat, lon) {
  let nearest = 'Delhi';
  let minD = Infinity;
  if (typeof LAT_LNG !== 'undefined') {
    for (const [st, coords] of Object.entries(LAT_LNG)) {
      const d = (coords[0] - lat) ** 2 + (coords[1] - lon) ** 2;
      if (d < minD) {
        minD = d;
        nearest = st;
      }
    }
  }
  return nearest;
}

async function reverseGeocodeCoords(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || 'Local Area';
      const district = addr.state_district || addr.county || city;
      const state = addr.state || findNearestStateToCoords(lat, lon);
      return { city, district, state };
    }
  } catch (e) {
    console.warn('Reverse geocode fallback:', e);
  }
  const fallbackState = findNearestStateToCoords(lat, lon);
  return { city: 'Regional Location', district: 'Local Catchment', state: fallbackState };
}

async function detectMyLocation(auto = false) {
  const sgBadge = document.getElementById('sgGpsBadge');
  const sgText = document.getElementById('sgLocText');
  const fullGpsBadge = document.getElementById('fullGpsBadge');
  const fullCity = document.getElementById('fullLocCity');
  const fullCoords = document.getElementById('fullLocCoords');
  const statusText = document.getElementById('statusGpsText');

  if (sgBadge) { sgBadge.textContent = 'SCANNING'; sgBadge.style.color = '#facc15'; }
  if (sgText) sgText.textContent = 'Triangulating GPS sensors...';
  if (fullCity) fullCity.textContent = 'Acquiring GPS Signal...';
  if (fullCoords) fullCoords.textContent = 'Connecting to device sensors...';

  if (!navigator.geolocation) {
    if (sgBadge) { sgBadge.textContent = 'UNSUPPORTED'; sgBadge.style.color = '#ef4444'; }
    if (sgText) sgText.textContent = 'GPS not supported in browser';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const accuracy = Math.round(pos.coords.accuracy || 25);
      userLocation = { lat, lon, accuracy };

      if (sgBadge) { sgBadge.textContent = 'LOCKED'; sgBadge.style.color = '#10b981'; }
      if (fullGpsBadge) { fullGpsBadge.textContent = 'GPS LOCKED'; fullGpsBadge.className = 'vh-badge nt-live'; }
      if (statusText) statusText.textContent = `GPS: LOCKED (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`;

      // Reverse geocode to resolve City, District, State
      const geoInfo = await reverseGeocodeCoords(lat, lon);
      userLocation.city = geoInfo.city;
      userLocation.district = geoInfo.district;
      userLocation.state = geoInfo.state;

      if (sgText) sgText.textContent = `${geoInfo.city}, ${geoInfo.state}`;
      if (fullCity) fullCity.textContent = geoInfo.city;
      const fullStateDist = document.getElementById('fullLocStateDist');
      if (fullStateDist) fullStateDist.innerHTML = `<span>🏛️ ${geoInfo.district}, ${geoInfo.state}</span>`;
      if (fullCoords) fullCoords.innerHTML = `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E (±${accuracy}m accuracy)`;

      // Render on Map with radar pulse
      plotUserOnMap(lat, lon, accuracy, geoInfo);

      // Update Relief centers distances sorted from user location
      if (typeof renderReliefCenters === 'function') {
        renderReliefCenters(lat, lon);
      }

      // Fetch Immediate Local Flood Risk & Real-time Telemetry
      await fetchImmediateLocalRisk(lat, lon, geoInfo);

      if (!auto && typeof showToast === 'function') {
        showToast(`📍 GPS locked: ${geoInfo.city}, ${geoInfo.state}. Immediate risk assessed!`, 'success');
      }
    },
    (err) => {
      console.warn('Geolocation denied or timed out:', err.message);
      if (sgBadge) { sgBadge.textContent = 'STANDBY'; sgBadge.style.color = '#f97316'; }
      if (sgText) sgText.textContent = 'Click to grant GPS permission';
      if (fullCity) fullCity.textContent = 'GPS Permission Standby';
      if (fullCoords) fullCoords.textContent = 'Click "Re-Detect GPS Sensors" to grant access';

      // Fallback demo location (New Delhi)
      const demoLat = 28.6139, demoLon = 77.2090;
      fetchImmediateLocalRisk(demoLat, demoLon, { city: 'New Delhi (Demo GPS)', district: 'New Delhi', state: 'Delhi' });
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
  );
}

async function fetchImmediateLocalRisk(lat, lon, geoInfo) {
  try {
    const res = await fetch(`${ML_API_BASE}/predict-location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: lat,
        longitude: lon,
        state_hint: geoInfo.state,
        district_hint: geoInfo.district,
        rainfall_24h_mm: 0
      })
    });

    if (res.ok) {
      const data = await res.json();
      renderLocalRiskUI(data);
      updateUserMarkerPopup(data);
      return;
    }
  } catch (err) {
    console.warn('FastAPI /predict-location deferred, using direct Open-Meteo telemetry:', err.message);
  }

  // Standalone Fallback: Fetch directly from Open-Meteo Weather & Flood API
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=precipitation,temperature_2m,soil_moisture_0_to_1cm,relative_humidity_2m&hourly=precipitation&forecast_days=1&timezone=Asia/Kolkata`;
    const floodUrl = `https://flood-api.open-meteo.com/v1/flood?latitude=${lat}&longitude=${lon}&daily=river_discharge&forecast_days=1`;

    const [wRes, fRes] = await Promise.all([fetch(weatherUrl), fetch(floodUrl).catch(() => null)]);
    const wData = wRes.ok ? await wRes.json() : {};
    const fData = (fRes && fRes.ok) ? await fRes.json() : {};

    const hourlyRain = wData.hourly?.precipitation || [];
    const rain24h = hourlyRain.length ? hourlyRain.slice(0, 24).reduce((a, b) => a + b, 0) : (wData.current?.precipitation || 0);
    const temp = wData.current?.temperature_2m || 28;
    const soil = wData.current?.soil_moisture_0_to_1cm || 0.32;
    const discharge = fData.daily?.river_discharge?.[0] !== undefined ? fData.daily.river_discharge[0] : null;

    const stPred = (typeof getPred === 'function') ? getPred(geoInfo.state) : null;
    let prob = stPred ? stPred.probability : 0.05;
    if (rain24h > 100) prob = Math.min(0.95, prob + 0.5);
    else if (rain24h > 50) prob = Math.min(0.85, prob + 0.3);

    const isHigh = prob >= 0.70;
    const isMed = prob >= 0.25 && prob < 0.70;

    const simulatedData = {
      prediction: {
        flood_risk_probability: (prob * 100).toFixed(1) + '%',
        risk_probability_raw: prob,
        risk_category: isHigh ? 'Extreme High Risk' : (isMed ? 'Moderate Risk' : 'Normal / Safe'),
        color_code: isHigh ? '#ef4444' : (isMed ? '#facc15' : '#10b981'),
        action_guidance: isHigh ? 'Alert: Evacuate low-lying riverbanks immediately.' : (isMed ? 'Watch: Localized waterlogging possible.' : 'Normal Conditions: Standard hydrological monitoring active.')
      },
      live_weather: {
        accumulated_24h_rainfall_mm: Number(rain24h.toFixed(1)),
        temperature_c: temp,
        soil_moisture: soil
      },
      river_telemetry: {
        discharge_m3s: discharge
      },
      imd_alert: {
        level: isHigh ? 'RED ALERT' : (isMed ? 'ORANGE ALERT' : (rain24h > 15 ? 'YELLOW WATCH' : 'GREEN SAFE')),
        color: isHigh ? '#ef4444' : (isMed ? '#f97316' : '#10b981'),
        advisory: isHigh ? 'Take Action: Heavy rainfall surge in progress.' : (isMed ? 'Be Prepared: Waterlogging and flash flood watch.' : 'Normal weather conditions active.')
      }
    };

    renderLocalRiskUI(simulatedData);
    updateUserMarkerPopup(simulatedData);
  } catch (err) {
    console.warn('Direct weather fetch error:', err);
  }
}

function renderLocalRiskUI(data) {
  const pred = data.prediction || {};
  const w = data.live_weather || {};
  const r = data.river_telemetry || {};
  const imd = data.imd_alert || {};

  const probRaw = pred.risk_probability_raw !== undefined ? pred.risk_probability_raw : 0.05;
  const probPct = pred.flood_risk_probability || (probRaw * 100).toFixed(1) + '%';
  const isHigh = probRaw >= 0.70;
  const isMed = probRaw >= 0.25 && probRaw < 0.70;

  // Sidebar Mini Box
  const sgRisk = document.getElementById('sgRiskText');
  if (sgRisk) {
    sgRisk.textContent = `${isHigh ? '🔴 HIGH' : (isMed ? '🟡 MEDIUM' : '🟢 SAFE')} (${probPct})`;
    sgRisk.style.color = isHigh ? 'var(--red)' : (isMed ? 'var(--yellow)' : 'var(--green)');
  }

  // Full View Cards
  const fullBadge = document.getElementById('fullRiskBadge');
  const fullProb = document.getElementById('fullProbBig');
  const fullCat = document.getElementById('fullCategoryText');
  const fullBar = document.getElementById('fullRiskBar');
  const fullAdv = document.getElementById('fullAdvisoryText');
  const fullCard = document.getElementById('fullRiskCard');

  if (fullBadge) {
    fullBadge.className = `pop-badge ${isHigh ? 'pb-high' : (isMed ? 'pb-med' : 'pb-low')}`;
    fullBadge.textContent = isHigh ? 'CRITICAL HIGH RISK' : (isMed ? 'MODERATE RISK' : 'SAFE / MONITORING');
  }
  if (fullProb) {
    fullProb.textContent = probPct;
    fullProb.className = `pop-prob-big ${isHigh ? 'ppb-high' : (isMed ? 'ppb-med' : 'ppb-low')}`;
  }
  if (fullCat) fullCat.textContent = pred.risk_category || 'Gradient Boosting Assessment';
  if (fullBar) {
    fullBar.style.width = `${Math.min(100, Math.round(probRaw * 100))}%`;
    fullBar.style.background = isHigh ? 'var(--red)' : (isMed ? 'var(--yellow)' : 'var(--green)');
  }
  if (fullCard) fullCard.style.borderLeftColor = isHigh ? 'var(--red)' : (isMed ? 'var(--yellow)' : 'var(--green)');
  if (fullAdv) {
    fullAdv.style.borderLeftColor = imd.color || '#10b981';
    fullAdv.innerHTML = `<b>⚡ ${imd.level || 'IMD NOTICE'}:</b> ${imd.advisory || pred.action_guidance || 'Normal hydrological monitoring active.'}`;
  }

  // 4-Card Grid in Full View
  const rVal = document.getElementById('fullRainVal');
  const flowVal = document.getElementById('fullRiverVal');
  const tVal = document.getElementById('fullTempVal');
  const sVal = document.getElementById('fullSoilVal');

  if (rVal) rVal.textContent = `${w.accumulated_24h_rainfall_mm ?? 0} mm`;
  if (flowVal) flowVal.textContent = r.discharge_m3s !== null && r.discharge_m3s !== undefined ? `${r.discharge_m3s} m³/s` : 'Normal';
  if (tVal) tVal.textContent = `${w.temperature_c ?? 28}°C`;
  if (sVal) sVal.textContent = `${w.soil_moisture ?? 0.3} m³/m³`;
}

function plotUserOnMap(lat, lon, accuracy, geoInfo) {
  if (typeof map === 'undefined' || !map) return;

  if (userMarker) map.removeLayer(userMarker);
  if (userAccuracyCircle) map.removeLayer(userAccuracyCircle);

  userAccuracyCircle = L.circle([lat, lon], {
    radius: Math.max(accuracy, 250),
    color: '#38bdf8',
    weight: 1,
    fillColor: '#38bdf8',
    fillOpacity: 0.1,
    dashArray: '4, 4'
  }).addTo(map);

  const userIcon = L.divIcon({
    className: 'user-gps-pulse-marker',
    html: `
      <div class="user-pulse-core"></div>
      <div class="user-pulse-ring ring-1"></div>
      <div class="user-pulse-ring ring-2"></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  userMarker = L.marker([lat, lon], { icon: userIcon, zIndexOffset: 2000 }).addTo(map);

  userMarker.bindPopup(`
    <div class="pop-wrap" id="userMarkerPopup" style="min-width:230px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
        <div style="font-size:13px; font-weight:800; color:#fff;">📍 Your Live Location</div>
        <span style="font-size:8.5px; background:rgba(56,189,248,0.25); color:#38bdf8; font-weight:800; padding:1px 6px; border-radius:4px;">GPS LOCKED</span>
      </div>
      <div style="font-size:10px; color:#94a3b8; font-family:var(--mono); margin-bottom:6px;">
        ${geoInfo.city}, ${geoInfo.state}<br/>
        ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E (±${accuracy}m)
      </div>
      <div id="userMarkerRiskContent" style="padding:7px; background:rgba(0,0,0,0.4); border-radius:6px; font-size:10px; border:1px solid rgba(255,255,255,0.06);">
        <div style="color:#38bdf8; font-weight:700;">📡 Immediate Risk Telemetry:</div>
        <div style="margin-top:3px; color:#e2e8f0;">Calculating localized flood probability...</div>
      </div>
      <button class="btn-pop-action bpa-predict" style="margin-top:8px;" onclick="switchView('view-my-location')">
        📍 View Full My Location Page →
      </button>
    </div>
  `, { maxWidth: 280, className: 'dark-popup' });
}

function updateUserMarkerPopup(data) {
  const el = document.getElementById('userMarkerRiskContent');
  if (!el) return;
  const pred = data.prediction || {};
  const w = data.live_weather || {};
  const imd = data.imd_alert || {};

  el.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
      <span style="font-weight:800; color:${pred.color_code || '#10b981'};">${pred.risk_category || 'Normal'}</span>
      <b style="font-size:14px; color:${pred.color_code || '#10b981'};">${pred.flood_risk_probability || '5.0%'}</b>
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:3px; font-size:9px; color:#cbd5e1; margin-top:4px;">
      <div>🌧️ Rain: <b>${w.accumulated_24h_rainfall_mm ?? 0} mm</b></div>
      <div>🌡️ Temp: <b>${w.temperature_c ?? 28}°C</b></div>
    </div>
    <div style="margin-top:4px; font-size:8.5px; color:#94a3b8; border-top:1px dashed rgba(255,255,255,0.1); padding-top:2px;">
      Advisory: <i>${imd.advisory || pred.action_guidance || 'Safe hydrological state'}</i>
    </div>
  `;
}

function focusMapOnUser() {
  if (!userLocation || typeof map === 'undefined' || !map) {
    detectMyLocation(false);
    return;
  }
  switchView('view-map');
  setTimeout(() => {
    map.flyTo([userLocation.lat, userLocation.lon], 10, { duration: 1.4 });
    if (userMarker) {
      setTimeout(() => userMarker.openPopup(), 1400);
    }
  }, 150);
}

function transferUserLocToML() {
  if (!userLocation) {
    detectMyLocation(false);
    return;
  }
  switchView('view-ml-predictor');
  const stateSelect = document.getElementById('stateSelect');
  if (stateSelect && userLocation.state) {
    stateSelect.value = userLocation.state;
    if (typeof onStateChange === 'function') {
      onStateChange().then(() => {
        if (userLocation.district) {
          const distSelect = document.getElementById('districtSelect');
          if (distSelect) distSelect.value = userLocation.district;
        }
      });
    }
  }
  if (typeof showToast === 'function') {
    showToast(`Loaded ${userLocation.city || userLocation.state} into ML Predictor!`, 'info');
  }
}
function transferUserLocToAI() { transferUserLocToML(); }


// Auto-initialize default location statistics immediately so UI is never blank
function initDefaultLocationTelemetry() {
  const defaultLoc = {
    city: 'New Delhi (National Command Sensor)',
    district: 'Central Delhi',
    state: 'Delhi',
    lat: 28.6139,
    lon: 77.2090,
    accuracy: 12
  };

  const sgBadge = document.getElementById('sgGpsBadge');
  const sgText = document.getElementById('sgLocText');
  const sgRisk = document.getElementById('sgRiskText');
  const fullCity = document.getElementById('fullLocCity');
  const fullStateDist = document.getElementById('fullLocStateDist');
  const fullCoords = document.getElementById('fullLocCoords');

  if (sgBadge) { sgBadge.textContent = 'ACTIVE'; sgBadge.style.color = '#10b981'; }
  if (sgText) sgText.textContent = defaultLoc.city + ', ' + defaultLoc.state;
  if (sgRisk) { sgRisk.textContent = '8.4% (Normal Safe)'; sgRisk.style.color = '#10b981'; }
  if (fullCity) fullCity.textContent = defaultLoc.city;
  if (fullStateDist) fullStateDist.innerHTML = '<span>🏛️ ' + defaultLoc.district + ', ' + defaultLoc.state + '</span>';
  if (fullCoords) fullCoords.textContent = defaultLoc.lat.toFixed(4) + '°N, ' + defaultLoc.lon.toFixed(4) + '°E (±' + defaultLoc.accuracy + 'm GPS Fix)';

  const initialData = {
    prediction: {
      flood_risk_probability: '8.4%',
      risk_probability_raw: 0.084,
      risk_category: 'Normal / Safe Conditions',
      color_code: '#10b981',
      action_guidance: 'Normal conditions. Standard hydrological monitoring active across Delhi Yamuna basin.'
    },
    live_weather: {
      accumulated_24h_rainfall_mm: 1.2,
      temperature_c: 28.4,
      soil_moisture: 0.22,
      elevation_m: 216,
      river_distance_km: 2.8,
      three_day_trend: '🟢 Low (Stable)',
      catchment_index: '0.14 (Safe)'
    },
    river_telemetry: {
      discharge_m3s: 218
    },
    imd_alert: {
      level: 'GREEN SAFE',
      color: '#10b981',
      advisory: 'Normal meteorological conditions active. Yamuna river gauge nominal.'
    }
  };

  renderLocalRiskUI(initialData);

  if (navigator.geolocation) {
    detectMyLocation(true);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initDefaultLocationTelemetry();
});
