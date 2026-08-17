(() => {
  const words = [
    // DSA Words
    "Array",
    "Linked List",
    "Dynamic Programming",
    "Dijkstra",
    "O(N log N)",
    "Binary Tree",
    "Hash Table",
    "Graph",
    "DFS",
    "BFS",
    "Trie",
    "Merge Sort",
    "Quick Sort",
    "Heap",
    "Two Pointers",
    "Sliding Window",
    "Backtracking",
    "Divide and Conquer",
    "Segment Tree",
    "Greedy",
    "Memoization",
    "Recursion",
    "Stack",
    "Queue",
    "Set",
    "Map",
    "Bit Manipulation",
    "Topological Sort",
    "Kruskal",
    "Prim",
    "Bellman-Ford",
    "Floyd-Warshall",
    "Union Find",
    "Disjoint Set",
    "Monotonic Stack",
    "Binary Search",
    "Prefix Sum",
    "Matrix",
    "String",
    // Quotes
    "Keep Grinding",
    "One more problem",
    "Trust the process",
    "Consistency is key",
    "Never give up",
    "Embrace the struggle",
    "Failure is feedback",
    "Code every day",
    "Stay focused",
    "You got this",
    "Small steps",
    "Progress over perfection",
    "Debug your mind",
    "Think first, code later",
    "Master the basics",
    "Stay hungry",
    "Stay foolish",
    "Level up",
    "Push your limits",
    "Break it down",
    "Learn, build, repeat",
    "Keep pushing",
  ];

  const colors = [
    { fill: "#ff3ea5", glow: "rgba(255, 62, 165, 0.8)" }, // Pink
    { fill: "#37b7ff", glow: "rgba(55, 183, 255, 0.8)" }, // Blue
    { fill: "#a39bb8", glow: "rgba(163, 155, 184, 0.5)" }, // Muted Purple
    { fill: "#ffffff", glow: "rgba(255, 255, 255, 0.8)" }, // White
  ];

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (prefersReduced.matches) return;

  const canvas = document.getElementById("falling-words-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let w, h;
  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  const activeWords = [];
  const shards = [];
  const MAX_WORDS = 40; // Limit for performance

  class Shard {
    constructor(x, y, text, color) {
      this.x = x;
      this.y = y;
      this.text = text;
      this.color = color;
      this.vx = (Math.random() - 0.5) * 15; // Explosive scatter horizontal
      this.vy = (Math.random() - 1.0) * 10; // Explosive scatter upward
      this.life = 1.0;
      this.decay = Math.random() * 0.02 + 0.015;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.2;
      this.size = Math.random() * 8 + 6;
    }

    update() {
      this.vy += 0.4; // Gravity
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotSpeed;
      this.life -= this.decay;
    }

    draw(ctx) {
      if (this.life <= 0) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.font = `bold ${this.size}px sans-serif`;
      ctx.fillStyle = this.color.fill;
      ctx.globalAlpha = this.life;
      ctx.fillText(this.text, 0, 0);
      ctx.restore();
    }
  }

  class Word {
    constructor() {
      this.reset();
      this.y = Math.random() * -h; // Random start high above
    }

    reset() {
      this.text = words[Math.floor(Math.random() * words.length)];
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.size = Math.floor(Math.random() * 16) + 14;
      this.x = Math.random() * (w - 200) + 50;
      this.y = -50 - Math.random() * 500; // Start off-screen
      this.vx = (Math.random() - 0.5) * 1; // Slight horizontal drift
      this.vy = Math.random() * 1 + 1; // Initial fall speed
      this.type = Math.random() > 0.5 ? "jelly" : "glass";

      this.scaleX = 1;
      this.scaleY = 1;
      this.squishing = false;
      this.squishTimer = 0;

      this.dead = false;
    }

    update() {
      if (this.dead) return;

      if (!this.squishing) {
        this.vy += 0.15; // Gravity
        this.x += this.vx;
        this.y += this.vy;

        // Air stretch (falling fast stretches Y)
        this.scaleY = 1 + Math.min(this.vy * 0.05, 0.5);
        this.scaleX = 1 - Math.min(this.vy * 0.02, 0.2);
      } else {
        this.squishTimer--;
        if (this.squishTimer <= 0) {
          this.squishing = false;
          // Rebound
          this.vy = -this.vy * 0.5; // Bounce up
        }
      }

      // Hit floor
      if (this.y >= h - 20 && !this.squishing) {
        if (this.type === "glass") {
          // Shatter
          const chars = this.text.split("");
          let curX = this.x;
          chars.forEach((c) => {
            shards.push(new Shard(curX, this.y, c, this.color));
            curX += this.size * 0.6; // Approximate width
          });
          this.dead = true;
        } else {
          // Jelly bounce
          this.y = h - 20; // Snap to floor
          this.squishing = true;
          this.squishTimer = 6;
          // Extreme squish effect
          this.scaleY = 0.4;
          this.scaleX = 1.6;

          // Stop if bounced too little
          if (Math.abs(this.vy) < 2) {
            this.dead = true;
          }
        }
      }

      // Out of bounds (e.g., drifting sideways)
      if (this.x < -200 || this.x > w + 200) {
        this.dead = true;
      }
    }

    draw(ctx) {
      if (this.dead) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.scale(this.scaleX, this.scaleY);

      ctx.font = `bold ${this.size}px 'Inter', sans-serif`;
      ctx.fillStyle = this.color.fill;

      // Glow
      ctx.shadowBlur = 15;
      ctx.shadowColor = this.color.glow;

      ctx.fillText(this.text, 0, 0);
      ctx.restore();
    }
  }

  // Spawn initial words
  for (let i = 0; i < MAX_WORDS; i++) {
    activeWords.push(new Word());
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);

    // Update & Draw Words
    for (let i = 0; i < activeWords.length; i++) {
      let w = activeWords[i];
      w.update();
      if (w.dead) {
        w.reset(); // Recycle the object
      }
      w.draw(ctx);
    }

    // Update & Draw Shards
    for (let i = shards.length - 1; i >= 0; i--) {
      let s = shards[i];
      s.update();
      s.draw(ctx);
      if (s.life <= 0) {
        shards.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
})();
