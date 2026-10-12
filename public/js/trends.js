/**
 * ========================================================================================
 * FloodWatch India - Historical Frequency Trends & Analytics Module
 * Renders interactive Chart.js line/bar graphs for 2018-2026 rainfall, flow & events
 * ========================================================================================
 */

let trendChartInstance = null;

const HISTORICAL_TRENDS_DATABASE = {
  'All India': {
    rainfall: [
      { year: '2018', val: 1150, type: 'normal' },
      { year: '2019', val: 1288, type: 'high' },
      { year: '2020', val: 1290, type: 'high' },
      { year: '2021', val: 1180, type: 'normal' },
      { year: '2022', val: 1240, type: 'medium' },
      { year: '2023', val: 1140, type: 'normal' },
      { year: '2024', val: 1420, type: 'high' },
      { year: '2025', val: 1360, type: 'high' },
      { year: '2026', val: 1210, type: 'medium' }
    ],
    riverFlow: [
      { year: '2018', val: 14200, type: 'normal' },
      { year: '2019', val: 18500, type: 'high' },
      { year: '2020', val: 17900, type: 'high' },
      { year: '2021', val: 15100, type: 'normal' },
      { year: '2022', val: 16800, type: 'medium' },
      { year: '2023', val: 14900, type: 'normal' },
      { year: '2024', val: 21400, type: 'high' },
      { year: '2025', val: 19800, type: 'high' },
      { year: '2026', val: 16200, type: 'medium' }
    ],
    events: [
      { year: '2018', val: 15, type: 'high' },
      { year: '2019', val: 22, type: 'high' },
      { year: '2020', val: 19, type: 'high' },
      { year: '2021', val: 10, type: 'normal' },
      { year: '2022', val: 14, type: 'medium' },
      { year: '2023', val: 11, type: 'normal' },
      { year: '2024', val: 28, type: 'high' },
      { year: '2025', val: 24, type: 'high' },
      { year: '2026', val: 13, type: 'medium' }
    ]
  },
  'Maharashtra': {
    rainfall: [
      { year: '2018', val: 1100, type: 'normal' },
      { year: '2019', val: 1450, type: 'high' },
      { year: '2020', val: 1320, type: 'high' },
      { year: '2021', val: 1290, type: 'high' },
      { year: '2022', val: 1250, type: 'medium' },
      { year: '2023', val: 1080, type: 'normal' },
      { year: '2024', val: 1520, type: 'high' },
      { year: '2025', val: 1390, type: 'high' },
      { year: '2026', val: 1180, type: 'medium' }
    ],
    riverFlow: [
      { year: '2018', val: 4200, type: 'normal' },
      { year: '2019', val: 7800, type: 'high' },
      { year: '2020', val: 6100, type: 'high' },
      { year: '2021', val: 6900, type: 'high' },
      { year: '2022', val: 5400, type: 'medium' },
      { year: '2023', val: 4100, type: 'normal' },
      { year: '2024', val: 8400, type: 'high' },
      { year: '2025', val: 7100, type: 'high' },
      { year: '2026', val: 4900, type: 'medium' }
    ],
    events: [
      { year: '2018', val: 4, type: 'normal' },
      { year: '2019', val: 8, type: 'high' },
      { year: '2020', val: 5, type: 'medium' },
      { year: '2021', val: 7, type: 'high' },
      { year: '2022', val: 5, type: 'medium' },
      { year: '2023', val: 3, type: 'normal' },
      { year: '2024', val: 9, type: 'high' },
      { year: '2025', val: 7, type: 'high' },
      { year: '2026', val: 4, type: 'medium' }
    ]
  },
  'Assam': {
    rainfall: [
      { year: '2018', val: 1850, type: 'normal' },
      { year: '2019', val: 2100, type: 'high' },
      { year: '2020', val: 2280, type: 'high' },
      { year: '2021', val: 1790, type: 'normal' },
      { year: '2022', val: 2450, type: 'high' },
      { year: '2023', val: 1910, type: 'normal' },
      { year: '2024', val: 2580, type: 'high' },
      { year: '2025', val: 2490, type: 'high' },
      { year: '2026', val: 2050, type: 'medium' }
    ],
    riverFlow: [
      { year: '2018', val: 32000, type: 'normal' },
      { year: '2019', val: 45000, type: 'high' },
      { year: '2020', val: 48000, type: 'high' },
      { year: '2021', val: 36000, type: 'normal' },
      { year: '2022', val: 52000, type: 'high' },
      { year: '2023', val: 38000, type: 'normal' },
      { year: '2024', val: 56000, type: 'high' },
      { year: '2025', val: 51000, type: 'high' },
      { year: '2026', val: 41000, type: 'medium' }
    ],
    events: [
      { year: '2018', val: 6, type: 'normal' },
      { year: '2019', val: 11, type: 'high' },
      { year: '2020', val: 12, type: 'high' },
      { year: '2021', val: 7, type: 'normal' },
      { year: '2022', val: 14, type: 'high' },
      { year: '2023', val: 8, type: 'normal' },
      { year: '2024', val: 16, type: 'high' },
      { year: '2025', val: 15, type: 'high' },
      { year: '2026', val: 9, type: 'medium' }
    ]
  },
  'Bihar': {
    rainfall: [
      { year: '2018', val: 920, type: 'normal' },
      { year: '2019', val: 1180, type: 'high' },
      { year: '2020', val: 1290, type: 'high' },
      { year: '2021', val: 1040, type: 'normal' },
      { year: '2022', val: 880, type: 'normal' },
      { year: '2023', val: 910, type: 'normal' },
      { year: '2024', val: 1350, type: 'high' },
      { year: '2025', val: 1220, type: 'high' },
      { year: '2026', val: 1010, type: 'medium' }
    ],
    riverFlow: [
      { year: '2018', val: 18000, type: 'normal' },
      { year: '2019', val: 27500, type: 'high' },
      { year: '2020', val: 29000, type: 'high' },
      { year: '2021', val: 21000, type: 'normal' },
      { year: '2022', val: 17000, type: 'normal' },
      { year: '2023', val: 19500, type: 'normal' },
      { year: '2024', val: 34000, type: 'high' },
      { year: '2025', val: 28500, type: 'high' },
      { year: '2026', val: 22000, type: 'medium' }
    ],
    events: [
      { year: '2018', val: 5, type: 'normal' },
      { year: '2019', val: 10, type: 'high' },
      { year: '2020', val: 11, type: 'high' },
      { year: '2021', val: 6, type: 'normal' },
      { year: '2022', val: 4, type: 'normal' },
      { year: '2023', val: 5, type: 'normal' },
      { year: '2024', val: 13, type: 'high' },
      { year: '2025', val: 9, type: 'high' },
      { year: '2026', val: 5, type: 'medium' }
    ]
  },
  'Gujarat': {
    rainfall: [
      { year: '2018', val: 780, type: 'normal' },
      { year: '2019', val: 1190, type: 'high' },
      { year: '2020', val: 1240, type: 'high' },
      { year: '2021', val: 950, type: 'normal' },
      { year: '2022', val: 1120, type: 'high' },
      { year: '2023', val: 980, type: 'normal' },
      { year: '2024', val: 1480, type: 'high' },
      { year: '2025', val: 1260, type: 'high' },
      { year: '2026', val: 890, type: 'medium' }
    ],
    riverFlow: [
      { year: '2018', val: 3200, type: 'normal' },
      { year: '2019', val: 8900, type: 'high' },
      { year: '2020', val: 9100, type: 'high' },
      { year: '2021', val: 4500, type: 'normal' },
      { year: '2022', val: 7800, type: 'high' },
      { year: '2023', val: 5100, type: 'normal' },
      { year: '2024', val: 12400, type: 'high' },
      { year: '2025', val: 9800, type: 'high' },
      { year: '2026', val: 5600, type: 'medium' }
    ],
    events: [
      { year: '2018', val: 2, type: 'normal' },
      { year: '2019', val: 7, type: 'high' },
      { year: '2020', val: 8, type: 'high' },
      { year: '2021', val: 4, type: 'normal' },
      { year: '2022', val: 6, type: 'medium' },
      { year: '2023', val: 4, type: 'normal' },
      { year: '2024', val: 12, type: 'high' },
      { year: '2025', val: 8, type: 'high' },
      { year: '2026', val: 3, type: 'medium' }
    ]
  },
  'Kerala': {
    rainfall: [
      { year: '2018', val: 2520, type: 'high' },
      { year: '2019', val: 2310, type: 'high' },
      { year: '2020', val: 2200, type: 'high' },
      { year: '2021', val: 2410, type: 'high' },
      { year: '2022', val: 1980, type: 'normal' },
      { year: '2023', val: 1740, type: 'normal' },
      { year: '2024', val: 2680, type: 'high' },
      { year: '2025', val: 2190, type: 'high' },
      { year: '2026', val: 1850, type: 'medium' }
    ],
    riverFlow: [
      { year: '2018', val: 16500, type: 'high' },
      { year: '2019', val: 12800, type: 'high' },
      { year: '2020', val: 11400, type: 'high' },
      { year: '2021', val: 13200, type: 'high' },
      { year: '2022', val: 9200, type: 'normal' },
      { year: '2023', val: 7800, type: 'normal' },
      { year: '2024', val: 18200, type: 'high' },
      { year: '2025', val: 12500, type: 'high' },
      { year: '2026', val: 8900, type: 'medium' }
    ],
    events: [
      { year: '2018', val: 14, type: 'high' },
      { year: '2019', val: 9, type: 'high' },
      { year: '2020', val: 7, type: 'high' },
      { year: '2021', val: 8, type: 'high' },
      { year: '2022', val: 4, type: 'normal' },
      { year: '2023', val: 3, type: 'normal' },
      { year: '2024', val: 11, type: 'high' },
      { year: '2025', val: 6, type: 'medium' },
      { year: '2026', val: 4, type: 'medium' }
    ]
  },
  'Himachal Pradesh': {
    rainfall: [
      { year: '2018', val: 920, type: 'normal' },
      { year: '2019', val: 1040, type: 'normal' },
      { year: '2020', val: 890, type: 'normal' },
      { year: '2021', val: 1110, type: 'normal' },
      { year: '2022', val: 1220, type: 'medium' },
      { year: '2023', val: 1650, type: 'high' },
      { year: '2024', val: 1490, type: 'high' },
      { year: '2025', val: 1380, type: 'high' },
      { year: '2026', val: 980, type: 'normal' }
    ],
    riverFlow: [
      { year: '2018', val: 2800, type: 'normal' },
      { year: '2019', val: 3400, type: 'normal' },
      { year: '2020', val: 2900, type: 'normal' },
      { year: '2021', val: 3900, type: 'normal' },
      { year: '2022', val: 4800, type: 'medium' },
      { year: '2023', val: 9800, type: 'high' },
      { year: '2024', val: 8200, type: 'high' },
      { year: '2025', val: 7400, type: 'high' },
      { year: '2026', val: 3600, type: 'normal' }
    ],
    events: [
      { year: '2018', val: 3, type: 'normal' },
      { year: '2019', val: 4, type: 'normal' },
      { year: '2020', val: 3, type: 'normal' },
      { year: '2021', val: 5, type: 'normal' },
      { year: '2022', val: 6, type: 'medium' },
      { year: '2023', val: 18, type: 'high' },
      { year: '2024', val: 12, type: 'high' },
      { year: '2025', val: 9, type: 'high' },
      { year: '2026', val: 4, type: 'medium' }
    ]
  },
  'Odisha': {
    rainfall: [
      { year: '2018', val: 1420, type: 'medium' },
      { year: '2019', val: 1680, type: 'high' },
      { year: '2020', val: 1540, type: 'high' },
      { year: '2021', val: 1390, type: 'normal' },
      { year: '2022', val: 1610, type: 'high' },
      { year: '2023', val: 1320, type: 'normal' },
      { year: '2024', val: 1740, type: 'high' },
      { year: '2025', val: 1580, type: 'high' },
      { year: '2026', val: 1290, type: 'normal' }
    ],
    riverFlow: [
      { year: '2018', val: 9400, type: 'medium' },
      { year: '2019', val: 14500, type: 'high' },
      { year: '2020', val: 12800, type: 'high' },
      { year: '2021', val: 8900, type: 'normal' },
      { year: '2022', val: 13600, type: 'high' },
      { year: '2023', val: 8400, type: 'normal' },
      { year: '2024', val: 16200, type: 'high' },
      { year: '2025', val: 13800, type: 'high' },
      { year: '2026', val: 8100, type: 'normal' }
    ],
    events: [
      { year: '2018', val: 5, type: 'normal' },
      { year: '2019', val: 9, type: 'high' },
      { year: '2020', val: 8, type: 'high' },
      { year: '2021', val: 4, type: 'normal' },
      { year: '2022', val: 8, type: 'high' },
      { year: '2023', val: 4, type: 'normal' },
      { year: '2024', val: 10, type: 'high' },
      { year: '2025', val: 7, type: 'high' },
      { year: '2026', val: 3, type: 'normal' }
    ]
  },
  'Andhra Pradesh': {
    rainfall: [
      { year: '2018', val: 880, type: 'normal' },
      { year: '2019', val: 960, type: 'normal' },
      { year: '2020', val: 1210, type: 'high' },
      { year: '2021', val: 1140, type: 'medium' },
      { year: '2022', val: 1080, type: 'normal' },
      { year: '2023', val: 920, type: 'normal' },
      { year: '2024', val: 1490, type: 'high' },
      { year: '2025', val: 1280, type: 'high' },
      { year: '2026', val: 940, type: 'normal' }
    ],
    riverFlow: [
      { year: '2018', val: 5400, type: 'normal' },
      { year: '2019', val: 7900, type: 'medium' },
      { year: '2020', val: 11800, type: 'high' },
      { year: '2021', val: 9400, type: 'medium' },
      { year: '2022', val: 8200, type: 'medium' },
      { year: '2023', val: 6100, type: 'normal' },
      { year: '2024', val: 19800, type: 'high' },
      { year: '2025', val: 14200, type: 'high' },
      { year: '2026', val: 6800, type: 'normal' }
    ],
    events: [
      { year: '2018', val: 2, type: 'normal' },
      { year: '2019', val: 4, type: 'normal' },
      { year: '2020', val: 7, type: 'high' },
      { year: '2021', val: 5, type: 'medium' },
      { year: '2022', val: 4, type: 'normal' },
      { year: '2023', val: 3, type: 'normal' },
      { year: '2024', val: 12, type: 'high' },
      { year: '2025', val: 8, type: 'high' },
      { year: '2026', val: 3, type: 'normal' }
    ]
  },
  'West Bengal': {
    rainfall: [
      { year: '2018', val: 1490, type: 'normal' },
      { year: '2019', val: 1620, type: 'medium' },
      { year: '2020', val: 1710, type: 'high' },
      { year: '2021', val: 1840, type: 'high' },
      { year: '2022', val: 1390, type: 'normal' },
      { year: '2023', val: 1450, type: 'normal' },
      { year: '2024', val: 1920, type: 'high' },
      { year: '2025', val: 1780, type: 'high' },
      { year: '2026', val: 1410, type: 'normal' }
    ],
    riverFlow: [
      { year: '2018', val: 11200, type: 'normal' },
      { year: '2019', val: 14800, type: 'medium' },
      { year: '2020', val: 16900, type: 'high' },
      { year: '2021', val: 19400, type: 'high' },
      { year: '2022', val: 10400, type: 'normal' },
      { year: '2023', val: 12100, type: 'normal' },
      { year: '2024', val: 22800, type: 'high' },
      { year: '2025', val: 18900, type: 'high' },
      { year: '2026', val: 11500, type: 'normal' }
    ],
    events: [
      { year: '2018', val: 4, type: 'normal' },
      { year: '2019', val: 6, type: 'medium' },
      { year: '2020', val: 8, type: 'high' },
      { year: '2021', val: 9, type: 'high' },
      { year: '2022', val: 3, type: 'normal' },
      { year: '2023', val: 4, type: 'normal' },
      { year: '2024', val: 11, type: 'high' },
      { year: '2025', val: 9, type: 'high' },
      { year: '2026', val: 4, type: 'normal' }
    ]
  },
  'Uttarakhand': {
    rainfall: [
      { year: '2018', val: 1240, type: 'normal' },
      { year: '2019', val: 1390, type: 'normal' },
      { year: '2020', val: 1310, type: 'normal' },
      { year: '2021', val: 1720, type: 'high' },
      { year: '2022', val: 1480, type: 'medium' },
      { year: '2023', val: 1890, type: 'high' },
      { year: '2024', val: 1810, type: 'high' },
      { year: '2025', val: 1670, type: 'high' },
      { year: '2026', val: 1290, type: 'normal' }
    ],
    riverFlow: [
      { year: '2018', val: 3800, type: 'normal' },
      { year: '2019', val: 4600, type: 'normal' },
      { year: '2020', val: 4100, type: 'normal' },
      { year: '2021', val: 8900, type: 'high' },
      { year: '2022', val: 5600, type: 'medium' },
      { year: '2023', val: 10400, type: 'high' },
      { year: '2024', val: 9800, type: 'high' },
      { year: '2025', val: 8700, type: 'high' },
      { year: '2026', val: 4200, type: 'normal' }
    ],
    events: [
      { year: '2018', val: 4, type: 'normal' },
      { year: '2019', val: 5, type: 'normal' },
      { year: '2020', val: 4, type: 'normal' },
      { year: '2021', val: 11, type: 'high' },
      { year: '2022', val: 7, type: 'medium' },
      { year: '2023', val: 15, type: 'high' },
      { year: '2024', val: 13, type: 'high' },
      { year: '2025', val: 10, type: 'high' },
      { year: '2026', val: 4, type: 'normal' }
    ]
  }
};

let activeTrendMetric = 'rainfall';

function setTrendMetric(metric) {
  activeTrendMetric = metric;
  document.querySelectorAll('#btnTrendRain, #btnTrendFlow, #btnTrendEvents').forEach(b => b.classList.remove('active'));
  if (metric === 'rainfall') document.getElementById('btnTrendRain')?.classList.add('active');
  if (metric === 'riverFlow') document.getElementById('btnTrendFlow')?.classList.add('active');
  if (metric === 'events') document.getElementById('btnTrendEvents')?.classList.add('active');
  updateTrendsChart();
}

function updateTrendsChart() {
  const state = document.getElementById("trendStateSelect")?.value || 'All India';
  const stateData = HISTORICAL_TRENDS_DATABASE[state] || HISTORICAL_TRENDS_DATABASE['All India'];
  const series = stateData[activeTrendMetric] || HISTORICAL_TRENDS_DATABASE['All India'][activeTrendMetric];

  const titleEl = document.getElementById("trendChartTitle");
  const unit = activeTrendMetric === 'rainfall' ? 'mm' : (activeTrendMetric === 'riverFlow' ? 'm³/s' : 'Disasters');
  const labelName = activeTrendMetric === 'rainfall' ? 'Annual Monsoon Rainfall (mm)' : (activeTrendMetric === 'riverFlow' ? 'Peak River Discharge Flow (m³/s)' : 'Documented Inundation Events');
  if (titleEl) titleEl.textContent = `📈 ${state}: ${labelName} (2018–2026)`;

  const canvas = document.getElementById('trendChartCanvas');
  const canvasContainer = document.getElementById('chartCanvasContainer');
  const fallbackWrap = document.getElementById('chartFallbackWrap');

  const maxVal = Math.max(...series.map(d => d.val));
  const avgVal = Math.round(series.reduce((acc, d) => acc + d.val, 0) / series.length);
  const peakItem = series.reduce((prev, cur) => (cur.val > prev.val ? cur : prev), series[0]);

  // Update Summary metrics
  const peakEl = document.getElementById("statPeakYear");
  const avgEl = document.getElementById("statAvgVal");
  const dirEl = document.getElementById("statTrendDir");

  if (peakEl) peakEl.textContent = `${peakItem.year} (${peakItem.val.toLocaleString()} ${unit})`;
  if (avgEl) avgEl.textContent = `${avgVal.toLocaleString()} ${unit}/yr`;
  if (dirEl) {
    const diffPct = (((series[series.length - 2].val - avgVal) / avgVal) * 100).toFixed(1);
    dirEl.textContent = `${diffPct >= 0 ? '+' : ''}${diffPct}% Anomaly Trend`;
    dirEl.style.color = diffPct > 10 ? 'var(--red)' : (diffPct > 0 ? 'var(--orange)' : 'var(--green)');
  }

  // Chart.js render
  if (typeof Chart !== 'undefined' && canvas) {
    if (canvasContainer) canvasContainer.style.display = 'block';
    if (fallbackWrap) fallbackWrap.style.display = 'none';

    const ctx = canvas.getContext('2d');
    if (trendChartInstance) {
      trendChartInstance.destroy();
    }

    const labels = series.map(d => d.year);
    const dataValues = series.map(d => d.val);

    let primaryColor = '#38bdf8';
    let gradientStart = 'rgba(56, 189, 248, 0.45)';
    let gradientEnd = 'rgba(56, 189, 248, 0.02)';
    if (activeTrendMetric === 'riverFlow') {
      primaryColor = '#f97316';
      gradientStart = 'rgba(249, 115, 22, 0.45)';
      gradientEnd = 'rgba(249, 115, 22, 0.02)';
    } else if (activeTrendMetric === 'events') {
      primaryColor = '#ef4444';
      gradientStart = 'rgba(239, 68, 68, 0.45)';
      gradientEnd = 'rgba(239, 68, 68, 0.02)';
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, gradientStart);
    gradient.addColorStop(1, gradientEnd);

    trendChartInstance = new Chart(ctx, {
      type: activeTrendMetric === 'events' ? 'bar' : 'line',
      data: {
        labels: labels,
        datasets: [{
          label: labelName,
          data: dataValues,
          borderColor: primaryColor,
          borderWidth: 2.5,
          backgroundColor: gradient,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: primaryColor,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          pointRadius: activeTrendMetric === 'events' ? 0 : 4.5,
          pointHoverRadius: 7,
          borderRadius: activeTrendMetric === 'events' ? 6 : 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 750,
          easing: 'easeOutQuart'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(8, 12, 22, 0.96)',
            titleColor: '#ffffff',
            bodyColor: '#38bdf8',
            borderColor: 'rgba(56, 189, 248, 0.3)',
            borderWidth: 1,
            padding: 10,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return ` ${context.parsed.y.toLocaleString()} ${unit}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.04)',
              drawBorder: false
            },
            ticks: {
              color: '#94a3b8',
              font: {
                family: 'JetBrains Mono, monospace',
                size: 11
              }
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.06)',
              drawBorder: false
            },
            ticks: {
              color: '#94a3b8',
              font: {
                family: 'JetBrains Mono, monospace',
                size: 10.5
              },
              callback: function(val) {
                return val >= 1000 ? (val / 1000) + 'k' : val;
              }
            }
          }
        }
      }
    });
  } else {
    // Fallback: CSS Bar Chart
    if (canvasContainer) canvasContainer.style.display = 'none';
    if (fallbackWrap) fallbackWrap.style.display = 'block';

    const area = document.getElementById('chartArea');
    const labelsEl = document.getElementById('chartLabels');
    if (!area || !labelsEl) return;

    area.innerHTML = series.map((d, i) => {
      const pct = Math.max(12, Math.min(100, (d.val / maxVal) * 100));
      const barClass = d.type === 'high' ? 'bar-high' : (d.type === 'medium' ? 'bar-medium' : 'bar-normal');
      return `
        <div class="chart-col" title="${d.year}: ${d.val.toLocaleString()} ${unit}">
          <div style="font-size:9.5px; color:var(--text-dim); font-family:var(--mono); margin-bottom:4px; font-weight:700;">${d.val.toLocaleString()}</div>
          <div class="chart-bar-wrap" style="height:140px;">
            <div class="chart-bar ${barClass}" style="--h:${pct}%; --delay:${0.1 + i * 0.06}s;"></div>
          </div>
        </div>`;
    }).join('');

    labelsEl.innerHTML = series.map(d => `
      <div class="chart-label-item" style="font-size:11px; font-weight:700; color:${d.year >= '2024' ? 'var(--blue)' : 'var(--text)'};">
        ${d.year}
      </div>
    `).join('');
  }
}
