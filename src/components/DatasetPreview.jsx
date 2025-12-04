import React, { useState, memo } from "react";

const DatasetPreview = memo(({
  datasetSamples,
  loadDatasetSamples,
  isTraining,
  canvasRefs,
  hasData,
}) => {
  const [showDatasetImages, setShowDatasetImages] = useState(true);

  return (
    <div className="card bg-dark text-light mb-4 shadow">
      <div className="card-body">
        <div
          className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-secondary"
          style={{ cursor: "pointer" }}
          onClick={() => setShowDatasetImages(!showDatasetImages)}
        >
          <h5 className="card-title fw-bold mb-0">
            <i className="bi bi-images me-2"></i>
            Dataset Preview
          </h5>
          <i
            className={`bi bi-chevron-${showDatasetImages ? "up" : "down"}`}
          ></i>
        </div>

        <div
          style={{
            maxHeight: showDatasetImages ? "1000px" : "0",
            overflow: "hidden",
            transition: "max-height 0.3s ease-in-out",
          }}
        >
          <div className="dataset-images-container">
            <div className="dataset-images-grid">
              {datasetSamples.length === 0
                ? // Placeholder when no images loaded
                  Array.from({ length: 20 }).map((_, idx) => (
                    <div key={idx} className="dataset-image-item">
                      <div className="dataset-image-placeholder">
                        <i className="bi bi-image"></i>
                      </div>
                      <div className="dataset-image-label">Label: -</div>
                    </div>
                  ))
                : // Display actual images
                  datasetSamples.map((sample, idx) => (
                    <div key={idx} className="dataset-image-item">
                      <div className="dataset-image-canvas-wrapper">
                        <canvas
                          ref={(el) => (canvasRefs.current[idx] = el)}
                          width={28}
                          height={28}
                          className="dataset-image-canvas"
                        ></canvas>
                      </div>
                      <div className="dataset-image-label">
                        Label: {sample.label}
                      </div>
                    </div>
                  ))}
            </div>
            <div className="text-center mt-3">
              <button
                className="btn btn-outline-light btn-sm"
                onClick={loadDatasetSamples}
                disabled={isTraining}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                {!hasData ? "Load Dataset" : "Load Random Samples"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default DatasetPreview;