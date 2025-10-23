import "./assets/App.css";
import { useEffect, useRef } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Register Chart.js components
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
);

function App() {
  const batchLossChartRef = useRef(null);
  const batchAccuracyChartRef = useRef(null);
  const epochLossChartRef = useRef(null);
  const epochAccuracyChartRef = useRef(null);
  const drawingCanvasRef = useRef(null);

  // Chart instances
  const batchLossChartInstance = useRef(null);
  const batchAccuracyChartInstance = useRef(null);
  const epochLossChartInstance = useRef(null);
  const epochAccuracyChartInstance = useRef(null);

  // Initialize all charts
  useEffect(() => {
    // Common chart options
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            color: "#e5e7eb",
            font: {
              size: 12,
              weight: "600",
            },
            padding: 15,
            usePointStyle: true,
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
          backgroundColor: "rgba(30, 41, 59, 0.95)",
          titleColor: "#e5e7eb",
          bodyColor: "#e5e7eb",
          borderColor: "#475569",
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y.toFixed(4);
              }
              return label;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: "#334155",
            drawBorder: false,
          },
          ticks: {
            color: "#9ca3af",
            font: {
              size: 11,
            },
          },
        },
        y: {
          grid: {
            color: "#334155",
            drawBorder: false,
          },
          ticks: {
            color: "#9ca3af",
            font: {
              size: 11,
            },
          },
        },
      },
      interaction: {
        mode: "nearest",
        axis: "x",
        intersect: false,
      },
    };

    // Batch Loss Chart
    if (batchLossChartRef.current) {
      const ctx = batchLossChartRef.current.getContext("2d");
      batchLossChartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "Batch Loss",
              data: [],
              borderColor: "#fbbf24",
              backgroundColor: "rgba(251, 191, 36, 0.1)",
              borderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 5,
              pointBackgroundColor: "#fbbf24",
              pointBorderColor: "#1e293b",
              pointBorderWidth: 2,
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          ...commonOptions,
          scales: {
            ...commonOptions.scales,
            y: {
              ...commonOptions.scales.y,
              beginAtZero: true,
              title: {
                display: true,
                text: "Loss",
                color: "#9ca3af",
                font: {
                  size: 12,
                  weight: "600",
                },
              },
            },
            x: {
              ...commonOptions.scales.x,
              title: {
                display: true,
                text: "Batch",
                color: "#9ca3af",
                font: {
                  size: 12,
                  weight: "600",
                },
              },
            },
          },
        },
      });
    }

    // Batch Accuracy Chart
    if (batchAccuracyChartRef.current) {
      const ctx = batchAccuracyChartRef.current.getContext("2d");
      batchAccuracyChartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "Batch Accuracy",
              data: [],
              borderColor: "#22c55e",
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              borderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 5,
              pointBackgroundColor: "#22c55e",
              pointBorderColor: "#1e293b",
              pointBorderWidth: 2,
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          ...commonOptions,
          scales: {
            ...commonOptions.scales,
            y: {
              ...commonOptions.scales.y,
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: "Accuracy (%)",
                color: "#9ca3af",
                font: {
                  size: 12,
                  weight: "600",
                },
              },
            },
            x: {
              ...commonOptions.scales.x,
              title: {
                display: true,
                text: "Batch",
                color: "#9ca3af",
                font: {
                  size: 12,
                  weight: "600",
                },
              },
            },
          },
        },
      });
    }

    // Epoch Loss Chart
    if (epochLossChartRef.current) {
      const ctx = epochLossChartRef.current.getContext("2d");
      epochLossChartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "Train Loss",
              data: [],
              borderColor: "#fbbf24",
              backgroundColor: "rgba(251, 191, 36, 0.1)",
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: "#fbbf24",
              pointBorderColor: "#1e293b",
              pointBorderWidth: 2,
              tension: 0.4,
              fill: true,
            },
            {
              label: "Validation Loss",
              data: [],
              borderColor: "#f97316",
              backgroundColor: "rgba(249, 115, 22, 0.1)",
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: "#f97316",
              pointBorderColor: "#1e293b",
              pointBorderWidth: 2,
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          ...commonOptions,
          scales: {
            ...commonOptions.scales,
            y: {
              ...commonOptions.scales.y,
              beginAtZero: true,
              title: {
                display: true,
                text: "Loss",
                color: "#9ca3af",
                font: {
                  size: 12,
                  weight: "600",
                },
              },
            },
            x: {
              ...commonOptions.scales.x,
              title: {
                display: true,
                text: "Epoch",
                color: "#9ca3af",
                font: {
                  size: 12,
                  weight: "600",
                },
              },
            },
          },
        },
      });
    }

    // Epoch Accuracy Chart
    if (epochAccuracyChartRef.current) {
      const ctx = epochAccuracyChartRef.current.getContext("2d");
      epochAccuracyChartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "Train Accuracy",
              data: [],
              borderColor: "#22c55e",
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: "#22c55e",
              pointBorderColor: "#1e293b",
              pointBorderWidth: 2,
              tension: 0.4,
              fill: true,
            },
            {
              label: "Validation Accuracy",
              data: [],
              borderColor: "#10b981",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: "#10b981",
              pointBorderColor: "#1e293b",
              pointBorderWidth: 2,
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          ...commonOptions,
          scales: {
            ...commonOptions.scales,
            y: {
              ...commonOptions.scales.y,
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: "Accuracy (%)",
                color: "#9ca3af",
                font: {
                  size: 12,
                  weight: "600",
                },
              },
            },
            x: {
              ...commonOptions.scales.x,
              title: {
                display: true,
                text: "Epoch",
                color: "#9ca3af",
                font: {
                  size: 12,
                  weight: "600",
                },
              },
            },
          },
        },
      });
    }

    // Cleanup function
    return () => {
      if (batchLossChartInstance.current) {
        batchLossChartInstance.current.destroy();
      }
      if (batchAccuracyChartInstance.current) {
        batchAccuracyChartInstance.current.destroy();
      }
      if (epochLossChartInstance.current) {
        epochLossChartInstance.current.destroy();
      }
      if (epochAccuracyChartInstance.current) {
        epochAccuracyChartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4 fw-bold">
        <span>MNIST</span>
        <span> </span>
        <span className="gradient-title">Training Playground</span>
      </h1>

      {/* Training Configuration */}
      <div className="card bg-dark text-light mb-4 shadow">
        <div className="card-body">
          <h5 className="card-title fw-bold mb-3 pb-2 border-bottom border-secondary">
            <i className="bi bi-gear-fill me-2"></i>
            Training Configuration
          </h5>
          <div className="row g-3">
            <div className="col-lg-4">
              <label className="form-label fw-semibold">
                <i className="bi bi-layers me-2"></i>Batch Size
              </label>
              <input
                type="number"
                className="form-control"
                defaultValue={32}
                min={1}
                max={512}
                step={1}
              />
            </div>
            <div className="col-lg-4">
              <label className="form-label fw-semibold">
                <i className="bi bi-arrow-repeat me-2"></i>Epochs
              </label>
              <input
                type="number"
                className="form-control"
                defaultValue={10}
                min={1}
                max={100}
                step={1}
              />
            </div>
            <div className="col-lg-4">
              <label className="form-label fw-semibold">
                <i className="bi bi-speedometer2 me-2"></i>Learning Rate
              </label>
              <input
                type="number"
                className="form-control"
                defaultValue={0.001}
                min={0.0001}
                max={1}
                step={0.0001}
              />
            </div>
          </div>
          <div className="row g-3 mt-2">
            <div className="col-md-6">
              <button className="btn btn-primary w-100 py-2">
                <i className="bi bi-play-fill me-2"></i>
                Start Training
              </button>
            </div>
            <div className="col-md-6">
              <button className="btn btn-danger w-100 py-2">
                <i className="bi bi-stop-fill me-2"></i>
                Stop Training
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Training Metrics */}
      <div className="card bg-dark text-light mb-4 shadow">
        <div className="card-body">
          <h5 className="card-title fw-bold mb-3 pb-2 border-bottom border-secondary">
            <i className="bi bi-bar-chart-fill me-2"></i>
            Training Metrics
          </h5>

          {/* Batch Metrics */}
          <div className="mb-4">
            <h6 className="text-muted mb-3">
              <i className="bi bi-arrow-clockwise me-2"></i>
              Batch Progress
            </h6>
            <div className="row g-3">
              <div className="col-md-4">
                <div className="metric-card">
                  <div className="metric-label">Batch</div>
                  <div className="metric-value text-info">0 / 0</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="metric-card">
                  <div className="metric-label">Loss</div>
                  <div className="metric-value text-warning">0.0000</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="metric-card">
                  <div className="metric-label">Accuracy</div>
                  <div className="metric-value text-success">0.00%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Epoch Metrics */}
          <div className="mb-3">
            <h6 className="text-muted mb-3">
              <i className="bi bi-collection me-2"></i>
              Epoch Summary
            </h6>
            <div className="row g-3 mb-3">
              <div className="col-md-3 col-sm-6">
                <div className="metric-card">
                  <div className="metric-label">Epoch</div>
                  <div className="metric-value text-info">0 / 0</div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6">
                <div className="metric-card">
                  <div className="metric-label">Train Loss</div>
                  <div className="metric-value text-warning">0.0000</div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6">
                <div className="metric-card">
                  <div className="metric-label">Train Acc</div>
                  <div className="metric-value text-success">0.00%</div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6">
                <div className="metric-card status-highlight">
                  <div className="metric-label">Status</div>
                  <div className="metric-status">
                    <span className="badge bg-secondary">
                      <i className="bi bi-hourglass-split me-1"></i>
                      Ready
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="metric-card">
                  <div className="metric-label">Validation Loss</div>
                  <div className="metric-value text-warning">0.0000</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="metric-card">
                  <div className="metric-label">Validation Accuracy</div>
                  <div className="metric-value text-success">0.00%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Digit Recognition Test */}
      <div className="card bg-dark text-light mb-4 shadow">
        <div className="card-body">
          <h5 className="card-title fw-bold mb-3 pb-2 border-bottom border-secondary">
            <i className="bi bi-pencil-square me-2"></i>
            Digit Recognition Test
          </h5>
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="drawing-section">
                <h6 className="text-muted mb-3">
                  <i className="bi bi-brush me-2"></i>
                  Draw a Digit (0-9)
                </h6>
                <div className="drawing-canvas-wrapper">
                  <canvas
                    ref={drawingCanvasRef}
                    width={280}
                    height={280}
                    className="drawing-canvas"
                  ></canvas>
                </div>
                <div className="mt-3">
                  <button className="btn btn-secondary w-100">
                    <i className="bi bi-eraser me-2"></i>
                    Clear Canvas
                  </button>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="prediction-section">
                <h6 className="text-muted mb-3">
                  <i className="bi bi-cpu me-2"></i>
                  Prediction Result
                </h6>
                <div className="prediction-result-card">
                  <div className="predicted-digit">
                    <div className="digit-label">Predicted Digit</div>
                    <div className="digit-value">-</div>
                  </div>
                  <div className="confidence-meter mt-4">
                    <div className="confidence-label mb-2">Confidence</div>
                    <div className="progress" style={{ height: "30px" }}>
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{ width: "0%" }}
                        aria-valuenow="0"
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >
                        0%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <h6 className="text-muted mb-3">
                    <i className="bi bi-list-ol me-2"></i>
                    All Predictions
                  </h6>
                  <div className="predictions-list">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                      <div key={digit} className="prediction-item">
                        <div className="prediction-digit">{digit}</div>
                        <div className="prediction-bar-wrapper">
                          <div
                            className="prediction-bar"
                            style={{ width: "0%" }}
                          ></div>
                        </div>
                        <div className="prediction-probability">0.0%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="card bg-dark text-light mb-4 shadow">
        <div className="card-body">
          <h5 className="card-title fw-bold mb-4 pb-2 border-bottom border-secondary">
            <i className="bi bi-graph-up-arrow me-2"></i>
            Training Visualization
          </h5>

          {/* Batch Charts */}
          <h6 className="text-muted mb-3">
            <i className="bi bi-speedometer me-2"></i>
            Batch-Level Metrics
          </h6>
          <div className="row g-4 mb-4">
            <div className="col-lg-6">
              <div className="chart-container">
                <div className="chart-header">
                  <i className="bi bi-graph-down text-warning me-2"></i>
                  <span>Batch Loss</span>
                </div>
                <div className="chart-body">
                  <canvas ref={batchLossChartRef}></canvas>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="chart-container">
                <div className="chart-header">
                  <i className="bi bi-graph-up text-success me-2"></i>
                  <span>Batch Accuracy</span>
                </div>
                <div className="chart-body">
                  <canvas ref={batchAccuracyChartRef}></canvas>
                </div>
              </div>
            </div>
          </div>

          {/* Epoch Charts */}
          <h6 className="text-muted mb-3">
            <i className="bi bi-bar-chart-line me-2"></i>
            Epoch-Level Metrics
          </h6>
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="chart-container">
                <div className="chart-header">
                  <i className="bi bi-graph-down text-warning me-2"></i>
                  <span>Epoch Loss</span>
                </div>
                <div className="chart-body">
                  <canvas ref={epochLossChartRef}></canvas>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="chart-container">
                <div className="chart-header">
                  <i className="bi bi-graph-up text-success me-2"></i>
                  <span>Epoch Accuracy</span>
                </div>
                <div className="chart-body">
                  <canvas ref={epochAccuracyChartRef}></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
