import { useState, useRef, useEffect, useCallback } from "react";
import { setBackend, tidy, browser } from "@tensorflow/tfjs";
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
import { createModel } from "../utils/model";
import { train, stopTraining } from "../utils/train";
import { MnistData } from "../utils/data";
import { inference } from "../utils/inference";
import {
  doPrediction,
  calculateConfusionMatrix,
  getConfusionMatrixStats,
} from "../utils/evaluate";

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

export const useMnistModel = ({
  batchLossChartRef,
  batchAccuracyChartRef,
  epochLossChartRef,
  epochAccuracyChartRef,
}) => {
  // Model & Data State
  const modelRef = useRef(null);
  const mnistDataRef = useRef(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState("Ready");
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Metrics State
  const [metrics, setMetrics] = useState({
    batchLoss: 0,
    batchAccuracy: 0,
    epochLoss: 0,
    epochAccuracy: 0,
    validLoss: 0,
    validAccuracy: 0,
    epochCount: 0,
    batchCount: 0,
    avgBatchTime: 0,
    avgEpochTime: 0,
  });

  // Throttling metrics updates
  const metricsRef = useRef(metrics);
  const lastUpdateRef = useRef(0);

  const updateMetrics = useCallback((newMetrics) => {
    metricsRef.current = { ...metricsRef.current, ...newMetrics };
    const now = Date.now();
    if (now - lastUpdateRef.current > 100) {
      setMetrics(metricsRef.current);
      lastUpdateRef.current = now;
    }
  }, []);

  // Chart Instances
  const chartInstances = useRef({
    batchLossChartInstance: { current: null },
    batchAccuracyChartInstance: { current: null },
    epochLossChartInstance: { current: null },
    epochAccuracyChartInstance: { current: null },
  });

  // Confusion Matrix State
  const [confusionMatrix, setConfusionMatrix] = useState(null);
  const [confusionMatrixStats, setConfusionMatrixStats] = useState(null);

  // Prediction State
  const [prediction, setPrediction] = useState({
    predictedDigit: null,
    confidence: 0,
    allProbabilities: Array(10).fill(0),
  });

  // Dataset Samples
  const [datasetSamples, setDatasetSamples] = useState([]);

  // Initialize Charts
  useEffect(() => {
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            color: "#e5e7eb",
            font: { size: 11, weight: "600" },
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
              if (label) label += ": ";
              if (context.parsed.y !== null)
                label += context.parsed.y.toFixed(4);
              return label;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: "#334155", drawBorder: false },
          ticks: { color: "#9ca3af", font: { size: 10 } },
        },
        y: {
          grid: { color: "#334155", drawBorder: false },
          ticks: { color: "#9ca3af", font: { size: 10 } },
        },
      },
      interaction: { mode: "nearest", axis: "x", intersect: false },
    };

    const initChart = (ref, instanceRef, type, datasets, yOptions) => {
      if (ref.current && !instanceRef.current) {
        const ctx = ref.current.getContext("2d");
        instanceRef.current = new Chart(ctx, {
          type,
          data: { labels: [], datasets },
          options: {
            ...commonOptions,
            scales: {
              ...commonOptions.scales,
              y: { ...commonOptions.scales.y, ...yOptions },
              x: {
                ...commonOptions.scales.x,
                title: {
                  display: true,
                  text:
                    type === "line" && datasets[0].label.includes("Batch")
                      ? "Batch"
                      : "Epoch",
                  color: "#9ca3af",
                  font: { size: 11, weight: "600" },
                },
              },
            },
          },
        });
      }
    };

    initChart(
      batchLossChartRef,
      chartInstances.current.batchLossChartInstance,
      "line",
      [
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
      {
        beginAtZero: true,
        title: {
          display: true,
          text: "Loss",
          color: "#9ca3af",
          font: { size: 11, weight: "600" },
        },
      }
    );

    initChart(
      batchAccuracyChartRef,
      chartInstances.current.batchAccuracyChartInstance,
      "line",
      [
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
      {
        beginAtZero: true,
        max: 1,
        title: {
          display: true,
          text: "Accuracy",
          color: "#9ca3af",
          font: { size: 11, weight: "600" },
        },
      }
    );

    initChart(
      epochLossChartRef,
      chartInstances.current.epochLossChartInstance,
      "line",
      [
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
      {
        beginAtZero: true,
        title: {
          display: true,
          text: "Loss",
          color: "#9ca3af",
          font: { size: 11, weight: "600" },
        },
      }
    );

    initChart(
      epochAccuracyChartRef,
      chartInstances.current.epochAccuracyChartInstance,
      "line",
      [
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
      {
        beginAtZero: true,
        max: 1,
        title: {
          display: true,
          text: "Accuracy",
          color: "#9ca3af",
          font: { size: 11, weight: "600" },
        },
      }
    );

    return () => {
      Object.values(chartInstances.current).forEach((ref) => {
        if (ref.current) {
          ref.current.destroy();
          ref.current = null;
        }
      });
    };
  }, [
    batchLossChartRef,
    batchAccuracyChartRef,
    epochLossChartRef,
    epochAccuracyChartRef,
  ]);

  const displayRandomSamples = async (data, canvasRefs) => {
    if (!canvasRefs || !canvasRefs.current) return;

    const examples = data.nextTestBatch(20);
    const numExamples = examples.xs.shape[0];

    const initialSamples = Array.from({ length: numExamples }, () => ({
      label: -1,
    }));
    setDatasetSamples(initialSamples);

    await new Promise((resolve) => setTimeout(resolve, 50));

    const samples = [];

    for (let i = 0; i < numExamples; i++) {
      const imageTensor = tidy(() => {
        return examples.xs
          .slice([i, 0], [1, examples.xs.shape[1]])
          .reshape([28, 28, 1]);
      });

      if (canvasRefs.current[i]) {
        await browser.toPixels(imageTensor, canvasRefs.current[i]);
      }

      const labelTensor = examples.labels.slice(
        [i, 0],
        [1, examples.labels.shape[1]]
      );
      const label = labelTensor.argMax(-1).dataSync()[0];
      samples.push({ label });
      labelTensor.dispose();
    }

    setDatasetSamples(samples);
    examples.xs.dispose();
    examples.labels.dispose();
  };

  const loadDatasetSamples = useCallback(async (canvasRefs) => {
    try {
      if (mnistDataRef.current === null) {
        setTrainingStatus("Loading Data");
        const data = new MnistData();
        await data.load();
        mnistDataRef.current = data;
        setTrainingStatus("Ready");
      }
      await displayRandomSamples(mnistDataRef.current, canvasRefs);
    } catch (error) {
      console.error("Error loading dataset samples:", error);
    }
  }, []);

  const startTraining = useCallback(async (config, canvasRefs) => {
    await setBackend(config.backend);
    setMetrics((prev) => ({ ...prev, avgBatchTime: 0, avgEpochTime: 0 }));
    setIsTraining(true);
    setTrainingStatus("Loading Data");

    // Clear charts
    const {
      batchLossChartInstance,
      batchAccuracyChartInstance,
      epochLossChartInstance,
      epochAccuracyChartInstance,
    } = chartInstances.current;
    if (batchLossChartInstance.current) {
      batchLossChartInstance.current.data.labels = [];
      batchLossChartInstance.current.data.datasets[0].data = [];
      batchLossChartInstance.current.update();
    }
    if (batchAccuracyChartInstance.current) {
      batchAccuracyChartInstance.current.data.labels = [];
      batchAccuracyChartInstance.current.data.datasets[0].data = [];
      batchAccuracyChartInstance.current.update();
    }
    if (epochLossChartInstance.current) {
      epochLossChartInstance.current.data.labels = [];
      epochLossChartInstance.current.data.datasets[0].data = [];
      epochLossChartInstance.current.data.datasets[1].data = [];
      epochLossChartInstance.current.update();
    }
    if (epochAccuracyChartInstance.current) {
      epochAccuracyChartInstance.current.data.labels = [];
      epochAccuracyChartInstance.current.data.datasets[0].data = [];
      epochAccuracyChartInstance.current.data.datasets[1].data = [];
      epochAccuracyChartInstance.current.update();
    }

    try {
      if (mnistDataRef.current === null) {
        const data = new MnistData();
        await data.load();
        mnistDataRef.current = data;
      }
      if (canvasRefs) {
        await displayRandomSamples(mnistDataRef.current, canvasRefs);
      }

      setTrainingStatus("Loading Model");
      const model = createModel(config.learningRate);

      setTrainingStatus("Training");
      await train(
        model,
        mnistDataRef.current,
        {
          BATCH_SIZE: config.batchSize,
          TRAIN_DATA_SIZE: config.trainDataSize,
          TEST_DATA_SIZE: config.testDataSize,
          EPOCHS: config.epochs,
        },
        chartInstances.current,
        {
          setBatchLoss: (v) => updateMetrics({ batchLoss: v }),
          setBatchAccuracy: (v) => updateMetrics({ batchAccuracy: v }),
          setEpochLoss: (v) => updateMetrics({ epochLoss: v }),
          setEpochAccuracy: (v) => updateMetrics({ epochAccuracy: v }),
          setValidLoss: (v) => updateMetrics({ validLoss: v }),
          setValidAccuracy: (v) => updateMetrics({ validAccuracy: v }),
          setEpochCount: (v) => updateMetrics({ epochCount: v }),
          setBatchCount: (v) => updateMetrics({ batchCount: v }),
          setAvgBatchTime: (v) => updateMetrics({ avgBatchTime: v }),
          setAvgEpochTime: (v) => updateMetrics({ avgEpochTime: v }),
        }
      );

      modelRef.current = model;
      setTrainingStatus("Completed");
    } catch (error) {
      console.error("Training error:", error);
      setTrainingStatus("Error");
    } finally {
      setIsTraining(false);
    }
  }, [updateMetrics]);

  const stopTrainingModel = useCallback(() => {
    stopTraining();
    setIsTraining(false);
    setTrainingStatus("Stopped");
  }, []);

  const evaluateModel = useCallback(async (testDataSize) => {
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
      const [preds, labels] = doPrediction(
        modelRef.current,
        mnistDataRef.current,
        testDataSize
      );

      const matrix = calculateConfusionMatrix(preds, labels);
      const stats = getConfusionMatrixStats(matrix);

      setConfusionMatrix(matrix);
      setConfusionMatrixStats(stats);

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
  }, []);

  const predictDrawing = useCallback(async (canvas) => {
    if (!canvas || !modelRef.current) return;

    try {
      const { predictions, predictedDigit } = inference(
        modelRef.current,
        canvas
      );
      const probabilities = await predictions.data();
      const confidenceValue = probabilities[predictedDigit];

      setPrediction({
        predictedDigit,
        confidence: confidenceValue,
        allProbabilities: Array.from(probabilities),
      });

      predictions.dispose();
    } catch (error) {
      console.error("Prediction error:", error);
    }
  }, []);

  const clearPrediction = useCallback(() => {
    setPrediction({
      predictedDigit: null,
      confidence: 0,
      allProbabilities: Array(10).fill(0),
    });
  }, []);

  return {
    model: modelRef.current,
    mnistData: mnistDataRef.current,
    isTraining,
    trainingStatus,
    isEvaluating,
    metrics,
    confusionMatrix,
    confusionMatrixStats,
    prediction,
    datasetSamples,
    startTraining,
    stopTrainingModel,
    evaluateModel,
    predictDrawing,
    clearPrediction,
    loadDatasetSamples,
  };
};
