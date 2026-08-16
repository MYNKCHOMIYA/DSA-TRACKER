/* ═══════════════════════════════════════════════════════════════
   1. AMBIENT FLOATING PARTICLES
   Canvas-based particle system using requestAnimationFrame.
   Respects prefers-reduced-motion for accessibility.
   ═══════════════════════════════════════════════════════════════ */
(() => {
  const canvas = document.getElementById("particles-canvas");
  if (!canvas) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (prefersReduced.matches) {
    canvas.style.display = "none";
    return;
  }

  const ctx = canvas.getContext("2d");
  let w, h;
  const particles = [];
  const PARTICLE_COUNT = 35;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  const PALETTE = [
    "255, 62, 165",   // pink
    "55, 183, 255",   // blue
    "255, 211, 79",   // gold
    "200, 200, 255",  // white-ish
  ];

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * w;
      this.y = h + Math.random() * 100;
      this.size = Math.random() * 2.5 + 0.5;
      this.speedY = -(Math.random() * 0.4 + 0.1);
      this.speedX = (Math.random() - 0.5) * 0.2;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.fadeDir = Math.random() > 0.5 ? 0.002 : -0.002;
      this.color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.opacity += this.fadeDir;
      if (this.opacity <= 0.05 || this.opacity >= 0.6) this.fadeDir *= -1;
      if (this.y < -20 || this.x < -20 || this.x > w + 20) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = new Particle();
    p.y = Math.random() * h; // spread across screen initially
    particles.push(p);
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }
  animate();
})();


/* ═══════════════════════════════════════════════════════════════
   2. CURSOR SCROLL COLOR SHIFT & SPOTLIGHT
   Shifts the cursor spotlight hue and moves it with pointer.
   ═══════════════════════════════════════════════════════════════ */
(() => {
  const cursor = document.getElementById("cursor-spotlight");
  if (!cursor) return;

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let ticking = false;

  const updateCursorPos = () => {
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    ticking = false;
  };

  window.addEventListener(
    "pointermove",
    (e) => {
      x = e.clientX;
      y = e.clientY;
      document.body.classList.add("is-pointer");

      if (!ticking) {
        window.requestAnimationFrame(updateCursorPos);
        ticking = true;
      }
    },
    { passive: true }
  );

  window.addEventListener("pointerleave", () => {
    document.body.classList.remove("is-pointer");
  });

  updateCursorPos();

  function updateCursorColor() {
    const scrollPct =
      window.scrollY / (document.body.scrollHeight - window.innerHeight || 1);
    const hue = 210 + scrollPct * 120;
    cursor.style.background = `radial-gradient(circle at 50% 50%, hsla(${hue}, 80%, 65%, 0.12), transparent 65%)`;
  }

  window.addEventListener("scroll", updateCursorColor, { passive: true });
  updateCursorColor();
})();
