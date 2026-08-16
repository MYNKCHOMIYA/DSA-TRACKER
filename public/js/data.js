// Striver A2Z DSA Sheet — Complete Structure
// Source: https://takeuforward.org/dsa/strivers-a2z-sheet-learn-dsa-a-to-z
const STRIVER_SHEET = {
  totalProblems: 474,
  categories: [
    {
      id: 'basics',
      name: 'Learn the Basics',
      subcategories: [
        { name: 'Things to Know in C++/Java/Python', count: 9 },
        { name: 'Build-up Logical Thinking', count: 2 },
        { name: 'Patterns', count: 22 },
        { name: 'Learn STL/Collections', count: 2 },
        { name: 'Know Basic Maths', count: 7 },
        { name: 'Learn Basic Recursion', count: 9 },
        { name: 'Learn Basic Hashing', count: 3 },
      ],
      totalProblems: 54,
    },
    {
      id: 'sorting',
      name: 'Sorting Techniques',
      subcategories: [
        { name: 'Sorting I', count: 3 },
        { name: 'Sorting II', count: 4 },
      ],
      totalProblems: 7,
    },
    {
      id: 'arrays',
      name: 'Arrays',
      subcategories: [
        { name: 'Easy', count: 14 },
        { name: 'Medium', count: 14 },
        { name: 'Hard', count: 12 },
      ],
      totalProblems: 40,
    },
    {
      id: 'binary-search',
      name: 'Binary Search',
      subcategories: [
        { name: 'BS on 1D Arrays', count: 13 },
        { name: 'BS on Answers', count: 12 },
        { name: 'BS on 2D Arrays', count: 7 },
      ],
      totalProblems: 32,
    },
    {
      id: 'strings',
      name: 'Strings',
      subcategories: [
        { name: 'Basic and Easy', count: 7 },
        { name: 'Medium', count: 8 },
      ],
      totalProblems: 15,
    },
    {
      id: 'linked-list',
      name: 'Linked List',
      subcategories: [
        { name: 'Learn 1D Linked List', count: 6 },
        { name: 'Learn Doubly Linked List', count: 4 },
        { name: 'Medium Problems of LL', count: 15 },
        { name: 'Hard Problems of LL', count: 6 },
      ],
      totalProblems: 31,
    },
    {
      id: 'recursion',
      name: 'Recursion',
      subcategories: [
        { name: 'Get a Strong Hold', count: 8 },
        { name: 'Subsequences Pattern', count: 10 },
        { name: 'Trying out all Combos / Hard', count: 7 },
      ],
      totalProblems: 25,
    },
    {
      id: 'bit-manipulation',
      name: 'Bit Manipulation',
      subcategories: [
        { name: 'Learn Bit Manipulation', count: 6 },
        { name: 'Interview Problems', count: 5 },
        { name: 'Advanced Maths', count: 7 },
      ],
      totalProblems: 18,
    },
    {
      id: 'stacks-queues',
      name: 'Stack and Queues',
      subcategories: [
        { name: 'Learning', count: 8 },
        { name: 'Prefix, Infix, Postfix', count: 6 },
        { name: 'Monotonic Stack/Queue', count: 9 },
        { name: 'Implementation', count: 7 },
      ],
      totalProblems: 30,
    },
    {
      id: 'sliding-window',
      name: 'Sliding Window & Two Pointer',
      subcategories: [
        { name: 'Medium Problems', count: 6 },
        { name: 'Hard Problems', count: 6 },
      ],
      totalProblems: 12,
    },
    {
      id: 'heaps',
      name: 'Heaps',
      subcategories: [
        { name: 'Learning', count: 5 },
        { name: 'Medium Problems', count: 6 },
        { name: 'Hard Problems', count: 6 },
      ],
      totalProblems: 17,
    },
    {
      id: 'greedy',
      name: 'Greedy Algorithms',
      subcategories: [
        { name: 'Easy Problems', count: 6 },
        { name: 'Medium/Hard', count: 9 },
      ],
      totalProblems: 15,
    },
    {
      id: 'binary-trees',
      name: 'Binary Trees',
      subcategories: [
        { name: 'Traversals', count: 13 },
        { name: 'Medium Problems', count: 12 },
        { name: 'Hard Problems', count: 13 },
      ],
      totalProblems: 38,
    },
    {
      id: 'bst',
      name: 'Binary Search Trees',
      subcategories: [
        { name: 'Concepts', count: 7 },
        { name: 'Practice Problems', count: 9 },
      ],
      totalProblems: 16,
    },
    {
      id: 'graphs',
      name: 'Graphs',
      subcategories: [
        { name: 'Learning (BFS/DFS)', count: 14 },
        { name: 'Problems on BFS/DFS', count: 14 },
        { name: 'Topo Sort & Problems', count: 7 },
        { name: 'Shortest Path Algorithms', count: 12 },
        { name: 'MST / Disjoint Set', count: 6 },
      ],
      totalProblems: 53,
    },
    {
      id: 'dp',
      name: 'Dynamic Programming',
      subcategories: [
        { name: 'Introduction to DP', count: 3 },
        { name: '1D DP', count: 4 },
        { name: '2D/3D DP and Grids', count: 6 },
        { name: 'DP on Subsequences', count: 9 },
        { name: 'DP on Strings', count: 8 },
        { name: 'DP on Stocks', count: 6 },
        { name: 'DP on LIS', count: 5 },
        { name: 'MCM DP / Partition DP', count: 7 },
        { name: 'DP on Squares', count: 2 },
      ],
      totalProblems: 50,
    },
    {
      id: 'tries',
      name: 'Tries',
      subcategories: [
        { name: 'Theory', count: 3 },
        { name: 'Problems', count: 4 },
      ],
      totalProblems: 7,
    },
  ],
};

// Topic keywords → GitHub folder name mapping
const TOPIC_FOLDER_MAP = {
  'basics': ['Logical Thinking', 'Basic Math', 'Basic Recursion', 'Basic Hashing'],
  'sorting': ['SORTING'],
  'arrays': ['ARRAY'],
  'binary-search': ['Binary Search'],
  'strings': ['Strings'],
  'linked-list': ['Linked List'],
  'recursion': ['Recursion'],
  'bit-manipulation': ['Bit Manipulation'],
  'stacks-queues': ['Stack', 'Queue'],
  'sliding-window': ['Sliding Window'],
  'heaps': ['Heap'],
  'greedy': ['Greedy'],
  'binary-trees': ['Binary Tree'],
  'bst': ['BST'],
  'graphs': ['Graph'],
  'dp': ['DP', 'Dynamic Programming'],
  'tries': ['Trie'],
};

// All category names for topic chips
const ALL_TOPICS = STRIVER_SHEET.categories.map(c => c.name);
