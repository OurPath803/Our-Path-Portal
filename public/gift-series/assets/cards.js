/* ============================================================
   OurPath, Cards & Guides
   Builds: Safeguarding & Signposting Card, Group Agreement
   one-pager, Audience Adaptation Guide.
   Each exposes window.<Name>.build(mount).
   Requires content.js, ourpath.js, document.css
   ============================================================ */
(function () {
  const G = window.GIFT;
  const OP = window.OurPath;

  function foot(n) {
    return `<div style="margin:0 56px;"><div class="pg-foot">
      <span class="op-footer">${OP.footer()}</span><span class="pg-num">${String(n).padStart(2, '0')}</span></div></div>`;
  }
  function head(section, tone) {
    return `<div class="pg-head"><span class="pg-section">${section}</span>
      <span>${OP.logo({ orientation: 'horizontal', size: 14, tagline: false })}</span></div>
      <div class="pg-rule"${tone ? ` style="background:var(--${tone})"` : ''}></div>`;
  }

  /* ============ SAFEGUARDING & SIGNPOSTING CARD ============ */
  const Card = {
    build(mount) {
      const sg = G.safeguarding;
      const resRow = (r) => `<div class="sc-res"><span class="sc-res-n">${r[0]}</span><span class="sc-res-c">${r[1]}</span><span class="sc-res-note">${r[2]}</span></div>`;
      const card = `
        <div class="page" style="min-height:auto;">
          ${head('Safeguarding &amp; signposting card', 'heart')}
          <div class="pg-body">
            <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">
              <span class="tag" style="--g:var(--heart);">Keep visible every session</span>
              <span style="flex:1;height:1px;background:var(--line);"></span>
            </div>
            <h1 class="doc-h1" style="font-size:34px;margin-bottom:14px;">Safeguarding &amp; signposting</h1>
            <div class="doc-callout navy" style="margin-bottom:16px;">
              <p class="doc-p" style="margin:0;font-size:14px;"><b>${sg.line}</b></p>
            </div>
            <div class="doc-cols" style="gap:22px;align-items:start;margin-bottom:16px;">
              <div>
                <div class="doc-h3" style="color:var(--heart);">Out of scope</div>
                <ul class="doc-ul" style="gap:6px;">${sg.outOfScope.map(x => `<li style="font-size:12px;">${x}</li>`).join('')}</ul>
              </div>
              <div>
                <div class="doc-h3" style="color:var(--heart);">Risk markers, slow down for</div>
                <ul class="doc-ul" style="gap:6px;">${sg.riskMarkers.map(x => `<li style="font-size:12px;">${x}</li>`).join('')}</ul>
              </div>
            </div>
            <div class="doc-h3">If risk is present, respond in order</div>
            <div class="sc-steps">
              ${sg.response.map((r, i) => `<div class="sc-step"><span class="sc-step-n">${i + 1}</span><span><b>${r[0]}</b>, ${r[1]}</span></div>`).join('')}
            </div>
            <div class="sc-resbox">
              <div class="doc-h3" style="color:#fff;margin-bottom:10px;">Resources, share in chat &amp; by email</div>
              ${sg.resources.map(resRow).join('')}
              <div class="sc-res youth">${`<span class="sc-res-n">Childline <span style="font-weight:400;font-size:12px;color:var(--gold-soft)">(youth)</span></span><span class="sc-res-c">0800 1111</span><span class="sc-res-note">free, 24/7, under-19s</span>`}</div>
            </div>
          </div>
          ${foot(1)}
        </div>`;
      mount.innerHTML = STYLE_CARD + card;
    },
  };

  const STYLE_CARD = `<style id="sc-style">
    .sc-steps { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; margin-bottom: 18px; }
    .sc-step { display: flex; gap: 10px; align-items: flex-start; font-family: var(--body); font-size: 12px; line-height: 1.4; color: var(--charcoal); }
    .sc-step b { color: var(--navy); }
    .sc-step-n { flex: none; width: 20px; height: 20px; border-radius: 50%; background: var(--heart); color: #fff;
      font-family: var(--display); font-size: 13px; display: flex; align-items: center; justify-content: center; }
    .sc-resbox { background: var(--navy); border-radius: 8px; padding: 18px 22px; }
    .sc-res { display: grid; grid-template-columns: 1fr auto 1fr; gap: 16px; align-items: baseline; padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,.14); }
    .sc-res:last-child { border-bottom: none; }
    .sc-res.youth { border-top: 1px solid rgba(255,255,255,.14); margin-top: 4px; }
    .sc-res-n { font-family: var(--display); font-size: 19px; font-weight: 600; color: #fff; }
    .sc-res-c { font-family: var(--display); font-size: 19px; color: var(--gold-soft); white-space: nowrap; }
    .sc-res-note { font-family: var(--body); font-size: 11.5px; color: rgba(245,240,232,.6); text-align: right; }
  </style>`;

  /* ============ GROUP AGREEMENT ONE-PAGER ============ */
  const Agreement = {
    build(mount) {
      const card = `
        <div class="page" style="min-height:auto;">
          ${head('Group agreement · ground rules', 'soul')}
          <div class="pg-body">
            <div class="doc-eyebrow">The Gift Series · our group agreement</div>
            <h1 class="doc-h1" style="margin-top:8px;">How we'll be together</h1>
            <p class="doc-p lede" style="margin-top:10px;max-width:600px;">We read this in our first session and return to it each week. It's what makes the group safe enough to be honest in. Nothing here is a test, it's a shared promise.</p>
            <div class="ga-grid">
              ${G.agreement.map(([t, d], i) => `<div class="ga-item">
                <span class="ga-n">${String(i + 1).padStart(2, '0')}</span>
                <div><div class="ga-t">${t}</div><div class="ga-d">${d}</div></div>
              </div>`).join('')}
            </div>
            <div class="doc-callout" style="margin-top:18px;display:flex;gap:20px;align-items:center;">
              <div style="flex:1;"><p class="doc-p" style="margin:0;font-size:12.5px;"><b>A reminder.</b> This is non-clinical developmental mentoring, not therapy. If something needs clinical care, we'll signpost you with care. Support is always available: Samaritans 116 123 · Shout 85258 · 999/A&amp;E if urgent.</p></div>
              <div style="text-align:center;flex:none;">${OP.logo({ orientation: 'stacked', size: 18 })}</div>
            </div>
          </div>
          ${foot(1)}
        </div>`;
      mount.innerHTML = STYLE_GA + card;
    },
  };

  const STYLE_GA = `<style id="ga-style">
    .ga-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 28px; margin-top: 22px; }
    .ga-item { display: grid; grid-template-columns: 40px 1fr; gap: 12px; align-items: start; padding-bottom: 13px; border-bottom: 1px solid var(--line); }
    .ga-n { font-family: var(--display); font-style: italic; font-size: 26px; color: var(--gold-deep); line-height: 1; }
    .ga-t { font-family: var(--display); font-size: 19px; font-weight: 600; color: var(--navy); }
    .ga-d { font-family: var(--body); font-size: 12px; line-height: 1.5; color: var(--charcoal); margin-top: 3px; }
  </style>`;

  /* ============ AUDIENCE ADAPTATION GUIDE ============ */
  const Adapt = {
    build(mount) {
      const audiences = [
        { k: 'mind', name: 'Young Muslim professionals', age: '20s–30s · default register',
          tone: 'Substantive, calm, intellectually generous. Faith references are natural, not performative.',
          lang: 'Full vocabulary; Arabic terms with a light gloss the first time, then used freely.',
          swap: '“Structured self-examination (muhāsabah)” → keep both; assume curiosity, not prior knowledge.',
          timing: 'Standard 75 min; this group can hold longer reflective silences.',
          safe: 'Standard adult signposting. Watch for high-achiever burnout masking as “fine”.' },
        { k: 'heart', name: 'Youth / adolescents', age: 'CAMHS-adjacent',
          tone: 'Warm, concrete, unhurried. More scaffolding, more frequent check-ins, lighter writing load.',
          lang: 'Plain and concrete; one idea at a time. Examples from everyday life, not abstractions.',
          swap: 'Shorter activity blocks; turn worksheets into 2–3 prompts. “Cost” → “what it takes out of you”.',
          timing: 'Break the 20-min activity into two 8–10 min blocks with a stretch between.',
          safe: 'Heightened, age-appropriate safeguarding. Confirm consent &amp; setting. Add Childline 0800 1111; know the school / GP route.' },
        { k: 'soul', name: 'General community adults', age: 'mixed faith',
          tone: 'Lead with the universal framing. Islamic terms offered as one tradition\u2019s vocabulary, never assumed.',
          lang: 'No in-group shorthand. Gloss every term; invite people\u2019s own language for meaning &amp; values.',
          swap: '“Groundedness, including your faith” → “…including whatever grounds you”. Keep the door open both ways.',
          timing: 'Standard; allow a little more time in Generalizing to bridge worldviews.',
          safe: 'Standard adult signposting; be ready for a wide range of starting points.' },
        { k: 'hands', name: 'Muslim community, all ages', age: 'mixed age',
          tone: 'Can foreground the Islamic grounding more warmly and explicitly.',
          lang: 'Arabic terms welcomed; still gloss for younger or newer members. Grade language to the room.',
          swap: 'Lean into the spiritual register in Soul &amp; Hands; protect quieter, older, or younger members in sharing.',
          timing: 'Standard; in mixed-age rooms, use pairs thoughtfully (pair by comfort, not age).',
          safe: 'Standard, plus age-appropriate care if minors present (consent, setting, Childline).' },
      ];
      const card = (a) => `<div class="ad-card gift-${a.k}">
        <div class="ad-head">
          <span class="ad-ic" style="color:var(--g)">${OP.icon(a.k, { size: 28, stroke: 1.7 })}</span>
          <span class="ad-age">${a.age}</span>
        </div>
        <div class="ad-name">${a.name}</div>
        <div class="ad-rows">
          <div class="ad-r"><span class="ad-k">Tone</span><span class="ad-v">${a.tone}</span></div>
          <div class="ad-r"><span class="ad-k">Language</span><span class="ad-v">${a.lang}</span></div>
          <div class="ad-r"><span class="ad-k">Example swaps</span><span class="ad-v">${a.swap}</span></div>
          <div class="ad-r"><span class="ad-k">Timing</span><span class="ad-v">${a.timing}</span></div>
          <div class="ad-r"><span class="ad-k">Safeguarding</span><span class="ad-v">${a.safe}</span></div>
        </div>
      </div>`;
      const page1 = `<div class="page">
        ${head('Audience adaptation guide')}
        <div class="pg-body">
          <div class="doc-eyebrow">Activity grading · one programme, four audiences</div>
          <h1 class="doc-h1" style="margin-top:8px;">Adapting the Gift Series</h1>
          <p class="doc-p lede" style="margin-top:10px;max-width:600px;">One core protocol and workbook, graded up or down for the room, classic OT activity grading. The structure (Cole's seven steps, the four tools, the Check-In) never changes; the <em>register, pace, and scaffolding</em> do.</p>
          <div class="ad-grid">${card(audiences[0])}${card(audiences[1])}</div>
        </div>
        ${foot(1)}
      </div>`;
      const page2 = `<div class="page">
        ${head('Audience adaptation guide')}
        <div class="pg-body">
          <div class="ad-grid">${card(audiences[2])}${card(audiences[3])}</div>
          <div class="doc-h3" style="margin-top:22px;">Grading principles, true for every room</div>
          <div class="doc-cols-3" style="gap:12px;">
            ${[['Grade the load, not the depth', 'Shorten writing and chunk activities for younger or time-poor groups, without dumbing down the questions.'],
               ['Gloss, don\u2019t gatekeep', 'Every Islamic term gets a plain-English gloss the first time. No one needs Muslim identity to take part; no one feels the soul stripped out.'],
               ['Protect the quiet', 'The smaller and more mixed the room, the more actively you protect quieter, older, and younger voices.']].map(([t, d]) =>
              `<div class="doc-callout" style="margin:0;"><div class="doc-h4" style="font-size:15px;">${t}</div><p class="doc-p" style="margin:6px 0 0;font-size:11.5px;">${d}</p></div>`).join('')}
          </div>
          <div class="doc-callout navy" style="margin-top:16px;">
            <p class="doc-p" style="margin:0;"><b>The test, whatever the room:</b> a Muslim community member feels <em>seen</em>; a non-Muslim, NHS-adjacent participant feels <em>included</em>. If an adaptation breaks either side of that test, it's gone too far.</p>
          </div>
        </div>
        ${foot(2)}
      </div>`;
      mount.innerHTML = STYLE_AD + page1 + page2;
    },
  };

  const STYLE_AD = `<style id="ad-style">
    .ad-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 22px; }
    .ad-card { border: 1px solid var(--line); border-top: 3px solid var(--g); padding: 18px 20px; }
    .ad-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .ad-ic { flex: none; display: inline-flex; }
    .ad-name { font-family: var(--display); font-size: 21px; font-weight: 600; color: var(--navy); line-height: 1.12; margin-bottom: 14px; text-wrap: balance; }
    .ad-age { font-family: var(--body); font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--g); }
    .ad-rows { display: flex; flex-direction: column; gap: 9px; }
    .ad-r { display: grid; grid-template-columns: 92px 1fr; gap: 12px; align-items: start; }
    .ad-k { font-family: var(--body); font-weight: 700; font-size: 9.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--gold-deep); padding-top: 2px; }
    .ad-v { font-family: var(--body); font-size: 11.5px; line-height: 1.5; color: var(--charcoal); }
    .ad-v em { font-style: italic; color: var(--g); }
  </style>`;

  window.SafeguardingCard = Card;
  window.AgreementSheet = Agreement;
  window.AdaptationGuide = Adapt;
})();
