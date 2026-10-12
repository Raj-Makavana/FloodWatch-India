/**
 * ========================================================================================
 * FloodWatch India - Dashboard Core Module
 * Handles API endpoints, Auth state, View switching, User header & Full Mobile UI Controls
 * ========================================================================================
 */

const NODE_API_BASE = (window.location.protocol === 'file:' || (window.location.port !== '5000' && window.location.port !== '')) ? 'http://localhost:5000' : '';
const API_BASE = `${NODE_API_BASE}/api/auth`;
const ML_API_BASE = "http://127.0.0.1:8000";
let currentUser = null;

/* ═════════════════════════════════════════════════════════════
   VIEW SWITCHING CONTROLLER (Sidebar Buttons -> Main Pages)
   ═════════════════════════════════════════════════════════════ */
function switchView(viewId) {
  // 1. Update Sidebar Nav Buttons
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  const activeNavBtn = document.getElementById('nav-' + viewId.replace('view-', ''));
  if (activeNavBtn) activeNavBtn.classList.add('active');

  // 2. Hide all views and show target view
  document.querySelectorAll('.dash-view').forEach(view => view.classList.remove('active'));
  const targetView = document.getElementById(viewId);
  if (targetView) targetView.classList.add('active');

  // 3. Sync Mobile Bottom Nav
  syncMobileBottomNav(viewId);

  // 4. Close mobile sidebar drawer if open
  closeMobileSidebar();

  // 5. Special handling for Map view (Leaflet size redraw)
  if (viewId === 'view-map') {
    setTimeout(() => {
      if (typeof map !== 'undefined' && map) map.invalidateSize();
    }, 120);
  }

  // 6. Special handling for Trends view (Chart resize/render)
  if (viewId === 'view-trends') {
    setTimeout(() => {
      if (typeof updateTrendsChart === 'function') updateTrendsChart();
    }, 60);
  }
}

/* ═════════════════════════════════════════════════════════════
   MOBILE SIDEBAR DRAWER CONTROLLER
   ═════════════════════════════════════════════════════════════ */
function toggleMobileSidebar() {
  const sb = document.querySelector('.sidebar');
  const btn = document.getElementById('mobileMenuBtn');
  const overlay = document.getElementById('sidebarOverlay');
  if (!sb) return;

  const isOpen = sb.classList.contains('mobile-open');
  if (isOpen) {
    closeMobileSidebar();
  } else {
    sb.classList.add('mobile-open');
    if (btn) btn.classList.add('open');
    if (overlay) overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeMobileSidebar() {
  const sb = document.querySelector('.sidebar');
  const btn = document.getElementById('mobileMenuBtn');
  const overlay = document.getElementById('sidebarOverlay');
  if (sb) sb.classList.remove('mobile-open');
  if (btn) btn.classList.remove('open');
  if (overlay) overlay.classList.remove('show');
  document.body.style.overflow = '';
}

function mobileNavTo(viewId, mbBtnId) {
  switchView(viewId);
  document.querySelectorAll('.mobile-nav-item').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(mbBtnId);
  if (btn) btn.classList.add('active');
}

function syncMobileBottomNav(viewId) {
  const mapKey = {
    'view-map': 'mbnav-map',
    'view-my-location': 'mbnav-my-location',
    'view-ml-predictor': 'mbnav-ml-predictor',
    'view-alerts': 'mbnav-alerts',
    'view-pdf-reports': 'mbnav-pdf-reports'
  };
  const activeBtnId = mapKey[viewId];
  document.querySelectorAll('.mobile-nav-item').forEach(b => b.classList.remove('active'));
  if (activeBtnId) {
    const btn = document.getElementById(activeBtnId);
    if (btn) btn.classList.add('active');
  }
}

/* ═════════════════════════════════════════════════════════════
   AUTO-INJECT MOBILE UI ELEMENTS (Overlay, Hamburger, Bottom Nav)
   ═════════════════════════════════════════════════════════════ */
function initMobileUI() {
  // 1. Ensure mobile.css is loaded
  if (!document.querySelector('link[href*="mobile.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/mobile.css';
    document.head.appendChild(link);
  }

  // 2. Ensure language.js is loaded
  if (!document.querySelector('script[src*="language.js"]')) {
    const s = document.createElement('script');
    s.src = 'js/language.js';
    document.body.appendChild(s);
  }

  // 3. Ensure sidebarOverlay exists
  if (!document.getElementById('sidebarOverlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'sidebarOverlay';
    overlay.setAttribute('onclick', 'closeMobileSidebar()');
    document.body.insertBefore(overlay, document.body.firstChild);
  }

  // 4. Ensure mobileMenuBtn exists in header
  const headerNav = document.querySelector('.header-nav');
  if (headerNav && !document.getElementById('mobileMenuBtn')) {
    const menuBtn = document.createElement('button');
    menuBtn.id = 'mobileMenuBtn';
    menuBtn.setAttribute('onclick', 'toggleMobileSidebar()');
    menuBtn.setAttribute('aria-label', 'Open navigation menu');
    menuBtn.innerHTML = '<span></span><span></span><span></span>';
    headerNav.insertBefore(menuBtn, headerNav.firstChild);
  }

  // 5. Ensure mobileBottomNav exists
  if (!document.getElementById('mobileBottomNav') && document.querySelector('.sidebar')) {
    const bnav = document.createElement('div');
    bnav.id = 'mobileBottomNav';
    bnav.innerHTML = `
      <nav class="mobile-nav-bar">
        <button class="mobile-nav-item active" id="mbnav-map" onclick="mobileNavTo('view-map', 'mbnav-map')">
          <span class="mnav-icon">🗺️</span>
          <span class="mnav-label">Map</span>
        </button>
        <button class="mobile-nav-item" id="mbnav-my-location" onclick="mobileNavTo('view-my-location', 'mbnav-my-location')">
          <span class="mnav-icon">📍</span>
          <span class="mnav-label">Location</span>
        </button>
        <button class="mobile-nav-item" id="mbnav-ml-predictor" onclick="mobileNavTo('view-ml-predictor', 'mbnav-ml-predictor')">
          <span class="mnav-icon">⚡</span>
          <span class="mnav-label">Predict</span>
        </button>
        <button class="mobile-nav-item" id="mbnav-alerts" onclick="mobileNavTo('view-alerts', 'mbnav-alerts')">
          <span class="mnav-icon">🚨</span>
          <span class="mnav-label">Alerts</span>
        </button>
        <button class="mobile-nav-item" id="mbnav-pdf-reports" onclick="mobileNavTo('view-pdf-reports', 'mbnav-pdf-reports')">
          <span class="mnav-icon">📄</span>
          <span class="mnav-label">Reports</span>
        </button>
      </nav>
    `;
    document.body.appendChild(bnav);
  }

  // 6. Close sidebar when clicking any nav-btn
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', closeMobileSidebar);
  });

  // 7. On window resize, if width > 900, ensure mobile drawer closes
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      closeMobileSidebar();
    }
    if (typeof map !== 'undefined' && map) {
      map.invalidateSize();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMobileUI);
} else {
  initMobileUI();
}

/* ═════════════════════════════════════════════════════════════
   AUTH VERIFICATION
   ═════════════════════════════════════════════════════════════ */
async function checkAuth() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('auth') === 'google_success') {
    if (typeof showToast === 'function') showToast('Google login successful!', 'success');
    window.history.replaceState({}, document.title, window.location.pathname);
  } else if (params.get('signup') === 'success') {
    if (typeof showToast === 'function') showToast('Account created and logged in!', 'success');
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  try {
    const response = await fetch(`${API_BASE}/me`, { method: 'GET', credentials: 'include' });
    if (!response.ok) {
      if (window.location.port !== '5000' && window.location.protocol !== 'file:') {
        console.warn('Auth check deferred on dev port, guest session active');
      } else {
        window.location.href = 'login.html'; 
        return;
      }
    } else {
      const data = await response.json();
      const user = data.data?.user;
      if (user) {
        currentUser = user;
        const name = user.name || user.email;
        const userEl = document.getElementById('userNameText');
        if (userEl) userEl.textContent = name;
        const alertEmail = document.getElementById('alertEmailInput');
        if (alertEmail && !alertEmail.value && user.email) {
          alertEmail.value = user.email;
        }
      }
    }
  } catch (err) {
    if (window.location.port === '5000' || window.location.protocol === 'file:') {
      window.location.href = 'login.html';
    }
  }
}

async function handleLogout() {
  try {
    await fetch(`${API_BASE}/logout`, { method: 'POST', credentials: 'include' });
    if (typeof showToast === 'function') showToast('Logged out successfully.', 'info');
    setTimeout(() => { window.location.href = 'login.html'; }, 600);
  } catch (err) {
    window.location.href = 'login.html';
  }
}
