/* ============================================================
   OurPath, Outcome Measure Forms (fillable + printable)
   Pre/Post Check-In · per-session exit ticket · 2-week follow-up
   Requires content.js, ourpath.js, document.css
   ============================================================ */
(function () {
  const G = window.GIFT;
  const OP = window.OurPath;

  let pageNo = 0;
  function chrome(section, bodyHTML, tone) {
    pageNo++;
    const n = String(pageNo).padStart(2, '0');
    return `<div class="page">
      <div class="pg-head"><span class="pg-section">${section}</span>
        <span>${OP.logo({ orientation: 'horizontal', size: 14, tagline: false })}</span></div>
      <div class="pg-rule"${tone ? ` style="background:var(--${tone})"` : ''}></div>
      <div class="pg-body">${bodyHTML}</div>
      <div style="margin:0 56px;"><div class="pg-foot">
        <span class="op-footer">${OP.footer()}</span><span class="pg-num">${n}</span></div></div>
    </div>`;
  }

  // a 0–10 scale row with clickable/print radio pips
  function scaleRow(domain, q, idPrefix) {
    const pips = Array.from({ length: 11 }).map((_, n) =>
      `<label class="of-pip"><input type="radio" name="${idPrefix}.${domain}" value="${n}" data-persist="${idPrefix}.${domain}"><span>${n}</span></label>`
    ).join('');
    return `<div class="of-row">
      <div class="of-row-label"><b>${domain}</b><span>${q}</span></div>
      <div class="of-scale">${pips}</div>
    </div>`;
  }

  function checkInForm(title, eyebrow, idPrefix, tone, intro) {
    const rows = G.checkin.map(c => scaleRow(c.k, c.q, idPrefix)).join('');
    return `
      <div class="doc-eyebrow">${eyebrow}</div>
      <h1 class="doc-h1" style="margin-top:8px;">${title}</h1>
      <p class="doc-p lede" style="margin-top:10px;max-width:580px;">${intro}</p>
      <div class="of-meta">
        <div class="of-field"><span class="of-flabel">Name / initials</span><span class="of-blank" contenteditable="true" data-persist="${idPrefix}.name"></span></div>
        <div class="of-field"><span class="of-flabel">Date</span><span class="of-blank" contenteditable="true" data-persist="${idPrefix}.date"></span></div>
      </div>
      <div class="of-scalehead"><span></span><span class="of-anchorlbl">0, none of this &nbsp;·&nbsp; 5, in the middle &nbsp;·&nbsp; 10, as much as I can imagine</span></div>
      <div class="of-rows">${rows}</div>`;
  }

  function pagePre() {
    const body = checkInForm(
      'Check-In Scale · before we begin',
      'Pre-programme outcome measure',
      'pre', 'mind',
      'Five domains, rated in your own honest judgement. There is no right answer and no pass mark, this is a starting picture we\u2019ll return to. Circle or tap one number per row.'
    ) + `
      <div class="doc-callout gift-mind" style="border-left-color:var(--mind);background:var(--mind-soft);margin-top:18px;">
        <p class="doc-p" style="margin:0;font-size:12.5px;">Keep this safe, you\u2019ll complete the same scale again after Session 4, and we\u2019ll look at what moved. A shift of <b>2 points or more</b> in any domain is worth pausing on.</p>
      </div>`;
    return chrome('Outcome form · Pre-programme', body, 'mind');
  }

  function pagePost() {
    const body = checkInForm(
      'Check-In Scale · after the series',
      'Post-programme outcome measure',
      'post', 'hands',
      'The same five domains, four weeks on. Rate as honestly as you did at the start, then turn the page to reflect on what changed.'
    ) + `
      <div style="margin-top:18px;display:flex;flex-direction:column;gap:10px;">
        <div class="of-field col"><span class="of-flabel">Where did you notice the most movement, and what do you think shifted it?</span>
          <div class="of-box" contenteditable="true" data-persist="post.reflect1"></div></div>
        <div class="of-field col"><span class="of-flabel">What will you carry forward?</span>
          <div class="of-box" contenteditable="true" data-persist="post.reflect2"></div></div>
      </div>`;
    return chrome('Outcome form · Post-programme', body, 'hands');
  }

  function pageExit() {
    const ticket = (wk, gift, tool) => `<div class="of-ticket gift-${gift}">
      <div class="of-ticket-head"><span style="color:var(--g)">${OP.icon(gift, { size: 24, stroke: 1.8 })}</span>
        <span class="of-ticket-wk">Week ${wk} · ${tool}</span></div>
      <div class="of-ticket-q">
        <span class="of-flabel">One thing that\u2019s clearer now than when we started:</span>
        <div class="of-line" contenteditable="true" data-persist="exit.${gift}.clear"></div>
      </div>
      <div class="of-ticket-q">
        <span class="of-flabel">The mode my coming week needs <span style="font-weight:400;color:var(--ink-60)">(Learning · Action · Endurance · Repair)</span>:</span>
        <div class="of-line short" contenteditable="true" data-persist="exit.${gift}.mode"></div>
      </div>
    </div>`;
    const body = `
      <div class="doc-eyebrow">Per-session exit ticket</div>
      <h1 class="doc-h1" style="margin-top:8px;">A line on the way out</h1>
      <p class="doc-p lede" style="margin-top:10px;max-width:580px;">One or two lines at the close of each session, captured in chat, on paper, or here. Quick, honest, no need to polish.</p>
      <div class="of-tickets">
        ${ticket(1, 'mind', 'The Position Map')}
        ${ticket(2, 'heart', 'The Cost Audit')}
        ${ticket(3, 'soul', 'The Integration Filter')}
        ${ticket(4, 'hands', 'The Orientation Framework')}
      </div>`;
    return chrome('Outcome form · Exit tickets', body, 'soul');
  }

  function pageFollowup() {
    const rows = G.checkin.map(c => scaleRow(c.k, c.q, 'fu')).join('');
    const body = `
      <div class="doc-eyebrow">Optional · two weeks on</div>
      <h1 class="doc-h1" style="margin-top:8px;">A gentle follow-up</h1>
      <p class="doc-p lede" style="margin-top:10px;max-width:580px;">Entirely optional, and just for you. Two weeks after the series, notice where things sit now, the work keeps moving after the sessions end.</p>
      <div class="of-meta">
        <div class="of-field"><span class="of-flabel">Name / initials</span><span class="of-blank" contenteditable="true" data-persist="fu.name"></span></div>
        <div class="of-field"><span class="of-flabel">Date</span><span class="of-blank" contenteditable="true" data-persist="fu.date"></span></div>
      </div>
      <div class="of-scalehead"><span></span><span class="of-anchorlbl">0, none of this &nbsp;·&nbsp; 5, in the middle &nbsp;·&nbsp; 10, as much as I can imagine</span></div>
      <div class="of-rows">${rows}</div>
      <div class="of-field col" style="margin-top:16px;"><span class="of-flabel">Has your between-session anchor or keystone routine held? What helped, or got in the way?</span>
        <div class="of-box" contenteditable="true" data-persist="fu.reflect"></div></div>
      <div class="doc-callout" style="margin-top:14px;">
        <p class="doc-p" style="margin:0;font-size:12px;">If things feel heavier than this work can hold, please reach out, Samaritans 116 123 · Shout text 85258 · 999/A&amp;E if at immediate risk. There is no shame in it.</p>
      </div>`;
    return chrome('Outcome form · 2-week follow-up', body);
  }

  const STYLE = `<style id="of-style">
    .of-meta { display: flex; gap: 40px; margin: 20px 0 18px; }
    .of-field { display: flex; flex-direction: column; gap: 5px; }
    .of-field.col { width: 100%; }
    .of-flabel { font-family: var(--body); font-weight: 600; font-size: 11px; letter-spacing: .04em; color: var(--ink-60); }
    .of-blank { min-width: 200px; border-bottom: 1.5px solid var(--cream-300); font-family: var(--display); font-size: 18px; color: var(--navy); padding: 2px 4px; outline: none; }
    .of-box { border: 1px solid var(--cream-300); border-radius: 5px; background: rgba(255,255,255,.45); min-height: 56px; padding: 9px 12px; font-family: var(--body); font-size: 13px; color: var(--navy); outline: none; line-height: 1.5; }
    .of-line { border-bottom: 1.5px solid var(--cream-300); min-height: 26px; padding: 2px 4px; font-family: var(--body); font-size: 13px; color: var(--navy); outline: none; }
    .of-line.short { max-width: 320px; }

    .of-scalehead { display: grid; grid-template-columns: 240px 1fr; gap: 18px; margin-bottom: 6px; }
    .of-anchorlbl { font-family: var(--body); font-size: 10.5px; color: var(--ink-60); text-align: left; }
    .of-rows { display: flex; flex-direction: column; }
    .of-row { display: grid; grid-template-columns: 240px 1fr; gap: 18px; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--line); }
    .of-row:last-child { border-bottom: none; }
    .of-row-label b { font-family: var(--body); font-weight: 700; font-size: 14px; color: var(--navy); display: block; }
    .of-row-label span { font-family: var(--body); font-size: 10.5px; color: var(--ink-60); line-height: 1.35; display: block; margin-top: 2px; }
    .of-scale { display: flex; gap: 6px; justify-content: space-between; }
    .of-pip { position: relative; flex: 1; cursor: pointer; }
    .of-pip input { position: absolute; opacity: 0; inset: 0; cursor: pointer; }
    .of-pip span { display: flex; align-items: center; justify-content: center; height: 34px; border: 1.5px solid var(--cream-300);
      border-radius: 6px; font-family: var(--display); font-size: 16px; color: var(--ink-60); background: rgba(255,255,255,.4); transition: all .12s; }
    .of-pip:has(input:checked) span { background: var(--g, var(--gold)); border-color: var(--g, var(--gold)); color: #fff; font-weight: 600; }
    .of-pip:hover span { border-color: var(--g, var(--gold-deep)); }

    .of-tickets { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px; }
    .of-ticket { border: 1px solid var(--line); border-top: 3px solid var(--g); padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; }
    .of-ticket-head { display: flex; align-items: center; gap: 10px; }
    .of-ticket-wk { font-family: var(--display); font-size: 18px; font-weight: 600; color: var(--navy); }
    .of-ticket-q { display: flex; flex-direction: column; gap: 5px; }

    @media print { .of-box, .of-line, .of-blank, .of-pip span { background: none !important; } }
  </style>`;

  function build(mount) {
    mount.innerHTML = STYLE + [pagePre(), pagePost(), pageExit(), pageFollowup()].join('');
    initPersistence(mount, 'ourpath.forms');
  }

  function initPersistence(root, KEY) {
    let store = {};
    try { store = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} };
    root.querySelectorAll('[data-persist]').forEach(el => {
      const id = el.getAttribute('data-persist');
      if (el.tagName === 'INPUT' && el.type === 'radio') {
        if (store[id] === el.value) el.checked = true;
        el.addEventListener('change', () => { if (el.checked) { store[id] = el.value; save(); } });
      } else {
        if (store[id] != null) el.innerHTML = store[id];
        el.addEventListener('input', () => { store[id] = el.innerHTML; save(); });
      }
    });
  }

  window.Forms = { build };
})();
