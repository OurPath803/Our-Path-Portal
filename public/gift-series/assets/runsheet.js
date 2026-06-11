/* ============================================================
   OurPath, Google Meet run-sheets / facilitator scripts
   One minute-by-minute run sheet per session. Requires
   content.js, ourpath.js, document.css. Adds run-sheet styles.
   ============================================================ */
(function () {
  const G = window.GIFT;
  const OP = window.OurPath;
  const NAMES = { mind: 'Mind', heart: 'Heart', soul: 'Soul', hands: 'Hands' };
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

  // running clock from cumulative step minutes
  function clock(mins) {
    const m = Math.round(mins);
    return `${String(Math.floor(m)).padStart(2, '0')}:00`;
  }

  // a spoken-line block
  function say(text) {
    return `<div class="rs-say"><span class="rs-say-tag">Say</span><span class="rs-say-text">“${text}”</span></div>`;
  }
  function doLine(items) {
    return `<ul class="rs-do">${items.map(x => `<li>${x}</li>`).join('')}</ul>`;
  }
  function screenTag(label) {
    return `<span class="rs-screen"><span class="rs-screen-ic">▣</span>Share: ${label}</span>`;
  }

  /* ---- the per-week spoken scripts & cues ---- */
  const SCRIPTS = {
    mind: {
      opening: 'Welcome, everyone. My name is [facilitator], and this is The Gift Series, a four-week space to see your life a little more clearly. I\u2019m here as your guide and timekeeper, not as a therapist. This week is the Gift of the Mind.',
      warmup: 'One word, just one, for how you arrived today. Drop it in the chat or unmute. No explaining.',
      toolIntro: 'We\u2019re going to map your actual position. Not the tidy version, the real one. This is private; you won\u2019t be asked to read it out.',
      sharePrompt: 'In your pairs: what surprised you? Patterns only, you never have to share the detail.',
      closing: 'Before you go: this week, notice once a day where your energy actually went, and just name it. No fixing. We\u2019ll start there next week with the Gift of the Heart.',
    },
    heart: {
      opening: 'Welcome back. I\u2019m [facilitator]. Last week we mapped where you are. This week, the Gift of the Heart, we name what it\u2019s costing you to carry it all.',
      warmup: 'One word for the week behind you. Chat or voice, your choice.',
      toolIntro: 'We\u2019re going to audit the real cost of what you carry. Some of it you chose. Some of it you didn\u2019t. We\u2019re going to tell the difference, without blame.',
      sharePrompt: 'Where was the resistance to naming a cost strongest for you? Patterns, not private detail.',
      closing: 'This week: hold one boundary, or tend one connection, just one. Connection is the strongest thing protecting you. Next week, the Gift of the Soul.',
    },
    soul: {
      opening: 'Welcome back, I\u2019m [facilitator]. We\u2019ve seen our position and named our costs. This week, the Gift of the Soul: what have we actually learned, and where does meaning live?',
      warmup: 'One word for what you\u2019re carrying into today.',
      toolIntro: 'Not everything we live through teaches us, most of it just happens. We\u2019re going to run the last few weeks through a filter: what changed you, what didn\u2019t, and what question you\u2019re still holding.',
      sharePrompt: 'Patience or avoidance, where\u2019s the line for you? Speak only to what you\u2019re ready to.',
      closing: 'This week: choose one value, and let it shape one specific action. Meaning is what carries us through the hard parts. Next week we finish, with the Gift of the Hands.',
    },
    hands: {
      opening: 'Welcome to our final week. I\u2019m [facilitator]. We\u2019ve seen, named, and integrated. Today, the Gift of the Hands, we choose how we face the season, and we leave with something to do.',
      warmup: 'One word for how you\u2019re arriving to this last session.',
      toolIntro: 'There are four modes of work: Learning, Action, Endurance, Repair. We\u2019re going to name the one this season actually needs, and write a single sentence, your Orientation Statement.',
      sharePrompt: 'If you\u2019re willing, read your Orientation Statement aloud. We witness, no feedback, no advice. (Entirely optional.)',
      closing: 'This is the end of the series. Take your keystone routine into the next season, small, repeatable, yours. Thank you for walking the whole path. The door stays open: journal, 1-to-1 mentoring, the next cohort.',
    },
  };

  function preSession(k, i) {
    const body = `
      <div class="gift-${k}" style="border-left:3px solid var(--g);padding-left:16px;margin-bottom:18px;">
        <div style="display:flex;align-items:center;gap:14px;">
          <span style="color:var(--g);flex:none;">${OP.icon(k, { size: 38, stroke: 1.7 })}</span>
          <div style="flex:1;">
            <div class="doc-eyebrow">Google Meet run-sheet · Week ${i + 1} · ${DOMAINS[k]}</div>
            <h1 class="doc-h1" style="font-size:34px;margin:3px 0 0;">The Gift of the ${NAMES[k]}</h1>
          </div>
        </div>
        <div class="doc-kicker" style="margin-top:10px;">${G.sessions[k].strap}</div>
      </div>
      <div class="doc-cols" style="gap:20px;align-items:start;">
        <div>
          <div class="doc-h3">15 min before, tech &amp; room setup</div>
          <ul class="doc-ul checks">
            <li>Open the Meet 10 min early; admit from the waiting room as people arrive</li>
            <li>Test mic, camera, and <b>screen-share</b> of the Week ${i + 1} deck</li>
            <li>Have the deck on slide 1; have the Workbook PDF and Safeguarding card to hand</li>
            <li>Paste the welcome message + group agreement link in the chat</li>
            <li>Mute notifications; close other tabs; phone on silent and out of reach</li>
            <li>Have water, the run-sheet, and a pen for notes</li>
            <li>Decide your co-facilitator / chat-watcher role if you have one</li>
          </ul>
        </div>
        <div>
          <div class="doc-h3">Have ready to paste in chat</div>
          <div class="rs-chat">
            <div class="rs-chat-line"><b>Welcome:</b> So glad you\u2019re here. Cameras optional. We\u2019ll begin at the top of the hour.</div>
            <div class="rs-chat-line"><b>Agreement:</b> [link to one-page group agreement]</div>
            <div class="rs-chat-line"><b>Workbook:</b> Open to the ${G.tools[k].name} worksheet (p.${5 + i}).</div>
            <div class="rs-chat-line"><b>Support (keep pinned):</b> Samaritans 116 123 · Shout text 85258 · 999/A&amp;E if urgent</div>
          </div>
          <div class="doc-callout alert" style="margin-top:14px;">
            <div style="font-family:var(--body);font-weight:700;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--heart);">Hold the boundary</div>
            <p class="doc-p" style="margin:5px 0 0;font-size:12px;">This is non-clinical. If risk surfaces, switch to the safeguarding response (overleaf), presence over agenda.</p>
          </div>
        </div>
      </div>
      <div class="doc-h3" style="margin-top:18px;">The spoken opening <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--ink-60);font-size:11px;">, name · group · role</span></div>
      ${say(SCRIPTS[k].opening)}`;
    return chrome(`Run-sheet · Week ${i + 1}, ${NAMES[k]}`, body, k);
  }

  function runMinutes(k, i) {
    const steps = G.sevenSteps[k];
    const sc = SCRIPTS[k];
    let cum = 0;
    const cues = {
      0: doLine([screenTag('Title slide → Group agreement'), 'Greet each person <b>by name</b> as they speak.', `Warm-up, say: <em>“${sc.warmup}”</em>`, 'Read the agreement aloud; invite a thumbs-up to consent.', screenTag('Check-In slide'), 'Everyone rates the 5 domains 0–10 privately in their Workbook.']),
      1: doLine([screenTag(`${G.tools[k].name}, tool intro & walkthrough`), `Say: <em>“${sc.toolIntro}”</em>`, 'Read each prompt; keep instructions simple and sequenced.', 'Cameras off is fine for private writing. <b>Give a 2-minute warning</b> before moving on.']),
      2: doLine([screenTag('Sharing prompt slide'), `Breakout pairs (or a round if ≤6). Say: <em>“${sc.sharePrompt}”</em>`, 'Set a clear timer; reopen the main room with a 30-sec warning.']),
      3: doLine(['Back in the main room, slow the pace.', 'Invite the felt layer, not more content: “What was that like?”', 'Protect quieter members; never put anyone on the spot.']),
      4: doLine([screenTag('Generalizing / psychoeducation slide'), 'This is the teaching moment, keep it short (≈3–4 min).', 'Name the resilience point explicitly; offer the Arabic term <em>and</em> its plain-English gloss.']),
      5: doLine([screenTag('Application / anchor slide'), 'Each person commits to one between-session anchor in their Workbook.', 'Keep it small and specific, “one role”, “one boundary”, “one routine”.']),
      6: doLine([screenTag('COMB close slide'), 'Run C·O·M·B as a quick round or chat-drop.', screenTag('Check-In slide (re-rate)'), 'Re-rate the 5 domains; note anyone with a 2+ shift to acknowledge.', screenTag('Signposting slide'), 'Closing ritual + signpost. End on time.']),
    };
    const rows = steps.map((st, idx) => {
      const start = clock(cum); cum += st[2];
      return `<div class="rs-step">
        <div class="rs-time"><span class="rs-clock">${start}</span><span class="rs-dur">${st[2]} min</span></div>
        <div class="rs-step-body">
          <div class="rs-step-head"><span class="rs-step-num">${idx + 1}</span><span class="rs-step-name">${st[0]}</span></div>
          ${cues[idx] || ''}
        </div>
      </div>`;
    }).join('');
    const body = `
      <div class="doc-h3" style="color:var(--g);">Minute-by-minute · 75 minutes</div>
      <p class="doc-p" style="margin-bottom:14px;font-size:12.5px;">Times are a guide, hold Cole's order, flex the minutes to your group. The <b>▣ Share</b> cue tells you what to put on screen.</p>
      <div class="rs-grid">${rows}</div>
      <div class="doc-h3" style="margin-top:18px;">The spoken close</div>
      ${say(sc.closing)}`;
    return chrome(`Run-sheet · Week ${i + 1}, ${NAMES[k]}`, body, k);
  }

  function contingency(k, i) {
    const items = [
      ['A long silence', 'Let it breathe, count to ten before rescuing it. Then: “Take your time. There\u2019s no rush here.” Offer the chat as an alternative to speaking.'],
      ['Someone becomes distressed', 'Slow right down. “Thank you for trusting us with that. Are you okay to stay with us, or would a moment off-camera help?” Offer to follow up 1-to-1 after. Keep the safeguarding card visible.'],
      ['A dominant member', 'Warmly redirect: “I want to make sure we hear some other voices, thank you.” Use round-robin or chat so quieter members have a clear way in.'],
      ['A risk disclosure', 'Move to the safeguarding response: slow down → ground (“Are you safe right now? Is someone with you?”) → signpost clearly → share resources in chat → follow up and document → consult your supervisor. Do not carry it alone.'],
      ['Tech failure (yours)', 'If you drop, the session pauses, participants keep their Workbook open. Rejoin; if you can\u2019t, the co-facilitator holds a grounding pause or closes early with the signposting slide.'],
      ['Tech failure (theirs)', 'Reassure in chat that dropping out is fine; the session is recorded for rewatch. They can return to the waiting room and you\u2019ll re-admit.'],
      ['Low attendance', 'Run it as a round rather than breakouts; the material works one-to-one or in a small circle. Warmth over format.'],
      ['Running over time', 'Protect Steps 6–7, the anchor and the close matter most. Trim Sharing or Generalizing, never the COMB close or the re-rate.'],
    ];
    const body = `
      <div class="doc-h3">Contingencies, hold the room</div>
      <p class="doc-p" style="margin-bottom:14px;">You won't need most of these. Read them once so they're in your hands if you do.</p>
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${items.map(([t, d]) => `<div class="rs-cont ${t.includes('risk') ? 'alert' : ''}">
          <div class="rs-cont-t">${t}</div>
          <div class="rs-cont-d">${d}</div>
        </div>`).join('')}
      </div>
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--line);text-align:center;">
        ${OP.logo({ orientation: 'horizontal', size: 18 })}
        <p class="doc-small" style="margin-top:10px;">Non-clinical developmental support · Samaritans 116 123 · Shout 85258 · 999/A&amp;E if at immediate risk</p>
      </div>`;
    return chrome(`Run-sheet · Week ${i + 1}, ${NAMES[k]}`, body, k);
  }

  const STYLE = `<style id="rs-style">
    .rs-say { display: grid; grid-template-columns: 54px 1fr; gap: 12px; align-items: start;
      background: var(--cream-200); border-left: 3px solid var(--gold); padding: 12px 16px; margin-bottom: 8px; }
    .rs-say-tag { font-family: var(--body); font-weight: 700; font-size: 9.5px; letter-spacing: .14em; text-transform: uppercase;
      color: var(--gold-deep); padding-top: 4px; }
    .rs-say-text { font-family: var(--display); font-style: italic; font-size: 16.5px; line-height: 1.42; color: var(--navy); }
    .rs-do { list-style: none; margin: 8px 0 0; padding: 0; display: flex; flex-direction: column; gap: 5px; }
    .rs-do li { position: relative; padding-left: 16px; font-family: var(--body); font-size: 12px; line-height: 1.45; color: var(--charcoal); }
    .rs-do li::before { content: "›"; position: absolute; left: 0; top: -1px; color: var(--g, var(--gold)); font-weight: 700; font-size: 14px; }
    .rs-do li b { color: var(--navy); }
    .rs-screen { display: inline-flex; align-items: center; gap: 6px; font-family: var(--body); font-weight: 600; font-size: 11px;
      color: var(--g, var(--navy)); background: var(--g-soft, var(--cream-200)); border-radius: 4px; padding: 2px 8px; }
    .rs-screen-ic { font-size: 11px; }

    .rs-chat { border: 1px dashed var(--line); border-radius: 6px; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; }
    .rs-chat-line { font-family: var(--body); font-size: 11.5px; line-height: 1.4; color: var(--charcoal); }
    .rs-chat-line b { color: var(--navy); }

    .rs-grid { display: flex; flex-direction: column; border: 1px solid var(--line); }
    .rs-step { display: grid; grid-template-columns: 78px 1fr; border-bottom: 1px solid var(--line); }
    .rs-step:last-child { border-bottom: none; }
    .rs-time { background: var(--g-soft); display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
      padding: 12px 6px; border-right: 1px solid var(--line); }
    .rs-clock { font-family: var(--display); font-size: 21px; font-weight: 600; color: var(--navy); }
    .rs-dur { font-family: var(--body); font-size: 10px; color: var(--ink-60); letter-spacing: .04em; margin-top: 2px; }
    .rs-step-body { padding: 12px 16px; }
    .rs-step-head { display: flex; align-items: center; gap: 10px; }
    .rs-step-num { width: 22px; height: 22px; border-radius: 50%; background: var(--g); color: #fff;
      font-family: var(--display); font-size: 14px; display: flex; align-items: center; justify-content: center; flex: none; }
    .rs-step-name { font-family: var(--body); font-weight: 700; font-size: 13px; color: var(--navy); letter-spacing: .02em; }

    .rs-cont { display: grid; grid-template-columns: 200px 1fr; gap: 16px; border: 1px solid var(--line); border-left: 3px solid var(--gold); padding: 11px 16px; }
    .rs-cont.alert { border-left-color: var(--heart); background: rgba(176,95,68,.05); }
    .rs-cont-t { font-family: var(--display); font-size: 17px; font-weight: 600; color: var(--navy); }
    .rs-cont-d { font-family: var(--body); font-size: 12px; line-height: 1.5; color: var(--charcoal); }
  </style>`;

  function build(key, mount) {
    const k = key;
    const i = G.order.indexOf(k);
    mount.innerHTML = STYLE + [preSession(k, i), runMinutes(k, i), contingency(k, i)].join('');
  }

  window.RunSheet = { build };
})();
