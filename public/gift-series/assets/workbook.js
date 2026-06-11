/* ============================================================
   OurPath, Participant Workbook
   Branded A4 booklet with FILLABLE worksheets + Check-In tracker.
   Inputs persist to localStorage. Requires content.js, ourpath.js,
   document.css. Adds its own worksheet styles.
   ============================================================ */
(function () {
  const G = window.GIFT;
  const OP = window.OurPath;
  const GIFTNAMES = { mind: 'Mind', heart: 'Heart', soul: 'Soul', hands: 'Hands' };
  const DOMAINS = { mind: 'Psychological', heart: 'Social / emotional', soul: 'Spiritual', hands: 'Physical / occupational' };

  let pageNo = 0;
  function chrome(section, bodyHTML, tone) {
    pageNo++;
    const n = String(pageNo).padStart(2, '0');
    return `<div class="page">
      <div class="pg-head">
        <span class="pg-section">${section}</span>
        <span>${OP.logo({ orientation: 'horizontal', size: 14, tagline: false })}</span>
      </div>
      <div class="pg-rule"${tone ? ` style="background:var(--${tone})"` : ''}></div>
      <div class="pg-body">${bodyHTML}</div>
      <div style="margin:0 56px;"><div class="pg-foot">
        <span class="op-footer">${OP.footer()}</span>
        <span class="pg-num">${n}</span>
      </div></div>
    </div>`;
  }

  // a labelled write-on field that persists
  function field(id, label, lines = 2) {
    const rows = Array.from({ length: lines }).map(() => '<div class="writeline"></div>').join('');
    return `<div class="wb-field">
      ${label ? `<div class="wb-flabel">${label}</div>` : ''}
      <div class="wb-write" contenteditable="true" data-persist="${id}" data-ph="" style="min-height:${lines * 30}px;"></div>
    </div>`;
  }
  function box(id, label, h = 90) {
    return `<div class="wb-field">
      ${label ? `<div class="wb-flabel">${label}</div>` : ''}
      <div class="wb-write box" contenteditable="true" data-persist="${id}" style="min-height:${h}px;"></div>
    </div>`;
  }

  /* ---------- COVER ---------- */
  function cover() {
    return `<div class="page cover">
      <div style="padding:60px 60px 0;">${OP.logo({ orientation: 'horizontal', size: 20, onNavy: true })}</div>
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:0 60px;">
        <div class="doc-eyebrow" style="color:var(--gold-soft)">Participant Workbook</div>
        <h1 style="font-family:var(--display);font-weight:600;font-size:72px;line-height:.98;color:var(--offwhite);margin:16px 0 0;letter-spacing:-.015em;">The Gift<br>Series</h1>
        <div style="font-family:var(--display);font-style:italic;font-size:25px;color:var(--gold-soft);margin-top:14px;">Your four-week journey, Mind · Heart · Soul · Hands</div>
        <div style="width:78px;height:2px;background:var(--gold);margin:30px 0;"></div>
        <p style="font-family:var(--body);font-size:15px;line-height:1.66;color:rgba(245,240,232,.84);max-width:460px;">This book is yours. Write in it freely, these pages are private, for your own reflection. You'll never be asked to share anything you don't choose to.</p>
        <div style="margin-top:40px;display:flex;align-items:center;gap:14px;">
          <span style="font-family:var(--body);font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold-soft);">This book belongs to</span>
          <span class="wb-write" contenteditable="true" data-persist="wb.owner" style="min-width:200px;border-bottom:1.5px solid var(--gold);color:var(--offwhite);font-family:var(--display);font-size:22px;padding:2px 6px;"></span>
        </div>
      </div>
      <div style="padding:0 60px 48px;display:flex;justify-content:space-between;align-items:flex-end;">
        <span class="op-footer on-navy">${OP.footer({ onNavy: true })}</span>
      </div>
    </div>`;
  }

  /* ---------- WELCOME ---------- */
  function welcome() {
    const body = `
      <div class="doc-eyebrow">Welcome</div>
      <h1 class="doc-h1" style="margin-top:8px;">What this is, and what it isn't</h1>
      <p class="doc-p lede" style="margin-top:14px;max-width:560px;">The Gift Series is a calm, structured space to see your life more clearly and choose how you face the season ahead. Over four weeks we develop four "gifts", the Mind, the Heart, the Soul, and the Hands.</p>
      <div class="doc-cols" style="margin-top:22px;gap:20px;">
        <div class="doc-callout gift-soul" style="border-left-color:var(--soul);background:var(--soul-soft);margin:0;">
          <div class="doc-h4">What this is</div>
          <ul class="doc-ul" style="margin-top:8px;">
            <li>Developmental mentoring, building self-awareness and direction</li>
            <li>Psychoeducation: short teaching, then your own reflection</li>
            <li>A small, confidential group that moves at a human pace</li>
            <li>Faith-integrated and universal, open to everyone</li>
          </ul>
        </div>
        <div class="doc-callout alert" style="margin:0;">
          <div class="doc-h4">What this isn't</div>
          <ul class="doc-ul" style="margin-top:8px;">
            <li>Not therapy, diagnosis, or treatment</li>
            <li>Not a substitute for medical or psychological care</li>
            <li>Not a place you'll be put on the spot or exposed</li>
            <li>Not about fixing you, you are not a problem to solve</li>
          </ul>
        </div>
      </div>
      <div class="doc-callout navy" style="margin-top:18px;">
        <div class="doc-h4">If things feel heavier than this</div>
        <p class="doc-p" style="margin:6px 0 10px;">OurPath works with people struggling to <em>see clearly</em>, not struggling to <em>function</em>. If you're in crisis or at risk, please reach out, there is no shame in it:</p>
        <p class="doc-p" style="margin:0;font-size:13px;"><b>Samaritans</b> 116&nbsp;123 (free, 24/7) &nbsp;·&nbsp; <b>Shout</b> text SHOUT to 85258 &nbsp;·&nbsp; <b>999 / A&amp;E</b> if there's immediate risk &nbsp;·&nbsp; your <b>GP</b></p>
      </div>`;
    return chrome('Welcome', body);
  }

  /* ---------- GROUP AGREEMENT ---------- */
  function agreementPage() {
    const body = `
      <div class="doc-eyebrow">Our group agreement</div>
      <h1 class="doc-h1" style="margin-top:8px;">How we'll be together</h1>
      <p class="doc-p lede" style="margin-top:12px;max-width:560px;">We'll read this together in our first session and return to it each week. It's what makes the group safe enough to be honest in.</p>
      <div style="margin-top:22px;display:flex;flex-direction:column;gap:12px;">
        ${G.agreement.map(([t, d], i) => `<div style="display:grid;grid-template-columns:32px 1fr;gap:14px;align-items:start;padding-bottom:12px;border-bottom:1px solid var(--line);">
          <span style="font-family:var(--display);font-size:22px;color:var(--gold-deep);font-style:italic;line-height:1;">${i + 1}</span>
          <span><b style="font-family:var(--display);font-size:18px;color:var(--navy);">${t}</b><br><span style="font-family:var(--body);font-size:13px;color:var(--charcoal);line-height:1.55;">${d}</span></span>
        </div>`).join('')}
      </div>`;
    return chrome('Group agreement', body);
  }

  /* ---------- CHECK-IN TRACKER (fillable) ---------- */
  function trackerPage() {
    const cols = ['Pre', 'Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Post'];
    const rows = G.checkin.map((c, ri) => `<tr>
      <td class="tk-domain"><b>${c.k}</b><span class="tk-q">${c.q}</span></td>
      ${cols.map((_, ci) => `<td class="tk-cell"><input class="tk-in" type="text" inputmode="numeric" maxlength="2" data-persist="tk.${ri}.${ci}" aria-label="${c.k} ${cols[ci]}"></td>`).join('')}
    </tr>`).join('');
    const body = `
      <div class="doc-eyebrow">Your Check-In Scale</div>
      <h1 class="doc-h1" style="margin-top:8px;">Tracking your movement</h1>
      <p class="doc-p lede" style="margin-top:12px;max-width:580px;">Five domains, rated <b>0–10</b>, in your own honest judgement. There's no right answer and no pass mark, this is a mirror, not a test. We'll rate together before we begin, each week, and at the end. Even slow movement counts.</p>
      <table class="tk-table" style="margin-top:20px;">
        <thead><tr><th class="tk-domain-h">Domain</th>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="doc-cols" style="margin-top:22px;gap:24px;">
        <div class="doc-callout" style="margin:0;">
          <div class="doc-h4">How to rate</div>
          <p class="doc-p" style="margin:6px 0 0;font-size:12.5px;"><b>0</b> = none of this at all · <b>5</b> = somewhere in the middle · <b>10</b> = as much as you can imagine. Go with your first instinct.</p>
        </div>
        <div class="doc-callout gift-mind" style="margin:0;border-left-color:var(--mind);background:var(--mind-soft);">
          <div class="doc-h4">Significant movement</div>
          <p class="doc-p" style="margin:6px 0 0;font-size:12.5px;">A shift of <b>2 points or more</b> in any domain across the series is worth pausing on. What changed?</p>
        </div>
      </div>`;
    return chrome('Check-In tracker', body);
  }

  /* ---------- WORKSHEETS (one per gift) ---------- */
  function worksheetHeader(k, i) {
    const s = G.sessions[k];
    const t = G.tools[k];
    return `<div class="gift-${k}" style="border-left:3px solid var(--g);padding-left:16px;margin-bottom:16px;">
      <div style="display:flex;align-items:center;gap:14px;">
        <span style="color:var(--g);flex:none;">${OP.icon(k, { size: 38, stroke: 1.7 })}</span>
        <div style="flex:1;">
          <div class="doc-eyebrow">Week ${i + 1} · ${DOMAINS[k]}</div>
          <h1 class="doc-h1" style="font-size:32px;margin:3px 0 0;">${t.name}</h1>
        </div>
      </div>
      <div class="doc-kicker" style="margin-top:10px;">${s.strap}</div>
    </div>`;
  }
  function reflectionBlock(k) {
    const s = G.sessions[k];
    return `<div class="doc-callout gift-${k}" style="border-left-color:var(--g);background:var(--g-soft);margin-top:16px;">
      <div style="font-family:var(--body);font-weight:700;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--navy);">Between-session reflection</div>
      <p class="doc-p" style="margin:5px 0 0;font-size:13px;">${s.between}</p>
    </div>`;
  }

  function wsMind() {
    const rowsN = 5;
    const tableRows = Array.from({ length: rowsN }).map((_, r) => `<tr>
      <td><div class="wb-cell" contenteditable="true" data-persist="ws.mind.r${r}.resp"></div></td>
      <td class="ws-pick"><div class="wb-cell pick" contenteditable="true" data-persist="ws.mind.r${r}.src" data-ph="C / I / A"></div></td>
      <td><div class="wb-cell" contenteditable="true" data-persist="ws.mind.r${r}.actual"></div></td>
      <td><div class="wb-cell" contenteditable="true" data-persist="ws.mind.r${r}.think"></div></td>
    </tr>`).join('');
    const body = worksheetHeader('mind', 0) + `
      <p class="doc-p" style="margin-bottom:12px;">List everything you're currently responsible for, <em>not</em> the job description, <em>everything</em>. For each, mark whether you <b>C</b>hose it, <b>I</b>nherited it, or <b>A</b>ssumed it, then notice where your energy actually goes versus where you think it goes.</p>
      <table class="ws-table">
        <thead><tr><th style="width:34%;">What I'm responsible for</th><th style="width:14%;">C / I / A</th><th style="width:26%;">Energy it <em>actually</em> takes</th><th style="width:26%;">Energy I <em>think</em> it takes</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
      ${box('ws.mind.gap', 'Where is the gap between actual and assumed the largest? What surprised you?', 80)}
      ${reflectionBlock('mind')}`;
    return chrome('Worksheet · The Position Map', body, 'mind');
  }

  function wsHeart() {
    const rowsN = 4;
    const tableRows = Array.from({ length: rowsN }).map((_, r) => `<tr>
      <td><div class="wb-cell" contenteditable="true" data-persist="ws.heart.r${r}.carry"></div></td>
      <td><div class="wb-cell" contenteditable="true" data-persist="ws.heart.r${r}.visible"></div></td>
      <td><div class="wb-cell" contenteditable="true" data-persist="ws.heart.r${r}.hidden"></div></td>
      <td><div class="wb-cell" contenteditable="true" data-persist="ws.heart.r${r}.deferred"></div></td>
      <td class="ws-pick"><div class="wb-cell pick" contenteditable="true" data-persist="ws.heart.r${r}.av" data-ph="Av / Un"></div></td>
    </tr>`).join('');
    const body = worksheetHeader('heart', 1) + `
      <p class="doc-p" style="margin-bottom:12px;">What is each thing you carry <em>actually</em> costing you, not what you tell people? Name the <b>visible</b> costs (time, money, health), the <b>hidden</b> ones (trust, resentment, disconnection), and the <b>deferred</b> ones (not broken <em>yet</em>). Mark each cost <b>Av</b>oidable or <b>Un</b>avoidable.</p>
      <table class="ws-table ws-table-sm">
        <thead><tr><th style="width:24%;">What I carry</th><th>Visible</th><th>Hidden</th><th>Deferred</th><th style="width:12%;">Av / Un</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
      ${box('ws.heart.absorbed', 'Where am I paying a cost I never agreed to, or carrying one that isn\u2019t mine? One relationship I want to tend:', 80)}
      ${reflectionBlock('heart')}`;
    return chrome('Worksheet · The Cost Audit', body, 'heart');
  }

  function wsSoul() {
    const body = worksheetHeader('soul', 2) + `
      <p class="doc-p" style="margin-bottom:14px;">Not everything you experience teaches you, most of it just happens. Sort the last few weeks honestly through the filter below.</p>
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${box('ws.soul.changed', 'What genuinely changed how I see something? (integrated clarity)', 70)}
        ${box('ws.soul.heard', 'What did I hear but not really absorb? (information without integration)', 70)}
        ${box('ws.soul.question', 'What question am I still sitting with? (honest, unrushed uncertainty)', 70)}
      </div>
      <div class="doc-callout" style="margin-top:14px;">
        <p class="doc-p" style="margin:0;font-size:12.5px;">Where is the pressure to "resolve" coming from, genuine clarity, or anxiety dressed as urgency? <span style="color:var(--ink-60)">It's okay to leave the question open.</span></p>
      </div>
      ${reflectionBlock('soul')}`;
    return chrome('Worksheet · The Integration Filter', body, 'soul');
  }

  function wsHands() {
    const modes = G.modes.map(m => `<label class="ws-mode" data-mode="${m.name}">
      <input type="radio" name="orientation-mode" value="${m.name}" data-persist="ws.hands.mode">
      <span class="ws-mode-name">${m.name}</span>
      <span class="ws-mode-gloss">${m.gloss}</span>
    </label>`).join('');
    const body = worksheetHeader('hands', 3) + `
      <p class="doc-p" style="margin-bottom:12px;">You can't control what happens next, but you can choose how you face it. Which mode does this season actually require? (Tick the one that's true, not the one that sounds best.)</p>
      <div class="ws-modes">${modes}</div>
      <div class="ws-statement">
        <div class="doc-h3" style="margin-bottom:8px;">My Orientation Statement</div>
        <div class="ws-stmt-line">Right now, in
          <span class="wb-write inline" contenteditable="true" data-persist="ws.hands.domain" data-ph="domain"></span>,
          I am in a season of
          <span class="wb-write inline" contenteditable="true" data-persist="ws.hands.modeword" data-ph="mode"></span>,
          and the work is
          <span class="wb-write inline wide" contenteditable="true" data-persist="ws.hands.work" data-ph="specific description"></span>.
        </div>
      </div>
      ${box('ws.hands.routine', 'One keystone routine I\u2019ll begin for the next season, small, specific, repeatable:', 70)}
      ${reflectionBlock('hands')}`;
    return chrome('Worksheet · The Orientation Framework', body, 'hands');
  }

  /* ---------- CLOSING ---------- */
  function closing() {
    const body = `
      <div class="doc-eyebrow">Where next</div>
      <h1 class="doc-h1" style="margin-top:8px;">Carrying it forward</h1>
      <p class="doc-p lede" style="margin-top:12px;max-width:560px;">The series ends; the practice doesn't. You've mapped your position, named your costs, filtered your learning, and chosen your mode. Here's how to keep the momentum.</p>
      <div class="doc-cols" style="margin-top:20px;gap:18px;">
        ${[['Keep a reflection practice', 'A few honest minutes, most days. Return to your Orientation Statement when the season shifts.'],
           ['Run your keystone routine', 'Same time each day. Small and repeatable beats large and rare.'],
           ['1-to-1 mentoring', 'If you want to go deeper on your own path, individual OurPath mentoring is available.'],
           ['The next cohort & community', 'Join a future Gift Series, or stay connected with the OurPath community.']].map(([t, d]) =>
          `<div class="doc-callout" style="margin:0;"><div class="doc-h4">${t}</div><p class="doc-p" style="margin:6px 0 0;font-size:12.5px;">${d}</p></div>`).join('')}
      </div>
      ${box('wb.closing.note', 'One thing I want to remember from these four weeks:', 70)}
      <div style="margin-top:24px;padding-top:18px;border-top:1px solid var(--line);text-align:center;">
        ${OP.logo({ orientation: 'stacked', size: 24 })}
        <p class="doc-small" style="margin-top:12px;">Non-clinical developmental support · not a substitute for therapy or medical care.<br>Samaritans 116 123 · Shout 85258 · 999/A&amp;E if at immediate risk</p>
      </div>`;
    return chrome('Where next', body);
  }

  const STYLE = `
    <style id="wb-style">
      .wb-write { font-family: var(--body); font-size: 13px; color: var(--navy); outline: none; line-height: 1.7; }
      .wb-write[contenteditable]:empty:before { content: attr(data-ph); color: var(--cream-300); }
      .wb-write.box { border: 1px solid var(--cream-300); border-radius: 5px; background: rgba(255,255,255,.45);
        padding: 10px 12px; background-image: repeating-linear-gradient(transparent, transparent 28px, var(--cream-200) 28px, var(--cream-200) 29px); }
      .wb-write.inline { display: inline-block; min-width: 70px; border-bottom: 1.5px solid var(--g, var(--gold)); padding: 0 6px;
        font-family: var(--display); font-size: 17px; color: var(--navy); }
      .wb-write.inline.wide { min-width: 200px; }
      .wb-flabel { font-family: var(--body); font-weight: 600; font-size: 11.5px; color: var(--ink-60); margin-bottom: 6px; line-height: 1.4; }
      .wb-field { margin-bottom: 4px; }

      /* worksheet tables */
      .ws-table { width: 100%; border-collapse: collapse; }
      .ws-table th { font-family: var(--body); font-size: 10px; letter-spacing: .08em; text-transform: uppercase;
        color: var(--gold-deep); font-weight: 700; text-align: left; padding: 7px 9px; border-bottom: 2px solid var(--g, var(--gold)); }
      .ws-table th em { font-style: italic; text-transform: none; letter-spacing: 0; }
      .ws-table td { border-bottom: 1px solid var(--cream-300); border-right: 1px solid var(--cream-300); padding: 0; vertical-align: top; }
      .ws-table td:last-child { border-right: none; }
      .wb-cell { min-height: 40px; padding: 8px 9px; font-family: var(--body); font-size: 12.5px; color: var(--navy);
        outline: none; line-height: 1.4; }
      .wb-cell.pick { text-align: center; font-family: var(--display); font-size: 16px; }
      .wb-cell[contenteditable]:empty:before { content: attr(data-ph); color: var(--cream-300); }
      .ws-table-sm .wb-cell { min-height: 36px; font-size: 11.5px; }

      /* orientation modes */
      .ws-modes { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; }
      .ws-mode { display: block; border: 1px solid var(--line); border-radius: 6px; padding: 12px 14px 12px 38px; position: relative; cursor: pointer; }
      .ws-mode input { position: absolute; left: 13px; top: 14px; width: 15px; height: 15px; accent-color: var(--hands); }
      .ws-mode-name { display: block; font-family: var(--display); font-size: 19px; font-weight: 600; color: var(--navy); }
      .ws-mode-gloss { display: block; font-family: var(--body); font-size: 11.5px; color: var(--ink-60); line-height: 1.4; margin-top: 2px; }
      .ws-mode:has(input:checked) { border-color: var(--hands); background: var(--hands-soft); }

      .ws-statement { border: 1px solid var(--hands); background: var(--hands-soft); border-radius: 6px; padding: 16px 18px; margin-bottom: 14px; }
      .ws-stmt-line { font-family: var(--display); font-size: 18px; line-height: 2.1; color: var(--navy); }

      /* check-in tracker */
      .tk-table { width: 100%; border-collapse: collapse; }
      .tk-table th { font-family: var(--body); font-size: 11px; letter-spacing: .06em; text-transform: uppercase;
        color: var(--gold-deep); font-weight: 700; padding: 8px 6px; border-bottom: 2px solid var(--gold); text-align: center; }
      .tk-table th.tk-domain-h { text-align: left; padding-left: 12px; }
      .tk-domain { padding: 10px 12px; border-bottom: 1px solid var(--line); width: 40%; }
      .tk-domain b { font-family: var(--body); font-size: 13.5px; color: var(--navy); display: block; }
      .tk-q { font-family: var(--body); font-size: 10.5px; color: var(--ink-60); line-height: 1.35; display: block; margin-top: 2px; }
      .tk-cell { border-bottom: 1px solid var(--line); border-left: 1px solid var(--cream-300); text-align: center; padding: 5px; }
      .tk-in { width: 44px; height: 40px; border: 1px solid var(--cream-300); border-radius: 5px; background: rgba(255,255,255,.5);
        text-align: center; font-family: var(--display); font-size: 20px; color: var(--navy); outline: none; }
      .tk-in:focus { border-color: var(--gold); background: #fff; }

      @media print { .wb-write, .wb-cell, .tk-in { background: none !important; } }
    </style>`;

  function build(mount) {
    const html = STYLE + [
      cover(), welcome(), agreementPage(), trackerPage(),
      wsMind(), wsHeart(), wsSoul(), wsHands(), closing(),
    ].join('');
    mount.innerHTML = html;
    initPersistence(mount);
  }

  /* ---- localStorage persistence for all fillable fields ---- */
  function initPersistence(root) {
    const KEY = 'ourpath.workbook';
    let store = {};
    try { store = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} };

    // contenteditable + text fields
    root.querySelectorAll('[data-persist]').forEach(el => {
      const id = el.getAttribute('data-persist');
      if (el.tagName === 'INPUT' && el.type === 'radio') {
        if (store[id] === el.value) el.checked = true;
        el.addEventListener('change', () => { if (el.checked) { store[id] = el.value; save(); } });
      } else if (el.tagName === 'INPUT') {
        if (store[id] != null) el.value = store[id];
        el.addEventListener('input', () => {
          let v = el.value.replace(/[^0-9]/g, '');
          if (v !== '' && +v > 10) v = '10';
          el.value = v; store[id] = v; save();
        });
      } else {
        if (store[id] != null) el.innerHTML = store[id];
        el.addEventListener('input', () => { store[id] = el.innerHTML; save(); });
      }
    });
  }

  window.Workbook = { build };
})();
