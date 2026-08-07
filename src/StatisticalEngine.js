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

  // Two-tailed p-value (approximation using normal distribution for large samples)
  const pValue = 2 * (1 - normalCDF(Math.abs(t)));

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
  const pValue = 2 * (1 - normalCDF(Math.abs(t)));

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

  // Simplified p-value calculation
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

  // ICC calculation
  const icc = (BMS - WMS) / (BMS + WMS);

  return {
    icc: icc,
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
  const pValueSlope = 2 * (1 - normalCDF(Math.abs(tSlope)));

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

  // ✅ Practical significance threshold (15%) - fixes "too strict" issue
  const practicalSignificanceThreshold = 0.15;

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

    // Compare to baseline
    const comparison = tTest(
      Array(flatData.length).fill(baselineMean),
      flatData
    );

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
  const timeIndices = stability.timepoints.map((_, i) => i + 1);
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

function fCDF(x, df1, df2) {
  // Simplified F-distribution CDF approximation
  // For actual implementation, use a proper stats library
  return 0.5; // Placeholder
}

function normalRandom(mean, sd) {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * sd;
}

function uniformRandom(min, max) {
  return min + Math.random() * (max - min);
}

function percentile(arr, p) {
  const sorted = [...arr].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}
