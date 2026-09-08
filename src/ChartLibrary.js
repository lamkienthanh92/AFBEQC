import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Cell,
  ComposedChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

// ============================================================================
// CUSTOM TOOLTIP
// ============================================================================

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.98)",
          padding: "10px 14px",
          border: "2px solid #2c3e50",
          borderRadius: "6px",
          boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
        }}
      >
        <p
          style={{
            margin: "0 0 6px 0",
            fontWeight: "bold",
            color: "#2c3e50",
            fontSize: "13px",
          }}
        >
          {label}
        </p>
        {payload.map((entry, index) => (
          <p
            key={index}
            style={{ margin: "3px 0", color: entry.color, fontSize: "12px" }}
          >
            <span style={{ fontWeight: "600" }}>{entry.name}:</span>{" "}
            {typeof entry.value === "number"
              ? entry.value.toFixed(2)
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ============================================================================
// CHART CARD COMPONENT - COMPACT VERSION
// ============================================================================

const ChartCard = ({ label, title, caption, children, span = 1 }) => {
  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
        gridColumn: span === 2 ? "span 2" : span === 3 ? "span 3" : "span 1",
        position: "relative",
      }}
      className="chart-card"
    >
      {/* Label Badge */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          backgroundColor: "#2c3e50",
          color: "white",
          padding: "4px 10px",
          borderRadius: "4px",
          fontWeight: "bold",
          fontSize: "13px",
          zIndex: 10,
        }}
      >
        {label}
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: "15px",
          fontWeight: "bold",
          marginTop: "32px",
          marginBottom: "4px",
          color: "#2c3e50",
        }}
      >
        {title}
      </div>

      {/* Caption */}
      <div
        style={{
          fontSize: "11px",
          color: "#666",
          marginBottom: "10px",
          fontStyle: "italic",
          lineHeight: "1.3",
        }}
      >
        {caption}
      </div>

      {/* Content */}
      {children}
    </div>
  );
};

// ============================================================================
// DECISION SUMMARY - PUBLICATION QUALITY
// ============================================================================

export const DecisionSummary = ({ results, criteria }) => {
  const formatNumber = (num, decimals = 2) => {
    return typeof num === "number" ? num.toFixed(decimals) : "N/A";
  };

  const homogeneityScore = results.decision.homogeneityPass
    ? 100
    : (results.homogeneity.criterion / criteria.homogeneityThreshold) * 100;

  const agreementScore = results.homogeneity.icc.icc * 100;

  const stabilityScore = results.decision.stabilityPass
    ? 100
    : (Object.values(results.stability.timepoints).filter((t) => t.stable)
        .length /
        Object.values(results.stability.timepoints).length) *
      100;

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f5f5f5",
        maxWidth: "1600px",
        margin: "0 auto",
      }}
    >
      {/* Main Title */}
      <div
        style={{
          background: "linear-gradient(135deg, #34495e 0%, #2c3e50 100%)",
          color: "white",
          padding: "20px 24px",
          borderRadius: "8px",
          marginBottom: "16px",
          boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "bold" }}>
          EQA SAMPLE PRODUCTION ANALYSIS - SUMMARY DASHBOARD
        </h1>
        <p style={{ margin: "6px 0 0 0", fontSize: "14px", opacity: 0.9 }}>
          Comprehensive Statistical Evaluation & Quality Decision
        </p>
      </div>

      {/* Overall Decision */}
      <div
        style={{
          padding: "24px",
          background: results.decision.overallPass
            ? "linear-gradient(135deg, #27ae60 0%, #229954 100%)"
            : "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
          color: "white",
          borderRadius: "8px",
          textAlign: "center",
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "16px",
          boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
        }}
      >
        {results.decision.overallPass ? "✓ " : "✗ "}
        {results.decision.recommendation}
      </div>

      {/* 3-Column Grid - COMPACT */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        {/* Chart A: Homogeneity Score */}
        <ChartCard
          label="(A)"
          title="Homogeneity Score"
          caption="Sample uniformity assessment. M-2SD must exceed threshold for acceptance."
        >
          <div style={{ textAlign: "center", padding: "20px 10px" }}>
            <div
              style={{
                fontSize: "56px",
                fontWeight: "bold",
                color: homogeneityScore >= 100 ? "#27ae60" : "#e74c3c",
                lineHeight: 1,
                marginBottom: "12px",
              }}
            >
              {Math.round(homogeneityScore)}%
            </div>
            <div
              style={{ fontSize: "13px", color: "#555", marginBottom: "6px" }}
            >
              M - 2SD ={" "}
              <strong>{formatNumber(results.homogeneity.criterion)}</strong>
            </div>
            <div
              style={{ fontSize: "12px", color: "#777", marginBottom: "12px" }}
            >
              Threshold: {criteria.homogeneityThreshold}
            </div>
            <div
              style={{
                padding: "8px 12px",
                backgroundColor:
                  homogeneityScore >= 100 ? "#d4edda" : "#f8d7da",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "bold",
                color: homogeneityScore >= 100 ? "#155724" : "#721c24",
              }}
            >
              {homogeneityScore >= 100 ? "✓ PASSED" : "✗ FAILED"}
            </div>
          </div>
        </ChartCard>

        {/* Chart B: Inter-reader Agreement */}
        <ChartCard
          label="(B)"
          title="Inter-reader Agreement"
          caption="Intraclass correlation coefficient (ICC). >0.90 = Excellent, 0.75-0.90 = Good."
        >
          <div style={{ textAlign: "center", padding: "20px 10px" }}>
            <div
              style={{
                fontSize: "56px",
                fontWeight: "bold",
                color:
                  agreementScore >= 90
                    ? "#27ae60"
                    : agreementScore >= 75
                    ? "#f39c12"
                    : "#e74c3c",
                lineHeight: 1,
                marginBottom: "12px",
              }}
            >
              {Math.round(agreementScore)}%
            </div>
            <div
              style={{ fontSize: "13px", color: "#555", marginBottom: "6px" }}
            >
              ICC ={" "}
              <strong>{formatNumber(results.homogeneity.icc.icc, 3)}</strong>
            </div>
            <div
              style={{ fontSize: "12px", color: "#777", marginBottom: "12px" }}
            >
              {results.homogeneity.icc.interpretation} agreement
            </div>
            <div
              style={{
                padding: "8px 12px",
                backgroundColor:
                  results.homogeneity.pairedTTest.pValue > criteria.pValueThreshold
                    ? "#d4edda"
                    : "#f8d7da",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "bold",
                color:
                  results.homogeneity.pairedTTest.pValue > criteria.pValueThreshold
                    ? "#155724"
                    : "#721c24",
              }}
            >
              p = {formatNumber(results.homogeneity.pairedTTest.pValue, 3)}
            </div>
          </div>
        </ChartCard>

        {/* Chart C: Stability Score */}
        <ChartCard
          label="(C)"
          title="Stability Score"
          caption="Proportion of stable timepoints. All timepoints must be stable for acceptance."
        >
          <div style={{ textAlign: "center", padding: "20px 10px" }}>
            <div
              style={{
                fontSize: "56px",
                fontWeight: "bold",
                color: stabilityScore === 100 ? "#27ae60" : "#e74c3c",
                lineHeight: 1,
                marginBottom: "12px",
              }}
            >
              {Math.round(stabilityScore)}%
            </div>
            <div
              style={{ fontSize: "13px", color: "#555", marginBottom: "6px" }}
            >
              <strong>
                {
                  Object.values(results.stability.timepoints).filter(
                    (t) => t.stable
                  ).length
                }
              </strong>{" "}
              /
              <strong>
                {Object.values(results.stability.timepoints).length}
              </strong>{" "}
              Stable
            </div>
            <div
              style={{ fontSize: "12px", color: "#777", marginBottom: "12px" }}
            >
              Dual criteria met (p &gt; {criteria.pValueThreshold} or Δ within {Math.round((results.stability?.practicalSignificanceThreshold ?? 0.15) * 100)}%)
            </div>
            <div
              style={{
                padding: "8px 12px",
                backgroundColor: results.decision.stabilityPass
                  ? "#d4edda"
                  : "#f8d7da",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "bold",
                color: results.decision.stabilityPass ? "#155724" : "#721c24",
              }}
            >
              {results.decision.stabilityPass ? "✓ ALL STABLE" : "✗ UNSTABLE"}
            </div>
          </div>
        </ChartCard>

        {/* Chart D: Performance Radar - LARGER */}
        <ChartCard
          label="(D)"
          title="Overall Performance Radar"
          caption="Multivariate assessment across 5 key quality metrics. Blue area = lot performance, green outline = target."
          span={2}
        >
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart
              data={[
                {
                  metric: "Homogeneity",
                  score: Math.min(100, homogeneityScore),
                  target: 100,
                },
                {
                  metric: "Agreement",
                  score: Math.min(100, agreementScore),
                  target: 100,
                },
                {
                  metric: "Stability",
                  score: Math.min(100, stabilityScore),
                  target: 100,
                },
                {
                  metric: "Precision",
                  score: Math.min(100, Math.max(0, 100 - results.homogeneity.cv)),
                  target: 100,
                },
                {
                  metric: "Robustness",
                  score: Math.min(
                    100,
                    (results.homogeneity.robustMean /
                      results.homogeneity.mean) *
                      100
                  ),
                  target: 100,
                },
              ]}
            >
              <PolarGrid stroke="#ccc" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: "#2c3e50", fontSize: 13, fontWeight: "600" }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                allowDataOverflow={true}
                tickFormatter={(v) => Math.round(v)}
                tick={{ fontSize: 11 }}
              />
              <Radar isAnimationActive={false}
                name="Performance"
                dataKey="score"
                stroke="#3498db"
                fill="#3498db"
                fillOpacity={0.5}
                strokeWidth={2.5}
              />
              <Radar isAnimationActive={false}
                name="Target"
                dataKey="target"
                stroke="#27ae60"
                fill="#27ae60"
                fillOpacity={0.05}
                strokeDasharray="5 5"
                strokeWidth={2}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart E: Key Metrics Summary */}
        <ChartCard
          label="(E)"
          title="Key Statistical Metrics"
          caption="Summary of critical parameters and quality indicators."
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              padding: "10px 0",
            }}
          >
            <div
              style={{
                textAlign: "center",
                padding: "12px",
                backgroundColor: "#e8f4f8",
                borderRadius: "6px",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#2c3e50",
                }}
              >
                {formatNumber(results.homogeneity.mean)}
              </div>
              <div
                style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}
              >
                Mean Count
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                padding: "12px",
                backgroundColor: "#fef5e7",
                borderRadius: "6px",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#2c3e50",
                }}
              >
                {formatNumber(results.homogeneity.cv)}%
              </div>
              <div
                style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}
              >
                CV%
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                padding: "12px",
                backgroundColor: "#ebf5fb",
                borderRadius: "6px",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#2c3e50",
                }}
              >
                {formatNumber(results.homogeneity.icc.icc, 2)}
              </div>
              <div
                style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}
              >
                ICC
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                padding: "12px",
                backgroundColor: results.homogeneity.outliers.grubbs.isOutlier
                  ? "#fdedec"
                  : "#d4edda",
                borderRadius: "6px",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#2c3e50",
                }}
              >
                {results.homogeneity.outliers.grubbs.isOutlier ? "YES" : "NO"}
              </div>
              <div
                style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}
              >
                Outliers
              </div>
            </div>
          </div>
        </ChartCard>

        {/* Chart F: Statistical Summary Table */}
        <ChartCard
          label="(F)"
          title="Statistical Parameters"
          caption="Detailed statistical analysis results with quality ratings."
          span={3}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "12px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#34495e", color: "white" }}>
                <th
                  style={{
                    padding: "10px",
                    textAlign: "left",
                    fontWeight: "600",
                  }}
                >
                  Parameter
                </th>
                <th
                  style={{
                    padding: "10px",
                    textAlign: "left",
                    fontWeight: "600",
                  }}
                >
                  Value
                </th>
                <th
                  style={{
                    padding: "10px",
                    textAlign: "left",
                    fontWeight: "600",
                  }}
                >
                  Interpretation
                </th>
                <th
                  style={{
                    padding: "10px",
                    textAlign: "left",
                    fontWeight: "600",
                  }}
                >
                  Quality Rating
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ backgroundColor: "#f9f9f9" }}>
                <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                  Mean (Classical)
                </td>
                <td
                  style={{
                    padding: "8px",
                    borderBottom: "1px solid #ddd",
                    fontWeight: "bold",
                  }}
                >
                  {formatNumber(results.homogeneity.mean)}
                </td>
                <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                  Average of all readings
                </td>
                <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                  <span style={{ color: "#27ae60", fontWeight: "bold" }}>
                    ● Excellent
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                  CV%
                </td>
                <td
                  style={{
                    padding: "8px",
                    borderBottom: "1px solid #ddd",
                    fontWeight: "bold",
                  }}
                >
                  {formatNumber(results.homogeneity.cv)}%
                </td>
                <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                  Coefficient of variation
                </td>
                <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                  <span
                    style={{
                      color:
                        results.homogeneity.cv < 15
                          ? "#27ae60"
                          : results.homogeneity.cv < 20
                          ? "#f39c12"
                          : "#e74c3c",
                      fontWeight: "bold",
                    }}
                  >
                    ●{" "}
                    {results.homogeneity.cv < 15
                      ? "Good"
                      : results.homogeneity.cv < 20
                      ? "Acceptable"
                      : "Poor"}
                  </span>
                </td>
              </tr>
              <tr style={{ backgroundColor: "#f9f9f9" }}>
                <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                  ICC
                </td>
                <td
                  style={{
                    padding: "8px",
                    borderBottom: "1px solid #ddd",
                    fontWeight: "bold",
                  }}
                >
                  {formatNumber(results.homogeneity.icc.icc, 3)}
                </td>
                <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                  Intraclass correlation
                </td>
                <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>
                  <span
                    style={{
                      color:
                        results.homogeneity.icc.icc > 0.9
                          ? "#27ae60"
                          : results.homogeneity.icc.icc > 0.75
                          ? "#f39c12"
                          : "#e74c3c",
                      fontWeight: "bold",
                    }}
                  >
                    ● {results.homogeneity.icc.interpretation}
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ padding: "8px" }}>Outliers (Grubbs)</td>
                <td style={{ padding: "8px", fontWeight: "bold" }}>
                  {results.homogeneity.outliers.grubbs.isOutlier
                    ? "Detected"
                    : "None"}
                </td>
                <td style={{ padding: "8px" }}>
                  {results.homogeneity.outliers.grubbs.isOutlier
                    ? `Outlier value: ${formatNumber(
                        results.homogeneity.outliers.grubbs.outlierValue
                      )}`
                    : "No significant outliers detected"}
                </td>
                <td style={{ padding: "8px" }}>
                  <span
                    style={{
                      color: results.homogeneity.outliers.grubbs.isOutlier
                        ? "#e74c3c"
                        : "#27ae60",
                      fontWeight: "bold",
                    }}
                  >
                    ●{" "}
                    {results.homogeneity.outliers.grubbs.isOutlier
                      ? "Review Required"
                      : "Good"}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </ChartCard>
      </div>

      <style>{`
        .chart-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
          transition: all 0.2s ease;
        }
        table tr:hover {
          background-color: #e8f4f8 !important;
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// HOMOGENEITY CHARTS - PUBLICATION QUALITY
// ============================================================================

export const HomogeneityCharts = ({ data, results }) => {
  if (!data || !data.reader1 || !data.reader2 || data.reader1.length === 0) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#e74c3c" }}>
        ⚠️ No data available. Please enter homogeneity data first.
      </div>
    );
  }

  const sampleIndices = [...Array(data.reader1.length).keys()].map(
    (i) => i + 1
  );

  const leveyJenningsData = sampleIndices.map((i) => ({
    sample: i,
    reader1: data.reader1[i - 1],
    reader2: data.reader2[i - 1],
    mean: results.mean,
    plus2SD: results.mean + 2 * results.sd,
    minus2SD: results.mean - 2 * results.sd,
    plus3SD: results.mean + 3 * results.sd,
    minus3SD: results.mean - 3 * results.sd,
  }));

  const blandAltmanData = sampleIndices.map((i) => ({
    average: (data.reader1[i - 1] + data.reader2[i - 1]) / 2,
    difference: data.reader1[i - 1] - data.reader2[i - 1],
    sample: `S${i}`,
  }));

  const boxPlotData = sampleIndices.map((i) => ({
    sample: `S${i}`,
    range: Math.abs(data.reader1[i - 1] - data.reader2[i - 1]),
    mean: (data.reader1[i - 1] + data.reader2[i - 1]) / 2,
  }));


  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f5f5f5",
        maxWidth: "1600px",
        margin: "0 auto",
      }}
    >
      {/* Main Title */}
      <div
        style={{
          background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
          color: "white",
          padding: "20px 24px",
          borderRadius: "8px",
          marginBottom: "16px",
          boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "bold" }}>
          HOMOGENEITY ANALYSIS - INTER-READER VARIABILITY ASSESSMENT
        </h1>
        <p style={{ margin: "6px 0 0 0", fontSize: "14px", opacity: 0.9 }}>
          Statistical evaluation of sample uniformity and measurement agreement
        </p>
      </div>

      {/* 3-Column Grid - COMPACT */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
        }}
      >
        {/* Chart A: Levey-Jennings */}
        <ChartCard
          label="(A)"
          title="Levey-Jennings Control Chart"
          caption="Quality control chart with Westgard rules. Points outside ±2SD require investigation."
          span={2}
        >
          <ResponsiveContainer width="100%" height={380}>
            <LineChart
              data={leveyJenningsData}
              margin={{ top: 10, right: 25, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis
                dataKey="sample"
                label={{
                  value: "Sample Number",
                  position: "insideBottom",
                  offset: -5,
                  fontSize: 11,
                }}
              />
              <YAxis
                label={{
                  value: "Count",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 11,
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />

              {/* Control zones */}
              <ReferenceArea
                y1={results.mean + 2 * results.sd}
                y2={results.mean + 3 * results.sd}
                fill="#ffcccc"
                fillOpacity={0.3}
              />
              <ReferenceArea
                y1={results.mean - 2 * results.sd}
                y2={results.mean - 3 * results.sd}
                fill="#ffcccc"
                fillOpacity={0.3}
              />
              <ReferenceArea
                y1={results.mean + results.sd}
                y2={results.mean + 2 * results.sd}
                fill="#ffffcc"
                fillOpacity={0.3}
              />
              <ReferenceArea
                y1={results.mean - results.sd}
                y2={results.mean - 2 * results.sd}
                fill="#ffffcc"
                fillOpacity={0.3}
              />
              <ReferenceArea
                y1={results.mean - results.sd}
                y2={results.mean + results.sd}
                fill="#ccffcc"
                fillOpacity={0.3}
              />

              <ReferenceLine
                y={results.mean}
                stroke="#27ae60"
                strokeWidth={2.5}
              />
              <ReferenceLine
                y={results.mean + 2 * results.sd}
                stroke="#e67e22"
                strokeDasharray="5 5"
                strokeWidth={2}
              />
              <ReferenceLine
                y={results.mean - 2 * results.sd}
                stroke="#e67e22"
                strokeDasharray="5 5"
                strokeWidth={2}
              />
              <ReferenceLine
                y={results.mean + 3 * results.sd}
                stroke="#e74c3c"
                strokeDasharray="3 3"
                strokeWidth={1.5}
              />
              <ReferenceLine
                y={results.mean - 3 * results.sd}
                stroke="#e74c3c"
                strokeDasharray="3 3"
                strokeWidth={1.5}
              />

              <Line isAnimationActive={false}
                type="monotone"
                dataKey="reader1"
                stroke="#3498db"
                strokeWidth={2.5}
                dot={{ r: 5, fill: "#3498db" }}
                name="Reader 1"
              />
              <Line isAnimationActive={false}
                type="monotone"
                dataKey="reader2"
                stroke="#9b59b6"
                strokeWidth={2.5}
                dot={{ r: 5, fill: "#9b59b6" }}
                name="Reader 2"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart B: Metrics Summary */}
        <ChartCard
          label="(B)"
          title="Homogeneity Metrics"
          caption="Key statistical parameters summary."
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "10px",
              padding: "10px 0",
            }}
          >
            <div
              style={{
                textAlign: "center",
                padding: "14px",
                backgroundColor: "#e8f4f8",
                borderRadius: "6px",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: "#2c3e50",
                }}
              >
                {results.mean.toFixed(1)}
              </div>
              <div
                style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}
              >
                Mean Count
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                padding: "14px",
                backgroundColor: "#fef5e7",
                borderRadius: "6px",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: "#2c3e50",
                }}
              >
                {results.sd.toFixed(1)}
              </div>
              <div
                style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}
              >
                Std Deviation
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                padding: "14px",
                backgroundColor: "#ebf5fb",
                borderRadius: "6px",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: "#2c3e50",
                }}
              >
                {results.cv.toFixed(1)}%
              </div>
              <div
                style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}
              >
                CV%
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                padding: "14px",
                backgroundColor:
                  results.criterion > 200 ? "#d4edda" : "#f8d7da",
                borderRadius: "6px",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: results.criterion > 200 ? "#27ae60" : "#e74c3c",
                }}
              >
                {results.criterion.toFixed(1)}
              </div>
              <div
                style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}
              >
                M - 2SD
              </div>
            </div>
          </div>
        </ChartCard>

        {/* Chart C: Bland-Altman */}
        <ChartCard
          label="(C)"
          title="Bland-Altman Agreement Plot"
          caption="Agreement analysis between readers. 95% of points should fall within limits of agreement."
          span={2}
        >
          <ResponsiveContainer width="100%" height={380}>
            <ScatterChart margin={{ top: 10, right: 25, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              {/* Both axes previously used Recharts' default domain, which
                  starts the x-axis at 0 (wasting most of the plot area) and can
                  clip the lower limit of agreement off the bottom of the y-axis
                  so that the reference line is not drawn at all. Both domains
                  are now derived from the data and the limits themselves. */}
              <XAxis
                type="number"
                dataKey="average"
                name="Average"
                domain={["dataMin - 20", "dataMax + 20"]}
                allowDecimals={false}
                label={{
                  value: "Average of Two Readers",
                  position: "insideBottom",
                  offset: -5,
                  fontSize: 11,
                }}
              />
              <YAxis
                type="number"
                dataKey="difference"
                name="Difference"
                domain={[
                  Math.floor(
                    Math.min(
                      results.blandAltman.lowerLimit,
                      ...results.blandAltman.data.differences
                    ) - 10
                  ),
                  Math.ceil(
                    Math.max(
                      results.blandAltman.upperLimit,
                      ...results.blandAltman.data.differences
                    ) + 10
                  ),
                ]}
                label={{
                  value: "Difference (R1 - R2)",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 11,
                }}
              />
              <Tooltip content={<CustomTooltip />} />

              <ReferenceArea
                y1={results.blandAltman.lowerLimit}
                y2={results.blandAltman.upperLimit}
                fill="#3498db"
                fillOpacity={0.1}
              />
              <ReferenceLine
                y={results.blandAltman.bias}
                stroke="#2c3e50"
                strokeWidth={2.5}
                label={{
                  value: `Bias: ${results.blandAltman.bias.toFixed(1)}`,
                  fontSize: 11,
                }}
              />
              <ReferenceLine
                y={results.blandAltman.upperLimit}
                stroke="#e74c3c"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{ value: `+1.96SD`, fontSize: 11 }}
              />
              <ReferenceLine
                y={results.blandAltman.lowerLimit}
                stroke="#e74c3c"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{ value: `-1.96SD`, fontSize: 11 }}
              />
              <ReferenceLine y={0} stroke="#95a5a6" strokeDasharray="3 3" />

              <Scatter isAnimationActive={false}
                name="Sample Differences"
                data={blandAltmanData}
                fill="#9b59b6"
              >
                {blandAltmanData.map((entry, index) => {
                  const isOutlier =
                    entry.difference > results.blandAltman.upperLimit ||
                    entry.difference < results.blandAltman.lowerLimit;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={isOutlier ? "#e74c3c" : "#9b59b6"}
                      r={isOutlier ? 8 : 5}
                    />
                  );
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart D: Range Analysis */}
        <ChartCard
          label="(D)"
          title="Inter-reader Range Chart"
          caption="Absolute differences between readers. Red bars exceed acceptable variation (>2× mean range)."
        >
          <ResponsiveContainer width="100%" height={380}>
            <ComposedChart
              data={boxPlotData}
              margin={{ top: 10, right: 25, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis
                dataKey="sample"
                label={{
                  value: "Sample",
                  position: "insideBottom",
                  offset: -5,
                  fontSize: 11,
                }}
              />
              <YAxis
                label={{
                  value: "|R1 - R2|",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 11,
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />

              <ReferenceLine
                y={results.blandAltman.sdDifferences}
                stroke="#e67e22"
                strokeWidth={2}
                strokeDasharray="5 5"
                label="Mean Range"
              />
              <ReferenceLine
                y={results.blandAltman.sdDifferences * 2}
                stroke="#e74c3c"
                strokeWidth={2}
                strokeDasharray="3 3"
                label="2× Mean"
              />

              <Bar isAnimationActive={false} dataKey="range" fill="#3498db" name="Range">
                {boxPlotData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.range > results.blandAltman.sdDifferences * 2
                        ? "#e74c3c"
                        : "#3498db"
                    }
                  />
                ))}
              </Bar>
              <Line isAnimationActive={false}
                type="monotone"
                dataKey="mean"
                stroke="#27ae60"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                name="Mean Count"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <style>{`
        .chart-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// STABILITY CHARTS - ENHANCED WITH VARIANCE COMPONENTS
// ============================================================================

export const StabilityCharts = ({ data, results, baseline }) => {
  const timeSeriesData = [
    {
      timepoint: "Baseline",
      mean: baseline,
      lower: baseline,
      upper: baseline,
      pValue: 1.0,
    },
    ...data.timepoints.map((tp) => {
      const result = results.timepoints[tp];
      return {
        timepoint: tp,
        mean: result?.mean || 0,
        lower: (result?.mean || 0) - (result?.sd || 0),
        upper: (result?.mean || 0) + (result?.sd || 0),
        pValue: result?.pValue || 1.0,
        stable: result?.stable,
      };
    }),
  ];

  const pValueData = data.timepoints.map((tp) => ({
    timepoint: tp,
    pValue: results.timepoints[tp]?.pValue || 1.0,
    logP: -Math.log10(results.timepoints[tp]?.pValue || 1.0),
    status: results.timepoints[tp]?.stable ? "Stable" : "Unstable",
  }));

  // Cumulative sum of the deviation of each time-point mean from baseline.
  // The previous implementation started the accumulation at index 1, silently
  // discarding the deviation of the first time point from the cumulative sum.
  const PST = results.practicalSignificanceThreshold ?? 0.15;
  const PSTpc = Math.round(PST * 100);
  const cusumData = timeSeriesData.map((entry, index) => {
    const cusum = timeSeriesData
      .slice(0, index + 1)
      .reduce((sum, e) => sum + (e.mean - baseline), 0);
    return { ...entry, cusum };
  });

  // ✅ NEW: Variance Components Data
  const varianceData = results.varianceComponents
    ? [
        {
          name: "Between\nTimepoints",
          variance: results.varianceComponents.betweenTimepoints.variance,
          contribution:
            results.varianceComponents.betweenTimepoints.contribution,
          sd: results.varianceComponents.betweenTimepoints.sd,
        },
        {
          name: "Within\nTimepoints",
          variance: results.varianceComponents.withinTimepoints.variance,
          contribution:
            results.varianceComponents.withinTimepoints.contribution,
          sd: results.varianceComponents.withinTimepoints.meanSD,
        },
        {
          name: "Total\nVariance",
          variance: results.varianceComponents.total.variance,
          contribution: 100,
          sd: results.varianceComponents.total.sd,
        },
      ]
    : [];

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f5f5f5",
        maxWidth: "1600px",
        margin: "0 auto",
      }}
    >
      {/* Main Title */}
      <div
        style={{
          background: "linear-gradient(135deg, #e67e22 0%, #d35400 100%)",
          color: "white",
          padding: "20px 24px",
          borderRadius: "8px",
          marginBottom: "16px",
          boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "bold" }}>
          STABILITY ANALYSIS - TEMPORAL VARIATION ASSESSMENT
        </h1>
        <p style={{ margin: "6px 0 0 0", fontSize: "14px", opacity: 0.9 }}>
          Time-series evaluation and trend detection over storage conditions
        </p>
      </div>

      {/* 3-Column Grid - COMPACT */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
        }}
      >
        {/* Chart A: Time Series */}
        <ChartCard
          label="(A)"
          title="Stability Over Time"
          caption={`Temporal variation with control bands. Inner band = the ±${Math.round((results.practicalSignificanceThreshold ?? 0.15) * 100)}% practical-significance limit; outer band = twice that limit.`}
          span={2}
        >
          <ResponsiveContainer width="100%" height={380}>
            <ComposedChart
              data={timeSeriesData}
              margin={{ top: 10, right: 25, left: 10, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis
                dataKey="timepoint"
                angle={-45}
                textAnchor="end"
                height={70}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                label={{
                  value: "Mean Count",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 11,
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />

              <ReferenceArea
                y1={baseline * (1 - 2 * PST)}
                y2={baseline * (1 + 2 * PST)}
                fill="#ffffcc"
                fillOpacity={0.2}
              />
              <ReferenceArea
                y1={baseline * (1 - PST)}
                y2={baseline * (1 + PST)}
                fill="#ccffcc"
                fillOpacity={0.3}
              />

              <ReferenceLine
                y={baseline}
                stroke="#27ae60"
                strokeWidth={2.5}
                label="Baseline"
              />
              <ReferenceLine
                y={baseline * (1 - PST)}
                stroke="#f39c12"
                strokeDasharray="5 5"
                strokeWidth={1.5}
                label={`-${PSTpc}%`}
              />
              <ReferenceLine
                y={baseline * (1 + PST)}
                stroke="#f39c12"
                strokeDasharray="5 5"
                strokeWidth={1.5}
                label={`+${PSTpc}%`}
              />
              <ReferenceLine
                y={baseline * (1 - 2 * PST)}
                stroke="#e74c3c"
                strokeDasharray="3 3"
                label={`-${2 * PSTpc}%`}
              />
              <ReferenceLine
                y={baseline * (1 + 2 * PST)}
                stroke="#e74c3c"
                strokeDasharray="3 3"
                label={`+${2 * PSTpc}%`}
              />

              <Area isAnimationActive={false}
                type="monotone"
                dataKey="upper"
                fill="#3498db"
                fillOpacity={0.2}
                stroke="none"
              />
              <Area isAnimationActive={false}
                type="monotone"
                dataKey="lower"
                fill="#3498db"
                fillOpacity={0.2}
                stroke="none"
              />
              <Line isAnimationActive={false}
                type="monotone"
                dataKey="mean"
                stroke="#2c3e50"
                strokeWidth={3}
                dot={{ r: 6, fill: "#2c3e50" }}
                name="Mean"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart B: Timepoint Status - ENHANCED */}
        <ChartCard
          label="(B)"
          title="Timepoint Status"
          caption={`Individual stability with practical significance (\u00b1${Math.round(
            (results.practicalSignificanceThreshold ?? 0.15) * 100
          )}%). Asterisk (*) = stat different but within range.`}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "8px",
              padding: "10px 0",
            }}
          >
            {data.timepoints.map((tp) => {
              const result = results.timepoints[tp];
              return (
                <div
                  key={tp}
                  style={{
                    padding: "12px",
                    backgroundColor: result?.stable ? "#d4edda" : "#f8d7da",
                    borderRadius: "6px",
                    border: `2px solid ${
                      result?.stable ? "#28a745" : "#dc3545"
                    }`,
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "bold",
                      marginBottom: "4px",
                    }}
                  >
                    {tp}
                  </div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: result?.stable ? "#155724" : "#721c24",
                      marginBottom: "3px",
                    }}
                  >
                    {result?.mean.toFixed(1)}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#666",
                      marginBottom: "3px",
                    }}
                  >
                    Δ = {result?.percentChange >= 0 ? "+" : ""}
                    {result?.percentChange?.toFixed(1)}%
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#666",
                      marginBottom: "3px",
                    }}
                  >
                    p = {result?.pValue.toFixed(3)}
                    {result?.statisticallyDifferent && result?.stable && (
                      <span style={{ color: "#f39c12", marginLeft: "3px" }}>
                        *
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "bold",
                      color: result?.stable ? "#155724" : "#721c24",
                    }}
                  >
                    {result?.stable ? "✓ STABLE" : "✗ UNSTABLE"}
                  </div>
                </div>
              );
            })}
            <div
              style={{
                fontSize: "9px",
                color: "#666",
                marginTop: "5px",
                fontStyle: "italic",
              }}
            >
              * Stat different but within ±{Math.round((results.practicalSignificanceThreshold ?? 0.15) * 100)}%
            </div>
          </div>
        </ChartCard>

        {/* Chart C: P-value Plot */}
        <ChartCard
          label="(C)"
          title="Statistical Significance Test"
          caption="P-value analysis vs baseline. Bars exceeding red line (α=0.05) indicate significant difference."
        >
          <ResponsiveContainer width="100%" height={380}>
            <ComposedChart
              data={pValueData}
              margin={{ top: 10, right: 25, left: 10, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis
                dataKey="timepoint"
                angle={-45}
                textAnchor="end"
                height={70}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                label={{
                  value: "-log10(P-value)",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 11,
                }}
              />
              <Tooltip content={<CustomTooltip />} />

              <ReferenceLine
                y={-Math.log10(0.05)}
                stroke="#e74c3c"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                label={{ value: "α=0.05", fontSize: 11 }}
              />

              <Bar isAnimationActive={false} dataKey="logP" name="-log10(P)">
                {pValueData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.logP > -Math.log10(0.05) ? "#e74c3c" : "#27ae60"
                    }
                  />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart D: CUSUM */}
        <ChartCard
          label="(D)"
          title="CUSUM Control Chart"
          caption="Cumulative sum chart detects small persistent shifts. Excursions beyond limits indicate process drift."
          span={2}
        >
          <ResponsiveContainer width="100%" height={380}>
            <LineChart
              data={cusumData}
              margin={{ top: 10, right: 25, left: 10, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis
                dataKey="timepoint"
                angle={-45}
                textAnchor="end"
                height={70}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                label={{
                  value: "Cumulative Deviation",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 11,
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />

              <ReferenceLine y={0} stroke="#27ae60" strokeWidth={2.5} />
              <ReferenceLine
                y={baseline * 0.5}
                stroke="#e74c3c"
                strokeDasharray="5 5"
                strokeWidth={2}
                label="UCL"
              />
              <ReferenceLine
                y={-baseline * 0.5}
                stroke="#e74c3c"
                strokeDasharray="5 5"
                strokeWidth={2}
                label="LCL"
              />

              <Line isAnimationActive={false}
                type="monotone"
                dataKey="cusum"
                stroke="#e67e22"
                strokeWidth={3}
                dot={{ r: 6 }}
                name="CUSUM"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ✅ NEW Chart E: Variance Components Analysis */}
        {varianceData.length > 0 && (
          <ChartCard
            label="(E)"
            title="Variance Components Analysis"
            caption="Decomposition of total variance into temporal (between-timepoint) and measurement (within-timepoint) sources."
          >
            <ResponsiveContainer width="100%" height={380}>
              <ComposedChart
                data={varianceData}
                margin={{ top: 10, right: 45, left: 10, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  yAxisId="left"
                  label={{
                    value: "Variance",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 11,
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{
                    value: "Contribution %",
                    angle: 90,
                    position: "insideRight",
                    fontSize: 11,
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />

                <Bar isAnimationActive={false}
                  yAxisId="left"
                  dataKey="variance"
                  fill="#3498db"
                  name="Variance"
                >
                  <Cell fill="#e67e22" />
                  <Cell fill="#3498db" />
                  <Cell fill="#2c3e50" />
                </Bar>
                <Line isAnimationActive={false}
                  yAxisId="right"
                  type="monotone"
                  dataKey="contribution"
                  stroke="#e74c3c"
                  strokeWidth={3}
                  name="Contribution %"
                />
              </ComposedChart>
            </ResponsiveContainer>

            {/* Summary stats below chart */}
            <div
              style={{
                marginTop: "10px",
                padding: "10px",
                backgroundColor: "#f8f9fa",
                borderRadius: "6px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                  fontSize: "11px",
                }}
              >
                <div>
                  <strong>Between-TP:</strong>
                  <br />
                  {results.varianceComponents.betweenTimepoints.contribution.toFixed(
                    1
                  )}
                  %
                </div>
                <div>
                  <strong>Within-TP:</strong>
                  <br />
                  {results.varianceComponents.withinTimepoints.contribution.toFixed(
                    1
                  )}
                  %
                </div>
                <div>
                  <strong>Total SD:</strong>
                  <br />
                  {results.varianceComponents.total.sd.toFixed(2)}
                </div>
                <div>
                  <strong>Total CV:</strong>
                  <br />
                  {results.varianceComponents.total.cv.toFixed(1)}%
                </div>
              </div>

              {/* Interpretation */}
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "10px",
                  color: "#666",
                  fontStyle: "italic",
                }}
              >
                {results.varianceComponents.betweenTimepoints.contribution > 70
                  ? "⚠ High temporal variation - storage conditions may affect stability"
                  : results.varianceComponents.withinTimepoints.contribution >
                    70
                  ? "⚠ High measurement variation - consider improving assay precision"
                  : "✓ Balanced variance - acceptable stability profile"}
              </div>
            </div>
          </ChartCard>
        )}

        {/* Chart F: Trend if available */}
        {results.trend && (
          <ChartCard
            label="(F)"
            title="Linear Regression Trend"
            caption="Trend analysis with fitted regression line. Significant slope indicates systematic drift."
            span={2}
          >
            <ResponsiveContainer width="100%" height={380}>
              <ComposedChart
                data={timeSeriesData.slice(1).map((entry, index) => ({
                  ...entry,
                  predicted:
                    results.trend.linearRegression.intercept +
                    results.trend.linearRegression.slope * (index + 1),
                }))}
                margin={{ top: 10, right: 25, left: 10, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                <XAxis
                  dataKey="timepoint"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  label={{
                    value: "Mean Count",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 11,
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />

                <Scatter isAnimationActive={false} name="Observed" dataKey="mean" fill="#3498db" />
                <Line isAnimationActive={false}
                  name="Fitted Line"
                  dataKey="predicted"
                  stroke="#e74c3c"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={false}
                  type="monotone"
                />
              </ComposedChart>
            </ResponsiveContainer>
            <div
              style={{
                marginTop: "8px",
                fontSize: "11px",
                color: "#666",
                textAlign: "center",
              }}
            >
              <strong>Slope:</strong>{" "}
              {results.trend.linearRegression.slope.toFixed(3)},
              <strong> p:</strong>{" "}
              {results.trend.linearRegression.pValue.toFixed(3)},
              <strong> R²:</strong>{" "}
              {results.trend.linearRegression.r2.toFixed(3)}
              {results.trend.linearRegression.significantTrend && (
                <span style={{ color: "#e74c3c", marginLeft: "8px" }}>
                  ⚠ Significant trend detected
                </span>
              )}
            </div>
          </ChartCard>
        )}
      </div>

      <style>{`
        .chart-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// UNCERTAINTY CHARTS - PUBLICATION QUALITY
// ============================================================================

export const UncertaintyCharts = ({ results }) => {
  const budgetData = results.budget.contributions;

  const mcDistribution = results.monteCarlo.distribution;
  const histogramBins = 35;
  const mcMin = Math.min(...mcDistribution);
  const mcMax = Math.max(...mcDistribution);
  const binWidth = (mcMax - mcMin) / histogramBins;

  const mcHistogram = Array(histogramBins)
    .fill(0)
    .map((_, i) => {
      const binMin = mcMin + i * binWidth;
      const binMax = binMin + binWidth;
      const count = mcDistribution.filter(
        (v) => v >= binMin && v < binMax
      ).length;
      return {
        bin: Math.round(binMin + binWidth / 2),
        count: count,
        frequency: count / mcDistribution.length,
      };
    });

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f5f5f5",
        maxWidth: "1600px",
        margin: "0 auto",
      }}
    >
      {/* Main Title */}
      <div
        style={{
          background: "linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)",
          color: "white",
          padding: "20px 24px",
          borderRadius: "8px",
          marginBottom: "16px",
          boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "26px", fontWeight: "bold" }}>
          UNCERTAINTY ANALYSIS - MEASUREMENT UNCERTAINTY BUDGET
        </h1>
        <p style={{ margin: "6px 0 0 0", fontSize: "14px", opacity: 0.9 }}>
          Uncertainty estimation following GUM methodology, with a Monte Carlo cross-check
        </p>
      </div>

      {/* 3-Column Grid - COMPACT */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
        }}
      >
        {/* Chart A: Pareto */}
        <ChartCard
          label="(A)"
          title="Uncertainty Budget (Pareto)"
          caption="Contribution analysis of uncertainty sources. Orange line shows cumulative percentage."
          span={2}
        >
          <ResponsiveContainer width="100%" height={380}>
            <ComposedChart
              data={budgetData.map((item, index, arr) => ({
                ...item,
                cumulative: arr
                  .slice(0, index + 1)
                  .reduce((sum, i) => sum + i.contribution, 0),
              }))}
              margin={{ top: 10, right: 50, left: 10, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={90}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                yAxisId="left"
                label={{
                  value: "Uncertainty Value",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 11,
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{
                  value: "Cumulative %",
                  angle: 90,
                  position: "insideRight",
                  fontSize: 11,
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />

              <Bar isAnimationActive={false}
                yAxisId="left"
                dataKey="value"
                fill="#9b59b6"
                name="Uncertainty"
              />
              <Line isAnimationActive={false}
                yAxisId="right"
                type="monotone"
                dataKey="cumulative"
                stroke="#e67e22"
                strokeWidth={3}
                name="Cumulative %"
              />

              <ReferenceLine
                yAxisId="right"
                y={80}
                stroke="#f39c12"
                strokeDasharray="5 5"
                strokeWidth={2}
                label="80%"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart B: Summary Stats */}
        <ChartCard
          label="(B)"
          title="Monte Carlo Summary"
          caption="Statistics from 10,000 simulation iterations."
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "10px",
              padding: "10px 0",
            }}
          >
            <div
              style={{
                textAlign: "center",
                padding: "14px",
                backgroundColor: "#e8f8f5",
                borderRadius: "6px",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: "#2c3e50",
                }}
              >
                {results.monteCarlo.mean.toFixed(2)}
              </div>
              <div
                style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}
              >
                Mean
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                padding: "14px",
                backgroundColor: "#fef5e7",
                borderRadius: "6px",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: "#2c3e50",
                }}
              >
                {results.monteCarlo.median.toFixed(2)}
              </div>
              <div
                style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}
              >
                Median
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                padding: "14px",
                backgroundColor: "#ebf5fb",
                borderRadius: "6px",
              }}
            >
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: "#2c3e50",
                }}
              >
                {results.monteCarlo.sd.toFixed(2)}
              </div>
              <div
                style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}
              >
                Std Dev
              </div>
            </div>
            <div
              style={{
                textAlign: "center",
                padding: "14px",
                backgroundColor: "#fdedec",
                borderRadius: "6px",
              }}
            >
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#2c3e50",
                }}
              >
                [{results.monteCarlo.percentile_2_5.toFixed(1)},{" "}
                {results.monteCarlo.percentile_97_5.toFixed(1)}]
              </div>
              <div
                style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}
              >
                95% CI
              </div>
            </div>
          </div>
        </ChartCard>

        {/* Chart C: Monte Carlo Distribution */}
        <ChartCard
          label="(C)"
          title="Monte Carlo Distribution"
          caption="Probability distribution from simulation (n=10,000). Red lines mark 95% confidence interval."
          span={2}
        >
          <ResponsiveContainer width="100%" height={380}>
            <ComposedChart
              data={mcHistogram}
              margin={{ top: 10, right: 25, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis
                dataKey="bin"
                type="number"
                domain={["dataMin", "dataMax"]}
                allowDuplicatedCategory={false}
                label={{
                  value: "Value",
                  position: "insideBottom",
                  offset: -5,
                  fontSize: 11,
                }}
              />
              <YAxis
                label={{
                  value: "Frequency",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 11,
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />

              <ReferenceLine
                x={Math.round(results.monteCarlo.mean)}
                stroke="#27ae60"
                strokeWidth={2.5}
                label="Mean"
              />
              <ReferenceLine
                x={Math.round(results.monteCarlo.percentile_2_5)}
                stroke="#e74c3c"
                strokeDasharray="3 3"
                strokeWidth={2}
                label="2.5%"
              />
              <ReferenceLine
                x={Math.round(results.monteCarlo.percentile_97_5)}
                stroke="#e74c3c"
                strokeDasharray="3 3"
                strokeWidth={2}
                label="97.5%"
              />

              <Area isAnimationActive={false}
                type="monotone"
                dataKey="frequency"
                fill="#9b59b6"
                fillOpacity={0.6}
                stroke="#9b59b6"
                strokeWidth={2}
                name="Distribution"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart D: Coverage Factors */}
        <ChartCard
          label="(D)"
          title="Coverage Factors"
          caption="Relationship between coverage factor k and confidence level. k=2 provides 95% confidence (ISO standard)."
        >
          <ResponsiveContainer width="100%" height={380}>
            <BarChart
              data={[
                {
                  k: "k=1",
                  uncertainty: results.budget.combinedUncertainty,
                  coverage: 68,
                },
                {
                  k: "k=2",
                  uncertainty: results.budget.expandedUncertainty,
                  coverage: 95,
                },
                {
                  k: "k=3",
                  uncertainty: results.budget.combinedUncertainty * 3,
                  coverage: 99.7,
                },
              ]}
              margin={{ top: 10, right: 25, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis dataKey="k" />
              <YAxis
                yAxisId="left"
                label={{
                  value: "U(k)",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 11,
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{
                  value: "Coverage %",
                  angle: 90,
                  position: "insideRight",
                  fontSize: 11,
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />

              <Bar isAnimationActive={false}
                yAxisId="left"
                dataKey="uncertainty"
                fill="#16a085"
                name="Expanded U"
              >
                <Cell fill="#3498db" />
                <Cell fill="#27ae60" />
                <Cell fill="#e67e22" />
              </Bar>
              <Line isAnimationActive={false}
                yAxisId="right"
                type="monotone"
                dataKey="coverage"
                stroke="#e74c3c"
                strokeWidth={3}
                name="Coverage %"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <style>{`
        .chart-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};
