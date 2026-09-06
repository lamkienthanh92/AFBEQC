import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * ExportDashboard Component
 * Provides high-quality export functionality for dashboards
 * Supports PNG (300 DPI) and PDF export
 * ✅ FIXED: Proper blob error handling
 * ✅ FIXED: Canvas size is now clamped so very tall/wide dashboards at
 *    300 DPI don't silently exceed the browser's max canvas dimension
 *    (a common cause of the download appearing to do nothing).
 * ✅ FIXED: Download now falls back to opening the image/PDF in a new
 *    tab if the browser blocks the programmatic <a download> click
 *    (this happens in some sandboxed/embedded preview environments).
 * ✅ FIXED: Chart entry animations are now disabled (see ChartLibrary.js)
 *    so exports capture the finished chart instead of a mid-animation
 *    frame — this previously made line/area series look "cut off"
 *    partway across the chart when a tab was captured shortly after
 *    first becoming visible.
 */

// Most browsers cap a single canvas dimension around 16384px, and many
// mobile/low-memory browsers fail well before that. Keep a safe margin.
const MAX_CANVAS_DIMENSION = 8000;

const getSafeScale = (el, desiredScale) => {
  const width = el.scrollWidth * desiredScale;
  const height = el.scrollHeight * desiredScale;
  const largest = Math.max(width, height);
  if (largest <= MAX_CANVAS_DIMENSION) return desiredScale;
  return desiredScale * (MAX_CANVAS_DIMENSION / largest);
};

// Triggers a file download for a blob/data URL; if the browser silently
// blocks the programmatic click (no error is thrown when this happens),
// falls back to opening the file in a new tab so the user can save it
// manually via the browser's built-in "Save as" / long-press menu.
const triggerDownload = (href, filename) => {
  try {
    const link = document.createElement("a");
    link.download = filename;
    link.href = href;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Programmatic download failed, opening in new tab:", err);
    window.open(href, "_blank", "noopener");
  }
};

// Pauses until the browser has actually painted a frame, so that a tab
// switched from display:none to display:block has non-zero layout
// dimensions and ResponsiveContainer has measured its size, before
// html2canvas tries to capture it.
const waitForRender = (delayMs = 500) =>
  new Promise((resolve) =>
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setTimeout(resolve, delayMs))
    )
  );

export const ExportButton = ({
  targetRef,
  filename,
  studyInfo,
  exportType = "png",
  // Optional: if this button exports a dashboard that lives inside a
  // display:none/block tab, pass its key plus the tab state so the
  // export can switch to that tab first. Without this, exporting a
  // dashboard that isn't the currently visible tab captures an empty
  // (0 KB) image, because html2canvas can't measure a hidden element.
  tabKey,
  activeTab,
  setActiveTab,
}) => {
  const handleExport = async () => {
    // Switch to the target tab first if it isn't already active, and
    // give the browser time to actually lay it out before capturing.
    const needsTabSwitch =
      tabKey !== undefined && setActiveTab && activeTab !== tabKey;
    const previousTab = activeTab;
    if (needsTabSwitch) {
      setActiveTab(tabKey);
      await waitForRender();
    }

    if (!targetRef.current || targetRef.current.offsetWidth === 0) {
      alert(
        "No content to export! Make sure the dashboard has finished loading, then try again."
      );
      if (needsTabSwitch) setActiveTab(previousTab);
      return;
    }

    // Create loading overlay
    const loadingDiv = document.createElement("div");
    loadingDiv.id = "export-loading";
    loadingDiv.innerHTML = `
      <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                  background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                  z-index: 10000; text-align: center;">
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">⏳ Exporting dashboard...</div>
        <div style="font-size: 14px; color: #666;">Please wait a moment</div>
      </div>
    `;

    try {
      document.body.appendChild(loadingDiv);

      // Calculate scale for 300 DPI
      // Standard screen DPI is 96, so scale = 300/96 ≈ 3.125
      // Clamped so tall dashboards don't exceed the browser's max canvas size
      const scale = getSafeScale(targetRef.current, 3.125);

      // Capture with high quality settings
      const canvas = await html2canvas(targetRef.current, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: targetRef.current.scrollWidth,
        height: targetRef.current.scrollHeight,
        windowWidth: targetRef.current.scrollWidth,
        windowHeight: targetRef.current.scrollHeight,
      });

      if (exportType === "png") {
        // ✅ FIXED: Better error handling for PNG export
        try {
          // Method 1: Try toBlob with proper error checking
          const blob = await new Promise((resolve, reject) => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error("Failed to create blob from canvas"));
                }
              },
              "image/png",
              1.0
            );
          });

          // Create download link (with automatic new-tab fallback)
          const url = URL.createObjectURL(blob);
          triggerDownload(url, `${filename}_${Date.now()}.png`);
          // Revoke slightly later so a fallback new-tab load has time to read it
          setTimeout(() => URL.revokeObjectURL(url), 10000);

          // Remove loading
          const loading = document.getElementById("export-loading");
          if (loading) document.body.removeChild(loading);

          alert("✅ PNG exported successfully!");
        } catch (blobError) {
          console.error(
            "Blob creation failed, trying fallback method:",
            blobError
          );

          // ✅ Fallback: Use toDataURL method
          const dataUrl = canvas.toDataURL("image/png", 1.0);
          triggerDownload(dataUrl, `${filename}_${Date.now()}.png`);

          // Remove loading
          const loading = document.getElementById("export-loading");
          if (loading) document.body.removeChild(loading);

          alert("✅ PNG exported successfully (fallback method)!");
        }
      } else if (exportType === "pdf") {
        // Export as PDF
        const imgData = canvas.toDataURL("image/png", 1.0);

        // Calculate PDF dimensions (A4 landscape or portrait based on aspect ratio)
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const aspectRatio = imgWidth / imgHeight;

        let pdfWidth, pdfHeight;
        if (aspectRatio > 1.4) {
          // Landscape
          pdfWidth = 297; // A4 landscape width in mm
          pdfHeight = 210;
        } else {
          // Portrait
          pdfWidth = 210; // A4 portrait width in mm
          pdfHeight = 297;
        }

        const pdf = new jsPDF({
          orientation: aspectRatio > 1.4 ? "landscape" : "portrait",
          unit: "mm",
          format: "a4",
        });

        // Add title page
        pdf.setFontSize(20);
        pdf.text(`EQA Analysis Report`, pdfWidth / 2, 20, { align: "center" });
        pdf.setFontSize(12);
        pdf.text(`Lot: ${studyInfo?.lotNumber || "N/A"}`, 20, 40);
        pdf.text(`Product: ${studyInfo?.productType || "N/A"}`, 20, 50);
        pdf.text(`Date: ${studyInfo?.productionDate || "N/A"}`, 20, 60);
        pdf.text(`Exported: ${new Date().toLocaleString()}`, 20, 70);

        // Add dashboard image
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

        pdf.save(`${filename}_${Date.now()}.pdf`);

        // Remove loading
        const loading = document.getElementById("export-loading");
        if (loading) document.body.removeChild(loading);

        alert("✅ PDF exported successfully!");
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("❌ Export failed: " + error.message);

      // Remove loading div if still exists
      const loading = document.getElementById("export-loading");
      if (loading) document.body.removeChild(loading);
    } finally {
      // Always restore whichever tab was active before we switched to
      // capture a hidden one, even if the export failed.
      if (needsTabSwitch) setActiveTab(previousTab);
    }
  };

  const buttonStyle = {
    padding: "12px 24px",
    backgroundColor: exportType === "png" ? "#9b59b6" : "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "pointer",
    marginRight: "12px",
    marginTop: "12px",
    fontWeight: "600",
    transition: "all 0.3s",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
  };

  return (
    <button
      style={buttonStyle}
      onClick={handleExport}
      onMouseEnter={(e) => {
        e.target.style.transform = "translateY(-2px)";
        e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "translateY(0)";
        e.target.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
      }}
    >
      {exportType === "png" ? "📸 Export PNG (300 DPI)" : "📄 Export PDF"}
    </button>
  );
};

/**
 * Wrapper component for exportable content
 * Adds proper styling and structure for export
 */
export const ExportableContainer = ({ children, title, studyInfo }) => {
  const containerRef = useRef(null);

  const containerStyle = {
    backgroundColor: "#ffffff",
    padding: "40px",
    minHeight: "100vh",
  };

  const headerStyle = {
    borderBottom: "4px solid #3498db",
    paddingBottom: "20px",
    marginBottom: "30px",
  };

  const titleStyle = {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: "10px",
  };

  const metaStyle = {
    fontSize: "14px",
    color: "#7f8c8d",
    lineHeight: "1.8",
  };

  return (
    <>
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <ExportButton
          targetRef={containerRef}
          filename={`${title}_Dashboard`}
          studyInfo={studyInfo}
          exportType="png"
        />
        <ExportButton
          targetRef={containerRef}
          filename={`${title}_Report`}
          studyInfo={studyInfo}
          exportType="pdf"
        />
      </div>

      <div ref={containerRef} style={containerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>{title}</h1>
          <div style={metaStyle}>
            <strong>Lot Number:</strong> {studyInfo?.lotNumber || "N/A"} |{" "}
            <strong>Product:</strong> {studyInfo?.productType || "N/A"} |{" "}
            <strong>Level:</strong> {studyInfo?.targetLevel || "N/A"} |{" "}
            <strong>Date:</strong> {studyInfo?.productionDate || "N/A"}
            <br />
            <strong>Exported:</strong> {new Date().toLocaleString("en-US")}
          </div>
        </div>

        {/* Content */}
        {children}

        {/* Footer */}
        <div
          style={{
            marginTop: "40px",
            paddingTop: "20px",
            borderTop: "2px solid #e0e0e0",
            fontSize: "12px",
            color: "#95a5a6",
            textAlign: "center",
          }}
        >
          <p>
            Generated by EQA Analysis System | 300 DPI High Resolution Export
          </p>
          <p>© {new Date().getFullYear()} - Confidential Laboratory Data</p>
        </div>
      </div>
    </>
  );
};

/**
 * Hook for batch export of multiple dashboards
 */
export const useBatchExport = () => {
  const exportMultipleDashboards = async (dashboards, studyInfo) => {
    const loadingDiv = document.createElement("div");
    loadingDiv.id = "batch-export-loading";
    loadingDiv.innerHTML = `
      <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                  background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                  z-index: 10000; text-align: center;">
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">⏳ Exporting ${dashboards.length} dashboards...</div>
        <div id="batch-progress" style="font-size: 14px; color: #666;">0/${dashboards.length}</div>
      </div>
    `;
    document.body.appendChild(loadingDiv);

    let successCount = 0;

    for (let i = 0; i < dashboards.length; i++) {
      const { ref, filename } = dashboards[i];

      try {
        const scale = getSafeScale(ref.current, 3.125);
        const canvas = await html2canvas(ref.current, {
          scale: scale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
        });

        // ✅ FIXED: Better error handling
        try {
          const blob = await new Promise((resolve, reject) => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error("Failed to create blob"));
                }
              },
              "image/png",
              1.0
            );
          });

          const url = URL.createObjectURL(blob);
          triggerDownload(url, `${filename}_${i + 1}_${Date.now()}.png`);
          setTimeout(() => URL.revokeObjectURL(url), 10000);

          successCount++;
        } catch (blobError) {
          // Fallback to dataURL
          const dataUrl = canvas.toDataURL("image/png", 1.0);
          triggerDownload(dataUrl, `${filename}_${i + 1}_${Date.now()}.png`);

          successCount++;
        }

        // Update progress
        const progressDiv = document.getElementById("batch-progress");
        if (progressDiv) {
          progressDiv.textContent = `${successCount}/${dashboards.length}`;
        }

        // Wait a bit between exports
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error exporting ${filename}:`, error);
      }
    }

    // Remove loading
    const loading = document.getElementById("batch-export-loading");
    if (loading) document.body.removeChild(loading);

    alert(
      `✅ Exported ${successCount}/${dashboards.length} dashboards successfully!`
    );
  };

  return { exportMultipleDashboards };
};

export default ExportableContainer;
