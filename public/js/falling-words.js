(() => {
  const words = [
    // DSA Concepts & Topics
    "Data Structures",
    "Algorithms",
    "Dynamic Programming",
    "Dijkstra's Algorithm",
    "Time Complexity",
    "Space Complexity",
    "O(N log N)",
    "Binary Search Tree",
    "Hash Tables",
    "Graph Theory",
    "Depth-First Search",
    "Breadth-First Search",
    "Trie Data Structure",
    "Merge Sort",
    "Quick Sort",
    "Min Heap",
    "Max Heap",
    "Two Pointers Technique",
    "Sliding Window",
    "Backtracking",
    "Divide & Conquer",
    "Segment Trees",
    "Greedy Algorithms",
    "Memoization",
    "Recursion",
    "Bit Manipulation",
    "Topological Sorting",
    "Kruskal's Algorithm",
    "Prim's Algorithm",
    "Bellman-Ford",
    "Floyd-Warshall",
    "Union Find",
    "Disjoint Set",
    "Monotonic Stack",
    "Prefix Sum",
    "Matrix Traversal",
    "Fenwick Tree",
    "Ternary Search",
    "A* Search",
    "B-Tree",
    "AVL Tree",
    "Red-Black Tree",
    "Suffix Array",
    "Rabin-Karp",
    "KMP Algorithm",
    "Z-Algorithm",

    // Motivational Quotes
    "Keep Grinding",
    "One More Problem",
    "Trust The Process",
    "Consistency Is Key",
    "Never Give Up",
    "Embrace The Struggle",
    "Failure Is Feedback",
    "Code Every Day",
    "Stay Focused",
    "You Got This",
    "Small Steps",
    "Progress Over Perfection",
    "Debug Your Mind",
    "Think First, Code Later",
    "Master The Basics",
    "Stay Hungry",
    "Stay Foolish",
    "Level Up",
    "Push Your Limits",
    "Learn, Build, Repeat",
    "The Obstacle Is The Way",
    "No Excuses",
    "Hard work beats talent",
    "1% Better Every Day",
    "Enjoy the journey",
    "Make it work, make it right, make it fast",
  ];

  // Elegant Grayscale / Silver Colors (Default)
  const colors = [
    { fill: "#ffffff", glow: "rgba(255, 255, 255, 0.5)" },
    { fill: "#f8fafc", glow: "rgba(248, 250, 252, 0.3)" },
    { fill: "#e2e8f0", glow: "rgba(226, 232, 240, 0.2)" },
    { fill: "#94a3b8", glow: "transparent" },
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

  // Track Mouse Position
  let mouseX = -1000;
  let mouseY = -1000;
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Create a continuous list of credits
  let credits = [];
  const SCROLL_SPEED = 0.5; // Very slow, elegant scroll
  const LINE_HEIGHT = 80;
  let isAnimating = true;

  function checkOverlap(x, y, width, height, list) {
    for (let c of list) {
      if (!c.width) continue;
      // 20px padding around each word
      if (
        x < c.x + c.width + 20 &&
        x + width + 20 > c.x &&
        y < c.y + 20 &&
        y + height + 20 > c.y - c.size
      ) {
        return true;
      }
    }
    return false;
  }

  function initCredits() {
    credits = [];
    const totalItems = 100; // slightly reduced to ensure it fits without overlap

    for (let i = 0; i < totalItems; i++) {
      const text = words[Math.floor(Math.random() * words.length)];
      const size = Math.random() > 0.8 ? 24 : 16;
      ctx.font = `${size === 24 ? "bold" : "normal"} ${size}px 'Space Grotesk', sans-serif`;
      const width = ctx.measureText(text).width;

      let x, y;
      let attempts = 0;
      let placed = false;

      while (attempts < 50 && !placed) {
        x = Math.random() * (w - width - 40) + 20;
        y = Math.random() * h * 3 - h; // Spread vertically across 3 screens

        if (!checkOverlap(x, y, width, size, credits)) {
          placed = true;
        }
        attempts++;
      }

      if (placed) {
        credits.push({
          text: text,
          y: y,
          x: x,
          width: width,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: size,
          scale: 1,
        });
      }
    }
  }

  initCredits();

  function animate() {
    if (!isAnimating) return;
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < credits.length; i++) {
      let credit = credits[i];

      // Move up
      credit.y -= SCROLL_SPEED;

      // Draw if visible on screen
      if (credit.y > -100 && credit.y < h + 100) {
        // Check hover collision
        const isHovered =
          mouseX >= credit.x &&
          mouseX <= credit.x + credit.width &&
          mouseY >= credit.y - credit.size &&
          mouseY <= credit.y;

        // Smoothly adjust scale
        if (isHovered) {
          credit.scale = Math.min((credit.scale || 1) + 0.05, 1.25);
        } else {
          credit.scale = Math.max((credit.scale || 1) - 0.05, 1);
        }

        ctx.save();

        // Translate for scaling from center of the word's left edge
        ctx.translate(credit.x, credit.y);
        ctx.scale(credit.scale, credit.scale);

        let opacity = 1;
        if (credit.y > h - 150) {
          opacity = (h - credit.y) / 150;
        } else if (credit.y < 150) {
          opacity = credit.y / 150;
        }
        ctx.globalAlpha = Math.max(0, opacity);

        ctx.font = `${credit.size === 24 ? "bold" : "normal"} ${credit.size}px 'Space Grotesk', sans-serif`;

        // Elegant hover effect
        ctx.fillStyle = credit.scale > 1.05 ? "#ffffff" : credit.color.fill;

        if (credit.scale > 1.05 || credit.color.glow !== "transparent") {
          ctx.shadowBlur = credit.scale > 1.05 ? 20 : 10;
          ctx.shadowColor =
            credit.scale > 1.05 ? "rgba(255,255,255,0.8)" : credit.color.glow;
        }

        ctx.textAlign = "left";
        ctx.fillText(credit.text, 0, 0);

        ctx.restore();
      }

      // Recycle to bottom if it goes off top
      if (credit.y < -100) {
        let placed = false;
        let attempts = 0;
        let newX, newY;

        // Ensure new text is sized correctly for collision check
        credit.text = words[Math.floor(Math.random() * words.length)];
        ctx.font = `${credit.size === 24 ? "bold" : "normal"} ${credit.size}px 'Space Grotesk', sans-serif`;
        credit.width = ctx.measureText(credit.text).width;

        while (attempts < 20 && !placed) {
          newX = Math.random() * (w - credit.width - 40) + 20;
          newY = h + Math.random() * 200 + 50; // Below screen

          if (!checkOverlap(newX, newY, credit.width, credit.size, credits)) {
            placed = true;
          }
          attempts++;
        }

        if (placed) {
          credit.y = newY;
          credit.x = newX;
          credit.color = colors[Math.floor(Math.random() * colors.length)];
          credit.scale = 1;
        } else {
          // If couldn't place without overlap, just push it far down to try again later
          credit.y = h + 1000;
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();

  // Toggle Button Logic
  const toggleBtn = document.getElementById("toggle-anim-btn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      isAnimating = !isAnimating;
      if (isAnimating) {
        animate();
        toggleBtn.textContent = "Toggle Credits";
      } else {
        ctx.clearRect(0, 0, w, h);
        toggleBtn.textContent = "Resume Credits";
      }
    });
  }
})();
