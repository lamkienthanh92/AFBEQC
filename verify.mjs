// Re-execution of the corrected statistical engine against the raw
// Lot ĐGĐ-P01 dataset reported in Table 1 of the manuscript.
import {
  performStatisticalAnalysis,
  pairedTTest,
  tTestPValue,
  intraclassCorrelation,
  mean,
  standardDeviation,
  setRandomSeed,
} from "./src/StatisticalEngine.js";

setRandomSeed(20240101);

const reader1 = [425, 386, 402, 411, 391, 367, 291, 406, 364, 325];
const reader2 = [413, 374, 390, 401, 389, 371, 301, 391, 304, 332];

// Each stability time point: three slides, each read twice -> [[r1,r2], ...]
const stabilityRaw = {
  "Day 1": [[376, 395], [381, 357], [293, 306]],
  "Day 3": [[376, 400], [405, 382], [371, 384]],
  "Day 5": [[318, 298], [391, 393], [363, 378]],
  "Day 7": [[367, 298], [371, 362], [391, 380]],
  "Week 1": [[386, 379], [363, 376], [408, 389]],
  "Week 2": [[296, 309], [370, 354], [334, 354]],
  "Week 3": [[346, 357], [387, 391], [355, 371]],
  "Week 4": [[401, 389], [295, 321], [367, 355]],
};

const input = {
  studyInfo: {
    lotNumber: "ĐGĐ-P01",
    acceptanceCriteria: {
      homogeneityThreshold: 200,
      pValueThreshold: 0.05,
      practicalSignificanceThreshold: 0.15,
    },
  },
  homogeneity: { reader1, reader2 },
  stability: {
    timepoints: Object.keys(stabilityRaw),
    elapsedDays: [1, 3, 5, 7, 7, 14, 21, 28],
    data: stabilityRaw,
  },
};

const r = performStatisticalAnalysis(input);
const f = (x, d = 3) => (x === undefined || x === null ? "n/a" : Number(x).toFixed(d));

console.log("=== HOMOGENEITY (n = 10 slides x 2 readers) ===");
console.log("mean          ", f(r.homogeneity.mean, 2));
console.log("SD            ", f(r.homogeneity.sd, 2));
console.log("CV %          ", f(r.homogeneity.cv, 2));
console.log("M-2SD         ", f(r.homogeneity.criterion, 2), r.homogeneity.passed ? "PASS" : "FAIL");
console.log("ICC model     ", r.homogeneity.icc.iccModel);
console.log("ICC(2,1)      ", f(r.homogeneity.icc.icc, 4));
console.log("ICC(1,1)      ", f(r.homogeneity.icc.icc11, 4));
console.log("ICC 95% CI    ", f(r.homogeneity.icc.ci95[0], 3), "-", f(r.homogeneity.icc.ci95[1], 3));

const ptt = pairedTTest(reader1, reader2);
console.log("paired t (readers)  t =", f(ptt.tStatistic), "df =", ptt.degreesOfFreedom, "p =", f(ptt.pValue, 4));
console.log("Bland-Altman bias   ", f(r.homogeneity.blandAltman.bias, 2),
  "LoA [", f(r.homogeneity.blandAltman.lowerLoA ?? r.homogeneity.blandAltman.lowerLimit, 2),
  ",", f(r.homogeneity.blandAltman.upperLoA ?? r.homogeneity.blandAltman.upperLimit, 2), "]");
console.log("Grubbs outlier      ", JSON.stringify(r.homogeneity.outliers.grubbs));

console.log("\n=== STABILITY (baseline = " + f(r.stability.baseline, 1) + ") ===");
console.log("timepoint |   mean |   delta% |      t | df |      p | stable");
for (const tp of Object.keys(stabilityRaw)) {
  const s = r.stability.timepoints[tp];
  const flat = stabilityRaw[tp].flat();
  const diffs = flat.map((v) => v - r.stability.baseline);
  const df = flat.length - 1;
  console.log(
    tp.padEnd(9),
    "|", f(s.mean, 1).padStart(6),
    "|", (s.percentChange >= 0 ? "+" : "") + f(s.percentChange, 1).padStart(5),
    "|", f(s.tStatistic, 3).padStart(6),
    "|", String(s.degreesOfFreedom).padStart(2),
    "|", f(s.pValue, 4).padStart(6),
    "|", s.stable ? "yes" : "NO",
    "| SD(diff) =", f(standardDeviation(diffs), 2)
  );
}

console.log("\n=== VARIANCE COMPONENTS ===");
console.log("between-timepoint variance", f(r.stability.varianceComponents.betweenTimepoints.variance, 1),
  "(", f(r.stability.varianceComponents.betweenTimepoints.contribution, 1), "% )");
console.log("within-timepoint  variance", f(r.stability.varianceComponents.withinTimepoints.variance, 1),
  "(", f(r.stability.varianceComponents.withinTimepoints.contribution, 1), "% )");

console.log("\n=== TREND ===");
const lr = r.stability.trend.linearRegression;
console.log("slope", f(lr.slope, 3), "AFB/day  R2", f(lr.r2, 4), "t", f(lr.tStatistic, 3), "df", 6, "p", f(lr.pValue, 4));
const tpMeans = Object.keys(stabilityRaw).map((tp) => r.stability.timepoints[tp].mean);
let cum = 0;
const cusum = tpMeans.map((m) => (cum += m - r.stability.baseline));
console.log("CUSUM by time point:", cusum.map((v) => f(v, 1)).join(", "));
console.log("CUSUM decision limits (+/-50% of baseline):", f(0.5 * r.stability.baseline, 1));

console.log("\n=== UNCERTAINTY BUDGET ===");
for (const c of r.uncertainty.budget.contributions) {
  console.log(String(c.name).padEnd(26), f(c.value, 2), "AFB  contribution", f(c.contribution, 1), "%");
}
console.log("combined u_c ", f(r.uncertainty.budget.combinedUncertainty, 2));
console.log("expanded U   ", f(r.uncertainty.budget.expandedUncertainty, 2),
  "(", f((r.uncertainty.budget.expandedUncertainty / r.homogeneity.mean) * 100, 1), "% rel )");
console.log("MC mean", f(r.uncertainty.monteCarlo.mean, 2), "sd", f(r.uncertainty.monteCarlo.sd, 2),
  "95% [", f(r.uncertainty.monteCarlo.percentile_2_5, 1), ",", f(r.uncertainty.monteCarlo.percentile_97_5, 1), "]");

console.log("\n=== DECISION ===");
console.log(JSON.stringify(r.decision, null, 2));
