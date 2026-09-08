import React, { useState, useRef } from "react";
import { performStatisticalAnalysis } from "./StatisticalEngine";
import {
  HomogeneityCharts,
  StabilityCharts,
  UncertaintyCharts,
  DecisionSummary,
} from "./ChartLibrary";
import { ExportButton } from "./ExportDashboard";

// Sample data
const SAMPLE_DATA = {
  afb_3plus: {
    lotNumber: "ĐGĐ-P01",
    productionDate: "2024-01-15",
    productType: "AFB Sputum Smear",
    targetLevel: "3+",
    homogeneity: {
      reader1: [425, 386, 402, 411, 391, 367, 291, 406, 364, 325],
      reader2: [413, 374, 390, 401, 389, 371, 301, 391, 304, 332],
    },
    stabilityShort: {
      day0: { mean: 371.7 },
      day1: [
        [376, 395],
        [381, 357],
        [293, 306],
      ],
      day3: [
        [376, 400],
        [405, 382],
        [371, 384],
      ],
      day5: [
        [318, 298],
        [391, 393],
        [363, 378],
      ],
      day7: [
        [367, 298],
        [371, 362],
        [391, 380],
      ],
    },
  },
};

const EQAAnalyzer = () => {
  const [step, setStep] = useState(1);
  const [studyInfo, setStudyInfo] = useState({
    lotNumber: "",
    productionDate: new Date().toISOString().split("T")[0],
    productType: "",
    targetLevel: "",
    acceptanceCriteria: {
      homogeneityThreshold: 200,
      pValueThreshold: 0.05,
      practicalSignificanceThreshold: 0.15,
    },
  });

  const [homogeneityData, setHomogeneityData] = useState({
    reader1: [],
    reader2: [],
  });

  const [stabilityData, setStabilityData] = useState({
    timepoints: [],
    data: {},
  });

  const [analysisResults, setAnalysisResults] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");

  // Refs for export
  const summaryRef = useRef(null);
  const homogeneityRef = useRef(null);
  const stabilityRef = useRef(null);
  const uncertaintyRef = useRef(null);

  // Load sample data
  const loadSampleData = () => {
    const sample = SAMPLE_DATA.afb_3plus;
    setStudyInfo({
      lotNumber: sample.lotNumber,
      productionDate: sample.productionDate,
      productType: sample.productType,
      targetLevel: sample.targetLevel,
      acceptanceCriteria: {
        homogeneityThreshold: 200,
        pValueThreshold: 0.05,
        practicalSignificanceThreshold: 0.15,
      },
    });
    setHomogeneityData(sample.homogeneity);

    const stabilityTimepoints = Object.keys(sample.stabilityShort).filter(
      (k) => k !== "day0"
    );
    const stabilityDataObj = {};
    stabilityTimepoints.forEach((tp) => {
      stabilityDataObj[tp] = sample.stabilityShort[tp];
    });
    stabilityDataObj.baseline = { mean: sample.stabilityShort.day0.mean };

    setStabilityData({
      timepoints: stabilityTimepoints,
      data: stabilityDataObj,
    });

    setStep(4);
    alert('✓ Sample data loaded! Click "Run Complete Analysis"');
  };

  // Parse CSV input
  const parseCSVInput = (text) => {
    return text
      .split(/[,\s]+/)
      .map((v) => parseFloat(v.trim()))
      .filter((v) => !isNaN(v));
  };

  // Run analysis
  const runAnalysis = () => {
    const results = performStatisticalAnalysis({
      studyInfo,
      homogeneity: homogeneityData,
      stability: stabilityData,
    });
    setAnalysisResults(results);
    setActiveTab("summary");
  };

  // Export results
  const exportResults = () => {
    const exportData = {
      studyInfo,
      homogeneityData,
      stabilityData,
      analysisResults,
      exportDate: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.download = `EQA_Analysis_${studyInfo.lotNumber}_${Date.now()}.json`;
    link.href = url;
    link.click();
  };

  const styles = {
    container: {
      fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
      maxWidth: "1600px",
      margin: "0 auto",
      padding: "24px",
      backgroundColor: "#f8f9fa",
      minHeight: "100vh",
    },
    header: {
      backgroundColor: "#2c3e50",
      color: "white",
      padding: "36px",
      borderRadius: "16px",
      marginBottom: "32px",
      boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
    },
    title: {
      margin: 0,
      fontSize: "36px",
      fontWeight: "bold",
      marginBottom: "8px",
    },
    subtitle: {
      margin: "12px 0 0 0",
      fontSize: "17px",
      opacity: 0.92,
      lineHeight: "1.5",
    },
    card: {
      backgroundColor: "white",
      padding: "28px",
      borderRadius: "16px",
      marginBottom: "24px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      border: "1px solid #e0e0e0",
    },
    cardTitle: {
      fontSize: "22px",
      fontWeight: "bold",
      marginBottom: "24px",
      color: "#2c3e50",
      borderBottom: "3px solid #3498db",
      paddingBottom: "12px",
    },
    inputGroup: {
      marginBottom: "22px",
    },
    label: {
      display: "block",
      marginBottom: "10px",
      fontWeight: "600",
      color: "#495057",
      fontSize: "15px",
    },
    input: {
      width: "100%",
      padding: "12px 14px",
      border: "2px solid #dee2e6",
      borderRadius: "8px",
      fontSize: "15px",
      boxSizing: "border-box",
      transition: "border-color 0.2s",
    },
    textarea: {
      width: "100%",
      padding: "12px 14px",
      border: "2px solid #dee2e6",
      borderRadius: "8px",
      fontSize: "14px",
      minHeight: "110px",
      fontFamily: "'Monaco', 'Consolas', monospace",
      boxSizing: "border-box",
      transition: "border-color 0.2s",
    },
    button: {
      padding: "14px 28px",
      backgroundColor: "#3498db",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      cursor: "pointer",
      marginRight: "12px",
      marginTop: "12px",
      fontWeight: "600",
      transition: "all 0.3s",
      boxShadow: "0 2px 6px rgba(52,152,219,0.3)",
    },
    buttonSecondary: {
      padding: "14px 28px",
      backgroundColor: "#95a5a6",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      cursor: "pointer",
      marginRight: "12px",
      marginTop: "12px",
      fontWeight: "600",
      transition: "all 0.3s",
    },
    buttonSuccess: {
      padding: "14px 28px",
      backgroundColor: "#27ae60",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      cursor: "pointer",
      marginRight: "12px",
      marginTop: "12px",
      fontWeight: "600",
      transition: "all 0.3s",
      boxShadow: "0 2px 6px rgba(39,174,96,0.3)",
    },
    buttonWarning: {
      padding: "14px 28px",
      backgroundColor: "#e67e22",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "16px",
      cursor: "pointer",
      marginRight: "12px",
      marginTop: "12px",
      fontWeight: "600",
      transition: "all 0.3s",
    },
    stepIndicator: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "36px",
      padding: "0 24px",
    },
    stepItem: {
      flex: 1,
      textAlign: "center",
      padding: "12px",
      position: "relative",
    },
    stepNumber: (active) => ({
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      backgroundColor: active ? "#3498db" : "#bdc3c7",
      color: "white",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      marginBottom: "10px",
      fontSize: "18px",
      transition: "all 0.3s",
      boxShadow: active ? "0 4px 8px rgba(52,152,219,0.4)" : "none",
    }),
    stepLabel: {
      fontSize: "15px",
      color: "#555",
      fontWeight: "500",
    },
    tabContainer: {
      display: "flex",
      gap: "8px",
      marginBottom: "24px",
      borderBottom: "2px solid #e0e0e0",
      paddingBottom: "0",
    },
    tab: (active) => ({
      padding: "14px 24px",
      backgroundColor: active ? "#3498db" : "transparent",
      color: active ? "white" : "#555",
      border: "none",
      borderRadius: "8px 8px 0 0",
      fontSize: "16px",
      cursor: "pointer",
      fontWeight: "600",
      transition: "all 0.2s",
      marginBottom: "-2px",
      borderBottom: active ? "2px solid #3498db" : "none",
    }),
    exportContainer: {
      backgroundColor: "#fff3cd",
      padding: "20px",
      borderRadius: "12px",
      marginBottom: "24px",
      border: "2px solid #ffc107",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🔬 EQA Sample Production Analyzer</h1>
        <p style={styles.subtitle}>
          Comprehensive Statistical Analysis for External Quality Assessment
          Sample Production
          <br />
          Including Homogeneity, Stability, and Uncertainty Estimation
        </p>
        <button style={styles.buttonWarning} onClick={loadSampleData}>
          📊 Load Sample Data (AFB Study)
        </button>
      </div>

      {/* Step Indicator */}
      <div style={styles.stepIndicator}>
        <div style={styles.stepItem}>
          <div style={styles.stepNumber(step >= 1)}>1</div>
          <div style={styles.stepLabel}>Study Info</div>
        </div>
        <div style={styles.stepItem}>
          <div style={styles.stepNumber(step >= 2)}>2</div>
          <div style={styles.stepLabel}>Homogeneity</div>
        </div>
        <div style={styles.stepItem}>
          <div style={styles.stepNumber(step >= 3)}>3</div>
          <div style={styles.stepLabel}>Stability</div>
        </div>
        <div style={styles.stepItem}>
          <div style={styles.stepNumber(step >= 4)}>4</div>
          <div style={styles.stepLabel}>Analysis</div>
        </div>
      </div>

      {/* Step 1: Study Information */}
      {step === 1 && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Step 1: Study Information</h2>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Lot Number</label>
            <input
              style={styles.input}
              type="text"
              value={studyInfo.lotNumber}
              onChange={(e) =>
                setStudyInfo({ ...studyInfo, lotNumber: e.target.value })
              }
              placeholder="e.g., ĐGĐ-P01"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Production Date</label>
            <input
              style={styles.input}
              type="date"
              value={studyInfo.productionDate}
              onChange={(e) =>
                setStudyInfo({ ...studyInfo, productionDate: e.target.value })
              }
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Product Type</label>
            <input
              style={styles.input}
              type="text"
              value={studyInfo.productType}
              onChange={(e) =>
                setStudyInfo({ ...studyInfo, productType: e.target.value })
              }
              placeholder="e.g., AFB Sputum Smear, Gram Stain, IHC Slides"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Target Level</label>
            <input
              style={styles.input}
              type="text"
              value={studyInfo.targetLevel}
              onChange={(e) =>
                setStudyInfo({ ...studyInfo, targetLevel: e.target.value })
              }
              placeholder="e.g., 3+, 2+, 1+, Negative"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Homogeneity Threshold (M - 2SD must be greater than)
            </label>
            <input
              style={styles.input}
              type="number"
              value={studyInfo.acceptanceCriteria.homogeneityThreshold}
              onChange={(e) =>
                setStudyInfo({
                  ...studyInfo,
                  acceptanceCriteria: {
                    ...studyInfo.acceptanceCriteria,
                    homogeneityThreshold: parseFloat(e.target.value),
                  },
                })
              }
              placeholder="e.g., 200 for AFB 3+, 100 for AFB 2+, 50 for AFB 1+"
            />
            <small
              style={{
                color: "#6c757d",
                fontSize: "13px",
                marginTop: "5px",
                display: "block",
              }}
            >
              AFB samples typically require: 3+ ≥200, 2+ ≥100, 1+ ≥50 bacilli
              per field
            </small>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              P-value Threshold (minimum acceptable)
            </label>
            <input
              style={styles.input}
              type="number"
              step="0.01"
              value={studyInfo.acceptanceCriteria.pValueThreshold}
              onChange={(e) =>
                setStudyInfo({
                  ...studyInfo,
                  acceptanceCriteria: {
                    ...studyInfo.acceptanceCriteria,
                    pValueThreshold: parseFloat(e.target.value),
                  },
                })
              }
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Practical Significance Threshold for Stability (% change from
              baseline)
            </label>
            <input
              style={styles.input}
              type="number"
              step="1"
              min="1"
              max="100"
              value={studyInfo.acceptanceCriteria.practicalSignificanceThreshold * 100}
              onChange={(e) => {
                const pct = parseFloat(e.target.value);
                setStudyInfo({
                  ...studyInfo,
                  acceptanceCriteria: {
                    ...studyInfo.acceptanceCriteria,
                    practicalSignificanceThreshold: isNaN(pct) ? 0 : pct / 100,
                  },
                });
              }}
              placeholder="e.g., 15"
            />
            <small
              style={{
                color: "#6c757d",
                fontSize: "13px",
                marginTop: "5px",
                display: "block",
              }}
            >
              A timepoint is flagged unstable only if BOTH the paired t-test is
              significant AND the change exceeds this percentage. Different
              EQA schemes / analytes use different acceptable-variation
              limits (commonly 10\u201325 %) \u2014 set this to match your programme's
              own criterion; there is no universal default for AFB
              microscopy, so review before relying on the built-in value of
              15 %.
            </small>
          </div>

          <button style={styles.button} onClick={() => setStep(2)}>
            Next: Homogeneity Data →
          </button>
        </div>
      )}

      {/* Step 2: Homogeneity Data */}
      {step === 2 && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Step 2: Homogeneity Assessment Data</h2>

          <p
            style={{ color: "#6c757d", marginBottom: "24px", fontSize: "15px" }}
          >
            Enter readings from two independent readers/analysts. Paste comma or
            space-separated values (typically 10 samples).
          </p>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Reader 1 Data</label>
            <textarea
              style={styles.textarea}
              placeholder="Example: 425, 386, 402, 411, 391, 367, 291, 406, 364, 325"
              onChange={(e) => {
                const values = parseCSVInput(e.target.value);
                setHomogeneityData({ ...homogeneityData, reader1: values });
              }}
              value={homogeneityData.reader1.join(", ")}
            />
            <small style={{ color: "#6c757d", fontSize: "13px" }}>
              ✓ Parsed {homogeneityData.reader1.length} values
            </small>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Reader 2 Data</label>
            <textarea
              style={styles.textarea}
              placeholder="Example: 413, 374, 390, 401, 389, 371, 301, 391, 304, 332"
              onChange={(e) => {
                const values = parseCSVInput(e.target.value);
                setHomogeneityData({ ...homogeneityData, reader2: values });
              }}
              value={homogeneityData.reader2.join(", ")}
            />
            <small style={{ color: "#6c757d", fontSize: "13px" }}>
              ✓ Parsed {homogeneityData.reader2.length} values
            </small>
          </div>

          <button style={styles.buttonSecondary} onClick={() => setStep(1)}>
            ← Back
          </button>
          <button
            style={styles.button}
            onClick={() => setStep(3)}
            disabled={
              homogeneityData.reader1.length === 0 ||
              homogeneityData.reader2.length === 0
            }
          >
            Next: Stability Data →
          </button>
        </div>
      )}

      {/* Step 3: Stability Data */}
      {step === 3 && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Step 3: Stability Assessment Data</h2>

          <p
            style={{ color: "#6c757d", marginBottom: "24px", fontSize: "15px" }}
          >
            Enter stability data at different timepoints. Each timepoint should
            have 3 samples with 2 readings each.
          </p>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Baseline Mean (from homogeneity assessment)
            </label>
            <input
              style={styles.input}
              type="number"
              value={stabilityData.data.baseline?.mean || ""}
              onChange={(e) =>
                setStabilityData({
                  ...stabilityData,
                  data: {
                    ...stabilityData.data,
                    baseline: { mean: parseFloat(e.target.value) },
                  },
                })
              }
              placeholder="Auto-calculated from homogeneity data"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Number of Timepoints</label>
            <input
              style={styles.input}
              type="number"
              min="1"
              max="10"
              onChange={(e) => {
                const count = parseInt(e.target.value) || 0;
                const timepoints = Array.from(
                  { length: count },
                  (_, i) => `timepoint_${i + 1}`
                );
                setStabilityData({ ...stabilityData, timepoints });
              }}
              placeholder="e.g., 4 for Day 1, 3, 5, 7"
            />
          </div>

          {stabilityData.timepoints.map((tp, idx) => (
            <div key={tp} style={styles.inputGroup}>
              <label style={styles.label}>
                Timepoint {idx + 1} Label (e.g., Day 1, Week 2)
              </label>
              <input
                style={styles.input}
                type="text"
                value={tp}
                onChange={(e) => {
                  const newTimepoints = [...stabilityData.timepoints];
                  newTimepoints[idx] = e.target.value;
                  setStabilityData({
                    ...stabilityData,
                    timepoints: newTimepoints,
                  });
                }}
              />
              <label style={styles.label}>
                Data (format: [r1,r2], [r1,r2], [r1,r2])
              </label>
              <textarea
                style={{ ...styles.textarea, minHeight: "70px" }}
                placeholder="Example: [376,395], [381,357], [293,306]"
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(`[${e.target.value}]`);
                    setStabilityData({
                      ...stabilityData,
                      data: {
                        ...stabilityData.data,
                        [tp]: parsed,
                      },
                    });
                  } catch (err) {
                    // Invalid JSON
                  }
                }}
              />
            </div>
          ))}

          <button style={styles.buttonSecondary} onClick={() => setStep(2)}>
            ← Back
          </button>
          <button style={styles.button} onClick={() => setStep(4)}>
            Next: Run Analysis →
          </button>
        </div>
      )}

      {/* Step 4: Analysis and Results */}
      {step === 4 && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Step 4: Complete Analysis</h2>

          <div
            style={{
              marginBottom: "24px",
              padding: "18px",
              backgroundColor: "#e8f4f8",
              borderRadius: "10px",
              borderLeft: "4px solid #3498db",
            }}
          >
            <strong style={{ fontSize: "16px", color: "#2c3e50" }}>
              Study Summary:
            </strong>
            <div
              style={{
                marginTop: "10px",
                color: "#555",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              <strong>Lot:</strong> {studyInfo.lotNumber} |{" "}
              <strong>Product:</strong> {studyInfo.productType} |{" "}
              <strong>Level:</strong> {studyInfo.targetLevel} |{" "}
              <strong>Date:</strong> {studyInfo.productionDate}
            </div>
          </div>

          <button style={styles.buttonSuccess} onClick={runAnalysis}>
            🚀 Run Complete Analysis
          </button>

          {analysisResults && (
            <>
              <button style={styles.buttonWarning} onClick={exportResults}>
                💾 Export Results (JSON)
              </button>

              <button style={styles.buttonSecondary} onClick={() => setStep(1)}>
                🔄 Start New Analysis
              </button>
            </>
          )}
        </div>
      )}

      {/* Results Display with Tabs and Export Options */}
      {analysisResults && (
        <>
          {/* Export Panel */}
          <div style={styles.exportContainer}>
            <h3 style={{ margin: "0 0 15px 0", color: "#856404" }}>
              📸 Export Dashboard (300 DPI PNG)
            </h3>
            <p
              style={{
                margin: "0 0 15px 0",
                fontSize: "14px",
                color: "#856404",
              }}
            >
              Choose which dashboard you want to export as a high-resolution
              image (300 DPI):
            </p>
            <ExportButton
              targetRef={summaryRef}
              filename={`${studyInfo.lotNumber}_Summary`}
              studyInfo={studyInfo}
              exportType="png"
              tabKey="summary"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <ExportButton
              targetRef={homogeneityRef}
              filename={`${studyInfo.lotNumber}_Homogeneity`}
              studyInfo={studyInfo}
              exportType="png"
              tabKey="homogeneity"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <ExportButton
              targetRef={stabilityRef}
              filename={`${studyInfo.lotNumber}_Stability`}
              studyInfo={studyInfo}
              exportType="png"
              tabKey="stability"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <ExportButton
              targetRef={uncertaintyRef}
              filename={`${studyInfo.lotNumber}_Uncertainty`}
              studyInfo={studyInfo}
              exportType="png"
              tabKey="uncertainty"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>

          <div style={styles.card}>
            <div style={styles.tabContainer}>
              <button
                style={styles.tab(activeTab === "summary")}
                onClick={() => setActiveTab("summary")}
              >
                📊 Summary
              </button>
              <button
                style={styles.tab(activeTab === "homogeneity")}
                onClick={() => setActiveTab("homogeneity")}
              >
                🧪 Homogeneity
              </button>
              <button
                style={styles.tab(activeTab === "stability")}
                onClick={() => setActiveTab("stability")}
              >
                ⏱️ Stability
              </button>
              <button
                style={styles.tab(activeTab === "uncertainty")}
                onClick={() => setActiveTab("uncertainty")}
              >
                🔬 Uncertainty
              </button>
            </div>
          </div>

          <div
            ref={summaryRef}
            style={{ display: activeTab === "summary" ? "block" : "none" }}
          >
            <DecisionSummary
              results={analysisResults}
              criteria={studyInfo.acceptanceCriteria}
            />
          </div>

          <div
            ref={homogeneityRef}
            style={{ display: activeTab === "homogeneity" ? "block" : "none" }}
          >
            <HomogeneityCharts
              data={homogeneityData}
              results={analysisResults.homogeneity}
            />
          </div>

          <div
            ref={stabilityRef}
            style={{ display: activeTab === "stability" ? "block" : "none" }}
          >
            <StabilityCharts
              data={stabilityData}
              results={analysisResults.stability}
              baseline={stabilityData.data.baseline?.mean}
            />
          </div>

          <div
            ref={uncertaintyRef}
            style={{ display: activeTab === "uncertainty" ? "block" : "none" }}
          >
            <UncertaintyCharts results={analysisResults.uncertainty} />
          </div>
        </>
      )}

      <style>{`
        input:focus, textarea:focus {
          border-color: #3498db !important;
          outline: none;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }
        
        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }
        
        button:active:not(:disabled) {
          transform: translateY(0);
        }
        
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default EQAAnalyzer;
