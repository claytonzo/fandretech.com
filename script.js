// ===== Fandre Technologies — interactions =====

// Current year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Nav background on scroll
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Reveal-on-scroll
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 70}ms`;
  observer.observe(el);
});

// ===== Animated network graphic in the hero =====
(function networkCanvas() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('net');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h, dpr, nodes;
  const mouse = { x: -9999, y: -9999 };

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // density scales with area, capped for performance
    const count = Math.min(Math.round((w * h) / 16000), 90);
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32,
      r: Math.random() * 1.6 + 0.8,
    }));
  }

  const LINK = 132; // px distance to draw a link

  function frame() {
    ctx.clearRect(0, 0, w, h);

    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;

      // subtle attraction toward the cursor
      const dx = mouse.x - n.x, dy = mouse.y - n.y;
      const md = Math.hypot(dx, dy);
      if (md < 170) {
        n.x += (dx / md) * 0.35;
        n.y += (dy / md) * 0.35;
      }
    }

    // links
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < LINK) {
          const t = 1 - dist / LINK;
          ctx.strokeStyle = `rgba(96, 150, 240, ${t * 0.32})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // nodes
    for (const n of nodes) {
      const near = Math.hypot(mouse.x - n.x, mouse.y - n.y) < 150;
      ctx.fillStyle = near ? 'rgba(56, 224, 200, 0.95)' : 'rgba(120, 170, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    raf = requestAnimationFrame(frame);
  }

  let raf;
  size();
  window.addEventListener('resize', size);
  window.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  window.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });

  if (reduce) {
    // draw a single static frame, no animation
    for (const n of nodes) { n.vx = n.vy = 0; }
    frame();
    cancelAnimationFrame(raf);
  } else {
    frame();
  }
})();
