/** The problem-section photograph — one place, one file of truth.
 *  Served as a 4:5 portrait crop so object-cover fills the slider frame
 *  without the vertical offset that makes a landscape photo appear to scroll. */
export const PROBLEM_IMAGE =
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&h=1000&w=800&fit=crop&auto=format";

/** Deterministic jitter in [-1, 1] — organic placement without Math.random (SSR-safe). */
export function jit(seed: number, salt: number): number {
  return ((((seed + 1) * 928371 + (salt + 1) * 123457) % 2000) / 1000) - 1;
}

/** Point on a quadratic bezier. */
export function qbez(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  t: number,
): [number, number] {
  const u = 1 - t;
  return [
    u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
    u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
  ];
}

/** Phyllotaxis disc — dense core, organic sunflower edge, zero randomness. */
export function disc(
  cx: number,
  cy: number,
  maxR: number,
  n: number,
  phase: number,
): Array<[number, number]> {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const rr = maxR * Math.sqrt((i + 0.6) / n);
    const th = i * golden + phase;
    return [cx + rr * Math.cos(th), cy + rr * Math.sin(th) * 0.8];
  });
}

export type Dot = { x: number; y: number; r: number; o: number };

/** The crowd, authored as formations — queues and huddles, not scatter.
 *  Array order is reveal order: the shore fills first, the main huddle
 *  swells, the walkway queues up, and the last strays wander in. */
export const CROWD: Dot[] = (() => {
  const dots: Dot[] = [];

  // 1. Shoreline queue — 26 people lining the water along a sagging curve
  for (let i = 0; i < 26; i++) {
    const t = i / 25;
    const [x, y] = qbez([4, 92], [50, 74], [96, 88], t);
    dots.push({
      x: x + jit(i, 7) * 1.4,
      y: y + jit(i, 13) * 1.1,
      r: 2.5 + jit(i, 3) * 0.5,
      o: 0.72,
    });
  }

  // 2. Main huddle — 16 in a dense cluster, right of centre
  disc(72, 66, 10.5, 16, 1.3).forEach(([x, y], i) => {
    dots.push({
      x: x + jit(i, 21) * 0.9,
      y: y + jit(i, 29) * 0.9,
      r: 2.7 + jit(i, 5) * 0.5,
      o: 0.76,
    });
  });

  // 3. Walkway queue — 12 climbing the boat's centre line, shrinking with distance
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const [x, y] = qbez([47, 97], [52, 78], [54, 58], t);
    dots.push({
      x: x + jit(i, 31) * 0.8,
      y: y + jit(i, 37) * 0.6,
      r: 3.3 - t * 1.3 + jit(i, 11) * 0.25,
      o: 0.7,
    });
  }

  // 4. Second huddle — 6, looser, left side
  disc(21, 61, 6, 6, 2.1).forEach(([x, y], i) => {
    dots.push({
      x: x + jit(i, 41) * 1.1,
      y: y + jit(i, 43) * 1.1,
      r: 2.3 + jit(i, 17) * 0.4,
      o: 0.68,
    });
  });

  // 5. Strays — 4 lone arrivals crossing the open ground
  (
    [
      [12, 42],
      [88, 46],
      [36, 28],
      [63, 20],
    ] as const
  ).forEach(([x, y], i) => {
    dots.push({
      x: x + jit(i, 47) * 1.5,
      y: y + jit(i, 53) * 1.2,
      r: 1.9 + jit(i, 19) * 0.3,
      o: 0.5,
    });
  });

  return dots;
})();
