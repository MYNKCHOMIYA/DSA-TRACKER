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

  function randomRGB() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
  }

  function initCredits() {
    credits = [];
    // We want a lot of items spread across the entire width and height
    const totalItems = 150;
    let currentY = 0;

    for (let i = 0; i < totalItems; i++) {
      const text = words[Math.floor(Math.random() * words.length)];
      credits.push({
        text: text,
        y: Math.random() * h * 2 - h, // Spread vertically
        x: Math.random() * w, // Spread horizontally across full screen
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() > 0.8 ? 24 : 16,
        hoveredColor: null, // Will store random color when hovered
      });
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
        ctx.save();

        // Measure text for accurate hover detection
        ctx.font = `${credit.size === 24 ? "bold" : "normal"} ${credit.size}px 'Space Grotesk', sans-serif`;
        const textWidth = ctx.measureText(credit.text).width;

        // Check hover collision (approximate bounding box)
        const isHovered =
          mouseX >= credit.x &&
          mouseX <= credit.x + textWidth &&
          mouseY >= credit.y - credit.size &&
          mouseY <= credit.y;

        if (isHovered) {
          if (!credit.hoveredColor) {
            const rgb = randomRGB();
            credit.hoveredColor = { fill: rgb, glow: rgb };
          }
        } else {
          // Slowly lose the hover color if not hovered (or just instantly snap back)
          // For simplicity, snap back to default:
          credit.hoveredColor = null;
        }

        // Fade in from bottom and fade out at top
        let opacity = 1;
        if (credit.y > h - 150) {
          opacity = (h - credit.y) / 150;
        } else if (credit.y < 150) {
          opacity = credit.y / 150;
        }

        ctx.globalAlpha = Math.max(0, opacity);

        const activeColor = credit.hoveredColor || credit.color;

        ctx.fillStyle = activeColor.fill;

        if (activeColor.glow !== "transparent") {
          ctx.shadowBlur = isHovered ? 20 : 10;
          ctx.shadowColor = activeColor.glow;
        }

        ctx.textAlign = "left";
        ctx.fillText(credit.text, credit.x, credit.y);

        ctx.restore();
      }

      // Recycle to bottom if it goes off top
      if (credit.y < -100) {
        credit.y = h + Math.random() * 200;
        credit.x = Math.random() * w; // New random horizontal position
        credit.color = colors[Math.floor(Math.random() * colors.length)];
        credit.text = words[Math.floor(Math.random() * words.length)];
        credit.hoveredColor = null;
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
