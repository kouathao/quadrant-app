// Google Analytics 4 with consent.
// Visitors in Europe (GDPR / UK GDPR require opt-in) see a consent banner and GA loads only
// after they accept. Everyone else gets GA straight away. "Cookie settings" in the footer
// reopens the banner so anyone can change their choice. Nothing loads off quadrantmac.com,
// so local previews don't pollute the stats.
(() => {
  const ID = 'G-5L6G2VM5PC';
  const KEY = 'quadrant-analytics-consent'; // 'granted' | 'denied'
  const live = location.hostname === 'quadrantmac.com' || location.hostname.endsWith('.quadrantmac.com');
  const inEurope = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').startsWith('Europe/');

  let stored = null;
  try { stored = localStorage.getItem(KEY); } catch {}
  const decided = stored || (inEurope ? null : 'granted');

  let loaded = false;
  function load() {
    window['ga-disable-' + ID] = false;
    if (loaded || !live) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', ID);
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(s);
  }

  function optOut() {
    window['ga-disable-' + ID] = true;
    const domain = location.hostname.replace(/^www\./, '');
    document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(n => n.startsWith('_ga')).forEach(n => {
      document.cookie = `${n}=; Max-Age=0; path=/; domain=${domain}`;
      document.cookie = `${n}=; Max-Age=0; path=/`;
    });
  }

  function choose(value) {
    try { localStorage.setItem(KEY, value); } catch {}
    if (value === 'granted') load(); else optOut();
  }

  function addStyles() {
    if (document.getElementById('consent-style')) return;
    const style = document.createElement('style');
    style.id = 'consent-style';
    style.textContent = `
      .consent { position: fixed; left: 16px; right: 16px; bottom: 16px; z-index: 200; max-width: 560px; margin: 0 auto;
        display: flex; flex-wrap: wrap; align-items: center; gap: 12px 16px; padding: 16px 18px; font-size: 14px;
        background: var(--surface); color: var(--text); border: 1px solid var(--line); border-radius: 14px; box-shadow: 0 12px 40px rgba(0,0,0,.25); }
      .consent p { margin: 0; flex: 1 1 260px; }
      .consent .actions { display: flex; gap: 8px; }
      .consent .btn { font: inherit; font-weight: 600; padding: 9px 16px; margin: 0; cursor: pointer; }
      .consent .btn.primary { border: 0; }
      .linklike { font: inherit; color: inherit; background: none; border: 0; padding: 0; text-decoration: underline; cursor: pointer; }`;
    document.head.appendChild(style);
  }

  function showBanner() {
    const existing = document.getElementById('consent');
    if (existing) { existing.querySelector('button').focus(); return; }
    addStyles();
    const el = document.createElement('div');
    el.id = 'consent';
    el.className = 'consent';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Cookie consent');
    el.innerHTML = '<p>Can we use Google Analytics cookies to count visits and see which pages help? Nothing is collected unless you accept.</p>'
      + '<div class="actions"><button type="button" class="btn secondary" data-choice="denied">Decline</button>'
      + '<button type="button" class="btn primary" data-choice="granted">Accept</button></div>';
    el.addEventListener('click', e => {
      const choice = e.target.closest('button')?.dataset.choice;
      if (!choice) return;
      choose(choice);
      el.remove();
      document.body.style.paddingBottom = '';
    });
    // Right after the skip link, so keyboard and screen reader users reach it early.
    const skip = document.querySelector('.skip-link');
    if (skip) skip.after(el); else document.body.prepend(el);
    // Keep the footer reachable above the fixed banner.
    document.body.style.paddingBottom = el.offsetHeight + 32 + 'px';
    return el;
  }

  if (decided === 'granted') load(); else if (decided === 'denied') optOut();

  document.addEventListener('DOMContentLoaded', () => {
    addStyles();
    if (!decided) showBanner();
    document.getElementById('cookie-settings')?.addEventListener('click', () => showBanner()?.querySelector('button').focus());

    // GA's automatic file-download tracking doesn't recognise .dmg, so record those clicks explicitly.
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href$=".dmg"]');
      if (a && window.gtag) gtag('event', 'file_download', { file_name: 'Quadrant.dmg', file_extension: 'dmg', link_url: a.href });
    });
  });
})();
