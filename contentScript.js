// Case Searcher — contentScript.js
// Configure the base domain below
// To customize: Update BASE_URL and URL_PATTERN

(function () {
  'use strict';

  // ============================================================
  // CONFIGURATION SECTION - EDIT THESE VALUES
  // ============================================================
  
  // Set your instance base URL (no trailing slash)
  // Example: "https://yourcompany.com" or "https://app.yourcompany.com"
  const BASE_URL = "YOUR_DOMAIN_HERE";
  
  // URL pattern that triggers the extension (include leading and trailing slashes)
  // Example: "/cases/view/" or "/support/tickets/view/"
  const URL_PATTERN = "YOUR_PATH_HERE";
  
  // ============================================================
  // END CONFIGURATION
  // ============================================================

  function norm(s) { return (s || '').replace(/\s+/g, ' ').trim(); }

  function setInputValue(input, value) {
    if (!input) return;
    try {
      const desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
      if (desc && desc.set) desc.set.call(input, value);
      else input.value = value;
    } catch (e) {
      input.value = value;
    }
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Unidentified' }));
    input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Unidentified' }));
  }

  function findValueAfterLabel(labelRegex) {
    const nodes = Array.from(document.querySelectorAll('p, span, div, td, th, label, strong, b'));
    for (const n of nodes) {
      const txt = norm(n.textContent || '');
      if (!txt) continue;
      if (labelRegex.test(txt)) {
        if (n.nextElementSibling && norm(n.nextElementSibling.textContent)) {
          return norm(n.nextElementSibling.textContent);
        }
        if (n.parentElement) {
          const siblings = Array.from(n.parentElement.children).filter(x => x !== n);
          for (const s of siblings) {
            const sText = norm(s.textContent || '');
            if (sText) return sText;
          }
        }
        if (n.parentElement && n.parentElement.nextElementSibling) {
          const pNext = n.parentElement.nextElementSibling;
          if (pNext && norm(pNext.textContent)) return norm(pNext.textContent);
        }
        const inline = txt.match(new RegExp(labelRegex.source + '\\s*[:\\-\\s]*(.+)', 'i'));
        if (inline && inline[1]) return norm(inline[1]);
      }
    }
    return null;
  }

  function extractSkillGroup() {
    const candidate = findValueAfterLabel(/\bSkill\s*Group\b[:]?/i);
    if (candidate) return candidate;
    const nodes = Array.from(document.querySelectorAll('*')).filter(n => (n.textContent || '').match(/Skill\s*Group/i));
    for (const n of nodes) {
      const txt = norm(n.textContent || '');
      const m = txt.match(/Skill\s*Group\s*[:\-]\s*(.+)/i);
      if (m && m[1]) return norm(m[1]);
      if (n.nextElementSibling && norm(n.nextElementSibling.textContent)) return norm(n.nextElementSibling.textContent);
      if (n.parentElement) {
        const sibs = Array.from(n.parentElement.children).filter(x => x !== n);
        for (const s of sibs) {
          if (norm(s.textContent || '')) return norm(s.textContent);
        }
      }
    }
    return null;
  }

  function extractOrderNumberFromBlock() {
    const v = findValueAfterLabel(/\bOrder\s*Number\b[:]?/i);
    if (v) {
      const onlyDigits = (v.match(/(\d{6,})/) || [])[1];
      if (onlyDigits) return onlyDigits;
      const alnum = v.match(/([A-Za-z0-9\-]{6,})/);
      if (alnum) return alnum[1];
    }
    const body = document.body && document.body.innerText ? document.body.innerText : '';
    const m = body.match(/Order\s*Number\s*[:\-\s]*([A-Za-z0-9\-\s]{6,})/i);
    if (m && m[1]) return m[1].replace(/\s+/g, '').replace(/\D/g, '').slice(0, 32);
    return null;
  }

  function extractOrderIdFromReturnInfo() {
    const headings = Array.from(document.querySelectorAll('p, div, h1, h2, h3, span, strong')).filter(n => (n.textContent || '').match(/Return\s*Info/i));
    for (const h of headings) {
      const container = h.closest('div') || h.parentElement;
      if (!container) continue;
      const text = container.innerText || container.textContent || '';
      const m = text.match(/Order\s*Id\s*[:\-\s]*([0-9]{6,})/i);
      if (m && m[1]) return m[1];
      const descendant = container.querySelectorAll('*');
      for (const d of descendant) {
        const dt = d.textContent || '';
        const mm = dt.match(/Order\s*Id\s*[:\-\s]*([0-9]{6,})/i);
        if (mm && mm[1]) return mm[1];
      }
    }
    const pageText = document.body && document.body.innerText ? document.body.innerText : '';
    const gm = pageText.match(/Order\s*Id\s*[:\-\s]*([0-9]{6,})/i);
    if (gm && gm[1]) return gm[1];
    return null;
  }

  function extractOrderBasedOnSkillGroup() {
    const skill = extractSkillGroup();
    if (skill) {
      const skillNorm = skill.toLowerCase();
      if (skillNorm.includes('manual ov')) {
        return extractOrderNumberFromBlock();
      } else {
        const ret = extractOrderIdFromReturnInfo();
        if (ret) return ret;
        return extractOrderNumberFromBlock();
      }
    } else {
      const fromOrder = extractOrderNumberFromBlock();
      if (fromOrder) return fromOrder;
      return extractOrderIdFromReturnInfo();
    }
  }

  function longestDigitSeq(s, minLen = 3) {
    if (!s) return null;
    const matches = Array.from((s.matchAll(/\d+/g))).map(m => m[0]);
    if (!matches.length) return null;
    matches.sort((a, b) => b.length - a.length);
    const best = matches[0];
    return best && best.length >= minLen ? best : null;
  }

  function valueFromNearbyElement(el) {
    if (!el) return null;
    if (el.nextElementSibling) {
      const v = longestDigitSeq(norm(el.nextElementSibling.textContent || ''), 3);
      if (v) return v;
    }
    if (el.parentElement) {
      const siblings = Array.from(el.parentElement.children).filter(x => x !== el);
      for (const s of siblings) {
        const v = longestDigitSeq(norm(s.textContent || ''), 3);
        if (v) return v;
      }
      if (el.parentElement.nextElementSibling) {
        const v2 = longestDigitSeq(norm(el.parentElement.nextElementSibling.textContent || ''), 3);
        if (v2) return v2;
      }
    }
    const txt = norm(el.textContent || '');
    const inlineMatch = txt.match(/Customer\s*ID\b[:\-\s]*([0-9]{3,})/i);
    if (inlineMatch && inlineMatch[1]) return inlineMatch[1];
    return null;
  }

  function extractCustomerIdFromBlock() {
    const all = Array.from(document.querySelectorAll('p, span, div, td, th, label, strong, b'));
    
    for (const n of all) {
      const txt = norm(n.textContent || '');
      if (!txt) continue;
      const inline = txt.match(/Customer\s*ID\b[:\-\s]*([0-9]{3,})/i);
      if (inline && inline[1]) {
        return inline[1];
      }
    }

    for (const n of all) {
      const txt = norm(n.textContent || '');
      if (!txt) continue;
      if (/^Customer\s*ID\b[:\-\s]*$/i.test(txt) || /^Customer\s*ID\b/i.test(txt) && txt.length <= 20 && !/\d/.test(txt)) {
        let skip = false;
        let a = n;
        for (let depth = 0; depth < 4 && a; depth++, a = a.parentElement) {
          if ((a.textContent || '').match(/Case\s*ID/i)) { skip = true; break; }
        }
        if (skip) continue;
        const near = valueFromNearbyElement(n);
        if (near) return near;
      }
    }

    const rows = Array.from(document.querySelectorAll('table tr'));
    for (const r of rows) {
      try {
        const cells = Array.from(r.querySelectorAll('td,th'));
        if (!cells.length) continue;
        const first = norm(cells[0].textContent || '');
        if (/^Customer\b/i.test(first) || /Customer\s*Name/i.test(first) || /Customer\s*ID/i.test(first)) {
          const restText = cells.slice(1).map(c => norm(c.textContent || '')).join(' | ');
          const d = longestDigitSeq(restText, 3);
          if (d) return d;
        }
      } catch (e) { }
    }

    for (const n of all) {
      const txt = norm(n.textContent || '');
      if (!txt) continue;
      if (/Customer\s*Name/i.test(txt) && txt.includes('|')) {
        const d = longestDigitSeq(txt, 3);
        if (d) return d;
      }
    }

    const body = document.body && (document.body.innerText || document.body.textContent) ? (document.body.innerText || document.body.textContent) : '';
    const m = body.match(/Customer\s*ID\s*[:\-\s]*([0-9]{3,})/i);
    if (m && m[1]) return m[1];

    return null;
  }

  function findSearchInput() {
    const selectors = [
      'input[name="SearchTerm"]',
      'input[placeholder*="Search"]',
      'input[placeholder*="search"]',
      'input[aria-label*="Search"]',
      'input[type="search"]'
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.offsetParent !== null) return el;
    }
    const containers = Array.from(document.querySelectorAll('div, section')).filter(d => {
      const t = (d.textContent || '').toLowerCase();
      return t.includes('buyer 360') || t.includes('search here') || t.includes('no result found');
    });
    for (const c of containers) {
      const i = c.querySelector('input');
      if (i && i.offsetParent !== null) return i;
    }
    const allInputs = Array.from(document.querySelectorAll('input'));
    for (const i of allInputs) {
      if (i.offsetParent !== null && i.clientWidth > 20) return i;
    }
    return null;
  }

  function findSearchButtonNear(input) {
    if (!input) return null;
    const group = input.closest('.p-inputgroup') || input.parentElement || input.closest('form');
    if (group) {
      const btn = group.querySelector('button[type="submit"], button');
      if (btn && btn.offsetParent !== null) return btn;
    }
    const buttons = Array.from(document.querySelectorAll('button'));
    for (const b of buttons) {
      if (b.querySelector('.pi-search')) return b;
      const aria = ((b.getAttribute('aria-label') || b.title || b.textContent) || '').toLowerCase();
      if (aria.includes('search') || aria.includes('go')) return b;
      const svg = b.querySelector('svg');
      if (svg && b.offsetParent !== null) return b;
    }
    const rightBtns = Array.from(document.querySelectorAll('button')).filter(b => {
      const r = b.getBoundingClientRect();
      return r.left > (window.innerWidth * 0.45) && b.offsetParent !== null;
    });
    if (rightBtns.length) return rightBtns[0];
    return null;
  }

  if (!window.__searcher_state) {
    window.__searcher_state = {
      processedKeys: new Set(),
      lastProcessed: null,
      observer: null,
      historyPatched: false
    };
  }

  function isAlreadyProcessed(key) {
    const s = window.__searcher_state;
    if (!key) return false;
    if (s.lastProcessed && s.lastProcessed.key === key && s.lastProcessed.path === location.pathname) return true;
    if (s.processedKeys.has(key) && s.lastProcessed && s.lastProcessed.path === location.pathname) return true;
    return false;
  }

  function markProcessed(key) {
    const s = window.__searcher_state;
    if (!key) return;
    s.processedKeys.add(key);
    s.lastProcessed = { key: key, path: location.pathname, time: Date.now() };
  }

  function clearLastIfPathChanged() {
    const s = window.__searcher_state;
    if (s.lastProcessed && s.lastProcessed.path !== location.pathname) {
      s.lastProcessed = null;
    }
  }

  function getSearchMode() {
    return new Promise((resolve) => {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get({ searchMode: 'customer' }, (res) => {
            resolve((res && res.searchMode) ? res.searchMode : 'customer');
          });
        } else {
          resolve('customer');
        }
      } catch (e) {
        resolve('customer');
      }
    });
  }

  async function attemptPasteAndSearch() {
    const mode = await getSearchMode();
    console.log('Case Searcher: search mode =', mode);

    let key = null;
    if (mode === 'order') {
      key = extractOrderBasedOnSkillGroup();
      if (!key) {
        console.log('Case Searcher: Order not found');
        return false;
      }
    } else {
      key = extractCustomerIdFromBlock();
      if (!key) {
        console.log('Case Searcher: Customer ID not found');
        return false;
      }
    }

    if (isAlreadyProcessed(key)) {
      console.log('Case Searcher: already processed:', key);
      return false;
    }

    console.log('Case Searcher: searching for:', key);

    const input = findSearchInput();
    if (!input) {
      console.log('Case Searcher: search input not found');
      return false;
    }

    setInputValue(input, key);

    const form = input.form || input.closest('form');
    const btn = findSearchButtonNear(input);

    setTimeout(() => {
      try {
        if (btn) {
          btn.scrollIntoView({ block: 'center', inline: 'center' });
          btn.click();
          console.log('Case Searcher: clicked search button');
        } else if (form) {
          form.submit();
          console.log('Case Searcher: submitted form');
        } else {
          console.log('Case Searcher: value pasted, press search manually. Key:', key);
        }
      } catch (e) {
        console.warn('Case Searcher: trigger failed', e);
      }
      try { markProcessed(key); } catch (e) { }
    }, 200);

    return true;
  }

  let runTimer = null;
  function scheduleAttempt(delay = 400) {
    clearTimeout(runTimer);
    if (window.__searcher_state.lastProcessed && window.__searcher_state.lastProcessed.path === location.pathname) {
      console.log('Case Searcher: skipping - already processed for this path');
      return;
    }
    runTimer = setTimeout(() => {
      try { attemptPasteAndSearch(); } catch (e) { console.error(e); }
    }, delay);
  }

  function startObserving() {
    scheduleAttempt(700);

    if (window.__searcher_state.observer) return;
    const observer = new MutationObserver((mutations) => {
      if (!location.pathname || !location.pathname.includes(URL_PATTERN)) return;
      clearLastIfPathChanged();
      if (!(window.__searcher_state.lastProcessed && window.__searcher_state.lastProcessed.path === location.pathname)) {
        scheduleAttempt(400);
      }
    });
    observer.observe(document.documentElement || document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
    window.__searcher_state.observer = observer;

    if (!window.__searcher_state.historyPatched) {
      (function () {
        const origPush = history.pushState;
        history.pushState = function () {
          origPush.apply(this, arguments);
          setTimeout(() => {
            clearLastIfPathChanged();
            if (location.pathname.includes(URL_PATTERN)) scheduleAttempt(800);
          }, 300);
        };
        const origReplace = history.replaceState;
        history.replaceState = function () {
          origReplace.apply(this, arguments);
          setTimeout(() => {
            clearLastIfPathChanged();
            if (location.pathname.includes(URL_PATTERN)) scheduleAttempt(800);
          }, 300);
        };
        window.addEventListener('popstate', () => {
          setTimeout(() => {
            clearLastIfPathChanged();
            if (location.pathname.includes(URL_PATTERN)) scheduleAttempt(800);
          }, 300);
        });
      })();
      window.__searcher_state.historyPatched = true;
    }
  }

  try {
    if (location.pathname && location.pathname.includes(URL_PATTERN)) {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startObserving);
      else startObserving();
    } else {
      let lastPath = location.pathname;
      setInterval(() => {
        if (location.pathname !== lastPath) {
          lastPath = location.pathname;
          clearLastIfPathChanged();
          if (location.pathname.includes(URL_PATTERN)) startObserving();
        }
      }, 800);
    }
  } catch (e) {
    console.error('Case Searcher init error', e);
  }

})();