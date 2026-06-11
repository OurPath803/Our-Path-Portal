/* ============================================================
   OurPath, gift icons, seal, and logo lockup helpers
   Usage:  el.innerHTML = OurPath.icon('mind', {size:48})
           el.innerHTML = OurPath.logo({align:'center', size:30})
   Icons inherit color via currentColor, set `color` on a wrapper.
   ============================================================ */
(function () {
  const ICONS = {
    // MIND, head in profile (facing left) + an inner spark of cognition
    mind: `
      <path d="M30 43 V36 c0-1.4 .9-2.4 2.2-2.9 C36.5 31.4 39 27 39 22 A15 15 0 0 0 9.6 18.2 l-2.5 4.6 c-.5 1 .1 1.9 1.2 2 l2.2 .2 v4.4 c0 1.8 1.4 3.2 3.2 3.2 H17 v6.6"/>
      <path d="M20.5 19.5 a4.3 4.3 0 1 0 .01 0 Z" stroke-width="1.5" opacity="0.5"/>
      <circle cx="20.6" cy="23.8" r="1.6" fill="currentColor" stroke="none"/>
    `,
    // HEART, single clean line heart
    heart: `
      <path d="M24 41 C9.5 30.5 7 21.5 12.6 16 c4-3.9 9.4-2 11.4 2.4 C26 14 31.4 12.1 35.4 16 c5.6 5.5 3.1 14.5 -11.4 25 Z"/>
    `,
    // SOUL, crescent embracing a clean upright flame
    soul: `
      <path d="M32 6.5 a17.5 17.5 0 1 0 .5 35 A14.2 14.2 0 1 1 32 6.5 Z"/>
      <path d="M23 17.5 c4.2 3.3 5 7.4 2.8 10.8 c-1.4 2.2-4.6 2.5-6.4 .4 c-1.7-2-1-4.6 .3-6.1 c-.2 1.9 .5 2.9 1.6 3.3 c-1.1-2.6 .1-5.6 1.7-8.4 Z" stroke-width="1.6"/>
    `,
    // HANDS, open upturned cupped palm receiving a four-point gift-spark
    hands: `
      <path d="M8 24 c0 9.4 7.2 15.5 16 15.5 S40 33.4 40 24"/>
      <path d="M8 24 l-1.8-3.4 M40 24 l1.8-3.4" stroke-width="1.6"/>
      <path d="M15 26.5 v-3.5 M21 28 v-4 M27 28 v-4 M33 26.5 v-3.5" stroke-width="1.5" opacity="0.6"/>
      <path d="M24 5 c1 3.6 2 4.6 5.6 5.6 c-3.6 1-4.6 2-5.6 5.6 c-1-3.6-2-4.6-5.6-5.6 c3.6-1 4.6-2 5.6-5.6 Z" fill="currentColor" stroke="none"/>
    `,
  };

  const SEAL = `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="22.5" stroke="currentColor" stroke-width="1.5" opacity="0.9"/>
      <line x1="24" y1="3" x2="24" y2="45" stroke="currentColor" stroke-width="1" opacity="0.35"/>
      <line x1="3" y1="24" x2="45" y2="24" stroke="currentColor" stroke-width="1" opacity="0.35"/>
      <circle cx="24" cy="13" r="2.4" fill="currentColor"/>
      <circle cx="35" cy="24" r="2.4" fill="currentColor"/>
      <circle cx="24" cy="35" r="2.4" fill="currentColor"/>
      <circle cx="13" cy="24" r="2.4" fill="currentColor"/>
    </svg>`;

  // The OurPath compass mark, an S-curve "journey path" through a crosshair.
  // theme: 'light' (on cream) | 'dark' (on teal) | 'gold' (mono teal)
  function mark(size = 64, theme = 'light') {
    let g = '#C4993C', cross = '#1A2F36', ctr = '#8A9BA0';
    let crossOp = 0.18, ringOp1 = 0.4, ringOp2 = 0.28, tickOp = 0.55;
    if (theme === 'dark') { cross = '#F5F0E8'; crossOp = 0.12; ctr = '#9DB0B6'; }
    if (theme === 'gold') { g = '#1A2F36'; cross = '#1A2F36'; ctr = '#1A2F36'; crossOp = 0.22; ringOp1 = 0.35; ringOp2 = 0.22; }
    const lo = theme === 'dark' ? '#9C8044' : '#D8B878'; // lighter start-dot tone
    return `<svg class="op-mark-svg" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="29" stroke="${g}" stroke-width="0.7" opacity="${ringOp1}"/>
      <circle cx="32" cy="32" r="20.5" stroke="${g}" stroke-width="0.6" opacity="${ringOp2}"/>
      <line x1="32" y1="13" x2="32" y2="51" stroke="${cross}" stroke-width="0.5" opacity="${crossOp}"/>
      <line x1="13" y1="32" x2="51" y2="32" stroke="${cross}" stroke-width="0.5" opacity="${crossOp}"/>
      <path d="M14.5 42 C20 30, 27.5 27.5, 32 32 C36.5 36.5, 45 34, 50 21.5" stroke="${g}" stroke-width="1.7" fill="none" stroke-linecap="round"/>
      <circle cx="50" cy="21.5" r="3.1" fill="${g}"/>
      <circle cx="14.5" cy="42" r="2.1" fill="${lo}"/>
      <circle cx="32" cy="32" r="2.2" fill="${ctr}"/>
      <line x1="32" y1="3.5" x2="32" y2="7.5" stroke="${g}" stroke-width="1" opacity="${tickOp}"/>
      <line x1="32" y1="56.5" x2="32" y2="60.5" stroke="${g}" stroke-width="1" opacity="${tickOp}"/>
      <line x1="3.5" y1="32" x2="7.5" y2="32" stroke="${g}" stroke-width="1" opacity="${tickOp}"/>
      <line x1="56.5" y1="32" x2="60.5" y2="32" stroke="${g}" stroke-width="1" opacity="${tickOp}"/>
    </svg>`;
  }

  function icon(name, opts = {}) {
    const size = opts.size || 48;
    const sw = opts.stroke || 2;
    const inner = ICONS[name] || '';
    return `<svg class="op-ic op-ic-${name}" viewBox="0 0 48 48" width="${size}" height="${size}"
      fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round"
      stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  }

  // backwards-compat alias used by the brand page
  function seal(size = 30, theme = 'light') { return mark(size, theme); }

  // OurPath lockup. opts:
  //   orientation: 'horizontal' (default) | 'stacked'
  //   size: wordmark font-size px (default 30)
  //   onNavy: boolean  · tagline: boolean (default true) · markOnly: boolean
  function logo(opts = {}) {
    const orient = opts.orientation || 'horizontal';
    const onNavy = !!opts.onNavy;
    const theme = onNavy ? 'dark' : 'light';
    const size = opts.size || 30;
    const showTag = opts.tagline !== false && opts.descriptor !== false;
    const markSize = opts.markSize || Math.round(size * (orient === 'stacked' ? 1.22 : 1.28));
    const tagSize = Math.max(7.5, +(size * 0.285).toFixed(1));
    const wordHTML = `<span class="op-word" style="font-size:${size}px"><span class="our">Our</span><span class="path">Path</span></span>`;
    const tagHTML = showTag ? `<span class="op-tag" style="font-size:${tagSize}px">Guidance &amp; Mentoring</span>` : '';

    if (opts.markOnly) return `<span class="op-mark">${mark(markSize, theme)}</span>`;

    if (orient === 'stacked') {
      return `<span class="op-logo stacked${onNavy ? ' on-navy' : ''}">
        <span class="op-mark">${mark(markSize, theme)}</span>
        <span class="op-text">${wordHTML}
          ${showTag ? `<span class="op-divline"><span class="seg"></span><span class="dot"></span><span class="seg"></span></span>${tagHTML}` : ''}
        </span>
      </span>`;
    }
    return `<span class="op-logo horizontal${onNavy ? ' on-navy' : ''}">
      <span class="op-mark">${mark(markSize, theme)}</span>
      <span class="op-hdiv" style="height:${Math.round(markSize * 0.78)}px"></span>
      <span class="op-text">${wordHTML}${tagHTML}</span>
    </span>`;
  }

  function footer(opts = {}) {
    const cls = opts.onNavy ? ' on-navy' : '';
    return `<span class="op-footer${cls}">
      <span>OurPath Guidance Ltd</span><span class="dot">·</span>
      <span>ourpathguidance.co.uk</span><span class="dot">·</span>
      <span>Non-clinical developmental support</span></span>`;
  }

  // gift metadata used across the pack
  const GIFTS = {
    mind:  { name: 'Mind', week: 1, domain: 'Psychological',         tool: 'Position Map',         var: 'mind', mode: 'Learning',          strap: 'Before you change anything, see where you actually are.' },
    heart: { name: 'Heart', week: 2, domain: 'Social / emotional',    tool: 'Cost Audit',           var: 'heart', mode: 'Repair · Endurance', strap: 'Everything you carry has a price. Most of it is unpaid.' },
    soul:  { name: 'Soul', week: 3, domain: 'Spiritual',             tool: 'Integration Filter',   var: 'soul', mode: 'Learning · Endurance', strap: 'Not everything you experience teaches you. Most of it just happens.' },
    hands: { name: 'Hands', week: 4, domain: 'Physical / occupational', tool: 'Orientation Framework', var: 'hands', mode: 'Action',            strap: "You can't control what happens next. You can choose how you face it." },
  };

  window.OurPath = { icon, seal, logo, footer, GIFTS, _ICONS: ICONS };
  // auto-hydrate any [data-op-logo] / [data-op-footer] / [data-op-icon] on load
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-op-logo]').forEach(el => {
      el.innerHTML = logo(JSON.parse(el.getAttribute('data-op-logo') || '{}'));
    });
    document.querySelectorAll('[data-op-footer]').forEach(el => {
      el.innerHTML = footer(JSON.parse(el.getAttribute('data-op-footer') || '{}'));
    });
    document.querySelectorAll('[data-op-icon]').forEach(el => {
      const cfg = el.getAttribute('data-op-icon').split(':');
      el.innerHTML = icon(cfg[0], { size: +cfg[1] || 48, stroke: +cfg[2] || 2 });
    });
  });
})();
