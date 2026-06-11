/* ============================================================
   TERRA — the 5-level pathway ladder graphic
   Renders into a container. opts via data-* or args.
   Used by Welcome Pack (portrait) + standalone (landscape).
   ============================================================ */
(function(){
  const LADDER = [
    { lvl:1, cls:'level-1', ar:'الأساس', tl:'Asās',     en:'Foundation',          award:'Foundation Certificate' },
    { lvl:2, cls:'level-2', ar:'المعرفة', tl:'Maʿrifah',  en:'Knowledge',           award:'Knowledge Certificate' },
    { lvl:3, cls:'level-3', ar:'الممارسة',tl:'Mumārasah', en:'Supervised Practice', award:'Certified Mentor' },
    { lvl:4, cls:'level-4', ar:'الإتقان', tl:'Itqān',     en:'Proficient Practice', award:'Advanced Mentor' },
    { lvl:5, cls:'level-5', ar:'الإجازة', tl:'Ijāzah',    en:'Authorisation',       award:'Authorised Trainer' },
  ];
  window.TERRA_LADDER = LADDER;

  // Vertical ascending ladder (for portrait booklet)
  window.terraLadderV = function(){
    return `<div class="tl-v">${LADDER.map((d,i)=>{
      const seal = terraSeal({ size:62, level:d.lvl, glyph:d.ar, gold:d.lvl===5 });
      return `<div class="tl-rung ${d.cls}" style="margin-bottom:${(LADDER.length-1-i)*0}px;">
        <div class="tl-step" style="--w:${36+i*15}%;">
          <div class="tl-seal">${seal}</div>
          <div class="tl-txt">
            <div class="tl-lvl">Level ${['I','II','III','IV','V'][i]}</div>
            <div class="tl-en">${d.tl} · ${d.en}</div>
            <div class="tl-award">${d.award}</div>
          </div>
        </div>
      </div>`;
    }).reverse().join('')}</div>`;
  };

  // Horizontal ascending ladder (for landscape website diagram)
  window.terraLadderH = function(){
    const risers = [34, 78, 122, 166, 210];
    return `<div class="tl-h">${LADDER.map((d,i)=>{
      const seal = terraSeal({ size:74, level:d.lvl, glyph:d.ar, gold:d.lvl===5 });
      return `<div class="tl-col ${d.cls}">
        <div class="tl-riser" style="height:${risers[i]}px;"></div>
        <div class="tl-card">
          <div class="tl-seal">${seal}</div>
          <div class="tl-lvl">Level ${['I','II','III','IV','V'][i]}</div>
          <div class="tl-ar">${d.ar}</div>
          <div class="tl-en">${d.tl}</div>
          <div class="tl-sub">${d.en}</div>
          <div class="tl-award">${d.award}</div>
        </div>
      </div>`;
    }).join('')}</div>`;
  };
})();
