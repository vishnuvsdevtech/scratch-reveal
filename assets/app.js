(() => {
  const c = document.getElementById('c');
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const out = document.getElementById('m-r');
  const nOut = document.getElementById('m-n');
  const hint = document.getElementById('m-h');

  function foil() {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#2b2f36');
    g.addColorStop(0.35, '#4a505a');
    g.addColorStop(0.55, '#23272e');
    g.addColorStop(0.8, '#3d434c');
    g.addColorStop(1, '#1b1e24');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // brushed grain
    for (let i = 0; i < 2600; i++) {
      const y = Math.random() * H;
      ctx.strokeStyle = `rgba(255,255,255,${Math.random() * 0.05})`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * W, y);
      ctx.lineTo(Math.random() * W, y + Math.random() * 1.6);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(240,245,255,.42)';
    ctx.font = '600 13px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('S C R A T C H   T O   R E V E A L', W / 2, H / 2);
    ctx.font = '10px ui-monospace, monospace';
    ctx.fillStyle = 'rgba(240,245,255,.22)';
    ctx.fillText('drag across the panel', W / 2, H / 2 + 22);
    ctx.textAlign = 'left';
  }
  foil();

  let down = false, strokes = 0, last = null, done = false, tick = 0;

  const pos = (e) => {
    const r = c.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
  };

  function erase(a, b) {
    ctx.globalCompositeOperation = 'destination-out';
    const r = 34;
    // soft brush: a few concentric circles rather than a hard disc
    for (let i = 4; i >= 1; i--) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, (r * i) / 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,0,0,${0.22 + i * 0.10})`;
      ctx.fill();
    }
    if (a) {
      ctx.lineWidth = r * 1.2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(0,0,0,.55)';
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function measure() {
    const s = 90;
    const small = document.createElement('canvas');
    small.width = s; small.height = Math.round(s * H / W);
    const sc = small.getContext('2d');
    sc.drawImage(c, 0, 0, small.width, small.height);
    const d = sc.getImageData(0, 0, small.width, small.height).data;
    let clear = 0, total = 0;
    for (let i = 3; i < d.length; i += 4) { total++; if (d[i] < 32) clear++; }
    return clear / total;
  }

  c.addEventListener('pointerdown', (e) => { down = true; last = pos(e); nOut.textContent = ++strokes; });
  c.addEventListener('pointerup', () => { down = false; last = null; });
  c.addEventListener('pointerleave', () => { down = false; last = null; });
  c.addEventListener('pointermove', (e) => {
    if (!down || done) return;
    const p = pos(e);
    erase(last, p);
    last = p;
    hint.textContent = 'keep going';
  });

  (function loop() {
    if (!done && ++tick % 12 === 0) {
      const r = measure();
      out.textContent = Math.round(r * 100) + '%';
      if (r > 0.65) {
        done = true;
        hint.textContent = 'revealed';
        c.style.transition = 'opacity .6s';
        c.style.opacity = '0';
        setTimeout(() => { c.style.display = 'none'; }, 620);
      }
    }
    requestAnimationFrame(loop);
  })();

  document.documentElement.dataset.ready = '1';
})();
