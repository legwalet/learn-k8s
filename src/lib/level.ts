/** Lightweight XP → level system for the game-like UI. Purely derived from points. */

export type LevelInfo = {
  level: number;
  title: string;
  /** Points required to reach the current level. */
  currentLevelFloor: number;
  /** Points required to reach the next level (Infinity at max). */
  nextLevelFloor: number;
  /** XP earned within the current level band. */
  xpIntoLevel: number;
  /** XP needed to fill the current level band. */
  xpForLevel: number;
  /** 0–100 progress toward the next level. */
  progressPct: number;
  isMaxLevel: boolean;
};

/** Cumulative point thresholds for each level (index = level - 1). */
const LEVEL_FLOORS = [0, 30, 80, 150, 250, 400, 600, 850, 1150, 1500];

const LEVEL_TITLES = [
  "Cluster Cadet",
  "Pod Pilot",
  "YAML Apprentice",
  "Deploy Ranger",
  "Service Scout",
  "Rollout Knight",
  "Platform Pathfinder",
  "Kube Captain",
  "Infra Archmage",
  "Cloud Legend",
];

export function getLevelInfo(points: number): LevelInfo {
  const safePoints = Math.max(0, points);

  let level = 1;
  for (let i = 0; i < LEVEL_FLOORS.length; i++) {
    if (safePoints >= LEVEL_FLOORS[i]) level = i + 1;
  }

  const isMaxLevel = level >= LEVEL_FLOORS.length;
  const currentLevelFloor = LEVEL_FLOORS[level - 1];
  const nextLevelFloor = isMaxLevel ? Infinity : LEVEL_FLOORS[level];

  const xpIntoLevel = safePoints - currentLevelFloor;
  const xpForLevel = isMaxLevel ? xpIntoLevel : nextLevelFloor - currentLevelFloor;
  const progressPct = isMaxLevel
    ? 100
    : Math.min(100, Math.round((xpIntoLevel / xpForLevel) * 100));

  return {
    level,
    title: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)],
    currentLevelFloor,
    nextLevelFloor,
    xpIntoLevel,
    xpForLevel,
    progressPct,
    isMaxLevel,
  };
}
