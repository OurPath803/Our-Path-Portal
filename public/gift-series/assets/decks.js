/* ============================================================
   OurPath, Gift Series deck builder
   Deck.render(key) → fills <deck-stage> with one week's slides.
   Requires content.js, ourpath.js, deck.css
   ============================================================ */
(function () {
  const G = window.GIFT;
  const OP = window.OurPath;
  const NAMES = { mind: 'Mind', heart: 'Heart', soul: 'Soul', hands: 'Hands' };
  const DOMAINS = { mind: 'Psychological', heart: 'Social / Emotional', soul: 'Spiritual', hands: 'Physical / Occupational' };

  // chrome for a content slide: step chip (1-7) + week/logo
  function top(k, i, stepNum, stepName, dark) {
    return `<div class="sl-top">
      <span class="sl-step"><span class="num">${stepNum}</span>Step ${stepNum} · ${stepName}</span>
      <span class="sl-week"><span class="dotg"></span>Week ${i + 1} · The ${NAMES[k]}</span>
    </div>`;
  }
  function progress(k, active) {
    return `<div class="sl-progress">${Array.from({ length: 7 }).map((_, n) =>
      `<span class="pd ${n + 1 <= active ? 'on' : ''}"></span>`).join('')}</div>`;
  }
  function slide(k, inner, opts = {}) {
    const cls = opts.dark ? 'sl dark' : 'sl';
    const corner = opts.corner ? `<div class="sl-corner">${OP.icon(k, { size: 460, stroke: 1.1 })}</div>` : '';
    return `<section data-label="${opts.label || ''}" class="gift-${k}">
      <div class="${cls}" style="--g:var(--${k});--g-soft:var(--${k}-soft)">
        ${corner}<div class="sl-pad">${inner}</div>
        ${opts.step ? progress(k, opts.step) : ''}
      </div>
    </section>`;
  }

  function render(key, mount) {
    const k = key;
    const i = G.order.indexOf(k);
    const s = G.sessions[k];
    const t = G.tools[k];
    const steps = G.sevenSteps[k];
    const slides = [];

    /* 0, TITLE */
    slides.push(slide(k, `
      <div class="sl-top">
        <span class="sl-week">The Gift Series · Week ${i + 1} of 4</span>
        ${OP.logo({ orientation: 'horizontal', size: 26, onNavy: true })}
      </div>
      <div class="sl-body">
        <div class="sl-title-ic">${OP.icon(k, { size: 132, stroke: 1.6 })}</div>
        <div class="sl-eyebrow">${DOMAINS[k]} · ${s.checkInFocus}</div>
        <h1 class="sl-h1 anim">The Gift of<br>the ${NAMES[k]}</h1>
        <div class="sl-kicker anim2">${s.strap}</div>
      </div>
      <div class="sl-foot">
        <span class="sl-nonclinical">Non-clinical developmental support · 75 minutes</span>
        <span class="sl-nonclinical">${t.name}</span>
      </div>`, { dark: true, corner: true, label: `Title · ${NAMES[k]}` }));

    /* 1, STEP 1 INTRODUCTION: group agreement */
    slides.push(slide(k, `
      ${top(k, i, 1, 'Introduction')}
      <div class="sl-rule"></div>
      <div class="sl-body">
        <h2 class="sl-h2">Welcome back. How we'll be together.</h2>
        <ul class="sl-list anim" style="margin-top:48px;">
          ${G.agreement.slice(0, 5).map(([a, d]) => `<li><span class="mk"></span><span><b>${a}.</b> ${d}</span></li>`).join('')}
        </ul>
      </div>`, { step: 1, label: 'Group agreement' }));

    /* 2, STEP 1 CHECK-IN (rate now) */
    slides.push(slide(k, `
      ${top(k, i, 1, 'Introduction', true)}
      <div class="sl-rule"></div>
      <div class="sl-body">
        <div class="sl-eyebrow">Check-In · rate yourself 0–10</div>
        <h2 class="sl-h2" style="margin-bottom:40px;">Where are you, honestly, right now?</h2>
        <div class="sl-checkin">
          ${G.checkin.map(c => `<div class="sl-ci-item"><span class="ci-k">${c.k}</span><span class="ci-q">${c.q}</span></div>`).join('')}
        </div>
        <div class="sl-scale">${Array.from({ length: 11 }).map((_, n) => `<span class="pip ${n <= 6 ? 'on' : ''}"></span>`).join('')}</div>
        <div class="sl-scale-lbl"><span>0 · none of this</span><span>5</span><span>10 · as much as I can imagine</span></div>
      </div>`, { dark: true, label: 'Check-In' }));

    /* 3, STEP 2 ACTIVITY: tool intro */
    slides.push(slide(k, `
      ${top(k, i, 2, 'Activity')}
      <div class="sl-rule"></div>
      <div class="sl-body">
        <div class="sl-eyebrow">Today's tool</div>
        <h2 class="sl-h1" style="font-size:92px;">${t.name}</h2>
        <div class="sl-kicker" style="color:var(--g);">${t.subtitle}</div>
        <p class="sl-lead" style="margin-top:40px;">A private worksheet, you'll work alone first. Nothing here will be shared unless you choose to. Take it slowly and answer honestly.</p>
      </div>`, { step: 2, label: 'Tool intro' }));

    /* 4, STEP 2 ACTIVITY: walkthrough */
    slides.push(slide(k, `
      ${top(k, i, 2, 'Activity')}
      <div class="sl-rule"></div>
      <div class="sl-body">
        <div class="sl-eyebrow">${t.name} · work through this</div>
        <ul class="sl-list anim">
          ${t.prompts.map(p => `<li><span class="mk"></span><span>${p}</span></li>`).join('')}
        </ul>
        ${t.statement ? `<div class="sl-teach" style="margin-top:44px;"><div class="a-label" style="font-size:22px;letter-spacing:.12em;text-transform:uppercase;color:var(--navy);margin-bottom:10px;">Your Orientation Statement</div><div style="font-family:var(--display);font-style:italic;font-size:42px;color:var(--navy);line-height:1.2;">“${t.statement}”</div></div>` : ''}
      </div>`, { step: 2, label: 'Tool walkthrough' }));

    /* 5, STEP 3 SHARING + STEP 4 PROCESSING */
    slides.push(slide(k, `
      ${top(k, i, 3, 'Sharing')}
      <div class="sl-rule"></div>
      <div class="sl-body">
        <div class="sl-eyebrow">Share patterns, not private details</div>
        <p class="sl-prompt">${steps[2][1].replace(/<[^>]+>/g, '').split('.')[0]}.</p>
        <div class="sl-anchor" style="margin-top:64px;">
          <div class="a-card outline"><div class="a-label" style="color:var(--g);">Then, Step 4 · Processing</div><div class="a-text">${steps[3][1].replace(/<[^>]+>/g, '')}</div></div>
        </div>
      </div>`, { step: 4, label: 'Sharing & processing' }));

    /* 6, STEP 5 GENERALIZING: psychoeducation */
    const md = G.modes[i]; // align a mode to the week for grounding
    slides.push(slide(k, `
      ${top(k, i, 5, 'Generalizing')}
      <div class="sl-rule"></div>
      <div class="sl-body">
        <div class="sl-eyebrow">Why this matters</div>
        <h2 class="sl-h2" style="margin-bottom:30px;">${psychoHead(k)}</h2>
        <div class="sl-teach">
          <p class="sl-lead" style="max-width:100%;">${steps[4][1]}</p>
        </div>
      </div>`, { step: 5, label: 'Generalizing' }));

    /* 7, STEP 6 APPLICATION: anchor */
    slides.push(slide(k, `
      ${top(k, i, 6, 'Application')}
      <div class="sl-rule"></div>
      <div class="sl-body">
        <div class="sl-eyebrow">This week, your anchor</div>
        <h2 class="sl-h2" style="font-size:64px;margin-bottom:52px;">${s.anchor}</h2>
        <div class="sl-anchor">
          <div class="a-card"><div class="a-label">Between-session reflection</div><div class="a-text">${s.between}</div></div>
          <div class="a-card outline"><div class="a-label" style="color:var(--g);">Resilience point</div><div class="a-text">${s.resilience}, ${resilienceLine(k)}</div></div>
        </div>
      </div>`, { step: 6, label: 'Application / anchor' }));

    /* 8, STEP 7 SUMMARY: COMB */
    slides.push(slide(k, `
      ${top(k, i, 7, 'Summary', true)}
      <div class="sl-rule"></div>
      <div class="sl-body">
        <div class="sl-eyebrow">The COMB close</div>
        <h2 class="sl-h2" style="margin-bottom:46px;">Before we finish</h2>
        <div class="sl-comb">
          ${G.comb.map(c => `<div class="sl-comb-item"><span class="cl">${c.l}</span><span class="ct"><b>${c.k}</b><span>${c.q}</span></span></div>`).join('')}
        </div>
      </div>`, { dark: true, label: 'COMB close' }));

    /* 9, re-rate + signpost (final) */
    const lastWeek = i === 3;
    slides.push(slide(k, `
      <div class="sl-top">
        <span class="sl-week">Week ${i + 1} · The ${NAMES[k]} · close</span>
        ${OP.logo({ orientation: 'horizontal', size: 24, onNavy: true })}
      </div>
      <div class="sl-rule"></div>
      <div class="sl-body">
        <div class="sl-eyebrow">${lastWeek ? 'Post-programme Check-In · signposting' : 'Re-rate your Check-In · signposting'}</div>
        <h2 class="sl-h2" style="margin-bottom:36px;">${lastWeek ? 'You walked the whole path. Thank you.' : 'Rate again, notice any movement.'}</h2>
        <p class="sl-lead" style="margin-bottom:40px;">This is developmental mentoring, not therapy. If anything here felt heavier than this work can hold, please reach out, there is no shame in it.</p>
        <div class="sl-res">
          ${G.safeguarding.resources.slice(0, 4).map(r => `<div class="sl-res-item"><span class="r-n">${r[0]}</span><span class="r-c">${r[1]}</span><span class="r-note">${r[2]}</span></div>`).join('')}
        </div>
      </div>
      <div class="sl-foot"><span class="sl-nonclinical">OurPath Guidance Ltd · ourpathguidance.co.uk · Non-clinical developmental support</span>
      <span class="sl-nonclinical">${lastWeek ? 'Next: journal · 1-to-1 mentoring · next cohort' : 'See you next week'}</span></div>`,
      { dark: true, corner: true, label: 'Signposting' }));

    mount.innerHTML = slides.join('');
  }

  function psychoHead(k) {
    return {
      mind: 'Functioning without a framework is exhausting.',
      heart: 'Connection is the strongest thing protecting you.',
      soul: 'Meaning is what carries you through the hard parts.',
      hands: 'You become what you repeatedly do.',
    }[k];
  }
  function resilienceLine(k) {
    return {
      mind: 'naming reduces overwhelm.',
      heart: 'connection buffers stress.',
      soul: 'meaning sustains through difficulty.',
      hands: 'meaningful doing builds momentum.',
    }[k];
  }

  window.Deck = { render };
})();
