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
  ];

  // Elegant Grayscale / Silver Colors
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

  // Create a continuous list of credits
  const credits = [];
  const SCROLL_SPEED = 0.5; // Very slow, elegant scroll
  const LINE_HEIGHT = 60;

  // Boundary definition (Keep it on the left side, max 35% of screen width)
  // to avoid crossing over the face or the login form.

  function initCredits() {
    let currentY = h; // Start at the bottom of the screen

    // Shuffle words for random order
    const shuffled = [...words].sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffled.length; i++) {
      credits.push({
        text: shuffled[i],
        y: currentY,
        color: colors[i % colors.length], // Cycle through elegant colors
        size: Math.random() > 0.8 ? 24 : 18, // Occasionally larger text
        xOffset: Math.random() * 40, // Slight random horizontal indent
      });
      currentY += LINE_HEIGHT + Math.random() * 40; // Random spacing between lines
    }
  }

  initCredits();

  function animate() {
    ctx.clearRect(0, 0, w, h);

    const boundaryWidth = Math.min(w * 0.35, 400); // Max 35% of screen, capped at 400px
    const startX = 40; // 40px from the left edge

    for (let i = 0; i < credits.length; i++) {
      let credit = credits[i];

      // Move up
      credit.y -= SCROLL_SPEED;

      // Draw if visible on screen
      if (credit.y > -100 && credit.y < h + 100) {
        ctx.save();

        // Fade in from bottom and fade out at top
        let opacity = 1;
        if (credit.y > h - 150) {
          opacity = (h - credit.y) / 150; // Fade in at bottom
        } else if (credit.y < 150) {
          opacity = credit.y / 150; // Fade out at top
        }

        ctx.globalAlpha = Math.max(0, opacity);

        ctx.font = `${credit.size === 24 ? "bold" : "normal"} ${credit.size}px 'Space Grotesk', sans-serif`;
        ctx.fillStyle = credit.color.fill;

        if (credit.color.glow !== "transparent") {
          ctx.shadowBlur = 10;
          ctx.shadowColor = credit.color.glow;
        }

        // Align left within the boundary
        ctx.textAlign = "left";
        ctx.fillText(credit.text, startX + credit.xOffset, credit.y);

        ctx.restore();
      }

      // Recycle to bottom if it goes off top
      if (credit.y < -100) {
        // Find the lowest Y currently in the array
        let lowestY = Math.max(...credits.map((c) => c.y));
        credit.y = Math.max(lowestY, h) + LINE_HEIGHT + Math.random() * 40;
        // Randomize position and color again
        credit.xOffset = Math.random() * 40;
        credit.color = colors[Math.floor(Math.random() * colors.length)];
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
})();
