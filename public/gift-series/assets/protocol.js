/* ============================================================
   OurPath, Facilitator Protocol & Group Manual
   Page generator. Requires content.js, ourpath.js, document.css
   ============================================================ */
(function () {
  const G = window.GIFT;
  const OP = window.OurPath;
  const ICONS = { mind: 'mind', heart: 'heart', soul: 'soul', hands: 'hands' };
  const GIFTNAMES = { mind: 'Mind', heart: 'Heart', soul: 'Soul', hands: 'Hands' };
  const DOMAINS = { mind: 'Psychological', heart: 'Social / emotional', soul: 'Spiritual', hands: 'Physical / occupational' };

  let pageNo = 0;
  const pages = [];

  // header/footer chrome for a standard page
  function chrome(section, bodyHTML, opts = {}) {
    pageNo++;
    const n = String(pageNo).padStart(2, '0');
    return `<div class="page">
      <div class="pg-head">
        <span class="pg-section">${section}</span>
        <span>${OP.logo({ orientation: 'horizontal', size: 14, tagline: false })}</span>
      </div>
      <div class="pg-rule"></div>
      <div class="pg-body">${bodyHTML}</div>
      <div style="margin:0 56px;"><div class="pg-foot">
        <span class="op-footer">${OP.footer()}</span>
        <span class="pg-num">${n}</span>
      </div></div>
    </div>`;
  }

  function sectionHead(num, title) {
    return `<div class="doc-section-head"><span class="doc-section-num">${num}</span><h2 class="doc-h2">${title}</h2></div>`;
  }

  /* ---------- COVER ---------- */
  function cover() {
    return `<div class="page cover">
      <div style="padding:64px 60px 0;flex:none;">${OP.logo({ orientation: 'horizontal', size: 22, onNavy: true })}</div>
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:0 60px;">
        <div class="doc-eyebrow" style="color:var(--gold-soft)">Facilitator Protocol &amp; Group Manual</div>
        <h1 style="font-family:var(--display);font-weight:600;font-size:74px;line-height:.98;color:var(--offwhite);margin:18px 0 0;letter-spacing:-.015em;">The Gift<br>Series</h1>
        <div style="font-family:var(--display);font-style:italic;font-size:27px;color:var(--gold-soft);margin-top:14px;">Four Gifts · Four Weeks · Mind · Heart · Soul · Hands</div>
        <div style="width:78px;height:2px;background:var(--gold);margin:30px 0;"></div>
        <p style="font-family:var(--body);font-size:15px;line-height:1.66;color:rgba(245,240,232,.84);max-width:480px;">A four-week online group programme that develops the whole person through psychoeducation and resilience-building, structured on Cole's Seven Steps and carrying OurPath's four tools in sequence.</p>
        <div style="display:flex;gap:40px;margin-top:36px;">
          ${G.order.map(k => `<div style="display:flex;flex-direction:column;align-items:center;gap:8px;color:var(--${k});"><span style="filter:saturate(1.4) brightness(1.3)">${OP.icon(k, { size: 38, stroke: 1.6 })}</span><span style="font-family:var(--display);color:var(--offwhite);font-size:16px;">${GIFTNAMES[k]}</span></div>`).join('')}
        </div>
      </div>
      <div style="padding:0 60px 48px;flex:none;display:flex;justify-content:space-between;align-items:flex-end;">
        <span class="op-footer on-navy">${OP.footer({ onNavy: true })}</span>
        <span style="font-family:var(--body);font-size:11px;color:var(--gold-soft);letter-spacing:.1em;">CONFIDENTIAL · FACILITATOR USE</span>
      </div>
    </div>`;
  }

  /* ---------- CONTENTS ---------- */
  function contents() {
    const items = [
      ['1', 'Group overview', 'Title &amp; rationale · population · frame of reference · aim', '03'],
      ['2', 'Goals &amp; selection', 'Measurable goals · inclusion &amp; exclusion criteria', '04'],
      ['3', 'Delivery &amp; leadership', 'Logistics · materials · leadership style · group agreement', '05'],
      ['4', 'The OurPath method', 'The four tools · the four modes · Check-In Scale · COMB', '06'],
      ['5', 'Session outline', 'The four-week spine on Cole\u2019s Seven Steps', '08'],
      ['6', 'Session plans', 'Week-by-week plans with timing grids', '09'],
      ['7', 'Safeguarding &amp; scope', 'Boundaries · risk markers · response · resources', '13'],
      ['8', 'Outcome measurement', 'Check-In, exit tickets, processing &amp; follow-up', '15'],
      ['9', 'References', 'Sources for the OT structure &amp; psychoeducation', '16'],
    ];
    const body = `
      <div class="doc-eyebrow">Contents</div>
      <h1 class="doc-h1" style="margin-top:8px;">What's in this manual</h1>
      <p class="doc-p lede" style="margin-top:14px;max-width:560px;">Everything a facilitator needs to run the full series, the protocol, the four session plans, and the safeguarding and measurement frame that holds them.</p>
      <div class="toc" style="margin-top:26px;">
        ${items.map(([n, name, sub, pg]) => `<div class="toc-item">
          <span class="t-num">${n}</span>
          <span><span class="t-name">${name}</span><span class="t-sub">${sub}</span></span>
          <span class="t-pg">p.${pg}</span>
        </div>`).join('')}
      </div>
      <div class="doc-callout" style="margin-top:24px;">
        <div class="doc-h4">How to use this manual</div>
        <p class="doc-p" style="margin:6px 0 0;">Read §1–4 once to hold the whole method. Run each week from its session plan (§6) with the matching slide deck and run-sheet. Keep §7 open in every session. This is a living document, adapt timing to your group, but keep Cole's seven steps intact and in order.</p>
      </div>`;
    return chrome('The Gift Series · Manual', body);
  }

  /* ---------- §1 OVERVIEW ---------- */
  function overview() {
    const m = G.meta;
    const body = `
      ${sectionHead('1', 'Group overview')}
      <div class="doc-h3">Group title &amp; rationale</div>
      <p class="doc-p"><b>The Gift Series</b> delivers OurPath's developmental method as a sequential group journey. Most people are not struggling to function, they are struggling to <em>see clearly</em>. The series gives a calm, structured space to examine one's position, costs, learning, and direction, with resilience as the connecting thread: each week names one protective factor and one practical anchor to carry away.</p>
      <div class="doc-cols" style="margin-top:18px;">
        <div>
          <div class="doc-h3">Population</div>
          <p class="doc-p">${m.population}</p>
        </div>
        <div>
          <div class="doc-h3">Setting</div>
          <p class="doc-p">${m.setting}</p>
        </div>
      </div>
      <div class="doc-callout navy" style="margin-top:6px;">
        <div class="doc-h4">Frame of reference</div>
        <p class="doc-p" style="margin:6px 0 0;"><b>Psychoeducational + Developmental</b>, client-centred. The psychoeducational frame pairs short skills-teaching inputs with reflective handouts; the developmental frame meets people at their life stage and builds capacity. Faith-integrated and universal: Islamic concepts are named and glossed, never assumed, a Muslim member feels seen; a non-Muslim member feels included.</p>
      </div>
      <div class="doc-h3" style="margin-top:18px;">Overall aim</div>
      <p class="doc-p">${m.aim}</p>
      <div class="doc-callout alert" style="margin-top:10px;border-left-color:var(--gold);">
        <p class="doc-p" style="margin:0;"><b>Non-clinical boundary.</b> OurPath is non-clinical developmental support. It cannot diagnose, treat, or replace therapy or medical care. This boundary is stated to participants in every facing piece and held throughout.</p>
      </div>`;
    return chrome('§1 · Group overview', body);
  }

  /* ---------- §2 GOALS & SELECTION ---------- */
  function goals() {
    const m = G.meta;
    const body = `
      ${sectionHead('2', 'Goals &amp; selection')}
      <div class="doc-h3">Measurable group goals &amp; objectives</div>
      <ul class="doc-ul">${m.goals.map(g => `<li>${g}</li>`).join('')}</ul>
      <div class="doc-cols" style="margin-top:20px;">
        <div>
          <div class="doc-h3" style="color:var(--soul);">Inclusion criteria</div>
          <ul class="doc-ul">${m.inclusion.map(x => `<li>${x}</li>`).join('')}</ul>
        </div>
        <div>
          <div class="doc-h3" style="color:var(--heart);">Exclusion criteria</div>
          <ul class="doc-ul">${m.exclusion.map(x => `<li>${x}</li>`).join('')}</ul>
        </div>
      </div>
      <div class="doc-callout" style="margin-top:22px;">
        <div class="doc-h4">Selection note</div>
        <p class="doc-p" style="margin:6px 0 0;">Selection is a brief, warm conversation, not an assessment. If someone is in acute distress or seeking treatment for a diagnosed condition, signpost with care (see §7) and offer a route back when they're ready. The group is for orientation, not crisis.</p>
      </div>`;
    return chrome('§2 · Goals &amp; selection', body);
  }

  /* ---------- §3 DELIVERY & LEADERSHIP ---------- */
  function delivery() {
    const m = G.meta;
    const facts = [['Group size', m.size], ['Duration', m.duration], ['Frequency', m.frequency], ['Platform', m.platform]];
    const body = `
      ${sectionHead('3', 'Delivery &amp; leadership')}
      <div class="doc-cols-3" style="grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px;">
        ${facts.map(([k, v]) => `<div style="border:1px solid var(--line);padding:12px 14px;">
          <div style="font-family:var(--body);font-weight:600;font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold-deep);">${k}</div>
          <div style="font-family:var(--display);font-size:19px;color:var(--navy);margin-top:4px;">${v}</div></div>`).join('')}
      </div>
      <div class="doc-cols">
        <div>
          <div class="doc-h3">Supplies &amp; materials</div>
          <ul class="doc-ul">${m.materials.map(x => `<li>${x}</li>`).join('')}</ul>
        </div>
        <div>
          <div class="doc-h3">Leadership style</div>
          <p class="doc-p">${m.leadership}</p>
        </div>
      </div>
      <div class="doc-h3" style="margin-top:20px;">Group agreement</div>
      <p class="doc-p" style="margin-bottom:10px;">Set in Session 1 and returned to at the start of every session. Read aloud, briefly, and invite consent.</p>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${G.agreement.map(([t, d], i) => `<div style="display:grid;grid-template-columns:26px 1fr;gap:12px;align-items:start;">
          <span style="font-family:var(--display);font-size:16px;color:var(--gold-deep);font-style:italic;">${i + 1}</span>
          <span><b style="font-family:var(--body);font-size:12.5px;color:var(--navy);">${t}.</b> <span style="font-family:var(--body);font-size:12.5px;color:var(--charcoal);line-height:1.5;">${d}</span></span>
        </div>`).join('')}
      </div>`;
    return chrome('§3 · Delivery &amp; leadership', body);
  }

  /* ---------- §4 METHOD, tools + modes ---------- */
  function methodTools() {
    const body = `
      ${sectionHead('4', 'The OurPath method')}
      <p class="doc-p lede" style="margin-bottom:18px;">Four tools, one per week, experienced in sequence, see clearly, name what you carry, integrate meaning, then choose and do. Reproduce them faithfully; do not substitute.</p>
      <div class="doc-cols" style="gap:14px;">
        ${G.order.map((k, i) => {
          const t = G.tools[k];
          return `<div class="gift-${k}" style="border:1px solid var(--line);border-top:3px solid var(--g);padding:16px 18px;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;color:var(--g);">
              <span style="flex:none;">${OP.icon(k, { size: 30, stroke: 1.7 })}</span>
              <div style="flex:1;"><div style="font-family:var(--body);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-60);">Week ${i + 1} · ${GIFTNAMES[k]}</div>
              <div style="font-family:var(--display);font-size:19px;color:var(--navy);font-weight:600;line-height:1.1;">${t.name}</div></div>
            </div>
            <div style="font-family:var(--display);font-style:italic;font-size:13px;color:var(--ink-60);margin-bottom:8px;">${t.subtitle}</div>
            <ul class="doc-ul" style="gap:6px;">${t.prompts.map(p => `<li style="font-size:12px;">${p}</li>`).join('')}</ul>
            ${t.statement ? `<div style="margin-top:8px;font-family:var(--display);font-style:italic;font-size:12.5px;color:var(--g);border-left:2px solid var(--g);padding-left:10px;">“${t.statement}”</div>` : ''}
          </div>`;
        }).join('')}
      </div>`;
    return chrome('§4 · The OurPath method', body);
  }

  /* ---------- §4b METHOD, modes, check-in, COMB ---------- */
  function methodFrames() {
    const body = `
      <div class="doc-h3">The four Modes</div>
      <p class="doc-p" style="margin-bottom:10px;">A psychoeducation thread running through the whole series, universal language with Islamic grounding. The mode is named, not prescribed.</p>
      <div class="doc-cols" style="gap:10px 14px;margin-bottom:20px;">
        ${G.modes.map(md => `<div style="border:1px solid var(--line);padding:12px 14px;">
          <div style="font-family:var(--display);font-size:18px;color:var(--navy);font-weight:600;">${md.name}</div>
          <div style="font-family:var(--body);font-size:12px;color:var(--charcoal);line-height:1.5;margin:3px 0 6px;">${md.gloss}.</div>
          <div style="font-family:var(--display);font-style:italic;font-size:12.5px;color:var(--gold-deep);">${md.term}, ${md.termGloss}</div>
        </div>`).join('')}
      </div>
      <div class="doc-cols" style="gap:24px;align-items:start;">
        <div>
          <div class="doc-h3">The Check-In Scale</div>
          <p class="doc-p" style="margin-bottom:8px;font-size:12.5px;">Five domains, self-rated 0–10, tracked session to session. Reflective, not clinical.</p>
          <div style="display:flex;flex-direction:column;gap:7px;">
            ${G.checkin.map(c => `<div style="display:grid;grid-template-columns:92px 1fr;gap:10px;align-items:baseline;">
              <span style="font-family:var(--body);font-weight:700;font-size:12px;color:var(--navy);">${c.k}</span>
              <span style="font-family:var(--body);font-size:11.5px;color:var(--ink-60);line-height:1.4;">${c.q}</span></div>`).join('')}
          </div>
        </div>
        <div>
          <div class="doc-h3">The COMB close</div>
          <p class="doc-p" style="margin-bottom:8px;font-size:12.5px;">Used in Step 7 of every session.</p>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${G.comb.map(c => `<div style="display:grid;grid-template-columns:26px 1fr;gap:10px;align-items:start;">
              <span style="font-family:var(--display);font-size:20px;font-weight:600;color:var(--gold-deep);line-height:1;">${c.l}</span>
              <span><b style="font-family:var(--body);font-size:12px;color:var(--navy);">${c.k}.</b> <span style="font-family:var(--body);font-size:11.5px;color:var(--charcoal);line-height:1.45;">${c.q}</span></span></div>`).join('')}
          </div>
        </div>
      </div>`;
    return chrome('§4 · The OurPath method', body);
  }

  /* ---------- §5 SESSION OUTLINE ---------- */
  function outline() {
    const rows = G.order.map((k, i) => {
      const s = G.sessions[k];
      return `<tr class="row-gift">
        <td>Wk ${i + 1}</td>
        <td><span style="display:inline-flex;align-items:center;gap:7px;color:var(--${k});">${OP.icon(k, { size: 18, stroke: 1.8 })}<b style="color:var(--navy);">${GIFTNAMES[k]}</b></span></td>
        <td>${DOMAINS[k]}</td>
        <td>${G.tools[k].name}</td>
        <td>${s.checkInFocus}</td>
        <td>${s.resilience}</td>
      </tr>`;
    }).join('');
    const body = `
      ${sectionHead('5', 'Session-by-session outline')}
      <p class="doc-p lede" style="margin-bottom:16px;">The spine, one gift per week, each engineered to stand alone as a drop-in, together forming the full method.</p>
      <table class="doc-table">
        <thead><tr><th>Week</th><th>Gift</th><th>Domain</th><th>OurPath tool</th><th>Check-In focus</th><th>Resilience anchor</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="doc-callout" style="margin-top:22px;">
        <div class="doc-h4" style="font-style:italic;font-family:var(--display);">The arc</div>
        <p class="doc-p" style="margin:8px 0 0;font-size:14px;">Mind <em>(see clearly)</em> &nbsp;→&nbsp; Heart <em>(name what you carry &amp; reconnect)</em> &nbsp;→&nbsp; Soul <em>(integrate meaning)</em> &nbsp;→&nbsp; Hands <em>(choose and do)</em>. This is also the intended order of OurPath's tools, so the cohort experiences the full method in sequence.</p>
      </div>
      <div class="doc-h3" style="margin-top:24px;">Every session is built on Cole's Seven Steps</div>
      <div class="doc-cols-3" style="gap:10px;">
        ${[['1 Introduction', 'safety, inclusion, presence; Check-In'], ['2 Activity', 'the experiential doing, the OurPath tool'], ['3 Sharing', 'patterns, not private detail'], ['4 Processing', 'the emotional layer surfaces'], ['5 Generalizing', 'where the psychoeducation lands'], ['6 Application', 'the between-session anchor'], ['7 Summary', 'COMB close; re-rate; signpost']].map(([n, d]) =>
          `<div style="border:1px solid var(--line);padding:10px 12px;"><div style="font-family:var(--body);font-weight:700;font-size:11.5px;color:var(--navy);">${n}</div><div style="font-family:var(--body);font-size:11px;color:var(--ink-60);line-height:1.4;margin-top:3px;">${d}</div></div>`).join('')}
      </div>`;
    return chrome('§5 · Session outline', body);
  }

  /* ---------- §6 SESSION PLANS (one per gift) ---------- */
  function sessionPlan(k, i) {
    const s = G.sessions[k];
    const steps = G.sevenSteps[k];
    const stepsHTML = steps.map((st, idx) => `<div class="step-row">
      <div class="s-num">${idx + 1}</div>
      <div class="s-body"><div class="s-name">${st[0]}</div><div class="s-desc">${st[1]}</div></div>
      <div class="s-time">${st[2]}'</div>
    </div>`).join('');
    const body = `
      <div class="gift-${k}" style="border-left:3px solid var(--g);padding-left:16px;margin-bottom:18px;">
        <div style="display:flex;align-items:center;gap:14px;">
          <span style="color:var(--g);flex:none;">${OP.icon(k, { size: 40, stroke: 1.7 })}</span>
          <div style="flex:1;">
            <div class="doc-eyebrow">Week ${i + 1} · ${DOMAINS[k]} · ${s.checkInFocus}</div>
            <h2 class="doc-h2" style="margin:4px 0 0;">The Gift of the ${GIFTNAMES[k]}</h2>
          </div>
        </div>
        <div class="doc-kicker" style="margin-top:12px;">${s.strap}</div>
      </div>
      <div class="doc-cols" style="gap:24px;margin-bottom:14px;">
        <div><div class="doc-h3">Aim</div><p class="doc-p" style="font-size:12.5px;">${s.aim}</p></div>
        <div><div class="doc-h3">Learning outcomes</div><ul class="doc-ul" style="gap:5px;">${s.outcomes.map(o => `<li style="font-size:12px;">${o}</li>`).join('')}</ul></div>
      </div>
      <div class="doc-h3">Cole's Seven Steps · 75 minutes</div>
      <div class="steps-grid">${stepsHTML}</div>
      <div class="doc-cols" style="gap:14px;margin-top:14px;">
        <div class="doc-callout gift-${k}" style="margin:0;border-left-color:var(--g);background:var(--g-soft);">
          <div style="font-family:var(--body);font-weight:700;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--navy);">Between-session anchor</div>
          <p class="doc-p" style="margin:5px 0 0;font-size:12.5px;">${s.between}</p>
        </div>
        <div class="doc-callout" style="margin:0;">
          <div style="font-family:var(--body);font-weight:700;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--gold-deep);">Resilience point</div>
          <p class="doc-p" style="margin:5px 0 0;font-size:12.5px;"><b>${s.resilience}.</b> Named explicitly in Step 5–6 and carried into the COMB close.</p>
        </div>
      </div>`;
    return chrome(`§6 · Session ${i + 1}, ${GIFTNAMES[k]}`, body);
  }

  /* ---------- §7 SAFEGUARDING (2 pages) ---------- */
  function safeguardingA() {
    const sg = G.safeguarding;
    const body = `
      ${sectionHead('7', 'Safeguarding &amp; scope')}
      <div class="doc-callout navy" style="margin-bottom:16px;">
        <p class="doc-p" style="margin:0;font-size:14.5px;"><b>${sg.line}</b></p>
      </div>
      <div class="doc-cols" style="gap:24px;align-items:start;">
        <div>
          <div class="doc-h3" style="color:var(--heart);">Out of scope</div>
          <ul class="doc-ul">${sg.outOfScope.map(x => `<li>${x}</li>`).join('')}</ul>
          <p class="doc-small" style="margin-top:8px;">These need clinical support. Signpost without apology and offer a route back when ready.</p>
        </div>
        <div>
          <div class="doc-h3" style="color:var(--heart);">Risk markers, slow down for</div>
          <ul class="doc-ul">${sg.riskMarkers.map(x => `<li>${x}</li>`).join('')}</ul>
        </div>
      </div>
      <div class="doc-h3" style="margin-top:20px;">If risk is present</div>
      <div class="steps-grid">
        ${sg.response.map((r, i) => `<div class="step-row" style="grid-template-columns:34px 1fr;">
          <div class="s-num" style="background:var(--heart);">${i + 1}</div>
          <div class="s-body"><div class="s-name">${r[0]}</div><div class="s-desc">${r[1]}</div></div>
        </div>`).join('')}
      </div>`;
    return chrome('§7 · Safeguarding &amp; scope', body);
  }

  function safeguardingB() {
    const sg = G.safeguarding;
    const resRow = (r, accent) => `<tr><td style="font-weight:600;color:var(--navy);width:34%;">${r[0]}</td><td style="font-weight:600;color:${accent || 'var(--heart)'};">${r[1]}</td><td style="color:var(--ink-60);">${r[2]}</td></tr>`;
    const body = `
      <div class="doc-h3">Resources to print &amp; share</div>
      <p class="doc-p" style="margin-bottom:12px;">Keep these to hand in every session; paste into chat and follow up by email when signposting.</p>
      <table class="doc-table" style="margin-bottom:20px;">
        <thead><tr><th>Resource</th><th>Contact</th><th>Notes</th></tr></thead>
        <tbody>${sg.resources.map(r => resRow(r)).join('')}</tbody>
      </table>
      <div class="doc-callout gift-mind" style="border-left-color:var(--mind);background:var(--mind-soft);">
        <div class="doc-h4">Working with youth / adolescents</div>
        <p class="doc-p" style="margin:6px 0 8px;font-size:12.5px;">Heightened, age-appropriate safeguarding. Confirm appropriate consent and setting. Add:</p>
        <table class="doc-table"><tbody>${sg.youthResources.map(r => resRow(r, 'var(--mind)')).join('')}</tbody></table>
      </div>
      <div class="doc-callout" style="margin-top:14px;">
        <p class="doc-p" style="margin:0;"><b>Standalone card.</b> This scope, the risk markers, the response steps and this resource list also exist as a single branded Safeguarding &amp; Signposting Card (digital + print), keep it visible during every session.</p>
      </div>`;
    return chrome('§7 · Safeguarding &amp; scope', body);
  }

  /* ---------- §8 OUTCOME MEASUREMENT ---------- */
  function outcomes() {
    const m = G.meta;
    const body = `
      ${sectionHead('8', 'Outcome measurement')}
      <p class="doc-p lede" style="margin-bottom:18px;">A light, reflective measurement frame, enough to see movement, never clinical assessment.</p>
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${m.outcomes_plan.map(([t, d], i) => `<div style="display:grid;grid-template-columns:30px 200px 1fr;gap:14px;align-items:start;padding:12px 0;border-bottom:1px solid var(--line);">
          <span style="font-family:var(--display);font-style:italic;font-size:18px;color:var(--gold-deep);">${i + 1}</span>
          <span style="font-family:var(--display);font-size:17px;color:var(--navy);">${t}</span>
          <span style="font-family:var(--body);font-size:12.5px;color:var(--charcoal);line-height:1.5;">${d}</span>
        </div>`).join('')}
      </div>
      <div class="doc-callout navy" style="margin-top:22px;">
        <div class="doc-h4">What counts as significant movement</div>
        <p class="doc-p" style="margin:6px 0 0;">A <b>2+ point shift</b> in any Check-In domain across the series is "significant movement" worth naming with the participant. Slow movement still counts, that's the point of the Momentum domain.</p>
      </div>`;
    return chrome('§8 · Outcome measurement', body);
  }

  /* ---------- §9 REFERENCES ---------- */
  function references() {
    const body = `
      ${sectionHead('9', 'References &amp; sources')}
      <p class="doc-p lede" style="margin-bottom:16px;">The OT structure draws on Cole's Seven Steps and standard OT group-protocol guidance; the psychoeducation draws on established wellbeing science; the faith register draws on classical Islamic psychospiritual sources.</p>
      <ol style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:11px;">
        ${G.references.map(r => `<li style="font-family:var(--body);font-size:12.5px;line-height:1.55;color:var(--charcoal);padding-left:6px;">${r}</li>`).join('')}
      </ol>
      <div class="doc-callout" style="margin-top:24px;">
        <p class="doc-p" style="margin:0;"><b>A note on the faith register.</b> Every Islamic concept is paired with a plain-English gloss the first time it appears. Nothing in this programme requires Muslim identity to participate, and nothing is stripped of OurPath's character. The test: a Muslim community member feels <em>seen</em>; a non-Muslim NHS-adjacent participant feels <em>included</em>.</p>
      </div>
      <div style="margin-top:32px;padding-top:20px;border-top:1px solid var(--line);text-align:center;">
        ${OP.logo({ orientation: 'stacked', size: 26 })}
        <p class="doc-small" style="margin-top:14px;">Non-clinical developmental support · not a substitute for therapy or medical care.</p>
      </div>`;
    return chrome('§9 · References', body);
  }

  function build(mount) {
    const html = [
      cover(), contents(), overview(), goals(), delivery(),
      methodTools(), methodFrames(), outline(),
      ...G.order.map((k, i) => sessionPlan(k, i)),
      safeguardingA(), safeguardingB(), outcomes(), references(),
    ].join('');
    mount.innerHTML = html;
  }

  window.Protocol = { build };
})();
