import "./assets/App.css";
import { useEffect, useRef, useState } from "react";
import { tidy, browser, setBackend } from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgpu";
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
import { createModel } from "./utils/model.js";
import { train, stopTraining } from "./utils/train.js";
import { MnistData } from "./utils/data.js";
import { inference } from "./utils/inference.js";
import {
  doPrediction,
  calculateConfusionMatrix,
  getConfusionMatrixStats,
} from "./utils/evaluate.js";

// TODO: fix yellowbox warnings in console

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
  // Chart refs
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

  const [showBatchCharts, setShowBatchCharts] = useState(true);
  const [showEpochCharts, setShowEpochCharts] = useState(true);
  const [showDatasetImages, setShowDatasetImages] = useState(true);
  const [showConfusionMatrix, setShowConfusionMatrix] = useState(true);

  // input box refs
  const trainDataSizeRef = useRef(null);
  const testDataSizeRef = useRef(null);
  const batchSizeRef = useRef(null);
  const epochsRef = useRef(null);
  const learningRateRef = useRef(null);
  const backendRef = useRef(null);

  // input box states
  const [trainDataSize, setTrainDataSize] = useState(5500);
  const [batchSize, setBatchSize] = useState(128);
  const [epochs, setEpochs] = useState(10);

  // Training Metrics state
  const [batchLoss, setBatchLoss] = useState(0);
  const [batchAccuracy, setBatchAccuracy] = useState(0);
  const [epochLoss, setEpochLoss] = useState(0);
  const [epochAccuracy, setEpochAccuracy] = useState(0);
  const [validLoss, setValidLoss] = useState(0);
  const [validAccuracy, setValidAccuracy] = useState(0);
  const [epochCount, setEpochCount] = useState(0);
  const [batchCount, setBatchCount] = useState(0);
  const [avgBatchTime, setAvgBatchTime] = useState(0);
  const [avgEpochTime, setAvgEpochTime] = useState(0);

  // Training state
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState("Ready"); // Ready, Loading Data, Loading Model, Training, Completed

  // Dataset preview state
  const mnistDataRef = useRef(null);
  const datasetCanvasRefs = useRef([]);
  const [datasetSamples, setDatasetSamples] = useState([]);

  // Model state
  const modelRef = useRef(null);

  // Confusion Matrix state
  const [showPerClassMetrics, setShowPerClassMetrics] = useState(false);
  const [confusionMatrix, setConfusionMatrix] = useState(null);
  const [confusionMatrixStats, setConfusionMatrixStats] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const classNames = [
    "Zero",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];

  // Drawing and Prediction state
  const [isDrawing, setIsDrawing] = useState(false);
  const [predictedDigit, setPredictedDigit] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [allProbabilities, setAllProbabilities] = useState(Array(10).fill(0));
  // Auto prediction timer
  const predictionTimerRef = useRef(null);

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
              size: 11,
              weight: "600",
            },
            padding: 10,
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
          padding: 10,
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
              size: 10,
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
              size: 10,
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
              pointRadius: 2,
              pointHoverRadius: 4,
              pointBackgroundColor: "#fbbf24",
              pointBorderColor: "#1e293b",
              pointBorderWidth: 1,
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
                  size: 11,
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
                  size: 11,
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
              pointRadius: 2,
              pointHoverRadius: 4,
              pointBackgroundColor: "#22c55e",
              pointBorderColor: "#1e293b",
              pointBorderWidth: 1,
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
              max: 1,
              title: {
                display: true,
                text: "Accuracy",
                color: "#9ca3af",
                font: {
                  size: 11,
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
                  size: 11,
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
              pointRadius: 3,
              pointHoverRadius: 5,
              pointBackgroundColor: "#fbbf24",
              pointBorderColor: "#1e293b",
              pointBorderWidth: 1,
              tension: 0.4,
              fill: true,
            },
            {
              label: "Validation Loss",
              data: [],
              borderColor: "#f97316",
              backgroundColor: "rgba(249, 115, 22, 0.1)",
              borderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 5,
              pointBackgroundColor: "#f97316",
              pointBorderColor: "#1e293b",
              pointBorderWidth: 1,
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
                  size: 11,
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
                  size: 11,
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
              pointRadius: 3,
              pointHoverRadius: 5,
              pointBackgroundColor: "#22c55e",
              pointBorderColor: "#1e293b",
              pointBorderWidth: 1,
              tension: 0.4,
              fill: true,
            },
            {
              label: "Validation Accuracy",
              data: [],
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              borderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 5,
              pointBackgroundColor: "#3b82f6",
              pointBorderColor: "#1e293b",
              pointBorderWidth: 1,
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
              max: 1,
              title: {
                display: true,
                text: "Accuracy",
                color: "#9ca3af",
                font: {
                  size: 11,
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
                  size: 11,
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

  // Initialize drawing canvas white background
  useEffect(() => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  async function displayRandomSamples(data) {
    // Get the examples
    const examples = data.nextTestBatch(20);
    const numExamples = examples.xs.shape[0];

    // initialize datasetSamples with placeholder labels
    const initialSamples = Array.from({ length: numExamples }, () => ({
      label: -1,
    }));
    setDatasetSamples(initialSamples);

    // wait for canvas ref ready
    await new Promise((resolve) => setTimeout(resolve, 50));

    const samples = [];

    for (let i = 0; i < numExamples; i++) {
      const imageTensor = tidy(() => {
        // Reshape the image to 28x28 px
        return examples.xs
          .slice([i, 0], [1, examples.xs.shape[1]])
          .reshape([28, 28, 1]);
      });

      if (datasetCanvasRefs.current[i]) {
        await browser.toPixels(imageTensor, datasetCanvasRefs.current[i]);
      }

      const labelTensor = examples.labels.slice(
        [i, 0],
        [1, examples.labels.shape[1]]
      );
      const label = labelTensor.argMax(-1).dataSync()[0];

      samples.push({ label });

      labelTensor.dispose();
    }

    // update correctly labeled samples
    setDatasetSamples(samples);

    examples.xs.dispose();
    examples.labels.dispose();
  }

  async function loadDatasetSamples() {
    try {
      if (mnistDataRef.current === null) {
        setTrainingStatus("Loading Data");
        const data = new MnistData();
        await data.load();
        mnistDataRef.current = data;
        setTrainingStatus("Ready");
      }
      await displayRandomSamples(mnistDataRef.current);
    } catch (error) {
      console.error("Error loading dataset samples:", error);
    }
  }

  async function startTraining() {
    await setBackend(backendRef.current.value);

    // Reset time metrics
    setAvgBatchTime(0);
    setAvgEpochTime(0);

    setIsTraining(true);
    setTrainingStatus("Loading Data");

    // Clear previous chart data
    batchLossChartInstance.current.data.labels = [];
    batchLossChartInstance.current.data.datasets[0].data = [];
    batchLossChartInstance.current.update();
    batchAccuracyChartInstance.current.data.labels = [];
    batchAccuracyChartInstance.current.data.datasets[0].data = [];
    batchAccuracyChartInstance.current.update();
    epochLossChartInstance.current.data.labels = [];
    epochLossChartInstance.current.data.datasets[0].data = [];
    epochLossChartInstance.current.data.datasets[1].data = [];
    epochLossChartInstance.current.update();
    epochAccuracyChartInstance.current.data.labels = [];
    epochAccuracyChartInstance.current.data.datasets[0].data = [];
    epochAccuracyChartInstance.current.data.datasets[1].data = [];
    epochAccuracyChartInstance.current.update();

    try {
      if (mnistDataRef.current === null) {
        const data = new MnistData();
        await data.load();
        mnistDataRef.current = data;
      }
      await displayRandomSamples(mnistDataRef.current);

      setTrainingStatus("Loading Model");
      const model = createModel(learningRateRef.current.value);

      setTrainingStatus("Training");
      await train(
        model,
        mnistDataRef.current,
        {
          BATCH_SIZE: Number(batchSizeRef.current.value),
          TRAIN_DATA_SIZE: Number(trainDataSizeRef.current.value),
          TEST_DATA_SIZE: Number(testDataSizeRef.current.value),
          EPOCHS: Number(epochsRef.current.value),
        },
        {
          batchLossChartInstance,
          batchAccuracyChartInstance,
          epochLossChartInstance,
          epochAccuracyChartInstance,
        },
        {
          setBatchLoss,
          setBatchAccuracy,
          setEpochLoss,
          setEpochAccuracy,
          setValidLoss,
          setValidAccuracy,
          setEpochCount,
          setBatchCount,
          setAvgBatchTime,
          setAvgEpochTime,
        }
      );

      // Save trained model
      modelRef.current = model;

      setTrainingStatus("Completed");
    } catch (error) {
      console.error("Training error:", error);
      setTrainingStatus("Error");
    } finally {
      setIsTraining(false);
    }
  }

  function stopTrainingModel() {
    stopTraining();
    setIsTraining(false);
    setTrainingStatus("Stopped");
  }

  async function evaluateModel() {
    if (!modelRef.current) {
      alert("Please train a model first!");
      return;
    }

    if (!mnistDataRef.current) {
      alert("Dataset not loaded!");
      return;
    }

    setIsEvaluating(true);
    setTrainingStatus("Evaluating");

    try {
      // Generate confusion matrix
      const [preds, labels] = doPrediction(
        modelRef.current,
        mnistDataRef.current,
        Number(testDataSizeRef.current.value)
      );

      const matrix = calculateConfusionMatrix(preds, labels);
      const stats = getConfusionMatrixStats(matrix);

      setConfusionMatrix(matrix);
      setConfusionMatrixStats(stats);

      // Clean up tensors
      preds.dispose();
      labels.dispose();

      setTrainingStatus("Completed");
    } catch (error) {
      console.error("Evaluation error:", error);
      setTrainingStatus("Error");
      alert("Error during evaluation: " + error.message);
    } finally {
      setIsEvaluating(false);
    }
  }

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

  // Get status badge style and text
  const getStatusBadge = () => {
    switch (trainingStatus) {
      case "Ready":
        return { class: "bg-secondary", text: "Ready", icon: "bi-circle-fill" };
      case "Loading Data":
        return {
          class: "bg-info",
          text: "Loading Data",
          icon: "bi-hourglass-split",
        };
      case "Loading Model":
        return {
          class: "bg-info",
          text: "Loading Model",
          icon: "bi-hourglass-split",
        };
      case "Training":
        return {
          class: "bg-warning",
          text: "Training",
          icon: "bi-lightning-charge-fill",
        };
      case "Evaluating":
        return {
          class: "bg-info",
          text: "Evaluating",
          icon: "bi-clipboard-data",
        };
      case "Completed":
        return {
          class: "bg-success",
          text: "Completed",
          icon: "bi-check-circle-fill",
        };
      case "Stopped":
        return {
          class: "bg-danger",
          text: "Stopped",
          icon: "bi-x-circle-fill",
        };
      case "Error":
        return {
          class: "bg-danger",
          text: "Error",
          icon: "bi-exclamation-triangle-fill",
        };
      default:
        return { class: "bg-secondary", text: "Ready", icon: "bi-circle-fill" };
    }
  };
  const statusBadge = getStatusBadge();

  // Drawing functions
  const startDrawing = (event) => {
    setIsDrawing(true);
    const canvas = drawingCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    ctx.strokeStyle = "black";
    ctx.lineWidth = 20;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawOnCanvas = (event) => {
    if (!isDrawing) return;

    const canvas = drawingCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();

    // Schedule auto prediction
    scheduleAutoPrediction();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    setIsDrawing(false);
    const canvas = drawingCanvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.closePath();

    // Schedule auto prediction when user stops drawing
    scheduleAutoPrediction();
  };

  // Touch events for mobile
  const startDrawingTouch = (event) => {
    event.preventDefault();
    setIsDrawing(true);
    const canvas = drawingCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    ctx.strokeStyle = "black";
    ctx.lineWidth = 20;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawOnCanvasTouch = (event) => {
    event.preventDefault();
    if (!isDrawing) return;

    const canvas = drawingCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();

    // Schedule auto prediction
    scheduleAutoPrediction();
  };

  const stopDrawingTouch = (event) => {
    event.preventDefault();
    if (!isDrawing) return;

    setIsDrawing(false);
    const canvas = drawingCanvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.closePath();

    // Schedule auto prediction
    scheduleAutoPrediction();
  };

  async function predictDrawing() {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    try {
      // Use the inference utility function
      const { predictions, predictedDigit } = inference(
        modelRef.current,
        canvas
      );

      // Get all probabilities
      const probabilities = await predictions.data();
      const confidenceValue = probabilities[predictedDigit];

      setPredictedDigit(predictedDigit);
      setConfidence(confidenceValue);
      setAllProbabilities(Array.from(probabilities));

      // Clean up
      predictions.dispose();
    } catch (error) {
      console.error("Prediction error:", error);
    }
  }

  function clearCanvas() {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;

    // Clear any pending prediction
    if (predictionTimerRef.current) {
      clearTimeout(predictionTimerRef.current);
    }

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Reset prediction results
    setPredictedDigit(null);
    setConfidence(0);
    setAllProbabilities(Array(10).fill(0));
  }
  // Auto predict after 0.5 seconds of no drawing
  const scheduleAutoPrediction = () => {
    // Clear existing timer
    if (predictionTimerRef.current) {
      clearTimeout(predictionTimerRef.current);
    }

    // Set new timer
    predictionTimerRef.current = setTimeout(() => {
      if (modelRef.current) {
        predictDrawing();
      }
    }, 500);
  };

  return (
    <div className="container-fluid p-4">
      <h1 className="text-center mb-4 fw-bold">
        <span>MNIST</span>
        <span> </span>
        <span className="gradient-title">Training Playground</span>
      </h1>

      <div className="row g-4">
        {/* Left Column */}
        <div className="col-lg-4">
          {/* Training Configuration */}
          <div className="card bg-dark text-light mb-4 shadow">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3 pb-2 border-bottom border-secondary">
                <i className="bi bi-gear-fill me-2"></i>
                Configuration
              </h5>
              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label fw-semibold small">
                    <i className="bi bi-database me-2"></i>Train Data
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    ref={trainDataSizeRef}
                    value={trainDataSize}
                    min={1000}
                    max={60000}
                    step={1000}
                    onChange={(e) => setTrainDataSize(Number(e.target.value))}
                    disabled={isTraining}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold small">
                    <i className="bi bi-database-check me-2"></i>Test Data
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    ref={testDataSizeRef}
                    defaultValue={1000}
                    min={1000}
                    max={10000}
                    step={1000}
                    disabled={isTraining}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold small">
                    <i className="bi bi-layers me-2"></i>Batch Size
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    ref={batchSizeRef}
                    value={batchSize}
                    min={1}
                    max={512}
                    step={1}
                    onChange={(e) => setBatchSize(Number(e.target.value))}
                    disabled={isTraining}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold small">
                    <i className="bi bi-cpu me-2"></i>Backend
                  </label>
                  <select
                    className="form-select form-select-sm"
                    ref={backendRef}
                    disabled={isTraining}
                  >
                    <option value="webgpu">WebGPU</option>
                    <option value="webgl">WebGL</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold small">
                    <i className="bi bi-arrow-repeat me-2"></i>Epochs
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    ref={epochsRef}
                    value={epochs}
                    min={1}
                    max={100}
                    step={1}
                    onChange={(e) => setEpochs(Number(e.target.value))}
                    disabled={isTraining}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold small">
                    <i className="bi bi-speedometer2 me-2"></i>Learning Rate
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    defaultValue={0.001}
                    min={0.0001}
                    max={1}
                    step={0.0001}
                    ref={learningRateRef}
                    disabled={isTraining}
                  />
                </div>
              </div>
              <div className="row g-2 mt-3">
                <div className="col-6">
                  {!isTraining ? (
                    <button
                      className="btn btn-primary w-100 btn-sm"
                      onClick={startTraining}
                    >
                      <i className="bi bi-play-fill me-1"></i>
                      Start Training
                    </button>
                  ) : (
                    <button
                      className="btn btn-danger w-100 btn-sm"
                      onClick={stopTrainingModel}
                    >
                      <i className="bi bi-stop-fill me-1"></i>
                      Stop Training
                    </button>
                  )}
                </div>
                <div className="col-6">
                  <button
                    className="btn btn-secondary w-100 btn-sm"
                    onClick={evaluateModel}
                    disabled={isTraining || isEvaluating || !modelRef.current}
                  >
                    <i className="bi bi-clipboard-data me-1"></i>
                    {isEvaluating ? "Evaluating..." : "Evaluate"}
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

              {/* Time Metrics */}
              <h6 className="text-muted mb-3 small">
                <i className="bi bi-clock me-2"></i>
                Performance
              </h6>
              <div className="row g-2 mb-4">
                <div className="col-6">
                  <div className="metric-card-compact">
                    <div className="metric-label-compact">Avg Batch Time</div>
                    <div className="metric-value-compact text-info">
                      {avgBatchTime.toFixed(0)} ms
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="metric-card-compact">
                    <div className="metric-label-compact">Avg Epoch Time</div>
                    <div className="metric-value-compact text-info">
                      {avgEpochTime >= 1000
                        ? `${(avgEpochTime / 1000).toFixed(2)} s`
                        : `${avgEpochTime.toFixed(0)} ms`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Batch Metrics */}
              <h6 className="text-muted mb-3 small">
                <i className="bi bi-arrow-clockwise me-2"></i>
                Batch Progress
              </h6>
              <div className="row g-2 mb-4">
                <div className="col-4">
                  <div className="metric-card-compact">
                    <div className="metric-label-compact">Batch</div>
                    <div className="metric-value-compact text-info">
                      {batchCount}/{Math.ceil(trainDataSize / batchSize)}
                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="metric-card-compact">
                    <div className="metric-label-compact">Loss</div>
                    <div className="metric-value-compact text-warning">
                      {batchLoss.toFixed(4)}
                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="metric-card-compact">
                    <div className="metric-label-compact">Acc</div>
                    <div className="metric-value-compact text-success">
                      {(batchAccuracy * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Epoch Metrics */}
              <h6 className="text-muted mb-3 small">
                <i className="bi bi-collection me-2"></i>
                Epoch Summary
              </h6>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <div className="metric-card-compact">
                    <div className="metric-label-compact">Epoch</div>
                    <div className="metric-value-compact text-info">
                      {epochCount}/{epochs}
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="metric-card-compact status-highlight">
                    <div className="metric-label-compact">Status</div>
                    <div className="metric-status">
                      <span className={`badge ${statusBadge.class} small`}>
                        <i className={`bi ${statusBadge.icon} me-1`}></i>
                        {statusBadge.text}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <div className="metric-card-compact">
                    <div className="metric-label-compact">Train Loss</div>
                    <div className="metric-value-compact text-warning">
                      {epochLoss.toFixed(4)}
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="metric-card-compact">
                    <div className="metric-label-compact">Train Acc</div>
                    <div className="metric-value-compact text-success">
                      {(epochAccuracy * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
              <div className="row g-2">
                <div className="col-6">
                  <div className="metric-card-compact">
                    <div className="metric-label-compact">Valid Loss</div>
                    <div className="metric-value-compact text-warning">
                      {validLoss.toFixed(4)}
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="metric-card-compact">
                    <div className="metric-label-compact">Valid Acc</div>
                    <div className="metric-value-compact text-success">
                      {(validAccuracy * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Drawing Area */}
          <div className="card bg-dark text-light mb-4 shadow">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3 pb-2 border-bottom border-secondary">
                <i className="bi bi-brush me-2"></i>
                Draw Digit
                {isTraining && (
                  <span className="badge bg-warning ms-2 small">
                    <i className="bi bi-lock-fill me-1"></i>
                    Locked
                  </span>
                )}
                {!isTraining && !modelRef.current && (
                  <span className="badge bg-secondary ms-2 small">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    Train Model First
                  </span>
                )}
              </h5>
              <div className="drawing-canvas-wrapper-compact mb-3">
                <canvas
                  ref={drawingCanvasRef}
                  width={280}
                  height={280}
                  className="drawing-canvas"
                  style={{
                    touchAction: "none",
                    opacity: isTraining || !modelRef.current ? 0.5 : 1,
                    cursor:
                      isTraining || !modelRef.current
                        ? "not-allowed"
                        : "crosshair",
                    pointerEvents:
                      isTraining || !modelRef.current ? "none" : "auto",
                  }}
                  onMouseDown={startDrawing}
                  onMouseMove={drawOnCanvas}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawingTouch}
                  onTouchMove={drawOnCanvasTouch}
                  onTouchEnd={stopDrawingTouch}
                ></canvas>
              </div>
              <div className="d-grid gap-2">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={clearCanvas}
                  disabled={isTraining || !modelRef.current}
                >
                  <i className="bi bi-eraser me-1"></i>
                  Clear Canvas
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={predictDrawing}
                  disabled={isTraining || !modelRef.current}
                >
                  <i className="bi bi-cpu me-1"></i>
                  Predict
                </button>
              </div>
              {(isTraining || !modelRef.current) && (
                <div className="text-center mt-2">
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    {isTraining
                      ? "Drawing is disabled during training"
                      : "Please train a model first to enable drawing"}
                  </small>
                </div>
              )}
            </div>
          </div>

          {/* Prediction Results */}
          <div className="card bg-dark text-light mb-4 shadow">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3 pb-2 border-bottom border-secondary">
                <i className="bi bi-cpu me-2"></i>
                Prediction Result
              </h5>

              <div className="prediction-result-card-compact mb-3">
                <div className="predicted-digit-compact">
                  <div className="digit-label-compact">Predicted Digit</div>
                  <div className="digit-value-compact">
                    {predictedDigit !== null ? predictedDigit : "-"}
                  </div>
                </div>
                <div className="confidence-meter-compact mt-3">
                  <div className="confidence-label-compact mb-2 small">
                    Confidence
                  </div>
                  <div className="progress" style={{ height: "24px" }}>
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{ width: `${confidence * 100}%` }}
                    >
                      <small className="fw-semibold">
                        {(confidence * 100).toFixed(1)}%
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              <h6 className="text-muted mb-3 small">
                <i className="bi bi-list-ol me-2"></i>
                All Probabilities
              </h6>
              <div className="predictions-list-compact">
                {allProbabilities.map((prob, digit) => (
                  <div key={digit} className="prediction-item-compact">
                    <div className="prediction-digit-compact">{digit}</div>
                    <div className="prediction-bar-wrapper-compact">
                      <div
                        className="prediction-bar"
                        style={{ width: `${prob * 100}%` }}
                      ></div>
                    </div>
                    <div className="prediction-probability-compact">
                      {(prob * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Charts, Dataset Images & Confusion Matrix */}
        <div className="col-lg-8">
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
                        <canvas ref={batchLossChartRef}></canvas>
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
                        <canvas ref={batchAccuracyChartRef}></canvas>
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
                        <canvas ref={epochLossChartRef}></canvas>
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
                        <canvas ref={epochAccuracyChartRef}></canvas>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dataset Images Preview */}
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
                  className={`bi bi-chevron-${
                    showDatasetImages ? "up" : "down"
                  }`}
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
                                ref={(el) =>
                                  (datasetCanvasRefs.current[idx] = el)
                                }
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
                      {mnistDataRef.current === null
                        ? "Load Dataset"
                        : "Load Random Samples"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Confusion Matrix */}
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
                  className={`bi bi-chevron-${
                    showConfusionMatrix ? "up" : "down"
                  }`}
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
                        Click "Evaluate" button after training to generate
                        confusion matrix
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
                              {(confusionMatrixStats.accuracy * 100).toFixed(2)}
                              %
                            </div>
                          </div>
                          <div className="metric-summary-card">
                            <div className="metric-summary-icon text-info">
                              <i className="bi bi-bullseye"></i>
                            </div>
                            <div className="metric-summary-label">
                              Avg Precision
                            </div>
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
                            <div className="metric-summary-label">
                              Avg Recall
                            </div>
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
                                            confusionMatrixStats.precision[
                                              idx
                                            ] > 0.9
                                              ? "text-success"
                                              : confusionMatrixStats.precision[
                                                  idx
                                                ] > 0.7
                                              ? "text-warning"
                                              : "text-danger"
                                          }
                                        >
                                          {(
                                            confusionMatrixStats.precision[
                                              idx
                                            ] * 100
                                          ).toFixed(2)}
                                          %
                                        </span>
                                      </td>
                                      <td>
                                        <span
                                          className={
                                            confusionMatrixStats.recall[idx] >
                                            0.9
                                              ? "text-success"
                                              : confusionMatrixStats.recall[
                                                  idx
                                                ] > 0.7
                                              ? "text-warning"
                                              : "text-danger"
                                          }
                                        >
                                          {(
                                            confusionMatrixStats.recall[idx] *
                                            100
                                          ).toFixed(2)}
                                          %
                                        </span>
                                      </td>
                                      <td>
                                        <span
                                          className={
                                            confusionMatrixStats.f1Score[idx] >
                                            0.9
                                              ? "text-success"
                                              : confusionMatrixStats.f1Score[
                                                  idx
                                                ] > 0.7
                                              ? "text-warning"
                                              : "text-danger"
                                          }
                                        >
                                          {(
                                            confusionMatrixStats.f1Score[idx] *
                                            100
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
        </div>
      </div>
    </div>
  );
}

export default App;
