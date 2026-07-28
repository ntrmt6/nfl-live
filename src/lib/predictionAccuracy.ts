interface GradedGame {
  season: number;
  week: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
}

interface GradablePrediction {
  season?: number;
  week?: number;
  homeTeam?: string;
  awayTeam?: string;
  predictedWinner?: string;
  confidence?: number;
}

export interface AccuracyByBucket {
  label: string;
  total: number;
  correct: number;
  accuracy: number;
}

export interface WeeklyAccuracy {
  week: number;
  total: number;
  correct: number;
  accuracy: number;
}

export interface AccuracySummary {
  totalGraded: number;
  correct: number;
  accuracy: number;
  byWeek: WeeklyAccuracy[];
  byConfidence: AccuracyByBucket[];
}

const CONFIDENCE_BUCKETS: [string, number, number][] = [
  ["50–59%", 50, 60],
  ["60–69%", 60, 70],
  ["70–79%", 70, 80],
  ["80%+", 80, 101],
];

function key(g: { season?: number; week?: number; homeTeam?: string; awayTeam?: string }) {
  return `${g.season}-${g.week}-${g.homeTeam}-${g.awayTeam}`;
}

/**
 * Grades predictions against actual final scores. Joins in-memory on
 * (season, week, homeTeam, awayTeam) since Prediction/Game (and their
 * College equivalents) aren't directly foreign-keyed together everywhere.
 */
export function computeAccuracy(
  finalGames: GradedGame[],
  predictions: GradablePrediction[]
): AccuracySummary {
  const predByKey = new Map<string, GradablePrediction>();
  for (const p of predictions) {
    if (p.predictedWinner) predByKey.set(key(p), p);
  }

  const weekMap = new Map<number, { total: number; correct: number }>();
  const bucketMap = new Map<string, { total: number; correct: number }>();
  for (const [label] of CONFIDENCE_BUCKETS) bucketMap.set(label, { total: 0, correct: 0 });

  let totalGraded = 0;
  let correct = 0;

  for (const g of finalGames) {
    const pred = predByKey.get(key(g));
    if (!pred?.predictedWinner) continue;
    if (g.homeScore === g.awayScore) continue; // ties aren't graded

    const actualWinner = g.homeScore > g.awayScore ? g.homeTeam : g.awayTeam;
    const isCorrect = pred.predictedWinner === actualWinner;

    totalGraded++;
    if (isCorrect) correct++;

    const wk = weekMap.get(g.week) ?? { total: 0, correct: 0 };
    wk.total++;
    if (isCorrect) wk.correct++;
    weekMap.set(g.week, wk);

    const conf = pred.confidence ?? 0;
    const bucket = CONFIDENCE_BUCKETS.find(([, lo, hi]) => conf >= lo && conf < hi);
    if (bucket) {
      const b = bucketMap.get(bucket[0])!;
      b.total++;
      if (isCorrect) b.correct++;
    }
  }

  const byWeek: WeeklyAccuracy[] = Array.from(weekMap.entries())
    .map(([week, v]) => ({ week, total: v.total, correct: v.correct, accuracy: Math.round((v.correct / v.total) * 100) }))
    .sort((a, b) => a.week - b.week);

  const byConfidence: AccuracyByBucket[] = CONFIDENCE_BUCKETS.map(([label]) => {
    const v = bucketMap.get(label)!;
    return { label, total: v.total, correct: v.correct, accuracy: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0 };
  });

  return {
    totalGraded,
    correct,
    accuracy: totalGraded > 0 ? Math.round((correct / totalGraded) * 100) : 0,
    byWeek,
    byConfidence,
  };
}
