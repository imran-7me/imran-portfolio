const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
menuToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
document.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

const roles = ['Cybersecurity student', 'Ethical hacking learner', 'Web development learner'];
const roleEl = document.getElementById('typed-role');
let role = 0, pos = roles[0].length, deleting = true;
function typeRole() {
  if (deleting) {
    pos--;
    roleEl.textContent = roles[role].slice(0, Math.max(0, pos));
    if (pos <= 0) { deleting = false; role = (role + 1) % roles.length; setTimeout(typeRole, 350); return; }
  } else {
    pos++;
    roleEl.textContent = roles[role].slice(0, pos);
    if (pos >= roles[role].length) { deleting = true; setTimeout(typeRole, 1500); return; }
  }
  setTimeout(typeRole, deleting ? 35 : 60);
}
setTimeout(typeRole, 1600);

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
    }
  });
}, { rootMargin: '-35% 0px -55% 0px' });
document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));

document.getElementById('year').textContent = new Date().getFullYear();

// Animated green network / cyber globe drawn on canvas.
const canvas = document.getElementById('network-canvas');
const ctx = canvas.getContext('2d');
let w = 0, h = 0, nodes = [], frame = 0;
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = rect.width; h = rect.height;
  canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  nodes = Array.from({length: 42}, (_, i) => ({
    angle: Math.random() * Math.PI * 2,
    radius: .17 + Math.random() * .29,
    y: (Math.random() - .5) * .9,
    speed: (Math.random() * .004 + .001) * (i % 2 ? 1 : -1),
    bright: Math.random() > .76
  }));
}
function drawNetwork() {
  ctx.clearRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2, radius = Math.min(w, h) * .42;
  // subtle orbit rings
  for (let j = 0; j < 3; j++) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius * (0.78 + j * .12), radius * (0.62 + j * .13), frame * .001 * (j % 2 ? 1 : -1), 0, Math.PI * 2);
    ctx.strokeStyle = j === 0 ? 'rgba(124,230,172,.34)' : 'rgba(124,230,172,.12)';
    ctx.lineWidth = 1; ctx.stroke();
  }
  const pts = nodes.map(n => {
    n.angle += n.speed;
    const x = cx + Math.cos(n.angle) * radius * n.radius * 2;
    const y = cy + Math.sin(n.angle) * radius * n.radius * 1.7 + n.y * radius * .55;
    return {x, y, bright:n.bright};
  });
  pts.forEach((p, i) => {
    for (let j = i + 1; j < pts.length; j++) {
      const q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = Math.hypot(dx, dy);
      if (d < radius * .48) {
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = `rgba(124,230,172,${(1 - d / (radius * .48)) * .38})`;
        ctx.lineWidth = .8; ctx.stroke();
      }
    }
    ctx.beginPath(); ctx.arc(p.x, p.y, p.bright ? 3 : 1.7, 0, Math.PI * 2);
    ctx.fillStyle = p.bright ? '#b8ffd1' : '#4d9e76'; ctx.fill();
  });
  // outer faint scan circle
  ctx.beginPath(); ctx.arc(cx, cy, radius * 1.05, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,38,61,.19)'; ctx.setLineDash([2, 5]); ctx.stroke(); ctx.setLineDash([]);
  frame++;
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) requestAnimationFrame(drawNetwork);
}
resizeCanvas();
drawNetwork();
window.addEventListener('resize', resizeCanvas);


// Custom cursor animation supplied by the user
(() => {
  if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;

  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let mx = -100, my = -100;
  let rx = -100, ry = -100;
  const ease = reduce ? 1 : 0.15;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
  });

  (function loop() {
    rx += (mx - rx) * ease;
    ry += (my - ry) * ease;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(loop);
  })();

  const hoverables = 'a, button, [role="button"], input, textarea, select, label';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverables)) ring.classList.add('is-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverables)) ring.classList.remove('is-hover');
  });

  window.addEventListener('mousedown', () => ring.classList.add('is-down'));
  window.addEventListener('mouseup', () => ring.classList.remove('is-down'));

  document.addEventListener('mouseleave', () => {
    dot.classList.add('cursor-hidden');
    ring.classList.add('cursor-hidden');
  });
  document.addEventListener('mouseenter', () => {
    dot.classList.remove('cursor-hidden');
    ring.classList.remove('cursor-hidden');
  });
})();
