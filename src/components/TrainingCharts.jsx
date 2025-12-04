import React, { useState, memo } from "react";

const TrainingCharts = memo(({ chartRefs }) => {
  const [showBatchCharts, setShowBatchCharts] = useState(true);
  const [showEpochCharts, setShowEpochCharts] = useState(true);

  return (
    <>
      {/* Batch Charts */}
      <div className="card bg-dark text-light mb-4 shadow">
        <div className="card-body">
          <div
            className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-secondary"
            style={{ cursor: "pointer" }}
            onClick={() => setShowBatchCharts(!showBatchCharts)}
          >
            <h5 className="card-title fw-bold mb-0">
              <i className="bi bi-speedometer me-2"></i>
              Batch-Level Metrics
            </h5>
            <i
              className={`bi bi-chevron-${showBatchCharts ? "up" : "down"}`}
            ></i>
          </div>

          <div
            style={{
              maxHeight: showBatchCharts ? "500px" : "0",
              overflow: "hidden",
              transition: "max-height 0.3s ease-in-out",
            }}
          >
            <div className="row g-3">
              <div className="col-md-6">
                <div className="chart-container-compact">
                  <div className="chart-header-compact">
                    <i className="bi bi-graph-down text-warning me-2"></i>
                    <span>Batch Loss</span>
                  </div>
                  <div className="chart-body-compact">
                    <canvas ref={chartRefs.batchLossChartRef}></canvas>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="chart-container-compact">
                  <div className="chart-header-compact">
                    <i className="bi bi-graph-up text-success me-2"></i>
                    <span>Batch Accuracy</span>
                  </div>
                  <div className="chart-body-compact">
                    <canvas ref={chartRefs.batchAccuracyChartRef}></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Epoch Charts */}
      <div className="card bg-dark text-light mb-4 shadow">
        <div className="card-body">
          <div
            className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-secondary"
            style={{ cursor: "pointer" }}
            onClick={() => setShowEpochCharts(!showEpochCharts)}
          >
            <h5 className="card-title fw-bold mb-0">
              <i className="bi bi-bar-chart-line me-2"></i>
              Epoch-Level Metrics
            </h5>
            <i
              className={`bi bi-chevron-${showEpochCharts ? "up" : "down"}`}
            ></i>
          </div>

          <div
            style={{
              maxHeight: showEpochCharts ? "500px" : "0",
              overflow: "hidden",
              transition: "max-height 0.3s ease-in-out",
            }}
          >
            <div className="row g-3">
              <div className="col-md-6">
                <div className="chart-container-compact">
                  <div className="chart-header-compact">
                    <i className="bi bi-graph-down text-warning me-2"></i>
                    <span>Epoch Loss</span>
                  </div>
                  <div className="chart-body-compact">
                    <canvas ref={chartRefs.epochLossChartRef}></canvas>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="chart-container-compact">
                  <div className="chart-header-compact">
                    <i className="bi bi-graph-up text-success me-2"></i>
                    <span>Epoch Accuracy</span>
                  </div>
                  <div className="chart-body-compact">
                    <canvas ref={chartRefs.epochAccuracyChartRef}></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default TrainingCharts;
