/**
 * ========================================================================================
 * FloodWatch India - Live Satellite Radar Map Module
 * ESRI Satellite tiles, dynamic persistent Heatmap, District/Area popups, GeoJSON boundaries
 * ========================================================================================
 */

let PREDS = {};
let currentLiveTelemetry = null;
let userLocation = null;
let userMarker = null;
let userAccuracyCircle = null;

const RIVER_DATA = {
  'Andaman & Nicobar': 'Kalpong Basin',
  'Andhra Pradesh': 'Krishna & Godavari',
  'Arunachal Pradesh': 'Siang & Subansiri',
  'Assam': 'Brahmaputra & Barak',
  'Bihar': 'Kosi, Gandak & Ganga',
  'Chandigarh': 'Sukhna Choe',
  'Chhattisgarh': 'Mahanadi & Hasdeo',
  'Dadra & Nagar Have': 'Daman Ganga',
  'Daman & Diu': 'Daman Ganga Estuary',
  'Delhi': 'Yamuna River',
  'Goa': 'Mandovi & Zuari',
  'Gujarat': 'Narmada, Tapi & Sabarmati',
  'Haryana': 'Yamuna & Ghaggar',
  'Himachal Pradesh': 'Beas, Sutlej & Ravi',
  'Jammu & Kashmir': 'Jhelum & Chenab',
  'Jharkhand': 'Subarnarekha & Damodar',
  'Karnataka': 'Cauvery & Tungabhadra',
  'Kerala': 'Periyar, Pamba & Bharathapuzha',
  'Ladakh': 'Indus River',
  'Lakshadweep': 'Arabian Sea Atolls',
  'Madhya Pradesh': 'Narmada, Chambal & Betwa',
  'Maharashtra': 'Godavari, Krishna & Konkan',
  'Manipur': 'Imphal & Barak',
  'Meghalaya': 'Umiam & Simsang',
  'Mizoram': 'Tlawng & Kolodyne',
  'Nagaland': 'Dhansiri & Doyang',
  'Odisha': 'Mahanadi & Brahmani',
  'Puducherry': 'Gingee & Sankaraparani',
  'Punjab': 'Sutlej, Beas & Ravi',
  'Rajasthan': 'Chambal & Luni',
  'Sikkim': 'Teesta River',
  'Tamil Nadu': 'Cauvery, Vaigai & Palar',
  'Telangana': 'Godavari & Krishna',
  'Tripura': 'Gumti, Howrah & Manu',
  'Uttar Pradesh': 'Ganga, Yamuna & Ghaghara',
  'Uttarakhand': 'Alaknanda & Bhagirathi',
  'West Bengal': 'Hooghly, Teesta & Damodar'
};

const LAT_LNG = {
  'Andaman & Nicobar': [11.667, 92.736],
  'Andhra Pradesh': [16.506, 80.648],
  'Arunachal Pradesh': [27.1, 93.616],
  'Assam': [26.144, 91.736],
  'Bihar': [25.594, 85.137],
  'Chandigarh': [30.733, 76.779],
  'Chhattisgarh': [21.251, 81.629],
  'Dadra & Nagar Have': [20.276, 73.008],
  'Daman & Diu': [20.428, 72.839],
  'Delhi': [28.613, 77.209],
  'Goa': [15.498, 73.827],
  'Gujarat': [22.258, 71.192],
  'Haryana': [29.058, 76.085],
  'Himachal Pradesh': [31.104, 77.173],
  'Jammu & Kashmir': [34.083, 74.797],
  'Jharkhand': [23.344, 85.309],
  'Karnataka': [14.52, 75.722],
  'Kerala': [10.85, 76.271],
  'Ladakh': [34.152, 77.577],
  'Lakshadweep': [10.566, 72.641],
  'Madhya Pradesh': [23.259, 77.412],
  'Maharashtra': [19.751, 75.713],
  'Manipur': [24.663, 93.906],
  'Meghalaya': [25.578, 91.893],
  'Mizoram': [23.164, 92.937],
  'Nagaland': [26.158, 94.562],
  'Odisha': [20.951, 85.098],
  'Puducherry': [11.941, 79.808],
  'Punjab': [31.147, 75.341],
  'Rajasthan': [27.023, 74.217],
  'Sikkim': [27.533, 88.512],
  'Tamil Nadu': [11.127, 78.656],
  'Telangana': [18.112, 79.019],
  'Tripura': [23.94, 91.988],
  'Uttar Pradesh': [26.846, 80.946],
  'Uttarakhand': [30.066, 79.019],
  'West Bengal': [22.986, 87.855]
};

function getPred(name) {
  if (!name) return null;
  if (PREDS[name]) return PREDS[name];
  const norm = name.toLowerCase().replace(/&/g,'and').replace(/\s+/g,' ').trim();
  for (const [k,v] of Object.entries(PREDS)) {
    if (k.toLowerCase().replace(/&/g,'and').replace(/\s+/g,' ').trim() === norm) return v;
  }
  return null;
}

let map, satLayer, labelsLayer, darkLayer, geoLayer, heatLayer;
let reliefLayerGroup, riskMarkersLayerGroup;
let isDarkBasemap = false;
let isHeatmapVisible = true;

function initMap() {
  const isMobile = window.innerWidth <= 900;

  map = L.map('floodMap', {
    center: isMobile ? [22.5, 79.5] : [22.8, 81.5],
    zoom: isMobile ? 4.3 : 5,
    minZoom: 3.8, maxZoom: 14,
    zoomControl: true,
    attributionControl: false
  });
  map.zoomControl.setPosition('bottomright');

  // High-resolution ESRI World Imagery (Satellite)
  satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19
  }).addTo(map);

  // Boundaries & labels reference layer
  labelsLayer = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19, pane: 'shadowPane'
  }).addTo(map);

  // Dark tactical CartoDB layer (optional toggle)
  darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19, subdomains: 'abcd'
  });

  // Mouse Coordinates Display
  const coordsEl = document.getElementById('mapCoords');
  map.on('mousemove', (e) => {
    if (coordsEl) coordsEl.textContent = `${e.latlng.lat.toFixed(4)}°N  ${e.latlng.lng.toFixed(4)}°E`;
  });

  // Relief Centers Layer
  reliefLayerGroup = L.layerGroup().addTo(map);
  riskMarkersLayerGroup = L.layerGroup().addTo(map);
  renderReliefMarkersOnMap();

  // Click anywhere on map to inspect district-level ML prediction
  map.on('click', (e) => {
    showAreaOrDistrictPopup(e.latlng);
  });

  // Dynamic heatmap radius adapter — scales radius proportionally so colors never disappear when zooming
  const updateHeatRadius = () => {
    if (!heatLayer) return;
    const z = map.getZoom();
    let r = 10, b = 6;
    if (z >= 13)      { r = 46; b = 26; }
    else if (z >= 11) { r = 36; b = 20; }
    else if (z >= 9)  { r = 26; b = 15; }
    else if (z >= 7)  { r = 18; b = 10; }
    else if (z >= 5)  { r = 12; b = 7; }
    else              { r = 8;  b = 5; }
    heatLayer.setOptions({ radius: r, blur: b, max: 0.85, minOpacity: 0.35 });
    if (typeof heatLayer._redraw === 'function') heatLayer._redraw();
  };
  map.on('zoomend', updateHeatRadius);

  setTimeout(() => {
    if (map) map.invalidateSize();
  }, 250);

  return map;
}

function toggleRadarHeatmap() {
  const btn = document.getElementById('btnToggleHeatmap');
  if (!heatLayer) return;
  if (isHeatmapVisible) {
    map.removeLayer(heatLayer);
    isHeatmapVisible = false;
    if (btn) btn.classList.remove('active');
  } else {
    map.addLayer(heatLayer);
    isHeatmapVisible = true;
    if (btn) btn.classList.add('active');
  }
}

function toggleReliefLayer() {
  const btn = document.getElementById('btnToggleRelief');
  if (!reliefLayerGroup) return;
  if (map.hasLayer(reliefLayerGroup)) {
    map.removeLayer(reliefLayerGroup);
    if (btn) btn.classList.remove('active');
  } else {
    map.addLayer(reliefLayerGroup);
    if (btn) btn.classList.add('active');
  }
}

function toggleMapBasemap() {
  const btn = document.getElementById('btnToggleSatMode');
  if (!isDarkBasemap) {
    map.removeLayer(satLayer);
    map.removeLayer(labelsLayer);
    darkLayer.addTo(map);
    isDarkBasemap = true;
    if (btn) { btn.innerHTML = '🛰️ Satellite'; btn.classList.add('active'); }
  } else {
    map.removeLayer(darkLayer);
    satLayer.addTo(map);
    labelsLayer.addTo(map);
    isDarkBasemap = false;
    if (btn) { btn.innerHTML = '🗺️ Dark Tactical'; btn.classList.remove('active'); }
  }
}

function renderReliefMarkersOnMap() {
  if (!reliefLayerGroup) return;
  reliefLayerGroup.clearLayers();
  const centers = (typeof reliefCenters !== 'undefined') ? reliefCenters : [];
  centers.forEach(c => {
    const markerIcon = L.divIcon({
      className: 'relief-map-pin',
      html: `<div style="background:#10b981; border:2px solid #fff; border-radius:50%; width:16px; height:16px; display:flex; align-items:center; justify-content:center; font-size:9px; box-shadow:0 0 10px #10b981;">🏥</div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    L.marker([c.lat, c.lng], { icon: markerIcon })
      .bindPopup(`
        <div class="pop-wrap" style="min-width:200px;">
          <div style="font-size:12px; font-weight:800; color:#fff;">🏥 ${c.name}</div>
          <div style="font-size:9.5px; color:#94a3b8; margin:3px 0;">${c.type} • ${c.city}</div>
          <div style="font-size:9.5px; color:#10b981; font-weight:700;">Status: ${c.status.toUpperCase()}</div>
          <div style="margin-top:6px; font-size:10px; color:#38bdf8;">📞 Emergency Helpline: <b>${c.contact}</b></div>
        </div>
      `, { className: 'dark-popup' })
      .addTo(reliefLayerGroup);
  });
}

async function loadPredictions() {
  try {
    const fileRes = await fetch('state_predictions.json?t=' + Date.now(), { cache: 'no-store' });
    if (fileRes.ok) {
      const raw = await fileRes.json();
      PREDS = raw.states || raw;
      const updatedEl = document.getElementById('predUpdatedAt');
      if (updatedEl) updatedEl.textContent = 'ML Models';
    }
  } catch (err) {
    console.warn('state_predictions.json not loaded:', err);
  }

  try {
    const liveRes = await fetch(`${ML_API_BASE}/map-predictions?t=` + Date.now(), { cache: 'no-store' });
    if (liveRes.ok) {
      const live = await liveRes.json();
      if (live.states) {
        PREDS = live.states;
        const updatedEl = document.getElementById('predUpdatedAt');
        if (updatedEl) updatedEl.textContent = 'Live Weather + ML';
      }
    }
  } catch (err) {
    console.warn('FastAPI live heatmap deferred, using trained models:', err.message);
  }

  buildRadarLayers();
  loadGeoJsonBoundaries();
  renderRiskMarkersOnMap();
}

const DISTRICT_HUBS = [
  // Jharkhand
  { name: 'Ranchi', state: 'Jharkhand', lat: 23.344, lon: 85.309, river: 'Subarnarekha River Basin' },
  { name: 'East Singhbhum (Jamshedpur)', state: 'Jharkhand', lat: 22.804, lon: 86.202, river: 'Subarnarekha & Kharkai' },
  { name: 'Dhanbad', state: 'Jharkhand', lat: 23.795, lon: 86.430, river: 'Damodar River Basin' },
  { name: 'Bokaro', state: 'Jharkhand', lat: 23.669, lon: 86.151, river: 'Damodar & Konar River' },
  { name: 'Deoghar', state: 'Jharkhand', lat: 24.482, lon: 86.700, river: 'Ajay & Mayurakshi Basin' },
  { name: 'Hazaribagh', state: 'Jharkhand', lat: 23.993, lon: 85.364, river: 'Konar & Barakar Catchment' },
  { name: 'Giridih', state: 'Jharkhand', lat: 24.186, lon: 86.307, river: 'Barakar & Usri Basin' },
  { name: 'Dumka', state: 'Jharkhand', lat: 24.269, lon: 87.249, river: 'Mayurakshi River Basin' },
  { name: 'West Singhbhum (Chaibasa)', state: 'Jharkhand', lat: 22.553, lon: 85.807, river: 'Roro & Karo River Basin' },
  { name: 'Palamu (Daltonganj)', state: 'Jharkhand', lat: 24.037, lon: 84.072, river: 'North Koel River Basin' },
  { name: 'Ramgarh', state: 'Jharkhand', lat: 23.628, lon: 85.516, river: 'Damodar River' },
  { name: 'Sahibganj', state: 'Jharkhand', lat: 25.244, lon: 87.644, river: 'Ganga River Basin' },
  { name: 'Godda', state: 'Jharkhand', lat: 24.827, lon: 87.213, river: 'Kajhia & Gerua Basin' },
  { name: 'Koderma', state: 'Jharkhand', lat: 24.467, lon: 85.594, river: 'Tilaiya Reservoir Catchment' },
  { name: 'Chatra', state: 'Jharkhand', lat: 24.208, lon: 84.872, river: 'Barakar Tributaries' },
  { name: 'Garhwa', state: 'Jharkhand', lat: 24.181, lon: 83.805, river: 'Son & Kanhar River' },
  { name: 'Latehar', state: 'Jharkhand', lat: 23.743, lon: 84.498, river: 'Auranga & North Koel' },
  { name: 'Simdega', state: 'Jharkhand', lat: 22.617, lon: 84.507, river: 'Sankh River Basin' },
  { name: 'Khunti', state: 'Jharkhand', lat: 23.072, lon: 85.278, river: 'Karo & Tajna Basin' },
  { name: 'Gumla', state: 'Jharkhand', lat: 23.044, lon: 84.542, river: 'South Koel Basin' },
  { name: 'Lohardaga', state: 'Jharkhand', lat: 23.435, lon: 84.681, river: 'South Koel River' },
  { name: 'Pakur', state: 'Jharkhand', lat: 24.633, lon: 87.848, river: 'Bansloi & Torai Basin' },
  { name: 'Jamtara', state: 'Jharkhand', lat: 23.961, lon: 86.802, river: 'Ajay River Basin' },
  { name: 'Saraikela Kharsawan', state: 'Jharkhand', lat: 22.700, lon: 85.930, river: 'Kharkai River' },

  // Bihar
  { name: 'Patna', state: 'Bihar', lat: 25.594, lon: 85.137, river: 'Ganga, Son & Punpun' },
  { name: 'Gaya', state: 'Bihar', lat: 24.795, lon: 85.000, river: 'Falgu River Basin' },
  { name: 'Bhagalpur', state: 'Bihar', lat: 25.242, lon: 86.984, river: 'Ganga River Basin' },
  { name: 'Muzaffarpur', state: 'Bihar', lat: 26.120, lon: 85.364, river: 'Burhi Gandak River' },
  { name: 'Darbhanga', state: 'Bihar', lat: 26.154, lon: 85.891, river: 'Bagmati & Kamla Balan' },
  { name: 'Purnia', state: 'Bihar', lat: 25.777, lon: 87.475, river: 'Kosi River Floodplain' },
  { name: 'Saharsa', state: 'Bihar', lat: 25.883, lon: 86.600, river: 'Kosi River Floodplain' },
  { name: 'Munger', state: 'Bihar', lat: 25.375, lon: 86.473, river: 'Ganga River Basin' },
  { name: 'Katihar', state: 'Bihar', lat: 25.541, lon: 87.573, river: 'Mahananda & Ganga' },
  { name: 'Saran (Chapra)', state: 'Bihar', lat: 25.784, lon: 84.727, river: 'Ganga & Ghaghara' },
  { name: 'Bhojpur (Arrah)', state: 'Bihar', lat: 25.556, lon: 84.664, river: 'Ganga & Son Basin' },

  // Uttar Pradesh
  { name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.317, lon: 82.973, river: 'Ganga & Varuna' },
  { name: 'Gorakhpur', state: 'Uttar Pradesh', lat: 26.760, lon: 83.373, river: 'Rapti & Rohini Basin' },
  { name: 'Prayagraj', state: 'Uttar Pradesh', lat: 25.435, lon: 81.846, river: 'Ganga & Yamuna Sangam' },
  { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.846, lon: 80.946, river: 'Gomti River Basin' },
  { name: 'Kanpur', state: 'Uttar Pradesh', lat: 26.449, lon: 80.331, river: 'Ganga River Basin' },
  { name: 'Ayodhya', state: 'Uttar Pradesh', lat: 26.792, lon: 82.199, river: 'Saryu River Basin' },
  { name: 'Bareilly', state: 'Uttar Pradesh', lat: 28.367, lon: 79.430, river: 'Ramganga Basin' },
  { name: 'Agra', state: 'Uttar Pradesh', lat: 27.176, lon: 78.008, river: 'Yamuna River Basin' },
  { name: 'Mirzapur', state: 'Uttar Pradesh', lat: 25.133, lon: 82.564, river: 'Ganga River Basin' },

  // West Bengal
  { name: 'Kolkata', state: 'West Bengal', lat: 22.572, lon: 88.363, river: 'Hooghly Estuary' },
  { name: 'Asansol (Paschim Bardhaman)', state: 'West Bengal', lat: 23.673, lon: 86.952, river: 'Damodar & Ajay Basin' },
  { name: 'Durgapur', state: 'West Bengal', lat: 23.520, lon: 87.311, river: 'Damodar Barrage' },
  { name: 'Siliguri (Darjeeling)', state: 'West Bengal', lat: 26.727, lon: 88.395, river: 'Mahananda & Teesta' },
  { name: 'Howrah', state: 'West Bengal', lat: 22.595, lon: 88.263, river: 'Hooghly & Damodar' },
  { name: 'Malda', state: 'West Bengal', lat: 25.007, lon: 88.145, river: 'Ganga & Mahananda' },
  { name: 'Jalpaiguri', state: 'West Bengal', lat: 26.541, lon: 88.719, river: 'Teesta & Jaldhaka' },
  { name: 'Paschim Medinipur', state: 'West Bengal', lat: 22.339, lon: 87.324, river: 'Kangsabati & Subarnarekha' },

  // Assam & Northeast
  { name: 'Kamrup Metro (Guwahati)', state: 'Assam', lat: 26.144, lon: 91.736, river: 'Brahmaputra River' },
  { name: 'Dibrugarh', state: 'Assam', lat: 27.472, lon: 94.912, river: 'Brahmaputra & Burhi Dihing' },
  { name: 'Cachar (Silchar)', state: 'Assam', lat: 24.833, lon: 92.778, river: 'Barak River Basin' },
  { name: 'Jorhat', state: 'Assam', lat: 26.750, lon: 94.216, river: 'Brahmaputra & Bhogdoi' },
  { name: 'Sonitpur (Tezpur)', state: 'Assam', lat: 26.633, lon: 92.800, river: 'Brahmaputra & Jia Bharali' },
  { name: 'Barpeta', state: 'Assam', lat: 26.321, lon: 91.006, river: 'Brahmaputra & Manas' },
  { name: 'Dhubri', state: 'Assam', lat: 26.020, lon: 89.970, river: 'Brahmaputra & Gangadhar' },

  // Odisha
  { name: 'Khordha (Bhubaneswar)', state: 'Odisha', lat: 20.296, lon: 85.824, river: 'Kuakhai & Daya Basin' },
  { name: 'Cuttack', state: 'Odisha', lat: 20.462, lon: 85.882, river: 'Mahanadi & Kathajodi' },
  { name: 'Sundargarh (Rourkela)', state: 'Odisha', lat: 22.260, lon: 84.853, river: 'Brahmani & Koel' },
  { name: 'Puri', state: 'Odisha', lat: 19.813, lon: 85.831, river: 'Bhargavi & Daya' },
  { name: 'Balasore', state: 'Odisha', lat: 21.493, lon: 86.933, river: 'Subarnarekha & Budhabalanga' },
  { name: 'Sambalpur', state: 'Odisha', lat: 21.466, lon: 83.981, river: 'Hirakud Dam / Mahanadi' },

  // Maharashtra
  { name: 'Mumbai City & Suburban', state: 'Maharashtra', lat: 19.076, lon: 72.877, river: 'Mithi River & Coastal Creek' },
  { name: 'Pune', state: 'Maharashtra', lat: 18.520, lon: 73.856, river: 'Mula & Mutha Basin' },
  { name: 'Nagpur', state: 'Maharashtra', lat: 21.145, lon: 79.088, river: 'Nag & Kanhan Basin' },
  { name: 'Nashik', state: 'Maharashtra', lat: 19.997, lon: 73.789, river: 'Godavari River Basin' },
  { name: 'Kolhapur', state: 'Maharashtra', lat: 16.705, lon: 74.243, river: 'Panchganga Basin' },
  { name: 'Thane', state: 'Maharashtra', lat: 19.218, lon: 72.978, river: 'Ulhas & Vaitarna' },

  // Gujarat
  { name: 'Ahmedabad', state: 'Gujarat', lat: 23.022, lon: 72.571, river: 'Sabarmati River Basin' },
  { name: 'Surat', state: 'Gujarat', lat: 21.170, lon: 72.831, river: 'Tapi River Basin' },
  { name: 'Vadodara', state: 'Gujarat', lat: 22.307, lon: 73.181, river: 'Vishwamitri River' },
  { name: 'Bharuch', state: 'Gujarat', lat: 21.705, lon: 72.995, river: 'Narmada Estuary' },
  { name: 'Rajkot', state: 'Gujarat', lat: 22.303, lon: 70.802, river: 'Aji & Nyari Basin' },

  // Kerala
  { name: 'Ernakulam (Kochi)', state: 'Kerala', lat: 9.931, lon: 76.267, river: 'Periyar & Muvattupuzha' },
  { name: 'Thiruvananthapuram', state: 'Kerala', lat: 8.524, lon: 76.936, river: 'Karamana & Neyyar' },
  { name: 'Kozhikode', state: 'Kerala', lat: 11.258, lon: 75.780, river: 'Chaliyar River Basin' },
  { name: 'Wayanad', state: 'Kerala', lat: 11.685, lon: 76.132, river: 'Kabini River Basin' },
  { name: 'Alappuzha', state: 'Kerala', lat: 9.498, lon: 76.338, river: 'Kuttanad & Pamba Basin' },
  { name: 'Idukki', state: 'Kerala', lat: 9.850, lon: 76.971, river: 'Periyar / Idukki Dam' },

  // South & Central Hubs
  { name: 'Bengaluru Urban', state: 'Karnataka', lat: 12.971, lon: 77.594, river: 'Vrishabhavathi Basin' },
  { name: 'Dakshina Kannada (Mangaluru)', state: 'Karnataka', lat: 12.914, lon: 74.856, river: 'Netravati & Gurupura' },
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.082, lon: 80.270, river: 'Adyar & Cooum Basin' },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.385, lon: 78.486, river: 'Musi River Basin' },
  { name: 'Krishna (Vijayawada)', state: 'Andhra Pradesh', lat: 16.506, lon: 80.648, river: 'Prakasam Barrage / Krishna' },
  { name: 'New Delhi', state: 'Delhi', lat: 28.613, lon: 77.209, river: 'Yamuna River Basin' },
  { name: 'Dehradun', state: 'Uttarakhand', lat: 30.316, lon: 78.032, river: 'Ganga & Tons Catchment' },
  { name: 'Haridwar', state: 'Uttarakhand', lat: 29.945, lon: 78.164, river: 'Ganga River Basin' },
  { name: 'Shimla', state: 'Himachal Pradesh', lat: 31.104, lon: 77.173, river: 'Sutlej & Giri Basin' },
  { name: 'Kullu', state: 'Himachal Pradesh', lat: 31.957, lon: 77.109, river: 'Beas River Valley' },
  { name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.259, lon: 77.412, river: 'Betwa & Kaliasot Basin' },
  { name: 'Jabalpur', state: 'Madhya Pradesh', lat: 23.181, lon: 79.986, river: 'Narmada Basin / Bargi Dam' }
];

function findNearestDistrict(lat, lon) {
  let nearest = null;
  let minDist = Infinity;
  for (const d of DISTRICT_HUBS) {
    const dist = (d.lat - lat) ** 2 + (d.lon - lon) ** 2;
    if (dist < minDist) {
      minDist = dist;
      nearest = d;
    }
  }
  if (minDist <= 0.72) return nearest;
  return null;
}


// ═══════════════════════════════════════════════════════════════════════════════
// SPECIFIC VULNERABLE FLOOD ZONES (Rivers, Dams, Below-Level Lands)
// Persists at all zoom levels without disappearing or coloring entire states red
// ═══════════════════════════════════════════════════════════════════════════════
const VULNERABLE_FLOOD_ZONES = [
  // ── RIVERS & WATERWAY BASINS ──
  { name: 'Brahmaputra River Corridor', state: 'Assam', type: 'river', typeLabel: 'River Basin Corridor', icon: '🌊', lat: 26.144, lon: 91.736, radiusMeters: 28000, desc: 'Brahmaputra main channel & seasonal alluvial floodplain' },
  { name: 'Barak Valley Basin', state: 'Assam', type: 'river', typeLabel: 'River Basin Corridor', icon: '🌊', lat: 24.833, lon: 92.778, radiusMeters: 22000, desc: 'Barak River catchment & low-lying Cachar basin' },
  { name: 'Kosi River Floodplain', state: 'Bihar', type: 'river', typeLabel: 'River Basin Corridor', icon: '🌊', lat: 25.930, lon: 86.600, radiusMeters: 28000, desc: 'Kosi River avulsion belt & Supaul/Saharsa alluvial lowlands' },
  { name: 'Ganga-Gandak Confluence', state: 'Bihar', type: 'river', typeLabel: 'River Basin Corridor', icon: '🌊', lat: 25.680, lon: 85.220, radiusMeters: 24000, desc: 'Ganga & Gandak confluence zone at Hajipur/Patna' },
  { name: 'Yamuna River Corridor', state: 'Delhi', type: 'river', typeLabel: 'River Basin Corridor', icon: '🌊', lat: 28.660, lon: 77.250, radiusMeters: 18000, desc: 'Yamuna River floodplain & Old Railway Bridge low-lying banks' },
  { name: 'Godavari River Delta', state: 'Andhra Pradesh', type: 'river', typeLabel: 'River Basin Corridor', icon: '🌊', lat: 16.989, lon: 81.784, radiusMeters: 26000, desc: 'Godavari River estuary & Dowleswaram barrage flood plain' },
  { name: 'Krishna River Basin', state: 'Andhra Pradesh', type: 'river', typeLabel: 'River Basin Corridor', icon: '🌊', lat: 16.506, lon: 80.648, radiusMeters: 24000, desc: 'Krishna River flood corridor & Prakasam Barrage zone' },
  { name: 'Mahanadi River Channel', state: 'Odisha', type: 'river', typeLabel: 'River Basin Corridor', icon: '🌊', lat: 20.462, lon: 85.882, radiusMeters: 25000, desc: 'Mahanadi River delta & Cuttack flood embankments' },
  { name: 'Narmada Estuary Corridor', state: 'Gujarat', type: 'river', typeLabel: 'River Basin Corridor', icon: '🌊', lat: 21.705, lon: 72.995, radiusMeters: 24000, desc: 'Narmada River estuary & Bharuch tidal basin' },
  { name: 'Tapi River Basin', state: 'Gujarat', type: 'river', typeLabel: 'River Basin Corridor', icon: '🌊', lat: 21.170, lon: 72.831, radiusMeters: 22000, desc: 'Tapi River lower catchment & Surat coastal flood plain' },
  { name: 'Periyar & Pamba River Basin', state: 'Kerala', type: 'river', typeLabel: 'River Basin Corridor', icon: '🌊', lat: 9.931, lon: 76.267, radiusMeters: 24000, desc: 'Periyar River valley & Aluva/Kochi catchment basin' },
  { name: 'Cauvery Delta Lowlands', state: 'Tamil Nadu', type: 'river', typeLabel: 'River Basin Corridor', icon: '🌊', lat: 10.790, lon: 79.137, radiusMeters: 26000, desc: 'Cauvery River delta & Thanjavur alluvial irrigation basin' },
  { name: 'Hooghly & Damodar Confluence', state: 'West Bengal', type: 'river', typeLabel: 'River Basin Corridor', icon: '🌊', lat: 22.400, lon: 88.240, radiusMeters: 26000, desc: 'Hooghly River tidal basin & Howrah/Kolkata lowlands' },
  { name: 'Teesta River Basin', state: 'West Bengal', type: 'river', typeLabel: 'River Basin Corridor', icon: '🌊', lat: 26.727, lon: 88.395, radiusMeters: 22000, desc: 'Teesta River downstream corridor & Jalpaiguri flood plain' },
  { name: 'Harike Wetland (Sutlej & Beas)', state: 'Punjab', type: 'river', typeLabel: 'River Basin Corridor', icon: '🌊', lat: 31.170, lon: 74.950, radiusMeters: 24000, desc: 'Beas & Sutlej river confluence & wetland floodplain' },

  // ── DAMS & OVERFLOW RESERVOIRS ──
  { name: 'Hirakud Dam Catchment', state: 'Odisha', type: 'dam', typeLabel: 'Dam & Reservoir Zone', icon: '🏛️', lat: 21.570, lon: 83.870, radiusMeters: 20000, desc: 'Mahanadi River — Largest earthen dam in India (5,896 MCM)' },
  { name: 'Tehri Dam Catchment', state: 'Uttarakhand', type: 'dam', typeLabel: 'Dam & Reservoir Zone', icon: '🏛️', lat: 30.378, lon: 78.480, radiusMeters: 18000, desc: 'Bhagirathi River — High-altitude reservoir (3,540 MCM)' },
  { name: 'Sardar Sarovar Dam', state: 'Gujarat', type: 'dam', typeLabel: 'Dam & Reservoir Zone', icon: '🏛️', lat: 21.831, lon: 73.748, radiusMeters: 22000, desc: 'Narmada River — Major gravity dam & spillway channel (9,500 MCM)' },
  { name: 'Bhakra Nangal Dam', state: 'Himachal Pradesh', type: 'dam', typeLabel: 'Dam & Reservoir Zone', icon: '🏛️', lat: 31.410, lon: 76.435, radiusMeters: 20000, desc: 'Sutlej River — Govind Sagar reservoir overflow corridor (9,340 MCM)' },
  { name: 'Idukki Dam Reservoir', state: 'Kerala', type: 'dam', typeLabel: 'Dam & Reservoir Zone', icon: '🏛️', lat: 9.849, lon: 76.974, radiusMeters: 20000, desc: 'Periyar River — Double curvature arch dam spillway corridor' },
  { name: 'Nagarjuna Sagar Dam', state: 'Telangana', type: 'dam', typeLabel: 'Dam & Reservoir Zone', icon: '🏛️', lat: 16.575, lon: 79.313, radiusMeters: 22000, desc: 'Krishna River — Massive storage reservoir & spillway buffer' },
  { name: 'Koyna Dam Reservoir', state: 'Maharashtra', type: 'dam', typeLabel: 'Dam & Reservoir Zone', icon: '🏛️', lat: 17.400, lon: 73.750, radiusMeters: 20000, desc: 'Koyna River — Shivajisagar lake dam corridor (2,797 MCM)' },
  { name: 'Mettur Dam (Stanley Reservoir)', state: 'Tamil Nadu', type: 'dam', typeLabel: 'Dam & Reservoir Zone', icon: '🏛️', lat: 11.800, lon: 77.800, radiusMeters: 20000, desc: 'Cauvery River — Primary Tamil Nadu reservoir (2,646 MCM)' },
  { name: 'Maithon & Panchet Dams', state: 'Jharkhand', type: 'dam', typeLabel: 'Dam & Reservoir Zone', icon: '🏛️', lat: 23.780, lon: 86.810, radiusMeters: 20000, desc: 'Damodar Valley Corporation flood moderation reservoirs' },

  // ── LOW-LYING LANDS & DEPRESSIONS ──
  { name: 'Kuttanad Below-Sea-Level Lowlands', state: 'Kerala', type: 'lowland', typeLabel: 'Low-Lying Terrain Depression', icon: '📉', lat: 9.498, lon: 76.338, radiusMeters: 24000, desc: 'Lowest altitude in India (1.5m to 2m below sea level) — high waterlogging risk' },
  { name: 'North Bihar Alluvial Depression', state: 'Bihar', type: 'lowland', typeLabel: 'Low-Lying Terrain Depression', icon: '📉', lat: 26.154, lon: 85.891, radiusMeters: 28000, desc: 'Darbhanga & Madhubani low-lying alluvial depression zone' },
  { name: 'Majuli Riverine Island Lowlands', state: 'Assam', type: 'lowland', typeLabel: 'Low-Lying Terrain Depression', icon: '📉', lat: 26.950, lon: 94.200, radiusMeters: 24000, desc: 'World’s largest inhabited river island — vulnerable to seasonal bank overflow' },
  { name: 'Sundarbans Coastal Lowlands', state: 'West Bengal', type: 'lowland', typeLabel: 'Low-Lying Terrain Depression', icon: '📉', lat: 21.949, lon: 88.899, radiusMeters: 26000, desc: 'Tidal mangrove lowlands & coastal embankment storm surge vulnerability' },
  { name: 'Mithi River Urban Estuary', state: 'Maharashtra', type: 'lowland', typeLabel: 'Low-Lying Terrain Depression', icon: '📉', lat: 19.076, lon: 72.877, radiusMeters: 18000, desc: 'Mumbai low-lying storm drainage bottleneck & Kurla/Kalina flood plain' },
  { name: 'Surat Coastal Alluvial Lowlands', state: 'Gujarat', type: 'lowland', typeLabel: 'Low-Lying Terrain Depression', icon: '📉', lat: 21.150, lon: 72.810, radiusMeters: 20000, desc: 'Low-lying coastal alluvial plain susceptible to tidal backwater surge' }
];

function renderRiskMarkersOnMap() {
  if (!map || !riskMarkersLayerGroup) return;
  riskMarkersLayerGroup.clearLayers();

  // Render specific vulnerable flood zones with accurate live calculations:
  // 🔴 RED: High Flood Risk (overflows, heavy live rain >= 55mm, prob >= 65%)
  // 🟡 YELLOW: Moderate Flood Watch (rain 20-55mm, prob 25-65%)
  // 🟢 GREEN: Low Risk / Safe (rain < 20mm, normal hydrological flow)
  VULNERABLE_FLOOD_ZONES.forEach(zone => {
    const pred = getPred(zone.state);
    const prob = pred ? (Number(pred.probability) || 0) : 0.02;
    const rain = pred ? (Number(pred.rainfall_24h_mm) || 0) : 0;

    const isHigh = prob >= 0.65 || rain >= 55.0;
    const isMed = !isHigh && (prob >= 0.25 || rain >= 20.0);

    const color = isHigh ? '#ef4444' : (isMed ? '#facc15' : '#10b981');
    const statusLabel = isHigh ? '🔴 HIGH FLOOD RISK' : (isMed ? '🟡 MODERATE WATCH' : '🟢 SAFE (NORMAL)');
    const fillOpacity = isHigh ? 0.38 : (isMed ? 0.28 : 0.20);

    // Geographic circle in meters: persists perfectly at every zoom level without disappearing!
    const circle = L.circle([zone.lat, zone.lon], {
      radius: zone.radiusMeters,
      color: color,
      weight: isHigh ? 2.5 : 1.5,
      opacity: 0.85,
      fillColor: color,
      fillOpacity: fillOpacity
    });

    const popupContent = `
      <div class="pop-wrap" style="min-width:250px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
          <span style="font-size:12px; font-weight:800; color:#fff;">${zone.icon} ${zone.name}</span>
          <span class="pop-badge" style="background:${color}22; color:${color}; border:1px solid ${color}; font-size:9px; padding:2px 6px;">${isHigh ? 'HIGH RISK' : (isMed ? 'WATCH' : 'SAFE')}</span>
        </div>
        <div style="font-size:9.5px; color:#38bdf8; margin-bottom:6px;">${zone.typeLabel} • ${zone.state}</div>
        <div style="font-size:9px; color:#94a3b8; line-height:1.35; margin-bottom:8px;">${zone.desc}</div>

        <div style="background:rgba(0,0,0,0.4); padding:6px; border-radius:4px; font-size:10px; margin-bottom:8px; border:1px solid rgba(255,255,255,0.06);">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; font-size:9.5px; color:#cbd5e1;">
            <div>🌧️ Live Rain: <b style="color:#38bdf8;">${rain.toFixed(1)} mm</b></div>
            <div>🎯 ML Risk: <b style="color:${color};">${(prob * 100).toFixed(1)}%</b></div>
          </div>
          <div style="margin-top:4px; font-size:9px; color:${color}; font-weight:700;">Status: ${statusLabel}</div>
        </div>

        <button class="btn-pop-action btn-pop-pdf" style="width:100%;" onclick="downloadDistrictRiskReportPDF('${zone.name}', '${zone.state}', ${zone.lat}, ${zone.lon})">
          📄 Download ${zone.name} Safety Report (PDF)
        </button>
      </div>
    `;

    circle.bindPopup(popupContent, { maxWidth: 300 });
    circle.bindTooltip(`<b>${zone.name}</b> — ${statusLabel}`, { sticky: true, direction: 'top' });
    circle.addTo(riskMarkersLayerGroup);
  });
}

/**
 * WATERWAY_HOTSPOTS: Precise lat/lon of river channels, dam zones, and low-lying
 * flood-prone corridors. Each entry has:
 *   state  — must match the key used in PREDS / state_predictions.json
 *   pts    — [[lat, lon, intensity], …]  (intensity 0.70–1.0 = channel core / RED)
 *            (intensity 0.30–0.45 = immediate bank buffer / YELLOW)
 *   thresh — minimum probability from live prediction before ANY point is shown
 */
const WATERWAY_HOTSPOTS = [

  // ── ASSAM – Brahmaputra channel & Barak valley ─────────────────────────────
  { state: 'Assam', thresh: 0.50, pts: [
    // Brahmaputra main channel (west→east)
    [26.018, 89.984, 0.92], [26.144, 91.736, 1.00], [26.180, 91.600, 0.96],
    [26.220, 91.850, 0.96], [26.350, 92.680, 0.98], [26.634, 92.793, 1.00],
    [26.580, 93.170, 0.97], [26.750, 94.216, 0.95], [27.472, 94.912, 0.93],
    // Barak valley
    [24.833, 92.778, 0.90],
    // Immediate bank buffer (YELLOW)
    [26.144, 91.650, 0.38], [26.144, 91.820, 0.36], [26.350, 92.580, 0.37],
    [26.634, 92.900, 0.38], [26.750, 94.100, 0.35]
  ]},

  // ── BIHAR – Kosi, Gandak & Ganga floodplain ────────────────────────────────
  { state: 'Bihar', thresh: 0.50, pts: [
    // Kosi corridor (most flood-prone in India)
    [25.930, 86.600, 0.97], [26.120, 86.600, 0.95], [26.154, 85.891, 0.92],
    [25.777, 87.475, 0.95], [25.540, 87.570, 0.93],
    // Ganga main channel
    [25.594, 85.137, 0.88], [25.242, 86.984, 0.86],
    // Immediate bank buffer (YELLOW)
    [25.930, 86.500, 0.36], [25.930, 86.700, 0.35],
    [26.120, 86.500, 0.34], [25.777, 87.375, 0.36]
  ]},

  // ── WEST BENGAL – Hooghly estuary & Teesta ─────────────────────────────────
  { state: 'West Bengal', thresh: 0.55, pts: [
    [22.572, 88.363, 0.90], [22.595, 88.263, 0.88], [22.400, 88.240, 0.85],
    [26.727, 88.395, 0.88], [26.541, 88.719, 0.86],
    // Buffer
    [22.572, 88.250, 0.35], [22.572, 88.470, 0.34]
  ]},

  // ── MAHARASHTRA – Mithi river (Mumbai), Panchganga, Godavari ───────────────
  { state: 'Maharashtra', thresh: 0.55, pts: [
    // Mithi river channel (Mumbai flood corridor)
    [19.076, 72.877, 0.93], [19.100, 72.895, 0.90], [19.050, 72.860, 0.88],
    // Panchganga (Kolhapur)
    [16.705, 74.243, 0.90], [16.680, 74.220, 0.86],
    // Godavari near Nashik
    [19.997, 73.789, 0.82],
    // Mula-Mutha (Pune)
    [18.520, 73.856, 0.78],
    // Buffer
    [19.076, 72.820, 0.36], [19.076, 72.930, 0.35],
    [16.705, 74.170, 0.34]
  ]},

  // ── GUJARAT – Tapi & Sabarmati ──────────────────────────────────────────────
  { state: 'Gujarat', thresh: 0.55, pts: [
    // Tapi river Surat
    [21.170, 72.831, 0.92], [21.150, 72.810, 0.88],
    // Sabarmati Ahmedabad
    [23.022, 72.571, 0.82], [23.050, 72.590, 0.78],
    // Narmada estuary
    [21.705, 72.995, 0.80],
    // Buffer
    [21.170, 72.780, 0.35], [21.170, 72.880, 0.34]
  ]},

  // ── KERALA – Periyar, Pamba, Chalakudy ─────────────────────────────────────
  { state: 'Kerala', thresh: 0.55, pts: [
    // Periyar / Idukki dam tail
    [9.850, 76.971, 0.92], [9.931, 76.267, 0.88],
    // Pamba – Kuttanad (below sea level)
    [9.498, 76.338, 0.95], [9.480, 76.300, 0.90],
    // Chaliyar
    [11.258, 75.780, 0.82],
    // Buffer
    [9.498, 76.270, 0.36], [9.498, 76.400, 0.35]
  ]},

  // ── ODISHA – Mahanadi & Brahmani delta ─────────────────────────────────────
  { state: 'Odisha', thresh: 0.55, pts: [
    // Mahanadi – Kathajodi split near Cuttack
    [20.462, 85.882, 0.93], [20.296, 85.824, 0.88],
    // Hirakud reservoir downstream
    [21.466, 83.981, 0.82],
    // Subarnarekha Balasore
    [21.493, 86.933, 0.80],
    // Buffer
    [20.462, 85.800, 0.34], [20.462, 85.960, 0.34]
  ]},

  // ── UTTAR PRADESH – Ganga, Yamuna Sangam, Rapti, Ghaghra ──────────────────
  { state: 'Uttar Pradesh', thresh: 0.55, pts: [
    // Prayagraj Sangam
    [25.435, 81.846, 0.92],
    // Varanasi Ganga
    [25.317, 82.973, 0.88],
    // Gorakhpur – Rapti
    [26.760, 83.373, 0.82],
    // Buffer
    [25.435, 81.780, 0.34], [25.317, 82.900, 0.33]
  ]},

  // ── ANDHRA PRADESH – Krishna / Prakasam barrage ────────────────────────────
  { state: 'Andhra Pradesh', thresh: 0.55, pts: [
    [16.506, 80.648, 0.90], [16.480, 80.620, 0.85],
    [16.506, 80.580, 0.34], [16.506, 80.710, 0.33]
  ]},

  // ── TELANGANA – Musi river / Hussain Sagar ─────────────────────────────────
  { state: 'Telangana', thresh: 0.55, pts: [
    [17.385, 78.486, 0.82], [17.380, 78.500, 0.76],
    [17.385, 78.430, 0.33]
  ]},

  // ── UTTARAKHAND – Ganga upper reaches / cloudbursts ───────────────────────
  { state: 'Uttarakhand', thresh: 0.60, pts: [
    [29.945, 78.164, 0.92], // Haridwar Ganga
    [30.316, 78.032, 0.82],
    [29.945, 78.100, 0.35], [29.945, 78.220, 0.34]
  ]},

  // ── HIMACHAL PRADESH – Beas / Sutlej cloudbursts ──────────────────────────
  { state: 'Himachal Pradesh', thresh: 0.60, pts: [
    [31.957, 77.109, 0.85], // Kullu Beas valley
    [31.104, 77.173, 0.78],
    [31.957, 77.050, 0.34]
  ]},

  // ── PUNJAB – Sutlej / Beas ─────────────────────────────────────────────────
  { state: 'Punjab', thresh: 0.55, pts: [
    [30.900, 75.850, 0.85],
    [30.730, 76.330, 0.80],
    [30.900, 75.780, 0.33]
  ]},

  // ── JHARKHAND – Subarnarekha / Damodar ────────────────────────────────────
  { state: 'Jharkhand', thresh: 0.55, pts: [
    [22.804, 86.202, 0.85], // Jamshedpur Subarnarekha
    [23.669, 86.151, 0.80], // Bokaro Damodar
    [22.804, 86.140, 0.33]
  ]},

  // ── DELHI – Yamuna flood plain ─────────────────────────────────────────────
  { state: 'Delhi', thresh: 0.60, pts: [
    [28.660, 77.280, 0.90], // Yamuna Pusta
    [28.613, 77.245, 0.85],
    [28.660, 77.230, 0.35], [28.660, 77.330, 0.34]
  ]},

  // ── ARUNACHAL PRADESH – Siang / Subansiri ─────────────────────────────────
  { state: 'Arunachal Pradesh', thresh: 0.55, pts: [
    [27.100, 93.620, 0.88], [27.200, 94.000, 0.84],
    [27.100, 93.550, 0.34]
  ]}
];

function buildRadarLayers() {
  if (!map || typeof L.heatLayer !== 'function') return;
  if (heatLayer) {
    map.removeLayer(heatLayer);
    heatLayer = null;
  }

  const heatPoints = [];

  // Dynamic Multi-Tier Hydrological Risk Rendering:
  // RED 🔴: High flood chance (dam overflow, surging river, low-lying inundation)
  // YELLOW 🟡: Moderate flood watch / elevated catchment rain
  // GREEN 🟢: Normal flow / safe hydrological baseline
  WATERWAY_HOTSPOTS.forEach(({ state, thresh, pts }) => {
    const pred = getPred(state);
    const prob = pred ? (Number(pred.probability) || 0) : 0.02;
    const rain = pred ? (Number(pred.rainfall_24h_mm) || 0) : 0;

    let tierIntensity = 0.28; // Default GREEN (safe)
    if (prob >= 0.65 || rain >= 55.0) {
      tierIntensity = 0.88; // RED (high risk / overflow)
    } else if (prob >= 0.25 || rain >= 20.0) {
      tierIntensity = 0.55; // YELLOW (moderate watch)
    }

    pts.forEach(([lat, lon, baseIntensity]) => {
      // Scale point intensity with actual live conditions
      heatPoints.push([lat, lon, Math.min(0.95, baseIntensity * tierIntensity)]);
    });
  });

  if (!heatPoints.length) return; // Clean satellite map — no active flood risk detected

  const curZoom = map.getZoom ? map.getZoom() : 5;
  let initR = 12, initB = 7;
  if (curZoom >= 13)      { initR = 46; initB = 26; }
  else if (curZoom >= 11) { initR = 36; initB = 20; }
  else if (curZoom >= 9)  { initR = 26; initB = 15; }
  else if (curZoom >= 7)  { initR = 18; initB = 10; }
  else if (curZoom >= 5)  { initR = 12; initB = 7; }

  heatLayer = L.heatLayer(heatPoints, {
    radius: initR,
    blur: initB,
    maxZoom: 16,
    max: 0.85,
    minOpacity: 0.35,
    gradient: {
      0.00: 'transparent',
      0.25: '#10b981',  // Safe / Normal baseline (Green)
      0.55: '#facc15',  // Moderate flood watch (Yellow)
      0.80: '#dc2626'   // River & Dam overflow hazard (Red)
    }
  }).addTo(map);
}

async function loadGeoJsonBoundaries() {
  try {
    const res = await fetch('india_states.json');
    if (res.ok) {
      const geoData = await res.json();
      renderGeoLayer(geoData);
    }
  } catch (e) {
    console.warn('Could not load india_states.json', e);
  }
}

function renderGeoLayer(geoData) {
  if (geoLayer) map.removeLayer(geoLayer);

  // NO yellow or red boundary lines! Completely seamless satellite view.
  geoLayer = L.geoJSON(geoData, {
    style: () => ({
      fillColor: 'transparent',
      fillOpacity: 0.0,
      stroke: false,
      weight: 0
    }),
    onEachFeature: (feature, layer) => {
      const name = feature.properties.ST_NM || 'Region';
      const pred = getPred(name);
      const isHigh = pred && (pred.probability >= 0.65 || pred.risk_level === 'high');
      const isMed = pred && !isHigh && (pred.probability >= 0.25 || pred.risk_level === 'medium');
      const riskLabel = isHigh ? '🔴 High Risk' : (isMed ? '🟡 Medium Risk' : '🟢 Safe (Normal)');

      layer.bindTooltip(
        `<b>${name}</b> — ${riskLabel} <span style="color:#38bdf8; font-size:10px;">(Click for District ML Prediction & PDF)</span>`,
        { sticky: true, direction: 'top' }
      );

      layer.on({
        click(e) {
          L.DomEvent.stopPropagation(e);
          showAreaOrDistrictPopup(e.latlng, name, pred);
        }
      });
    }
  }).addTo(map);
}

function showAreaOrDistrictPopup(latlng, stateHint = null, predHint = null) {
  const lat = Number(latlng.lat);
  const lon = Number(latlng.lng);

  const nearestDist = findNearestDistrict(lat, lon);
  const stateName = stateHint || (nearestDist ? nearestDist.state : (typeof findNearestStateToCoords === 'function' ? findNearestStateToCoords(lat, lon) : 'Delhi'));
  const districtName = nearestDist ? nearestDist.name : 'Local Catchment';
  const riverBasin = (nearestDist && nearestDist.river) ? nearestDist.river : (RIVER_DATA[stateName] || 'Regional Catchment');

  const pred = predHint || getPred(stateName);
  const stateProbStr = pred ? pred.probability_str : '4.0%';
  const stateGuidance = pred ? pred.action_guidance : 'Normal conditions. Standard hydrological monitoring active.';

  const popupId = 'pop-' + Math.random().toString(36).substring(2, 9);

  const html = `
    <div class="pop-wrap" id="${popupId}" style="min-width:280px; max-width:320px;">
      <div class="pop-tab-bar">
        <button class="pop-tab-btn active" id="${popupId}-tab-dist" onclick="togglePopupTab('${popupId}', 'dist')">
          📍 ${districtName} (Area Risk)
        </button>
        <button class="pop-tab-btn" id="${popupId}-tab-state" onclick="togglePopupTab('${popupId}', 'state')">
          🏛️ ${stateName} State
        </button>
      </div>

      <!-- TAB 1: SPECIFIC DISTRICT / AREA PREDICTION -->
      <div id="${popupId}-view-dist">
        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:3px;">
          <div class="pop-state" style="font-size:14px; margin:0;" id="${popupId}-dist-name">📍 ${districtName}</div>
          <span id="${popupId}-dist-badge" class="pop-badge pb-low">CHECKING...</span>
        </div>
        <div style="font-size:9px; color:var(--text-dim); margin-bottom:6px;">
          ${stateName} • <span style="font-family:var(--mono); color:#38bdf8;">${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E</span>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px;">
          <div class="pop-prob-big ppb-low" id="${popupId}-dist-prob">--%</div>
          <div style="font-size:9.5px; font-weight:700; color:var(--text-secondary);" id="${popupId}-dist-category">Calculating Local Risk...</div>
        </div>
        <div style="font-size:8.5px; color:var(--text-dim); margin-bottom:8px;">Live ML Inundation Probability for ${districtName}</div>

        <div class="pop-telemetry-box" style="margin:4px 0 8px 0;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; border-bottom:1px dashed rgba(255,255,255,0.1); padding-bottom:3px;">
            <span style="color:#10b981; font-weight:700; font-size:9px;">📡 Open-Meteo & GloFAS (Point Coords)</span>
            <span id="${popupId}-dist-imd" style="background:#16a34a; color:#fff; font-size:8px; font-weight:800; padding:1px 5px; border-radius:3px;">GREEN SAFE</span>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; font-size:9.5px; color:#cbd5e1;">
            <div>🌧️ Rain: <b id="${popupId}-dist-rain" style="color:#38bdf8;">-- mm</b></div>
            <div>🌊 Flow: <b id="${popupId}-dist-flow" style="color:#38bdf8;">-- m³/s</b></div>
            <div>🌡️ Temp: <b id="${popupId}-dist-temp">--°C</b></div>
            <div>🌱 Soil: <b id="${popupId}-dist-soil">--</b></div>
          </div>
          <div style="margin-top:4px; font-size:8.5px; color:#94a3b8; border-top:1px dashed rgba(255,255,255,0.08); padding-top:3px;">
            River Basin: <b style="color:#e2e8f0;">${riverBasin}</b>
          </div>
        </div>

        <div style="font-size:9px; line-height:1.35; color:#cbd5e1; margin-bottom:8px; background:rgba(255,255,255,0.03); padding:6px; border-radius:4px; border:1px solid rgba(255,255,255,0.05);" id="${popupId}-dist-guidance">
          ⚡ <b>Local Advisory:</b> Hydrological telemetry synchronizing...
        </div>

        <div class="pop-actions-row">
          <button class="btn-pop-action btn-pop-pdf" onclick="downloadDistrictRiskReportPDF('${districtName}', '${stateName}', ${lat}, ${lon})">
            📄 Download ${districtName} Risk Report (PDF)
          </button>
          <button class="btn-pop-action bpa-predict" onclick="selectDistrictInMLPredictor('${stateName}', '${districtName}')">
            📈 Test ${districtName} in ML Predictor
          </button>
        </div>
      </div>

      <!-- TAB 2: OVERALL STATE SUMMARY -->
      <div id="${popupId}-view-state" style="display:none;">
        <div class="pop-state">${stateName}</div>
        <div style="font-size:9px; color:var(--text-dim); margin-bottom:6px;">State-Wide Aggregated Hydrological Assessment</div>
        <div class="pop-prob-big ppb-low" style="margin-bottom:2px;">${stateProbStr}</div>
        <div style="font-size:9px; color:var(--text-dim); margin-bottom:8px;">State Regional Inundation Baseline</div>

        <div class="pop-telemetry-box" style="margin-bottom:8px;">
          <div style="font-size:9px; color:#94a3b8;">Primary River Basin:</div>
          <div style="font-size:11px; font-weight:700; color:#38bdf8; margin:2px 0 4px 0;">${RIVER_DATA[stateName] || 'Regional Catchment'}</div>
          <div style="font-size:8.5px; color:#94a3b8;">Official NDMA & IMD regional warning matrix</div>
        </div>

        <div style="font-size:9px; line-height:1.35; color:#94a3b8; margin-bottom:8px;">
          ⚡ <b>State Guidance:</b> ${stateGuidance}
        </div>

        <div class="pop-actions-row">
          <button class="btn-pop-action bpa-predict" onclick="selectStateInMLPredictor('${stateName}')">
            📈 Open ML Predictor for ${stateName}
          </button>
          <button class="btn-pop-action bpa-history" onclick="filterHistoricalByState('${stateName}')">
            📜 Filter Historical DB (${stateName})
          </button>
        </div>
      </div>
    </div>`;

  L.popup({ maxWidth: 320, closeButton: true })
    .setLatLng(latlng)
    .setContent(html)
    .openOn(map);

  fetchDistrictAreaPrediction(popupId, lat, lon, stateName, districtName);
}

function togglePopupTab(popupId, tab) {
  const distView = document.getElementById(`${popupId}-view-dist`);
  const stateView = document.getElementById(`${popupId}-view-state`);
  const distTab = document.getElementById(`${popupId}-tab-dist`);
  const stateTab = document.getElementById(`${popupId}-tab-state`);

  if (tab === 'dist') {
    if (distView) distView.style.display = 'block';
    if (stateView) stateView.style.display = 'none';
    if (distTab) distTab.classList.add('active');
    if (stateTab) stateTab.classList.remove('active');
  } else {
    if (distView) distView.style.display = 'none';
    if (stateView) stateView.style.display = 'block';
    if (distTab) distTab.classList.remove('active');
    if (stateTab) stateTab.classList.add('active');
  }
}

async function fetchDistrictAreaPrediction(popupId, lat, lon, stateName, districtName) {
  let resolvedData = null;

  try {
    const res = await fetch(`${ML_API_BASE}/predict-location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: lat,
        longitude: lon,
        state_hint: stateName,
        district_hint: districtName
      })
    });

    if (res.ok) {
      resolvedData = await res.json();
    }
  } catch (err) {
    console.warn('FastAPI /predict-location deferred:', err.message);
  }

  // Standalone fallback: Direct Open-Meteo fetch
  if (!resolvedData) {
    try {
      const [wRes, fRes] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,soil_moisture_0_to_1cm&hourly=precipitation&forecast_days=2&timezone=Asia/Kolkata`),
        fetch(`https://flood-api.open-meteo.com/v1/flood?latitude=${lat}&longitude=${lon}&daily=river_discharge&forecast_days=1`)
      ]);
      const wData = wRes.ok ? await wRes.json() : {};
      const fData = fRes.ok ? await fRes.json() : {};
      const cur = wData.current || {};
      const hourlyRain = wData.hourly?.precipitation || [];
      const rain24h = hourlyRain.length ? Number(hourlyRain.slice(0, 24).reduce((a, b) => a + b, 0).toFixed(1)) : (cur.precipitation || 0.0);
      const discharge = fData.daily?.river_discharge?.[0];

      const statePred = getPred(stateName);
      const baseProb = statePred ? Number(statePred.probability) : 0.04;
      const dynamicProb = rain24h <= 5.0 ? baseProb * 0.2 : Math.min(0.99, baseProb * 0.3 + (rain24h / 85.0) * 0.7);

      resolvedData = {
        query: { detected_district: districtName, detected_state: stateName },
        live_weather: {
          current_precipitation_mm: cur.precipitation || 0.0,
          accumulated_24h_rainfall_mm: rain24h,
          temperature_c: cur.temperature_2m || 28.0,
          soil_moisture: cur.soil_moisture_0_to_1cm || 0.28
        },
        river_telemetry: { discharge_m3s: discharge !== undefined ? discharge : null },
        prediction: {
          flood_risk_probability: `${(dynamicProb * 100).toFixed(1)}%`,
          risk_category: dynamicProb >= 0.75 ? 'Extreme High Risk' : (dynamicProb >= 0.50 ? 'High Risk' : (dynamicProb >= 0.25 ? 'Moderate Risk' : 'Low Risk')),
          alert_level: dynamicProb >= 0.75 ? 'RED EMERGENCY' : (dynamicProb >= 0.50 ? 'ORANGE WARNING' : (dynamicProb >= 0.25 ? 'YELLOW WATCH' : 'GREEN SAFE')),
          color_code: dynamicProb >= 0.75 ? '#dc2626' : (dynamicProb >= 0.50 ? '#ea580c' : (dynamicProb >= 0.25 ? '#ca8a04' : '#16a34a')),
          action_guidance: dynamicProb >= 0.50 ? 'Activate local disaster defense teams. Monitor riverbanks.' : 'Standard hydrological observation. Normal flow conditions.'
        },
        imd_alert: {
          level: rain24h >= 115.6 ? 'RED ALERT' : (rain24h >= 64.5 ? 'ORANGE ALERT' : (rain24h >= 15.6 ? 'YELLOW ALERT' : 'GREEN SAFE')),
          color: rain24h >= 115.6 ? '#dc2626' : (rain24h >= 64.5 ? '#ea580c' : (rain24h >= 15.6 ? '#ca8a04' : '#16a34a'))
        }
      };
    } catch (e) {
      console.error('Direct fallback failed:', e);
    }
  }

  if (!resolvedData) return;

  const p = resolvedData.prediction || {};
  const w = resolvedData.live_weather || {};
  const r = resolvedData.river_telemetry || {};
  const imd = resolvedData.imd_alert || {};

  const probVal = parseFloat(p.flood_risk_probability || '5.0');
  const isHigh = probVal >= 75.0;
  const isMed = probVal >= 25.0 && probVal < 75.0;
  const cls = isHigh ? 'high' : (isMed ? 'med' : 'low');

  const badgeEl = document.getElementById(`${popupId}-dist-badge`);
  const probEl = document.getElementById(`${popupId}-dist-prob`);
  const catEl = document.getElementById(`${popupId}-dist-category`);
  const rainEl = document.getElementById(`${popupId}-dist-rain`);
  const flowEl = document.getElementById(`${popupId}-dist-flow`);
  const tempEl = document.getElementById(`${popupId}-dist-temp`);
  const soilEl = document.getElementById(`${popupId}-dist-soil`);
  const imdEl = document.getElementById(`${popupId}-dist-imd`);
  const guidEl = document.getElementById(`${popupId}-dist-guidance`);

  if (badgeEl) {
    badgeEl.textContent = p.alert_level || (isHigh ? 'HIGH RISK' : (isMed ? 'MEDIUM' : 'SAFE'));
    badgeEl.className = `pop-badge pb-${cls}`;
  }
  if (probEl) {
    probEl.textContent = p.flood_risk_probability || `${probVal}%`;
    probEl.className = `pop-prob-big ppb-${cls}`;
  }
  if (catEl) catEl.textContent = p.risk_category || 'Hydrological Assessment Complete';
  if (rainEl) rainEl.textContent = `${w.accumulated_24h_rainfall_mm ?? 0.0} mm`;
  if (flowEl) flowEl.textContent = r.discharge_m3s !== null && r.discharge_m3s !== undefined ? `${r.discharge_m3s} m³/s` : 'Normal';
  if (tempEl) tempEl.textContent = `${w.temperature_c ?? 28.0}°C`;
  if (soilEl) soilEl.textContent = `${w.soil_moisture ?? 0.28}`;
  if (imdEl) {
    imdEl.textContent = imd.level || 'GREEN SAFE';
    imdEl.style.background = imd.color || '#16a34a';
  }
  if (guidEl && p.action_guidance) {
    guidEl.innerHTML = `⚡ <b>Local Advisory:</b> ${p.action_guidance}`;
  }
}

function selectDistrictInMLPredictor(stateName, districtName) {
  switchView('view-ml-predictor');
  const stateSelect = document.getElementById("stateSelect");
  if (!stateSelect) return;
  stateSelect.value = stateName;
  if (typeof onStateChange === 'function') onStateChange();
  setTimeout(() => {
    const distSelect = document.getElementById("districtSelect");
    if (distSelect && districtName) {
      for (let i = 0; i < distSelect.options.length; i++) {
        if (distSelect.options[i].text.toLowerCase().includes(districtName.toLowerCase())) {
          distSelect.selectedIndex = i;
          break;
        }
      }
    }
    if (typeof showToast === 'function') showToast(`Loaded ${districtName || stateName} into ML Predictor!`, 'info');
  }, 120);
}
