/**
 * FloodWatch Toast Notification Utility
 */
(function () {
  let toastContainer = null;

  function ensureContainer() {
    if (!toastContainer || !document.body.contains(toastContainer)) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'fw-toast-container';
      document.body.appendChild(toastContainer);
    }
    return toastContainer;
  }

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  window.showToast = function (message, type = 'info', duration = 3500) {
    const container = ensureContainer();

    // Prevent duplicate spam of exact same message
    const existingToasts = container.querySelectorAll('.fw-toast-msg');
    for (let el of existingToasts) {
      if (el.textContent === message) {
        return;
      }
    }

    const toast = document.createElement('div');
    toast.className = `fw-toast ${type}`;

    const iconSpan = document.createElement('span');
    iconSpan.className = 'fw-toast-icon';
    iconSpan.textContent = icons[type] || 'ℹ';

    const msgSpan = document.createElement('span');
    msgSpan.className = 'fw-toast-msg';
    msgSpan.textContent = message;

    toast.appendChild(iconSpan);
    toast.appendChild(msgSpan);
    container.appendChild(toast);

    // Trigger animation in next frame
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    let dismissTimer = setTimeout(dismiss, duration);

    function dismiss() {
      clearTimeout(dismissTimer);
      toast.classList.remove('show');
      toast.classList.add('hide');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }

    toast.addEventListener('click', dismiss);
  };
})();
