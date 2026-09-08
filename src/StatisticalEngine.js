// Statistical Engine for EQA Analysis
// All statistical computations for homogeneity, stability, and uncertainty
// ✅ ENHANCED with Practical Significance (±15%) and Variance Components

// ============================================================================
// BASIC STATISTICS
// ============================================================================

export const mean = (arr) => {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
};

export const variance = (arr) => {
  if (arr.length === 0) return 0;
  const m = mean(arr);
  return (
    arr.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / (arr.length - 1)
  );
};

export const standardDeviation = (arr) => {
  return Math.sqrt(variance(arr));
};

export const coefficientOfVariation = (arr) => {
  const m = mean(arr);
  const sd = standardDeviation(arr);
  return m === 0 ? 0 : (sd / m) * 100;
};

export const median = (arr) => {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

export const mad = (arr) => {
  // Median Absolute Deviation
  const m = median(arr);
  const deviations = arr.map((x) => Math.abs(x - m));
  return median(deviations);
};

export const robustSD = (arr) => {
  // Robust standard deviation using MAD
  return 1.4826 * mad(arr);
};

// ============================================================================
// STATISTICAL TESTS
// ============================================================================

export const tTest = (arr1, arr2) => {
  // Independent samples t-test
  const n1 = arr1.length;
  const n2 = arr2.length;
  const mean1 = mean(arr1);
  const mean2 = mean(arr2);
  const var1 = variance(arr1);
  const var2 = variance(arr2);

  // Pooled variance
  const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2);

  // t-statistic
  const t = (mean1 - mean2) / Math.sqrt(pooledVar * (1 / n1 + 1 / n2));

  // Degrees of freedom
  const df = n1 + n2 - 2;

  // Two-tailed p-value from the exact t distribution (df = n1 + n2 - 2)
  const pValue = tTestPValue(t, df);

  return {
    tStatistic: t,
    degreesOfFreedom: df,
    pValue: pValue,
    significant: pValue < 0.05,
  };
};

export const pairedTTest = (arr1, arr2) => {
  // Paired t-test
  if (arr1.length !== arr2.length) {
    throw new Error("Arrays must have same length for paired t-test");
  }

  const differences = arr1.map((val, i) => val - arr2[i]);
  const meanDiff = mean(differences);
  const sdDiff = standardDeviation(differences);
  const n = differences.length;

  const t = meanDiff / (sdDiff / Math.sqrt(n));
  const df = n - 1;
  // Exact two-tailed p-value from the t distribution with df = n - 1.
  const pValue = tTestPValue(t, df);

  return {
    tStatistic: t,
    degreesOfFreedom: df,
    pValue: pValue,
    meanDifference: meanDiff,
    significant: pValue < 0.05,
  };
};

export const fTest = (arr1, arr2) => {
  // F-test for equality of variances
  const var1 = variance(arr1);
  const var2 = variance(arr2);
  const f = var1 / var2;
  const df1 = arr1.length - 1;
  const df2 = arr2.length - 1;

  // Two-tailed p-value from the exact F distribution
  const pValue = 2 * Math.min(fCDF(f, df1, df2), 1 - fCDF(f, df1, df2));

  return {
    fStatistic: f,
    df1: df1,
    df2: df2,
    pValue: pValue,
    significant: pValue < 0.05,
  };
};

// ============================================================================
// ADVANCED STATISTICS
// ============================================================================

export const intraclassCorrelation = (arr1, arr2) => {
  // ICC(2,1) - Two-way random effects, absolute agreement, single rater
  const n = arr1.length;
  const allData = [...arr1, ...arr2];
  const grandMean = mean(allData);

  // Between-subject variance
  const subjectMeans = arr1.map((val, i) => (val + arr2[i]) / 2);
  const BSS =
    2 * subjectMeans.reduce((sum, sm) => sum + Math.pow(sm - grandMean, 2), 0);
  const BMS = BSS / (n - 1);

  // Within-subject variance
  const WSS = arr1.reduce(
    (sum, val, i) =>
      sum +
      Math.pow(val - subjectMeans[i], 2) +
      Math.pow(arr2[i] - subjectMeans[i], 2),
    0
  );
  const WMS = WSS / n;

  // Two-way decomposition: separate the rater (column) effect out of the
  // within-subject term so that the coefficient is a genuine ICC(2,1) rather
  // than the one-way ICC(1,1) that (BMS - WMS)/(BMS + WMS) returns.
  const k = 2; // two raters
  const raterMeans = [mean(arr1), mean(arr2)];
  const JSS =
    n * raterMeans.reduce((sum, rm) => sum + Math.pow(rm - grandMean, 2), 0);
  const JMS = JSS / (k - 1); // rater mean square
  const EMS = (WSS - JSS) / ((n - 1) * (k - 1)); // residual mean square

  // ICC(2,1): two-way random effects, absolute agreement, single rater
  const icc =
    (BMS - EMS) / (BMS + (k - 1) * EMS + (k * (JMS - EMS)) / n);

  // ICC(1,1) retained for reference/backward comparison only
  const icc11 = (BMS - WMS) / (BMS + (k - 1) * WMS);

  // 95 % confidence interval for ICC(2,1) (McGraw & Wong, ICC(A,1))
  const aTerm = (k * icc) / (n * (1 - icc));
  const bTerm = 1 + (k * icc * (n - 1)) / (n * (1 - icc));
  const vDen =
    Math.pow(aTerm * JMS, 2) / (k - 1) +
    Math.pow(bTerm * EMS, 2) / ((n - 1) * (k - 1));
  const v = Math.pow(aTerm * JMS + bTerm * EMS, 2) / vDen;
  const Fl = fQuantile(0.975, n - 1, v);
  const Fu = fQuantile(0.975, v, n - 1);
  const ciLower =
    (n * (BMS - Fl * EMS)) /
    (Fl * (k * JMS + (k * n - k - n) * EMS) + n * BMS);
  const ciUpper =
    (n * (Fu * BMS - EMS)) /
    (k * JMS + (k * n - k - n) * EMS + n * Fu * BMS);

  return {
    icc: icc,
    ci95: [ciLower, ciUpper],
    iccModel: "ICC(2,1): two-way random effects, absolute agreement, single rater",
    icc11: icc11,
    raterMeanSquare: JMS,
    residualMeanSquare: EMS,
    betweenSubjectVariance: BMS,
    withinSubjectVariance: WMS,
    interpretation:
      icc > 0.9
        ? "Excellent"
        : icc > 0.75
        ? "Good"
        : icc > 0.5
        ? "Moderate"
        : "Poor",
  };
};

export const concordanceCorrelation = (arr1, arr2) => {
  // Lin's Concordance Correlation Coefficient
  const n = arr1.length;
  const mean1 = mean(arr1);
  const mean2 = mean(arr2);
  const var1 = variance(arr1);
  const var2 = variance(arr2);

  // Covariance
  const cov =
    arr1.reduce((sum, val, i) => sum + (val - mean1) * (arr2[i] - mean2), 0) /
    (n - 1);

  // Pearson correlation
  const r = cov / (Math.sqrt(var1) * Math.sqrt(var2));

  // CCC
  const ccc = (2 * cov) / (var1 + var2 + Math.pow(mean1 - mean2, 2));

  return {
    ccc: ccc,
    pearsonR: r,
    interpretation:
      ccc > 0.95
        ? "Excellent"
        : ccc > 0.9
        ? "Good"
        : ccc > 0.8
        ? "Moderate"
        : "Poor",
  };
};

export const blandAltman = (arr1, arr2) => {
  // Bland-Altman analysis
  const differences = arr1.map((val, i) => val - arr2[i]);
  const averages = arr1.map((val, i) => (val + arr2[i]) / 2);

  const meanDiff = mean(differences);
  const sdDiff = standardDeviation(differences);

  const upperLimit = meanDiff + 1.96 * sdDiff;
  const lowerLimit = meanDiff - 1.96 * sdDiff;

  // Count points outside limits
  const outsideLimits = differences.filter(
    (d, i) => d > upperLimit || d < lowerLimit
  ).length;

  return {
    bias: meanDiff,
    upperLimit: upperLimit,
    lowerLimit: lowerLimit,
    sdDifferences: sdDiff,
    pointsOutsideLimits: outsideLimits,
    percentOutside: (outsideLimits / differences.length) * 100,
    data: { differences, averages },
  };
};

// ============================================================================
// OUTLIER DETECTION
// ============================================================================

export const grubbsTest = (arr, alpha = 0.05) => {
  // Grubbs test for outliers
  const n = arr.length;
  const m = mean(arr);
  const sd = standardDeviation(arr);

  // Find maximum deviation
  const deviations = arr.map((x) => Math.abs(x - m));
  const maxDeviation = Math.max(...deviations);
  const maxIndex = deviations.indexOf(maxDeviation);

  // Grubbs statistic
  const G = maxDeviation / sd;

  // Critical value (approximation)
  const tCritical = 2.5; // Simplified for n=10, alpha=0.05
  const criticalValue =
    ((n - 1) / Math.sqrt(n)) *
    Math.sqrt(Math.pow(tCritical, 2) / (n - 2 + Math.pow(tCritical, 2)));

  return {
    grubbsStatistic: G,
    criticalValue: criticalValue,
    isOutlier: G > criticalValue,
    outlierValue: arr[maxIndex],
    outlierIndex: maxIndex,
  };
};

export const dixonTest = (arr) => {
  // Dixon's Q test
  const sorted = [...arr].sort((a, b) => a - b);
  const n = sorted.length;

  // Test both extremes
  const Q_low = (sorted[1] - sorted[0]) / (sorted[n - 1] - sorted[0]);
  const Q_high = (sorted[n - 1] - sorted[n - 2]) / (sorted[n - 1] - sorted[0]);

  // Critical value (approximation for n=10)
  const criticalValue = 0.466;

  return {
    Q_low: Q_low,
    Q_high: Q_high,
    criticalValue: criticalValue,
    lowOutlier: Q_low > criticalValue,
    highOutlier: Q_high > criticalValue,
  };
};

// ============================================================================
// REGRESSION AND TREND ANALYSIS
// ============================================================================

export const linearRegression = (x, y) => {
  // Simple linear regression
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // R-squared
  const yMean = mean(y);
  const yPred = x.map((xi) => slope * xi + intercept);
  const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - yPred[i], 2), 0);
  const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
  const r2 = 1 - ssRes / ssTot;

  // Standard error of slope
  const seSlope =
    Math.sqrt(ssRes / (n - 2)) / Math.sqrt(sumX2 - (sumX * sumX) / n);
  const tSlope = slope / seSlope;
  const pValueSlope = tTestPValue(tSlope, n - 2);

  return {
    slope: slope,
    intercept: intercept,
    r2: r2,
    seSlope: seSlope,
    tStatistic: tSlope,
    pValue: pValueSlope,
    significantTrend: pValueSlope < 0.05,
    predictions: yPred,
  };
};

export const mannKendall = (arr) => {
  // Mann-Kendall trend test
  const n = arr.length;
  let S = 0;

  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      S += Math.sign(arr[j] - arr[i]);
    }
  }

  // Variance of S
  const varS = (n * (n - 1) * (2 * n + 5)) / 18;

  // Z-statistic
  let Z;
  if (S > 0) {
    Z = (S - 1) / Math.sqrt(varS);
  } else if (S < 0) {
    Z = (S + 1) / Math.sqrt(varS);
  } else {
    Z = 0;
  }

  const pValue = 2 * (1 - normalCDF(Math.abs(Z)));

  return {
    S: S,
    Z: Z,
    pValue: pValue,
    trend: S > 0 ? "increasing" : S < 0 ? "decreasing" : "no trend",
    significant: pValue < 0.05,
  };
};

// ============================================================================
// UNCERTAINTY ESTIMATION
// ============================================================================

export const uncertaintyBudget = (components) => {
  // Combined uncertainty from multiple components
  // components = [{name, value, type: 'A' or 'B', distribution}]

  const combinedVariance = components.reduce((sum, comp) => {
    return sum + Math.pow(comp.value, 2);
  }, 0);

  const combinedUncertainty = Math.sqrt(combinedVariance);

  // Expanded uncertainty (k=2 for 95% confidence)
  const expandedUncertainty = 2 * combinedUncertainty;

  // Contribution percentages
  const contributions = components.map((comp) => ({
    name: comp.name,
    value: comp.value,
    contribution: (Math.pow(comp.value, 2) / combinedVariance) * 100,
  }));

  return {
    combinedUncertainty: combinedUncertainty,
    expandedUncertainty: expandedUncertainty,
    coverageFactor: 2,
    confidenceLevel: 0.95,
    contributions: contributions,
  };
};

export const monteCarlo = (params, iterations = 10000) => {
  // Monte Carlo simulation for uncertainty propagation
  // params = {mean, uncertainty, distribution: 'normal' or 'uniform'}

  const results = [];

  for (let i = 0; i < iterations; i++) {
    let sample;
    if (params.distribution === "normal") {
      sample = normalRandom(params.mean, params.uncertainty);
    } else {
      sample = uniformRandom(
        params.mean - params.uncertainty,
        params.mean + params.uncertainty
      );
    }
    results.push(sample);
  }

  return {
    mean: mean(results),
    sd: standardDeviation(results),
    median: median(results),
    percentile_2_5: percentile(results, 2.5),
    percentile_97_5: percentile(results, 97.5),
    distribution: results,
  };
};

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

export const performStatisticalAnalysis = (input) => {
  const { studyInfo, homogeneity, stability } = input;

  // ========== HOMOGENEITY ANALYSIS ==========
  const allReadings = [...homogeneity.reader1, ...homogeneity.reader2];
  const homogeneityMean = mean(allReadings);
  const homogeneitySD = standardDeviation(allReadings);
  const homogeneityCV = coefficientOfVariation(allReadings);

  // M - 2SD criterion
  const homogeneityCriterion = homogeneityMean - 2 * homogeneitySD;
  const homogeneityPass =
    homogeneityCriterion > studyInfo.acceptanceCriteria.homogeneityThreshold;

  // Inter-reader comparison
  const tTestResult = tTest(homogeneity.reader1, homogeneity.reader2);
  const fTestResult = fTest(homogeneity.reader1, homogeneity.reader2);
  const iccResult = intraclassCorrelation(
    homogeneity.reader1,
    homogeneity.reader2
  );
  const cccResult = concordanceCorrelation(
    homogeneity.reader1,
    homogeneity.reader2
  );
  const blandAltmanResult = blandAltman(
    homogeneity.reader1,
    homogeneity.reader2
  );

  // Outlier detection
  const grubbsResult = grubbsTest(allReadings);
  const dixonResult = dixonTest(allReadings);

  // Robust statistics
  const robustMean = median(allReadings);
  const robustSd = robustSD(allReadings);

  // ========== STABILITY ANALYSIS - ENHANCED ==========
  const baselineMean = stability.data.baseline?.mean || homogeneityMean;
  const stabilityResults = {};

  // ✅ Practical significance threshold — user-configurable via
  // studyInfo.acceptanceCriteria.practicalSignificanceThreshold (fraction,
  // e.g. 0.15 = 15%), since different EQA programmes/analytes use different
  // acceptable-variation limits; falls back to 0.15 if not supplied so
  // existing callers/datasets keep working unchanged.
  const practicalSignificanceThreshold =
    studyInfo?.acceptanceCriteria?.practicalSignificanceThreshold ?? 0.15;

  // ✅ Arrays for variance components analysis
  const allTimepointMeans = [];
  const allTimepointSDs = [];
  const allTimepointCVs = [];

  stability.timepoints.forEach((tp) => {
    const timepointData = stability.data[tp];
    if (!timepointData || !Array.isArray(timepointData)) return;

    // Flatten the data
    const flatData = timepointData.flat();
    const timepointMean = mean(flatData);
    const timepointSD = standardDeviation(flatData);
    const timepointCV = coefficientOfVariation(flatData);

    // ✅ Store for variance components calculation
    allTimepointMeans.push(timepointMean);
    allTimepointSDs.push(timepointSD);
    allTimepointCVs.push(timepointCV);

    // Compare to baseline.
    //
    // Previously this called the independent two-sample tTest() with a
    // zero-variance constant vector for the baseline. That yields the correct
    // t-statistic by coincidence but assigns df = 2n - 2 instead of n - 1,
    // because the baseline is a single fixed reference value and not an
    // independently sampled group. It is now computed as a one-sample t-test
    // of the readings at this time point against the baseline mean.
    const nTp = flatData.length;
    const sdTp = standardDeviation(flatData);
    const tStat = (timepointMean - baselineMean) / (sdTp / Math.sqrt(nTp));
    const dfTp = nTp - 1;
    const comparison = {
      tStatistic: tStat,
      degreesOfFreedom: dfTp,
      pValue: tTestPValue(tStat, dfTp),
    };

    // ✅ Calculate percent change from baseline
    const percentChange = ((timepointMean - baselineMean) / baselineMean) * 100;
    const absPercentChange = Math.abs(percentChange);

    // ✅ Dual criteria assessment (statistical AND clinical significance)
    const statisticallyDifferent =
      comparison.pValue <= studyInfo.acceptanceCriteria.pValueThreshold;
    const clinicallySignificant =
      absPercentChange > practicalSignificanceThreshold * 100;

    // Only mark as UNSTABLE if BOTH conditions are met
    const isStable = !statisticallyDifferent || !clinicallySignificant;

    // Stability reason for transparency
    let stabilityReason;
    if (!isStable) {
      stabilityReason =
        "Both statistically and clinically significant difference";
    } else if (statisticallyDifferent && !clinicallySignificant) {
      stabilityReason = `Statistically different (p=${comparison.pValue.toFixed(
        3
      )}) but within acceptable range (Δ=${percentChange.toFixed(1)}%)`;
    } else {
      stabilityReason = "No statistically significant difference";
    }

    stabilityResults[tp] = {
      mean: timepointMean,
      sd: timepointSD,
      cv: timepointCV,
      pValue: comparison.pValue,
      tStatistic: comparison.tStatistic,
      degreesOfFreedom: comparison.degreesOfFreedom,
      sdOfReadings: sdTp,
      n: nTp,
      meanChange: timepointMean - baselineMean,
      percentChange: percentChange,
      absPercentChange: absPercentChange,
      statisticallyDifferent: statisticallyDifferent,
      clinicallySignificant: clinicallySignificant,
      stable: isStable,
      stabilityReason: stabilityReason,
    };
  });

  // ✅ VARIANCE COMPONENTS ANALYSIS
  const varianceComponents = {
    // Between-timepoint variance (temporal variation)
    betweenTimepoints: {
      mean: mean(allTimepointMeans),
      variance: variance(allTimepointMeans),
      sd: standardDeviation(allTimepointMeans),
      cv: coefficientOfVariation(allTimepointMeans),
      range: Math.max(...allTimepointMeans) - Math.min(...allTimepointMeans),
      contribution: 0, // Will be calculated below
    },

    // Within-timepoint variance (measurement variation)
    withinTimepoints: {
      meanSD: mean(allTimepointSDs),
      variance: Math.pow(mean(allTimepointSDs), 2),
      meanCV: mean(allTimepointCVs),
      contribution: 0, // Will be calculated below
    },

    // Total variance
    total: {
      variance: 0,
      sd: 0,
      cv: 0,
    },
  };

  // Calculate total variance and contributions
  const betweenVar = varianceComponents.betweenTimepoints.variance;
  const withinVar = varianceComponents.withinTimepoints.variance;
  const totalVar = betweenVar + withinVar;

  varianceComponents.total.variance = totalVar;
  varianceComponents.total.sd = Math.sqrt(totalVar);
  varianceComponents.total.cv =
    (varianceComponents.total.sd / baselineMean) * 100;

  // Calculate percentage contributions
  varianceComponents.betweenTimepoints.contribution =
    totalVar > 0 ? (betweenVar / totalVar) * 100 : 0;
  varianceComponents.withinTimepoints.contribution =
    totalVar > 0 ? (withinVar / totalVar) * 100 : 0;

  // Trend analysis
  // Use real elapsed time (days) when the caller supplies it, so that the
  // regression slope is expressed in AFB per day rather than AFB per
  // measurement occasion; fall back to the ordinal index otherwise.
  const timeIndices =
    Array.isArray(stability.elapsedDays) &&
    stability.elapsedDays.length === stability.timepoints.length
      ? stability.elapsedDays
      : stability.timepoints.map((_, i) => i + 1);
  const timepointMeans = stability.timepoints.map(
    (tp) => stabilityResults[tp]?.mean || 0
  );

  let trendAnalysis = null;
  if (timepointMeans.length > 2) {
    const regression = linearRegression(timeIndices, timepointMeans);
    const mkTest = mannKendall(timepointMeans);

    trendAnalysis = {
      linearRegression: regression,
      mannKendall: mkTest,
    };
  }

  // ========== UNCERTAINTY ANALYSIS ==========
  const uncertaintyComponents = [
    {
      name: "Homogeneity",
      value: homogeneitySD,
      type: "A",
      distribution: "normal",
    },
    {
      name: "Stability",
      value: standardDeviation(timepointMeans),
      type: "A",
      distribution: "normal",
    },
    {
      name: "Measurement Repeatability",
      value: mean([
        standardDeviation(homogeneity.reader1),
        standardDeviation(homogeneity.reader2),
      ]),
      type: "A",
      distribution: "normal",
    },
  ];

  const uncertaintyBudgetResult = uncertaintyBudget(uncertaintyComponents);

  // Monte Carlo simulation
  const monteCarloResult = monteCarlo(
    {
      mean: homogeneityMean,
      uncertainty: uncertaintyBudgetResult.combinedUncertainty,
      distribution: "normal",
    },
    10000
  );

  // ========== FINAL DECISION ==========
  const allStable = Object.values(stabilityResults).every((r) => r.stable);
  const overallPass =
    homogeneityPass &&
    tTestResult.pValue > studyInfo.acceptanceCriteria.pValueThreshold &&
    allStable;

  return {
    homogeneity: {
      mean: homogeneityMean,
      sd: homogeneitySD,
      cv: homogeneityCV,
      criterion: homogeneityCriterion,
      passed: homogeneityPass,
      robustMean: robustMean,
      robustSD: robustSd,
      tTest: tTestResult,
      fTest: fTestResult,
      icc: iccResult,
      ccc: cccResult,
      blandAltman: blandAltmanResult,
      outliers: {
        grubbs: grubbsResult,
        dixon: dixonResult,
      },
    },
    stability: {
      baseline: baselineMean,
      timepoints: stabilityResults,
      trend: trendAnalysis,
      varianceComponents: varianceComponents, // ✅ ADDED
      allStable: allStable,
      practicalSignificanceThreshold: practicalSignificanceThreshold, // ✅ so dashboards can display the configured value instead of a hardcoded "15%"
    },
    uncertainty: {
      budget: uncertaintyBudgetResult,
      monteCarlo: monteCarloResult,
    },
    decision: {
      overallPass: overallPass,
      homogeneityPass: homogeneityPass,
      stabilityPass: allStable,
      recommendation: overallPass
        ? "LOT APPROVED FOR RELEASE"
        : "LOT FAILED - DO NOT RELEASE",
    },
  };
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function normalCDF(x) {
  // Approximation of normal CDF
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

// ---------------------------------------------------------------------------
// Exact distribution functions (Student's t and Fisher's F)
//
// Previously the engine approximated all t-test p-values with the standard
// normal CDF and returned a hard-coded 0.5 from fCDF(). With the small sample
// sizes used in EQA panel characterisation (n = 10 for homogeneity, n = 3
// slides x 2 readings per stability time point) the normal approximation is
// severely anti-conservative and understates p-values by up to an order of
// magnitude. Both are now computed exactly from the regularised incomplete
// beta function.
// ---------------------------------------------------------------------------

function logGamma(z) {
  // Lanczos approximation (g = 7, n = 9); accurate to ~15 significant digits
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (z < 0.5) {
    // Reflection formula
    return (
      Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z)
    );
  }
  z -= 1;
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

function betacf(x, a, b) {
  // Continued-fraction expansion for the incomplete beta function
  const FPMIN = 1e-300;
  const EPS = 3e-16;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

function incompleteBeta(x, a, b) {
  // Regularised incomplete beta function I_x(a, b)
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const lbeta =
    logGamma(a + b) - logGamma(a) - logGamma(b) +
    a * Math.log(x) + b * Math.log(1 - x);
  const front = Math.exp(lbeta);
  if (x < (a + 1) / (a + b + 2)) {
    return (front * betacf(x, a, b)) / a;
  }
  return 1 - (Math.exp(
    logGamma(a + b) - logGamma(a) - logGamma(b) +
    b * Math.log(1 - x) + a * Math.log(x)
  ) * betacf(1 - x, b, a)) / b;
}

export function tCDF(t, df) {
  // Cumulative distribution function of Student's t with df degrees of freedom
  if (!isFinite(t) || !isFinite(df) || df <= 0) return NaN;
  const x = df / (df + t * t);
  const p = 0.5 * incompleteBeta(x, df / 2, 0.5);
  return t > 0 ? 1 - p : p;
}

export function tTestPValue(t, df) {
  // Two-tailed p-value from the t distribution
  if (!isFinite(t) || !isFinite(df) || df <= 0) return NaN;
  return 2 * (1 - tCDF(Math.abs(t), df));
}

export function fCDF(x, df1, df2) {
  // Cumulative distribution function of the F distribution
  if (!isFinite(x) || x <= 0) return 0;
  return incompleteBeta((df1 * x) / (df1 * x + df2), df1 / 2, df2 / 2);
}

// ---------------------------------------------------------------------------
// Seedable pseudo-random generator (mulberry32).
//
// Monte Carlo results are otherwise irreproducible between runs, which makes
// any simulated figure quoted in a report impossible to verify. Calling
// setRandomSeed(n) makes the simulation deterministic; passing null restores
// Math.random().
// ---------------------------------------------------------------------------
let _rng = Math.random;

export function setRandomSeed(seed) {
  if (seed === null || seed === undefined) {
    _rng = Math.random;
    return;
  }
  let a = seed >>> 0;
  _rng = function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normalRandom(mean, sd) {
  // Box-Muller transform
  const u1 = _rng() || Number.EPSILON;
  const u2 = _rng();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * sd;
}

function uniformRandom(min, max) {
  return min + _rng() * (max - min);
}

function percentile(arr, p) {
  const sorted = [...arr].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

// Quantile of the F distribution, obtained by bisection on fCDF. Used for the
// ICC confidence interval.
export function fQuantile(p, df1, df2) {
  let lo = 0;
  let hi = 1e6;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (fCDF(mid, df1, df2) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
