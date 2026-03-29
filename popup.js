(function () {
  const toggle = document.getElementById('modeToggle');
  const modeCustomer = document.getElementById('modeCustomer');
  const modeOrder = document.getElementById('modeOrder');
  const currentModeEl = document.getElementById('currentMode');
  const root = document.getElementById('root');
  const savedEl = document.getElementById('saved');

  function setVisual(mode) {
    const isOrder = (mode === 'order');
    toggle.checked = isOrder;
    modeCustomer.classList.toggle('active', !isOrder);
    modeCustomer.setAttribute('aria-pressed', String(!isOrder));
    modeOrder.classList.toggle('active', isOrder);
    modeOrder.setAttribute('aria-pressed', String(isOrder));
    currentModeEl.textContent = isOrder ? 'Order Number' : 'Customer ID';
  }

  function showSaved() {
    root.classList.add('saved-visible');
    savedEl.style.opacity = '1';
    setTimeout(() => {
      root.classList.remove('saved-visible');
      savedEl.style.opacity = '';
    }, 900);
  }

  function broadcastModeChange(mode) {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || !tabs.length) return;
        for (const t of tabs) {
          try {
            chrome.tabs.sendMessage(t.id, { type: 'searchMode_changed', searchMode: mode }, () => {});
          } catch (e) { }
        }
      });
    }
  }

  function saveMode(mode) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ searchMode: mode }, () => {
        setVisual(mode);
        showSaved();
        broadcastModeChange(mode);
      });
    } else {
      setVisual(mode);
      showSaved();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get({ searchMode: 'customer' }, (res) => {
        const mode = (res && res.searchMode) ? res.searchMode : 'customer';
        setVisual(mode);
      });
    } else {
      setVisual('customer');
    }

    toggle.addEventListener('change', () => {
      const mode = toggle.checked ? 'order' : 'customer';
      saveMode(mode);
    });

    modeCustomer.addEventListener('click', () => {
      saveMode('customer');
    });
    modeOrder.addEventListener('click', () => {
      saveMode('order');
    });
  });
})();