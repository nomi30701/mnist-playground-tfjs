import React, { useState, memo } from "react";

const ConfusionMatrix = memo(({
  confusionMatrix,
  confusionMatrixStats,
  classNames,
}) => {
  const [showConfusionMatrix, setShowConfusionMatrix] = useState(true);
  const [showPerClassMetrics, setShowPerClassMetrics] = useState(false);

  const getMaxConfusionValue = () => {
    if (!confusionMatrix) return 1;
    return Math.max(...confusionMatrix.flat());
  };

  const getCellColor = (value, rowIdx, colIdx) => {
    if (!confusionMatrix) return "rgba(139, 92, 246, 0.1)";
    const maxValue = getMaxConfusionValue();
    const intensity = value / maxValue;

    // Diagonal cells (correct predictions) - purple gradient
    if (rowIdx === colIdx) {
      return `rgba(139, 92, 246, ${0.2 + intensity * 0.8})`;
    }
    // Off-diagonal cells (errors) - red gradient
    return `rgba(239, 68, 68, ${0.1 + intensity * 0.6})`;
  };

  // Get cell text color
  const getCellTextColor = (value) => {
    if (!confusionMatrix) return "#9ca3af";
    const maxValue = getMaxConfusionValue();
    const intensity = value / maxValue;
    return intensity > 0.4 ? "#ffffff" : "#e5e7eb";
  };

  return (
    <div className="card bg-dark text-light mb-4 shadow">
      <div className="card-body">
        <div
          className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-secondary"
          style={{ cursor: "pointer" }}
          onClick={() => setShowConfusionMatrix(!showConfusionMatrix)}
        >
          <h5 className="card-title fw-bold mb-0">
            <i className="bi bi-grid-3x3 me-2"></i>
            Confusion Matrix
          </h5>
          <i
            className={`bi bi-chevron-${showConfusionMatrix ? "up" : "down"}`}
          ></i>
        </div>

        <div
          style={{
            maxHeight: showConfusionMatrix ? "2000px" : "0",
            overflow: "hidden",
            transition: "max-height 0.3s ease-in-out",
          }}
        >
          <div className="confusion-matrix-container">
            {!confusionMatrix ? (
              <div className="confusion-matrix-empty-state">
                <div className="empty-state-icon">
                  <i className="bi bi-grid-3x3-gap"></i>
                </div>
                <div className="empty-state-text">
                  No confusion matrix available
                </div>
                <div className="empty-state-hint">
                  Click "Evaluate" button after training to generate confusion
                  matrix
                </div>
              </div>
            ) : (
              <>
                {/* Metrics Summary Cards */}
                {confusionMatrixStats && (
                  <div className="metrics-summary">
                    <div className="metric-summary-card">
                      <div className="metric-summary-icon text-success">
                        <i className="bi bi-check-circle-fill"></i>
                      </div>
                      <div className="metric-summary-label">
                        Overall Accuracy
                      </div>
                      <div className="metric-summary-value text-success">
                        {(confusionMatrixStats.accuracy * 100).toFixed(2)}%
                      </div>
                    </div>
                    <div className="metric-summary-card">
                      <div className="metric-summary-icon text-info">
                        <i className="bi bi-bullseye"></i>
                      </div>
                      <div className="metric-summary-label">Avg Precision</div>
                      <div className="metric-summary-value text-info">
                        {(
                          (confusionMatrixStats.precision.reduce(
                            (a, b) => a + b,
                            0
                          ) /
                            confusionMatrixStats.precision.length) *
                          100
                        ).toFixed(2)}
                        %
                      </div>
                    </div>
                    <div className="metric-summary-card">
                      <div className="metric-summary-icon text-warning">
                        <i className="bi bi-arrow-repeat"></i>
                      </div>
                      <div className="metric-summary-label">Avg Recall</div>
                      <div className="metric-summary-value text-warning">
                        {(
                          (confusionMatrixStats.recall.reduce(
                            (a, b) => a + b,
                            0
                          ) /
                            confusionMatrixStats.recall.length) *
                          100
                        ).toFixed(2)}
                        %
                      </div>
                    </div>
                  </div>
                )}

                {/* Confusion Matrix Visualization */}
                <div className="confusion-matrix-wrapper">
                  <div className="confusion-matrix-grid">
                    {confusionMatrix.map((row, i) =>
                      row.map((value, j) => (
                        <div
                          key={`${i}-${j}`}
                          className="confusion-matrix-cell"
                          style={{
                            backgroundColor: getCellColor(value, i, j),
                            color: getCellTextColor(value),
                            fontWeight: i === j ? "bold" : "normal",
                          }}
                          title={`True: ${classNames[i]}, Pred: ${classNames[j]}, Count: ${value}`}
                        >
                          {value}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Axis Labels */}
                  <div className="confusion-matrix-axis-labels">
                    <div className="confusion-matrix-axis-row">
                      <div className="confusion-matrix-axis-title">
                        True Label ↓
                      </div>
                      <div className="confusion-matrix-axis-numbers">
                        {classNames.map((_, idx) => (
                          <div
                            key={idx}
                            className="confusion-matrix-axis-number"
                          >
                            {idx}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="confusion-matrix-axis-labels">
                    <div className="confusion-matrix-axis-row">
                      <div className="confusion-matrix-axis-title">
                        Predicted →
                      </div>
                      <div className="confusion-matrix-axis-numbers">
                        {classNames.map((_, idx) => (
                          <div
                            key={idx}
                            className="confusion-matrix-axis-number"
                          >
                            {idx}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="confusion-matrix-legend">
                    <div className="legend-item">
                      <div className="legend-color-box legend-correct"></div>
                      <span>Correct Predictions</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color-box legend-incorrect"></div>
                      <span>Incorrect Predictions</span>
                    </div>
                  </div>
                </div>

                {/* Per-Class Metrics */}
                {confusionMatrixStats && (
                  <div className="per-class-metrics">
                    <div
                      className="per-class-metrics-header"
                      onClick={() =>
                        setShowPerClassMetrics(!showPerClassMetrics)
                      }
                    >
                      <div className="per-class-metrics-title">
                        <i className="bi bi-table"></i>
                        <span>Per-Class Metrics</span>
                      </div>
                      <i
                        className={`bi bi-chevron-${
                          showPerClassMetrics ? "up" : "down"
                        }`}
                      ></i>
                    </div>

                    <div
                      style={{
                        maxHeight: showPerClassMetrics ? "500px" : "0",
                        overflow: "hidden",
                        transition: "max-height 0.3s ease-in-out",
                      }}
                    >
                      <div className="table-responsive">
                        <table className="table table-sm table-dark table-hover table-bordered mb-0">
                          <thead>
                            <tr>
                              <th style={{ width: "30%" }}>Digit</th>
                              <th>Precision</th>
                              <th>Recall</th>
                              <th>F1-Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {classNames.map((name, idx) => (
                              <tr key={idx}>
                                <td>
                                  <strong>{idx}</strong>
                                  <span className="text-muted ms-2">
                                    ({name})
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className={
                                      confusionMatrixStats.precision[idx] > 0.9
                                        ? "text-success"
                                        : confusionMatrixStats.precision[idx] >
                                          0.7
                                        ? "text-warning"
                                        : "text-danger"
                                    }
                                  >
                                    {(
                                      confusionMatrixStats.precision[idx] * 100
                                    ).toFixed(2)}
                                    %
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className={
                                      confusionMatrixStats.recall[idx] > 0.9
                                        ? "text-success"
                                        : confusionMatrixStats.recall[idx] > 0.7
                                        ? "text-warning"
                                        : "text-danger"
                                    }
                                  >
                                    {(
                                      confusionMatrixStats.recall[idx] * 100
                                    ).toFixed(2)}
                                    %
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className={
                                      confusionMatrixStats.f1Score[idx] > 0.9
                                        ? "text-success"
                                        : confusionMatrixStats.f1Score[idx] >
                                          0.7
                                        ? "text-warning"
                                        : "text-danger"
                                    }
                                  >
                                    {(
                                      confusionMatrixStats.f1Score[idx] * 100
                                    ).toFixed(2)}
                                    %
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default ConfusionMatrix;
