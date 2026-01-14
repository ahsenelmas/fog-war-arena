// Simple arena maze walls (axis-aligned rectangles)
// Units are in world coordinates.
//
// Tip: Keep walls >= 40px thick so collisions feel good.

export const MAP_WALLS = [
  // outer border (optional visual only; physics uses WORLD bounds)
  // { x: 0, y: 0, w: 2400, h: 40 },
  // { x: 0, y: 1560, w: 2400, h: 40 },
  // { x: 0, y: 0, w: 40, h: 1600 },
  // { x: 2360, y: 0, w: 40, h: 1600 },

  // --- main corridors ---
  { x: 300, y: 220, w: 1800, h: 60 },
  { x: 300, y: 1320, w: 1800, h: 60 },

  { x: 300, y: 220, w: 60, h: 520 },
  { x: 300, y: 860, w: 60, h: 520 },

  { x: 2040, y: 220, w: 60, h: 520 },
  { x: 2040, y: 860, w: 60, h: 520 },

  // --- middle maze blocks ---
  { x: 620, y: 520, w: 520, h: 60 },
  { x: 1260, y: 520, w: 520, h: 60 },

  { x: 620, y: 1020, w: 520, h: 60 },
  { x: 1260, y: 1020, w: 520, h: 60 },

  { x: 1080, y: 640, w: 60, h: 380 },
  { x: 1320, y: 640, w: 60, h: 380 },

  // --- side pockets ---
  { x: 120, y: 520, w: 240, h: 60 },
  { x: 120, y: 820, w: 240, h: 60 },
  { x: 2040, y: 520, w: 240, h: 60 },
  { x: 2040, y: 820, w: 240, h: 60 },

  // --- small cover pieces ---
  { x: 520, y: 760, w: 120, h: 40 },
  { x: 1760, y: 760, w: 120, h: 40 },
  { x: 1120, y: 300, w: 160, h: 40 },
  { x: 1120, y: 1260, w: 160, h: 40 },
];
