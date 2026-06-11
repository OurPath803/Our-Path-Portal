/* ============================================================
   TERRA shared marks — pointed-arch motif, seals, scaler
   Plain functions on window. Load after terra.css.
   ============================================================ */
(function(){
  const NS='http://www.w3.org/2000/svg';

  // ---- The OurPath compass mark (genuine brand SVG) ----
  // opts:{ size, theme:'light'|'dark'|'gold' }
  window.terraMark = function(opts){
    opts = opts || {};
    const sz = opts.size || 64;
    const theme = opts.theme || 'light';
    let g='#C4993C', cross='#1A2F36', crossOp=0.2, tickOp=0.5, ctr='#1A2F36', ctrOp=0.4;
    if(theme==='dark'){ g='#C4993C'; cross='#F5F0E8'; crossOp=0.12; tickOp=0.6; ctr='#F5F0E8'; ctrOp=0.3; }
    if(theme==='gold'){ g='#1A2F36'; cross='#1A2F36'; crossOp=0.2; tickOp=0.4; ctr='#1A2F36'; ctrOp=0.5; }
    const arcOp = theme==='gold'?0.8:0.9;
    const termOp = theme==='gold'?0.8:0.9;
    return `<svg class="terra-mark" width="${sz}" height="${sz}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="OurPath">
      <circle cx="32" cy="32" r="30" stroke="${g}" stroke-width="0.75" opacity="${theme==='gold'?0.3:0.38}"/>
      <circle cx="32" cy="32" r="22" stroke="${g}" stroke-width="0.5" opacity="0.25"/>
      <path d="M 10 38 Q 20 20, 32 32 Q 44 44, 54 26" stroke="${g}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="${arcOp}"/>
      <circle cx="54" cy="26" r="2.5" fill="${g}" opacity="${termOp}"/>
      <circle cx="10" cy="38" r="1.5" fill="${g}" opacity="0.5"/>
      <line x1="32" y1="14" x2="32" y2="50" stroke="${cross}" stroke-width="0.5" opacity="${crossOp}"/>
      <line x1="14" y1="32" x2="50" y2="32" stroke="${cross}" stroke-width="0.5" opacity="${crossOp}"/>
      <line x1="32" y1="4"  x2="32" y2="8"  stroke="${g}" stroke-width="1" opacity="${tickOp}"/>
      <line x1="32" y1="56" x2="32" y2="60" stroke="${g}" stroke-width="1" opacity="${tickOp}"/>
      <line x1="4"  y1="32" x2="8"  y2="32" stroke="${g}" stroke-width="1" opacity="${tickOp}"/>
      <line x1="56" y1="32" x2="60" y2="32" stroke="${g}" stroke-width="1" opacity="${tickOp}"/>
      <circle cx="32" cy="32" r="1.5" fill="${ctr}" opacity="${ctrOp}"/>
    </svg>`;
  };
  window.terraMotif = function(opts){ return terraMark(opts); };

  // Thin geometric rule with a centred diamond (for section breaks)
  window.terraDiamondRule = function(width, color){
    color = color || 'var(--gold)';
    width = width || 220;
    return `<div class="terra-drule" style="display:flex;align-items:center;gap:10px;justify-content:center;width:${width}px;">
      <span style="flex:1;height:1px;background:${color};opacity:.7;"></span>
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M5 0 L10 5 L5 10 L0 5 Z" fill="${color}"/></svg>
      <span style="flex:1;height:1px;background:${color};opacity:.7;"></span>
    </div>`;
  };

  // The brand divider: gold rule · gold dot · gold rule
  function brandDivider(theme, w){
    w = w || 60;
    return `<div style="display:flex;align-items:center;gap:12px;justify-content:center;">
      <span style="display:block;height:1px;width:${w}px;background:var(--gold);opacity:.6;"></span>
      <span style="width:4px;height:4px;border-radius:50%;background:var(--gold);"></span>
      <span style="display:block;height:1px;width:${w}px;background:var(--gold);opacity:.6;"></span>
    </div>`;
  }
  window.terraBrandDivider = brandDivider;

  // Stacked OurPath lockup. opts:{ scale, theme, mark, tagline }
  window.terraWordmark = function(opts){
    opts = opts || {};
    const sc = opts.scale || 1;
    const theme = opts.theme || 'light';
    const showMark = opts.mark !== false;
    const showTag = opts.tagline !== false;
    const nameColor = theme==='dark' ? 'var(--cream)' : 'var(--navy)';
    const tagColor = theme==='dark' ? '#7A9098' : 'var(--grey)';
    const mark = showMark ? `<div style="margin-bottom:${18*sc}px;">${terraMark({size:Math.round(64*sc), theme:theme})}</div>` : '';
    const tag = showTag ? `<div style="margin-top:${12*sc}px;display:flex;flex-direction:column;align-items:center;gap:${12*sc}px;">
        ${brandDivider(theme, 52*sc)}
        <span style="font-family:'Cormorant SC',serif;font-weight:300;font-size:${11*sc}px;letter-spacing:${0.45*sc}em;text-transform:uppercase;color:${tagColor};padding-left:${0.45*sc}em;">Guidance &amp; Mentoring</span>
      </div>` : '';
    return `<div class="terra-lockup" style="display:flex;flex-direction:column;align-items:center;text-align:center;">
      ${mark}
      <span style="font-family:'Cormorant Garamond',serif;font-weight:300;font-size:${48*sc}px;letter-spacing:${0.115*sc}em;line-height:1;color:${nameColor};padding-left:${0.115*sc}em;"><span>Our</span><span style="font-weight:600;font-style:italic;">Path</span></span>
      ${tag}
    </div>`;
  };

  // Horizontal OurPath lockup. opts:{ scale, theme, tagline }
  window.terraWordmarkH = function(opts){
    opts = opts || {};
    const sc = opts.scale || 1;
    const theme = opts.theme || 'light';
    const nameColor = theme==='dark' ? 'var(--cream)' : 'var(--navy)';
    const tagColor = theme==='dark' ? '#7A9098' : 'var(--grey)';
    const tag = opts.tagline!==false ? `<span style="font-family:'Cormorant SC',serif;font-weight:300;font-size:${9.5*sc}px;letter-spacing:${0.42*sc}em;text-transform:uppercase;color:${tagColor};">Guidance &amp; Mentoring</span>` : '';
    return `<div class="terra-lockup-h" style="display:flex;align-items:center;gap:${26*sc}px;">
      ${terraMark({size:Math.round(44*sc), theme:theme})}
      <span style="display:block;width:1px;height:${46*sc}px;background:var(--gold);opacity:.4;"></span>
      <span style="display:flex;flex-direction:column;gap:${5*sc}px;">
        <span style="font-family:'Cormorant Garamond',serif;font-weight:300;font-size:${32*sc}px;letter-spacing:${0.11*sc}em;line-height:1;color:${nameColor};"><span>Our</span><span style="font-weight:600;font-style:italic;">Path</span></span>
        ${tag}
      </span>
    </div>`;
  };

  // Level seal. opts:{ size, level, glyph, ring, glyphColor, fill, gold }
  // Concentric rings + compass ticks (brand echo) + centred Arabic glyph + numeral band.
  window.terraSeal = function(opts){
    opts = opts || {};
    const sz = opts.size || 140;
    const lvl = opts.level || 1;
    const glyph = opts.glyph || '';
    const ring = opts.ring || 'var(--seal-ring, var(--navy))';
    const fill = opts.fill || 'var(--seal-fill, transparent)';
    const gC = opts.glyphColor || 'var(--seal-glyph, var(--navy))';
    const numColor = opts.numColor || (opts.gold ? 'var(--cream)' : 'var(--gold-deep)');
    const tick = opts.gold ? 'var(--cream)' : 'var(--gold)';
    const roman = ['','I','II','III','IV','V'][lvl] || lvl;
    return `<svg class="terra-seal" width="${sz}" height="${sz}" viewBox="0 0 200 200" fill="none" aria-label="Level ${lvl} seal">
      <circle cx="100" cy="100" r="94" fill="${fill}" stroke="${ring}" stroke-width="2"/>
      <circle cx="100" cy="100" r="80" fill="none" stroke="${ring}" stroke-width="0.8" opacity="0.7"/>
      <circle cx="100" cy="100" r="80" fill="none" stroke="${ring}" stroke-width="0.8" stroke-dasharray="1.3 5.4" opacity="0.85"/>
      <!-- compass cardinal ticks -->
      <line x1="100" y1="14" x2="100" y2="24" stroke="${tick}" stroke-width="1.4"/>
      <line x1="100" y1="176" x2="100" y2="186" stroke="${tick}" stroke-width="1.4"/>
      <line x1="14" y1="100" x2="24" y2="100" stroke="${tick}" stroke-width="1.4"/>
      <line x1="176" y1="100" x2="186" y2="100" stroke="${tick}" stroke-width="1.4"/>
      <!-- centred Arabic glyph -->
      <text x="100" y="116" text-anchor="middle" font-family="Amiri, serif" font-size="60" fill="${gC}" direction="rtl">${glyph}</text>
      <!-- numeral band -->
      <text x="100" y="156" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="600" letter-spacing="3" font-size="14.5" fill="${numColor}">LEVEL ${roman}</text>
    </svg>`;
  };

  // ---- Digital badge / medallion (square, transparent-ready) ----
  // opts:{ size, level, glyph, translit, designation, ring, disc, glyphColor, textColor, tick, gold }
  window.terraBadge = function(opts){
    opts = opts || {};
    const sz = opts.size || 200;
    const lvl = opts.level || 1;
    const glyph = opts.glyph || '';
    const translit = (opts.translit || '').toUpperCase();
    const desig = (opts.designation || '').toUpperCase();
    const roman = ['','I','II','III','IV','V'][lvl] || lvl;
    const gold = !!opts.gold;
    // colour scheme
    const accent = opts.ring   || (gold ? 'var(--gold)'   : 'var(--navy)');
    const disc   = opts.disc   || (gold ? 'var(--gold)'   : 'var(--cream)');
    const glyphC = opts.glyphColor || (gold ? 'var(--cream)' : 'var(--navy)');
    const textC  = opts.textColor  || (gold ? 'var(--cream)' : 'var(--navy)');
    const tick   = opts.tick   || (gold ? 'var(--cream)' : 'var(--gold)');
    const uid = 'bdg'+lvl+'_'+Math.random().toString(36).slice(2,7);
    return `<svg class="terra-badge" width="${sz}" height="${sz}" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="${desig} badge">
      <defs>
        <path id="${uid}_top" d="M 26 100 A 74 74 0 0 1 174 100"/>
        <path id="${uid}_bot" d="M 168 100 A 68 68 0 0 1 32 100"/>
      </defs>
      <!-- coin -->
      <circle cx="100" cy="100" r="98" fill="${disc}"/>
      <circle cx="100" cy="100" r="98" fill="none" stroke="${accent}" stroke-width="2"/>
      <circle cx="100" cy="100" r="62" fill="none" stroke="${accent}" stroke-width="1" opacity="0.6"/>
      <circle cx="100" cy="100" r="62" fill="none" stroke="${accent}" stroke-width="1" stroke-dasharray="1.2 5" opacity="0.7"/>
      <!-- ring text -->
      <text font-family="DM Sans, sans-serif" font-weight="600" font-size="12.5" letter-spacing="2.4" fill="${textC}">
        <textPath href="#${uid}_top" startOffset="50%" text-anchor="middle">${desig}</textPath>
      </text>
      <text font-family="DM Sans, sans-serif" font-weight="500" font-size="9.5" letter-spacing="3" fill="${textC}" opacity="0.85">
        <textPath href="#${uid}_bot" startOffset="50%" text-anchor="middle">LEVEL ${roman} · ${translit}</textPath>
      </text>
      <!-- compass ticks -->
      <line x1="100" y1="44" x2="100" y2="52" stroke="${tick}" stroke-width="1.4"/>
      <line x1="100" y1="148" x2="100" y2="156" stroke="${tick}" stroke-width="1.4"/>
      <line x1="44" y1="100" x2="52" y2="100" stroke="${tick}" stroke-width="1.4"/>
      <line x1="148" y1="100" x2="156" y2="100" stroke="${tick}" stroke-width="1.4"/>
      <!-- centred glyph -->
      <text x="100" y="112" text-anchor="middle" font-family="Amiri, serif" font-weight="700" font-size="46" fill="${glyphC}" direction="rtl">${glyph}</text>
      <!-- roman numeral -->
      <text x="100" y="134" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="600" font-size="10" letter-spacing="2" fill="${tick}">${roman}</text>
    </svg>`;
  };

  // Responsive scaler for fixed-size papers
  function fit(){
    document.querySelectorAll('.paper-mount').forEach(function(m){
      const p = m.querySelector('.paper'); if(!p) return;
      const w = +p.dataset.w || 1123;
      const avail = m.clientWidth;
      const scale = Math.min(1, avail / w);
      p.style.transform = 'scale('+scale+')';
      const h = +p.dataset.h || 794;
      m.style.height = (h*scale)+'px';
    });
  }
  window.terraFit = fit;
  window.addEventListener('resize', fit);
  window.addEventListener('load', function(){ fit(); setTimeout(fit,250); });
  if(document.fonts && document.fonts.ready){ document.fonts.ready.then(function(){ fit(); }); }
  document.addEventListener('DOMContentLoaded', fit);
})();
