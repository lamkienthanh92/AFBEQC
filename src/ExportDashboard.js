import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * ExportDashboard Component
 * Provides high-quality export functionality for dashboards
 * Supports PNG (300 DPI) and PDF export
 * ✅ FIXED: Proper blob error handling
 */

export const ExportButton = ({
  targetRef,
  filename,
  studyInfo,
  exportType = "png",
}) => {
  const handleExport = async () => {
    if (!targetRef.current) {
      alert("No content to export!");
      return;
    }

    // Create loading overlay
    const loadingDiv = document.createElement("div");
    loadingDiv.id = "export-loading";
    loadingDiv.innerHTML = `
      <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                  background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                  z-index: 10000; text-align: center;">
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">⏳ Đang xuất dashboard...</div>
        <div style="font-size: 14px; color: #666;">Vui lòng đợi trong giây lát</div>
      </div>
    `;

    try {
      document.body.appendChild(loadingDiv);

      // Calculate scale for 300 DPI
      // Standard screen DPI is 96, so scale = 300/96 ≈ 3.125
      const scale = 3.125;

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

          // Create download link
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.download = `${filename}_${Date.now()}.png`;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          // Remove loading
          const loading = document.getElementById("export-loading");
          if (loading) document.body.removeChild(loading);

          alert("✅ Xuất PNG thành công!");
        } catch (blobError) {
          console.error(
            "Blob creation failed, trying fallback method:",
            blobError
          );

          // ✅ Fallback: Use toDataURL method
          const dataUrl = canvas.toDataURL("image/png", 1.0);
          const link = document.createElement("a");
          link.download = `${filename}_${Date.now()}.png`;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Remove loading
          const loading = document.getElementById("export-loading");
          if (loading) document.body.removeChild(loading);

          alert("✅ Xuất PNG thành công (fallback method)!");
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

        alert("✅ Xuất PDF thành công!");
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("❌ Lỗi khi xuất: " + error.message);

      // Remove loading div if still exists
      const loading = document.getElementById("export-loading");
      if (loading) document.body.removeChild(loading);
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
      {exportType === "png" ? "📸 Xuất PNG (300 DPI)" : "📄 Xuất PDF"}
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
            <strong>Exported:</strong> {new Date().toLocaleString("vi-VN")}
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
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">⏳ Đang xuất ${dashboards.length} dashboard...</div>
        <div id="batch-progress" style="font-size: 14px; color: #666;">0/${dashboards.length}</div>
      </div>
    `;
    document.body.appendChild(loadingDiv);

    let successCount = 0;

    for (let i = 0; i < dashboards.length; i++) {
      const { ref, filename } = dashboards[i];

      try {
        const scale = 3.125;
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
          const link = document.createElement("a");
          link.download = `${filename}_${i + 1}_${Date.now()}.png`;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          successCount++;
        } catch (blobError) {
          // Fallback to dataURL
          const dataUrl = canvas.toDataURL("image/png", 1.0);
          const link = document.createElement("a");
          link.download = `${filename}_${i + 1}_${Date.now()}.png`;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

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
      `✅ Đã xuất ${successCount}/${dashboards.length} dashboard thành công!`
    );
  };

  return { exportMultipleDashboards };
};

export default ExportableContainer;
