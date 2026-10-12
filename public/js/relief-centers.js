/**
 * ========================================================================================
 * FloodWatch India - NDRF & Emergency Relief Centers Module
 * 20 active battalions, SDMA control rooms, distance sorting via GPS, 1-click calls
 * ========================================================================================
 */

const reliefCenters = [
  { id: 1, name: '1st Battalion NDRF Guwahati', type: 'NDRF Battalion', city: 'Guwahati, Assam', lat: 26.1445, lng: 91.7362, contact: '0361-2840284', status: 'active' },
  { id: 2, name: '2nd Battalion NDRF Nadia', type: 'NDRF Battalion', city: 'Haringhata, West Bengal', lat: 22.9566, lng: 88.5412, contact: '033-25870094', status: 'active' },
  { id: 3, name: '3rd Battalion NDRF Mundali', type: 'NDRF Battalion', city: 'Cuttack, Odisha', lat: 20.4625, lng: 85.8828, contact: '0671-2879710', status: 'deployed' },
  { id: 4, name: '4th Battalion NDRF Arakkonam', type: 'NDRF Battalion', city: 'Vellore, Tamil Nadu', lat: 13.0784, lng: 79.6677, contact: '04177-246594', status: 'active' },
  { id: 5, name: '5th Battalion NDRF Pune', type: 'NDRF Battalion', city: 'Sudumbare, Maharashtra', lat: 18.7183, lng: 73.7437, contact: '02114-247000', status: 'active' },
  { id: 6, name: '6th Battalion NDRF Vadodara', type: 'NDRF Battalion', city: 'Jarod, Gujarat', lat: 22.4282, lng: 73.3444, contact: '02668-274580', status: 'deployed' },
  { id: 7, name: '7th Battalion NDRF Bhatinda', type: 'NDRF Battalion', city: 'Bhatinda, Punjab', lat: 30.2110, lng: 74.9455, contact: '0164-2246193', status: 'standby' },
  { id: 8, name: '8th Battalion NDRF Ghaziabad', type: 'NDRF Battalion', city: 'Ghaziabad, NCR / UP', lat: 28.6692, lng: 77.4538, contact: '0120-2766014', status: 'active' },
  { id: 9, name: '9th Battalion NDRF Bihta', type: 'NDRF Battalion', city: 'Patna, Bihar', lat: 25.5684, lng: 84.8727, contact: '06115-252558', status: 'deployed' },
  { id: 10, name: '10th Battalion NDRF Guntur', type: 'NDRF Battalion', city: 'Vijayawada, Andhra Pradesh', lat: 16.3067, lng: 80.4365, contact: '0863-2293050', status: 'deployed' },
  { id: 11, name: '11th Battalion NDRF Varanasi', type: 'NDRF Battalion', city: 'Varanasi, Uttar Pradesh', lat: 25.3176, lng: 82.9739, contact: '0542-2501101', status: 'active' },
  { id: 12, name: '12th Battalion NDRF Doimukh', type: 'NDRF Battalion', city: 'Itanagar, Arunachal Pradesh', lat: 27.1350, lng: 93.7500, contact: '0360-2277105', status: 'active' },
  { id: 13, name: '14th Battalion NDRF Jasur', type: 'NDRF Battalion', city: 'Kangra / Kullu, Himachal Pradesh', lat: 32.2500, lng: 75.9167, contact: '01893-225010', status: 'deployed' },
  { id: 14, name: '15th Battalion NDRF Gadonia', type: 'NDRF Battalion', city: 'Wayanad / Thrissur, Kerala', lat: 11.6854, lng: 76.1320, contact: '0487-2362400', status: 'active' },
  { id: 15, name: 'Maharashtra SEOC Command HQ', type: 'SDMA Control Room', city: 'Mantralaya, Mumbai', lat: 18.9220, lng: 72.8347, contact: '022-22027990', status: 'active' },
  { id: 16, name: 'Gujarat State Emergency Center (SEOC)', type: 'SDMA Control Room', city: 'Gandhinagar, Gujarat', lat: 23.2156, lng: 72.6369, contact: '079-23251900', status: 'active' },
  { id: 17, name: 'Kerala State Disaster Management Authority', type: 'SDMA Control Room', city: 'Thiruvananthapuram, Kerala', lat: 8.5241, lng: 76.9366, contact: '0471-2331645', status: 'active' },
  { id: 18, name: 'Assam State Disaster Management (ASDMA)', type: 'SDMA Control Room', city: 'Dispur, Guwahati', lat: 26.1433, lng: 91.7898, contact: '1079', status: 'active' },
  { id: 19, name: 'Bihar State Disaster Authority HQ', type: 'SDMA Control Room', city: 'Patna, Bihar', lat: 25.6093, lng: 85.1235, contact: '0612-2547204', status: 'active' },
  { id: 20, name: 'AIIMS Emergency Disaster Relief Wing', type: 'Emergency Hospital', city: 'New Delhi', lat: 28.5672, lng: 77.2100, contact: '011-26588500', status: 'active' }
];

function filterReliefCenters() {
  const uLat = (typeof userLocation !== 'undefined' && userLocation) ? userLocation.lat : null;
  const uLng = (typeof userLocation !== 'undefined' && userLocation) ? userLocation.lon : null;
  renderReliefCenters(uLat, uLng);
}

function renderReliefCenters(userLat, userLng) {
  const list = document.getElementById('reliefList');
  const badge = document.getElementById('reliefGpsBadge');
  if (!list) return;

  const typeFilter = document.getElementById('reliefTypeFilter')?.value || 'all';
  const searchText = (document.getElementById('reliefSearchInput')?.value || '').toLowerCase().trim();

  let centers = reliefCenters.map(c => {
    const dist = (userLat != null) ? haversine(userLat, userLng, c.lat, c.lng) : null;
    return { ...c, distance: dist };
  });

  if (typeFilter !== 'all') {
    centers = centers.filter(c => c.type.toLowerCase().includes(typeFilter.toLowerCase()));
  }

  if (searchText) {
    centers = centers.filter(c => c.name.toLowerCase().includes(searchText) || c.city.toLowerCase().includes(searchText) || c.type.toLowerCase().includes(searchText));
  }

  if (userLat != null) {
    centers.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    if (badge) badge.textContent = `SORTED: ${(typeof userLocation !== 'undefined' && userLocation && userLocation.city) ? userLocation.city : 'GPS'}`;
  }

  if (centers.length === 0) {
    list.innerHTML = `<div style="text-align:center; padding:30px; color:#94a3b8; font-size:12px;">No relief units match your search or filter.</div>`;
    return;
  }

  list.innerHTML = centers.map((c, i) => {
    const statusClass = c.status === 'active' ? 'status-active' : (c.status === 'deployed' ? 'status-deployed' : 'status-standby');
    const distText = c.distance != null ? `📍 ${Math.round(c.distance)} km away` : '—';
    return `
      <div class="relief-item" style="padding:12px 14px; margin-bottom:8px; animation: fadeInUp 0.4s ease-out ${i * 0.03}s both;">
        <div class="relief-info">
          <div style="font-size:13.5px; font-weight:800; color:#fff;">🏥 ${c.name}</div>
          <div style="font-size:10.5px; color:var(--text-dim); margin-top:2px;">
            <span style="color:var(--blue); font-weight:700;">${c.type}</span> • ${c.city}
          </div>
          <div style="margin-top:6px; font-size:11px; display:flex; align-items:center; gap:8px;">
            <span style="color:#94a3b8;">Helpline:</span>
            <a href="tel:${c.contact.replace(/[^0-9]/g, '')}" style="color:#38bdf8; font-family:var(--mono); font-weight:800; text-decoration:none;">
              📞 ${c.contact}
            </a>
            <button onclick="copyHelplineNumber('${c.contact}')" style="background:rgba(255,255,255,0.06); border:1px solid var(--border); color:var(--text-secondary); font-size:9.5px; padding:1px 6px; border-radius:3px; cursor:pointer;">
              📋 Copy
            </button>
          </div>
        </div>
        <div class="relief-right" style="text-align:right;">
          <span class="relief-status ${statusClass}" style="font-size:9px; padding:2px 7px;">${c.status.toUpperCase()}</span>
          <span style="font-size:11.5px; font-family:var(--mono); color:var(--blue); font-weight:800; margin-top:5px; display:block;">${distText}</span>
          <div style="display:flex; gap:5px; margin-top:6px; justify-content:flex-end;">
            <a href="tel:${c.contact.replace(/[^0-9]/g, '')}" class="btn-pop-action bpa-predict" style="text-decoration:none; padding:4px 8px; font-size:10px; background:#16a34a; border-color:#22c55e; color:#fff;">
              📞 Call
            </a>
            <button class="btn-pop-action bpa-predict" style="width:auto; padding:4px 9px; font-size:10px;" onclick="switchView('view-map'); if(typeof map !== 'undefined' && map) map.flyTo([${c.lat}, ${c.lng}], 11);">
              🗺️ Map
            </button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function copyHelplineNumber(num) {
  navigator.clipboard.writeText(num).then(() => {
    if (typeof showToast === 'function') showToast(`Copied ${num} to clipboard!`, 'success');
  });
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
