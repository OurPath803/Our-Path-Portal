/* ============================================================
   OurPath, Gift Series poster builders
   window.Posters.build(type, size) → HTML string
   types: 'master' | 'mind' | 'heart' | 'soul' | 'hands'
   size:  'a4' | 'square'
   Requires ourpath.js (OurPath.icon / .logo / .footer / .GIFTS)
   ============================================================ */
(function () {
  // ---- editable logistics (placeholders, adjust per cohort) ----
  const SERIES = {
    time: '7:30 – 8:45pm',
    platform: 'Live on Google Meet',
    join: 'Join link sent on booking',
    price: '£80 full series · £24 single gift',
    cta: 'Book one and see',
    url: 'ourpathguidance.co.uk/gift-series',
    dates: ['Thu 3 Sep', 'Thu 10 Sep', 'Thu 17 Sep', 'Thu 24 Sep'],
    cohort: 'Autumn cohort · 2026',
  };

  const EXPLORE = {
    mind: [
      'Map everything you carry, and whether you <em>chose</em>, <em>inherited</em>, or <em>assumed</em> it',
      'See the gap between where your energy goes and where you think it goes',
      'Leave naming one role to re-examine this week',
    ],
    heart: [
      'Audit the real cost of what you carry, visible, hidden, and deferred',
      'Separate the costs that are yours from the ones you\u2019ve absorbed',
      'Name one boundary to hold, or one connection to tend',
    ],
    soul: [
      'Tell genuine learning from passive accumulation',
      'Sit with one honest question, unrushed, unresolved',
      'Find one value to act from before the week is out',
    ],
    hands: [
      'Choose the mode your season needs: Learning · Action · Endurance · Repair',
      'Write your own <em>Orientation Statement</em>',
      'Commit to one keystone routine that holds body and mind',
    ],
  };

  const ARABIC = {
    mind: 'mu\u1E25\u0101sabah · structured self-examination',
    heart: '\u1E63u\u1E25ba · companionship that steadies',
    soul: 'tadabbur · reflection that integrates',
    hands: 'tawakkul · trust expressed through action',
  };

  const I = (n, o) => window.OurPath.icon(n, o);
  const G = () => window.OurPath.GIFTS;
  const logo = (o) => window.OurPath.logo(o);
  const foot = (o) => window.OurPath.footer(o);

  function weekTab(g, onAccent) {
    return `<span class="pos-week" style="${onAccent ? 'border-color:rgba(255,255,255,.4);color:#fff' : ''}">Week ${g.week}&nbsp;of&nbsp;4</span>`;
  }

  /* ---------------- GIFT POSTER · A4 ---------------- */
  function giftA4(key) {
    const g = G()[key];
    const bullets = EXPLORE[key].map(b =>
      `<li><span class="tick">${I(key === 'mind' ? 'mind' : key, { size: 0 })}</span><span class="bx">${b}</span></li>`
    ).join('');
    const dot = `<svg width="9" height="9" viewBox="0 0 10 10"><path d="M5 0l1.4 3.6L10 5 6.4 6.4 5 10 3.6 6.4 0 5l3.6-1.4z" fill="var(--accent)"/></svg>`;
    const lis = EXPLORE[key].map(b => `<li><span class="tick">${dot}</span><span class="bx">${b}</span></li>`).join('');
    return `<div class="pos pos--gift" style="--accent:var(--${key});--accent-soft:var(--${key}-soft)">
      <div class="pos-watermark">${I(key, { size: 520, stroke: 1.2 })}</div>
      <div class="pos-pad">
        <header class="pos-head">
          <span class="pos-logo">${logo({ orientation: 'horizontal', size: 19, tagline: false })}</span>
          ${weekTab(g)}
        </header>

        <div class="pos-hero">
          <div class="pos-ic">${I(key, { size: 92, stroke: 1.7 })}</div>
          <div class="pos-eyebrow">${g.domain} · ${g.mode}</div>
          <h1 class="pos-title">The Gift of<br>the ${g.name}</h1>
          <hr class="gold-rule pos-rule">
          <p class="pos-strap">${g.strap}</p>
        </div>

        <div class="pos-explore">
          <div class="pos-explabel">What you\u2019ll explore</div>
          <ul class="pos-list">${lis}</ul>
          <div class="pos-arabic">${ARABIC[key]}</div>
        </div>

        <div class="pos-details">
          <div class="pos-det-row">
            <div class="det"><span class="det-k">When</span><span class="det-v">${SERIES.dates[g.week - 1]} · ${SERIES.time}</span></div>
            <div class="det"><span class="det-k">Where</span><span class="det-v">${SERIES.platform}</span></div>
          </div>
          <div class="pos-det-row">
            <div class="det"><span class="det-k">Group</span><span class="det-v">8–12 people · 75 minutes</span></div>
            <div class="det"><span class="det-k">Fee</span><span class="det-v">${SERIES.price}</span></div>
          </div>
          <a class="pos-cta">${SERIES.cta}<span class="arr">→</span></a>
          <div class="pos-join">${SERIES.url} · ${SERIES.join}</div>
        </div>

        <footer class="pos-foot">
          <span class="pos-nonclinical">Non-clinical developmental support, not therapy, diagnosis, or treatment.</span>
          <span class="pos-footline">${foot()}</span>
        </footer>
      </div>
    </div>`;
  }

  /* ---------------- GIFT POSTER · SQUARE 1080 ---------------- */
  function giftSquare(key) {
    const g = G()[key];
    const dot = `<svg width="9" height="9" viewBox="0 0 10 10"><path d="M5 0l1.4 3.6L10 5 6.4 6.4 5 10 3.6 6.4 0 5l3.6-1.4z" fill="var(--accent)"/></svg>`;
    const lis = EXPLORE[key].map(b => `<li><span class="tick">${dot}</span><span class="bx">${b}</span></li>`).join('');
    return `<div class="pos pos--gift pos--sq" style="--accent:var(--${key});--accent-soft:var(--${key}-soft)">
      <div class="pos-watermark sq">${I(key, { size: 560, stroke: 1.1 })}</div>
      <div class="pos-pad">
        <header class="pos-head">
          <span class="pos-logo">${logo({ orientation: 'horizontal', size: 22, tagline: false })}</span>
          ${weekTab(g)}
        </header>
        <div class="pos-sq-mid">
          <div class="pos-ic">${I(key, { size: 112, stroke: 1.6 })}</div>
          <div class="pos-eyebrow">${g.domain} · ${g.mode}</div>
          <h1 class="pos-title sq">The Gift of the ${g.name}</h1>
          <hr class="gold-rule pos-rule">
          <p class="pos-strap sq">${g.strap}</p>
          <ul class="pos-list sq">${lis}</ul>
        </div>
        <footer class="pos-sq-foot">
          <div class="sqf-line">
            <div class="det"><span class="det-k">When</span><span class="det-v">${SERIES.dates[g.week - 1]} · ${SERIES.time}</span></div>
            <div class="det"><span class="det-k">Where</span><span class="det-v">${SERIES.platform} · 75 min</span></div>
            <a class="pos-cta sq">${SERIES.cta}<span class="arr">→</span></a>
          </div>
          <div class="pos-nonclinical center">Non-clinical developmental support · ${SERIES.url}</div>
        </footer>
      </div>
    </div>`;
  }

  /* ---------------- SERIES MASTER · A4 ---------------- */
  function masterRow() {
    const ks = ['mind', 'heart', 'soul', 'hands'];
    return ks.map((k, i) => {
      const g = G()[k];
      return `<div class="mrow-item">
        <div class="mrow-ic" style="color:var(--${k})">${I(k, { size: 50, stroke: 1.7 })}</div>
        <div class="mrow-nm">${g.name}</div>
        <div class="mrow-dom">${g.domain.split(' ')[0]}</div>
        ${i < 3 ? '<span class="mrow-arrow">→</span>' : ''}
      </div>`;
    }).join('');
  }

  function masterA4() {
    return `<div class="pos pos--master">
      <div class="pos-pad">
        <header class="pos-head center">
          <span class="pos-logo">${logo({ orientation: 'horizontal', size: 24, onNavy: true })}</span>
        </header>
        <div class="m-hero">
          <div class="pos-eyebrow on-navy">Online group workshops · Google Meet</div>
          <h1 class="m-title">The Gift Series</h1>
          <div class="m-sub">Four Gifts · Four Weeks</div>
          <hr class="gold-rule m-rule">
          <p class="m-lede">A four-week journey that develops the whole person, <em>Mind, Heart, Soul,</em> and <em>Hands</em>. Each week stands alone; together they walk you through OurPath's full method, from <em>seeing clearly</em> to <em>choosing and doing</em>.</p>
        </div>
        <div class="m-arc">${masterRow()}</div>
        <div class="m-arcline">See clearly &nbsp;·&nbsp; name what you carry &nbsp;·&nbsp; integrate meaning &nbsp;·&nbsp; choose and do</div>
        <div class="m-details">
          <div class="m-det"><span class="md-k">Begins</span><span class="md-v">${SERIES.dates[0]} 2026 · weekly</span></div>
          <div class="m-det"><span class="md-k">Time</span><span class="md-v">${SERIES.time} · 75 min</span></div>
          <div class="m-det"><span class="md-k">Group</span><span class="md-v">8–12 people</span></div>
          <div class="m-det"><span class="md-k">Fee</span><span class="md-v">${SERIES.price}</span></div>
        </div>
        <div class="m-cta-row">
          <a class="pos-cta gold">${SERIES.cta}<span class="arr">→</span></a>
          <span class="m-url">${SERIES.url}</span>
        </div>
        <footer class="pos-foot on-navy">
          <span class="pos-nonclinical light">Non-clinical developmental support, not a substitute for therapy or medical care.</span>
          <span class="pos-footline">${foot({ onNavy: true })}</span>
        </footer>
      </div>
    </div>`;
  }

  /* ---------------- SERIES MASTER · SQUARE ---------------- */
  function masterSquare() {
    const ks = ['mind', 'heart', 'soul', 'hands'];
    const icons = ks.map(k => `<div class="msq-ic" style="color:var(--${k})">${I(k, { size: 58, stroke: 1.6 })}<span>${G()[k].name}</span></div>`).join('');
    return `<div class="pos pos--master pos--sq">
      <div class="pos-pad">
        <header class="pos-head center"><span class="pos-logo">${logo({ orientation: 'horizontal', size: 24, onNavy: true })}</span></header>
        <div class="msq-mid">
          <div class="pos-eyebrow on-navy">Online · Google Meet · 4 weeks</div>
          <h1 class="m-title sq">The Gift Series</h1>
          <div class="m-sub sq">Four Gifts · Four Weeks</div>
          <hr class="gold-rule m-rule">
          <div class="msq-icons">${icons}</div>
          <div class="m-arcline sq">See clearly · name what you carry · integrate meaning · choose and do</div>
        </div>
        <footer class="msq-foot">
          <div class="sqf-when light">Begins ${SERIES.dates[0]} 2026 · ${SERIES.time} · ${SERIES.price}</div>
          <a class="pos-cta gold sq">${SERIES.cta}<span class="arr">→</span></a>
          <div class="pos-nonclinical center light">Non-clinical developmental support · ${SERIES.url}</div>
        </footer>
      </div>
    </div>`;
  }

  function build(type, size) {
    if (type === 'master') return size === 'square' ? masterSquare() : masterA4();
    return size === 'square' ? giftSquare(type) : giftA4(type);
  }

  window.Posters = { build, SERIES };
})();
