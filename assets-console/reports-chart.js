/* Eventa · shared report chart ---------------------------------------------------
   Theme-aware, dependency-free trend chart for the Insights report pages.

   Visual language:
     · smooth line    — Catmull-Rom → cubic bezier, matching dashboard.html and the
                        Reports Overview so every chart in the kit reads as one family.
     · dotted grid    — a dot matrix (dasharray + round caps), quieter than rules.
     · area fill      — a soft gradient from the axis floor to the line.
     · hover          — vertical guide + ringed dot + a tooltip that follows the cursor.
                        Without it only the last of N values is ever readable.

   Options:
     labels, values          required, same length
     prefix, suffix          units for the axis + tooltip ('฿', '%', …)
     max                     top of a zero-based axis (ignored when fit:true)
     fit:true                fit the y-axis to the data band instead of 0→max.
                             Essential for rates: attendance lives in a 76–82% band,
                             which on a 0–100 axis is 6% of the plot and reads flat.
     type                    'area' (default) | 'line' (no fill) | 'bar'
     height                  default 190

   NOTE: no log axis. A log scale is right when data spans orders of magnitude; ours
   spans ~1.8×, where a log axis would flatten it into a meaningless line.

   Usage:
     EventaChart('rt-chart', { labels, values, max, prefix, suffix });
     window.EventaOnThemeChange = window.EventaReportRerender;
------------------------------------------------------------------------------- */
(function () {
  var charts = [];
  var gidc = 0;
  var DEFAULT_H = 190;

  function palette() {
    var dark = document.documentElement.classList.contains('dark');
    return {
      dot: dark ? 'rgba(255,255,255,0.18)' : 'rgba(17,24,39,0.16)',
      axis: dark ? '#8b96a0' : '#8b93a4',
      ring: dark ? '#171d1a' : '#ffffff',
      tipBg: dark ? '#e6ebe8' : '#111827',
      tipFg: dark ? '#0e1311' : '#ffffff',
      tipSub: dark ? 'rgba(14,19,17,.6)' : 'rgba(255,255,255,.6)',
      guide: dark ? 'rgba(255,255,255,0.25)' : 'rgba(17,24,39,0.2)',
      barIdle: dark ? 'rgba(27,167,112,.35)' : 'rgba(27,167,112,.25)',
    };
  }

  /* Catmull-Rom → cubic bezier. Matches dashboard.html / the Reports Overview, so every
     chart in the kit shares one curve treatment. */
  function smoothPath(pts) {
    var d = 'M ' + pts[0][0] + ' ' + pts[0][1];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i],
        p1 = pts[i],
        p2 = pts[i + 1],
        p3 = pts[i + 2] || p2;
      var c1x = p1[0] + (p2[0] - p0[0]) / 6,
        c1y = p1[1] + (p2[1] - p0[1]) / 6;
      var c2x = p2[0] - (p3[0] - p1[0]) / 6,
        c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ' C ' + c1x + ' ' + c1y + ' ' + c2x + ' ' + c2y + ' ' + p2[0] + ' ' + p2[1];
    }
    return d;
  }

  function fmt(v, cfg) {
    var r = Math.round(v * 10) / 10;
    return (cfg.prefix || '') + r + (cfg.suffix || '');
  }

  function domainOf(cfg) {
    var vals = cfg.values;
    if (!cfg.fit) return { lo: 0, hi: cfg.max || Math.max.apply(null, vals) * 1.15 || 1 };
    var lo = Math.min.apply(null, vals),
      hi = Math.max.apply(null, vals);
    var pad = Math.max(1, (hi - lo) * 0.35);
    var yLo = Math.floor(lo - pad),
      yHi = Math.ceil(hi + pad);
    if (cfg.suffix === '%') {
      yLo = Math.max(0, yLo);
      yHi = Math.min(100, yHi);
    }
    if (yHi <= yLo) yHi = yLo + 1;
    return { lo: yLo, hi: yHi };
  }

  function draw(c) {
    var cfg = c.cfg,
      el = c.el,
      p = palette();
    var W = Math.max(320, Math.round(el.clientWidth || 640));
    var H = cfg.height || DEFAULT_H;
    c._w = W;
    var PL = 48,
      PR = 14,
      PT = 22,
      PB = 34;
    var plotW = W - PL - PR,
      plotH = H - PT - PB,
      n = cfg.values.length;
    var dom = domainOf(cfg),
      span = dom.hi - dom.lo;
    var type = cfg.type || 'area';
    var xFor = function (i) {
      return PL + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
    };
    var yFor = function (v) {
      return PT + (1 - (v - dom.lo) / span) * plotH;
    };

    /* dotted grid: a hairline with round caps and a near-zero dash reads as a dot row */
    var grid = '';
    for (var k = 0; k <= 4; k++) {
      var val = dom.lo + (span * k) / 4,
        y = yFor(val);
      grid +=
        '<line x1="' +
        PL +
        '" y1="' +
        y +
        '" x2="' +
        (W - PR) +
        '" y2="' +
        y +
        '" stroke="' +
        p.dot +
        '" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="0.1 9"/>';
      grid +=
        '<text x="' +
        (PL - 10) +
        '" y="' +
        (y + 4) +
        '" text-anchor="end" font-size="11" fill="' +
        p.axis +
        '">' +
        fmt(val, cfg) +
        '</text>';
    }
    var xl = '';
    cfg.labels.forEach(function (lb, i) {
      xl +=
        '<text x="' +
        xFor(i) +
        '" y="' +
        (PT + plotH + 22) +
        '" text-anchor="middle" font-size="11" fill="' +
        p.axis +
        '">' +
        lb +
        '</text>';
    });

    var body = '';
    if (type === 'bar') {
      var slot = plotW / n;
      var bw = Math.max(5, Math.min(slot * 0.62, 40));
      var rx = Math.min(bw / 2, 6);
      cfg.values.forEach(function (v, i) {
        var x = PL + slot * (i + 0.5) - bw / 2,
          yv = yFor(v);
        var h = Math.max(2, PT + plotH - yv);
        body +=
          '<rect x="' +
          x +
          '" y="' +
          yv +
          '" width="' +
          bw +
          '" height="' +
          h +
          '" rx="' +
          rx +
          '" fill="' +
          (i === n - 1 ? '#1ba770' : p.barIdle) +
          '"/>';
      });
    } else {
      var pts = cfg.values.map(function (v, i) {
        return [xFor(i), yFor(v)];
      });
      var line = smoothPath(pts);
      if (type === 'area') {
        body +=
          '<path d="' +
          line +
          ' L ' +
          xFor(n - 1) +
          ' ' +
          (PT + plotH) +
          ' L ' +
          xFor(0) +
          ' ' +
          (PT + plotH) +
          ' Z" fill="url(#' +
          cfg._gid +
          ')"/>';
      }
      body +=
        '<path d="' +
        line +
        '" fill="none" stroke="#1ba770" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>';
    }

    /* hover furniture — hidden until the pointer is over the plot */
    var hover =
      '<line data-rc-guide x1="0" y1="' +
      PT +
      '" x2="0" y2="' +
      (PT + plotH) +
      '" stroke="' +
      p.guide +
      '" stroke-width="1" opacity="0"/>' +
      '<circle data-rc-dot cx="0" cy="0" r="5" fill="#1ba770" stroke="' +
      p.ring +
      '" stroke-width="3" opacity="0"/>' +
      '<rect data-rc-hit x="' +
      PL +
      '" y="' +
      PT +
      '" width="' +
      plotW +
      '" height="' +
      plotH +
      '" fill="transparent" style="cursor:crosshair"/>';

    el.style.position = 'relative';
    el.innerHTML =
      '<svg viewBox="0 0 ' +
      W +
      ' ' +
      H +
      '" width="' +
      W +
      '" height="' +
      H +
      '" style="display:block" font-family="Inter, sans-serif">' +
      '<defs><linearGradient id="' +
      cfg._gid +
      '" x1="0" x2="0" y1="0" y2="1">' +
      '<stop offset="0%" stop-color="#1ba770" stop-opacity="0.22"/><stop offset="100%" stop-color="#1ba770" stop-opacity="0"/>' +
      '</linearGradient></defs>' +
      grid +
      body +
      xl +
      hover +
      '</svg>' +
      '<div data-rc-tip style="position:absolute;pointer-events:none;opacity:0;transition:opacity .12s;' +
      'background:' +
      p.tipBg +
      ';color:' +
      p.tipFg +
      ';border-radius:8px;padding:7px 10px;' +
      'font-size:12px;line-height:1.35;white-space:nowrap;box-shadow:0 6px 18px rgba(0,0,0,.18);z-index:5"></div>';

    /* --- hover wiring (re-attached on every draw, since innerHTML is rebuilt) --- */
    var svg = el.querySelector('svg');
    var guide = el.querySelector('[data-rc-guide]');
    var dot = el.querySelector('[data-rc-dot]');
    var hit = el.querySelector('[data-rc-hit]');
    var tip = el.querySelector('[data-rc-tip]');
    var step = n > 1 ? plotW / (n - 1) : plotW;

    function toSvgX(clientX) {
      var r = svg.getBoundingClientRect();
      return (clientX - r.left) * (W / r.width);
    }
    function show(e) {
      var mx = toSvgX(e.clientX);
      var i = Math.max(0, Math.min(n - 1, Math.round((mx - PL) / step)));
      var cx = type === 'bar' ? PL + (plotW / n) * (i + 0.5) : xFor(i);
      var cy = yFor(cfg.values[i]);
      guide.setAttribute('x1', cx);
      guide.setAttribute('x2', cx);
      guide.setAttribute('opacity', '1');
      dot.setAttribute('cx', cx);
      dot.setAttribute('cy', cy);
      dot.setAttribute('opacity', '1');
      tip.innerHTML =
        '<div style="color:' +
        p.tipSub +
        '">' +
        cfg.labels[i] +
        '</div>' +
        '<div style="font-weight:700">' +
        fmt(cfg.values[i], cfg) +
        '</div>';
      tip.style.opacity = '1';
      // position in CSS px, clamped inside the container
      var scale = svg.getBoundingClientRect().width / W;
      var left = cx * scale - tip.offsetWidth / 2;
      left = Math.max(2, Math.min(left, el.clientWidth - tip.offsetWidth - 2));
      tip.style.left = left + 'px';
      tip.style.top = Math.max(2, cy * scale - tip.offsetHeight - 12) + 'px';
    }
    function hide() {
      guide.setAttribute('opacity', '0');
      dot.setAttribute('opacity', '0');
      tip.style.opacity = '0';
    }
    hit.addEventListener('mousemove', show);
    hit.addEventListener('mouseleave', hide);
  }

  var RO = window.ResizeObserver
    ? new window.ResizeObserver(function (entries) {
        entries.forEach(function (e) {
          for (var i = 0; i < charts.length; i++) {
            if (charts[i].el !== e.target) continue;
            var w = Math.round(e.contentRect.width);
            if (w > 0 && w !== charts[i]._w) draw(charts[i]);
            return;
          }
        });
      })
    : null;

  window.EventaChart = function (id, cfg) {
    var el = typeof id === 'string' ? document.getElementById(id) : id;
    if (!el) return;
    cfg._gid = 'rcg' + gidc++;
    for (var i = 0; i < charts.length; i++) {
      if (charts[i].el === el) {
        charts[i].cfg = cfg;
        draw(charts[i]);
        return charts[i];
      }
    }
    var c = { el: el, cfg: cfg };
    charts.push(c);
    draw(c);
    if (RO) RO.observe(el);
    return c;
  };
  window.EventaAreaChart = window.EventaChart; /* back-compat alias */
  window.EventaReportRerender = function () {
    charts.forEach(draw);
  };

  if (!RO) {
    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(window.EventaReportRerender, 150);
    });
  }
})();
