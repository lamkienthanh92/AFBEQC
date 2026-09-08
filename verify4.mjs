import { performStatisticalAnalysis, tTest, pairedTTest, setRandomSeed } from "./src/StatisticalEngine.js";
setRandomSeed(20240101);
const reader1=[425,386,402,411,391,367,291,406,364,325];
const reader2=[413,374,390,401,389,371,301,391,304,332];
const short={ "Day 1":[[376,395],[381,357],[293,306]], "Day 3":[[376,400],[405,382],[371,384]],
              "Day 5":[[318,298],[391,393],[363,378]], "Day 7":[[367,298],[371,362],[391,380]] };
const r=performStatisticalAnalysis({
  studyInfo:{acceptanceCriteria:{homogeneityThreshold:200,pValueThreshold:0.05,practicalSignificanceThreshold:0.15}},
  homogeneity:{reader1,reader2},
  stability:{timepoints:Object.keys(short), elapsedDays:[1,3,5,7], data:short}});
const f=(x,d=3)=>Number(x).toFixed(d);
console.log("SHORT-TERM RUN (4 time points) - as exported in the dashboards");
const vc=r.stability.varianceComponents;
console.log("between-TP variance", f(vc.betweenTimepoints.variance,1), "(", f(vc.betweenTimepoints.contribution,1),"%)");
console.log("within-TP  variance", f(vc.withinTimepoints.variance,1), "(", f(vc.withinTimepoints.contribution,1),"%)");
console.log("total variance", f(vc.total.variance,1), "total SD", f(vc.total.sd,2), "total CV", f(vc.total.cv,1));
const lr=r.stability.trend.linearRegression;
console.log("regression slope", f(lr.slope,3), "R2", f(lr.r2,4), "t", f(lr.tStatistic,3), "p", f(lr.pValue,4));
console.log("uncertainty components:");
for(const c of r.uncertainty.budget.contributions) console.log("  ",c.name.padEnd(26), f(c.value,2), f(c.contribution,1)+"%");
console.log("u_c", f(r.uncertainty.budget.combinedUncertainty,2), "U", f(r.uncertainty.budget.expandedUncertainty,2),
  "rel", f(r.uncertainty.budget.expandedUncertainty/r.homogeneity.mean*100,1)+"%");
const mc=r.uncertainty.monteCarlo;
console.log("MC seeded: mean", f(mc.mean,2), "sd", f(mc.sd,2), "CI [", f(mc.percentile_2_5,1),",", f(mc.percentile_97_5,1),"]");
console.log("\nWHICH TEST GIVES p = 0.584 ON THE SUMMARY DASHBOARD?");
console.log("independent two-sample t-test:", f(tTest(reader1,reader2).pValue,4), " (df", tTest(reader1,reader2).degreesOfFreedom,")");
console.log("paired t-test              :", f(pairedTTest(reader1,reader2).pValue,4), " (df", pairedTTest(reader1,reader2).degreesOfFreedom,")");
