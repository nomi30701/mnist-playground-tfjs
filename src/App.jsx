import "./assets/App.css";
import { useRef, useState, useCallback, useMemo } from "react";
import "@tensorflow/tfjs-backend-webgpu";

import TrainingConfig from "./components/TrainingConfig";
import TrainingMetricsSummary from "./components/TrainingMetricsSummary";
import TrainingCharts from "./components/TrainingCharts";
import DrawingPad from "./components/DrawingPad";
import PredictionResult from "./components/PredictionResult";
import DatasetPreview from "./components/DatasetPreview";
import ConfusionMatrix from "./components/ConfusionMatrix";
import { useMnistModel } from "./hooks/useMnistModel";

function App() {
  // Chart refs
  const batchLossChartRef = useRef(null);
  const batchAccuracyChartRef = useRef(null);
  const epochLossChartRef = useRef(null);
  const epochAccuracyChartRef = useRef(null);

  // Canvas refs
  const drawingCanvasRef = useRef(null);
  const datasetCanvasRefs = useRef([]);

  // Configuration State
  const [config, setConfig] = useState({
    trainDataSize: 5500,
    testDataSize: 1000,
    batchSize: 128,
    epochs: 10,
    learningRate: 0.001,
    backend: "webgpu",
  });

  // Custom Hook
  const {
    model,
    mnistData,
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
  } = useMnistModel({
    batchLossChartRef,
    batchAccuracyChartRef,
    epochLossChartRef,
    epochAccuracyChartRef,
  });

  const handleStartTraining = useCallback(() => {
    startTraining(config, datasetCanvasRefs);
  }, [config, startTraining]);

  const handleLoadDatasetSamples = useCallback(() => {
    loadDatasetSamples(datasetCanvasRefs);
  }, [loadDatasetSamples]);

  const handlePredict = useCallback(() => {
    predictDrawing(drawingCanvasRef.current);
  }, [predictDrawing]);

  const handleClearCanvas = useCallback(() => {
    const canvas = drawingCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    clearPrediction();
  }, [clearPrediction]);

  const handleEvaluateModel = useCallback(() => {
    evaluateModel(config.testDataSize);
  }, [evaluateModel, config.testDataSize]);

  const classNames = useMemo(() => [
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
  ], []);

  const chartRefs = useMemo(() => ({
    batchLossChartRef,
    batchAccuracyChartRef,
    epochLossChartRef,
    epochAccuracyChartRef,
  }), []);

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
          <TrainingConfig
            config={config}
            setConfig={setConfig}
            isTraining={isTraining}
            startTraining={handleStartTraining}
            stopTraining={stopTrainingModel}
            evaluateModel={handleEvaluateModel}
            isEvaluating={isEvaluating}
            hasModel={!!model}
          />

          <TrainingMetricsSummary
            metrics={metrics}
            trainingStatus={trainingStatus}
            config={config}
          />

          <DrawingPad
            canvasRef={drawingCanvasRef}
            isTraining={isTraining}
            hasModel={!!model}
            onPredict={handlePredict}
            onClear={handleClearCanvas}
          />

          <PredictionResult
            predictedDigit={prediction.predictedDigit}
            confidence={prediction.confidence}
            allProbabilities={prediction.allProbabilities}
          />
        </div>

        {/* Right Column */}
        <div className="col-lg-8">
          <TrainingCharts
            chartRefs={chartRefs}
          />
          <DatasetPreview
            datasetSamples={datasetSamples}
            loadDatasetSamples={handleLoadDatasetSamples}
            isTraining={isTraining}
            canvasRefs={datasetCanvasRefs}
            hasData={!!mnistData}
          />

          <ConfusionMatrix
            confusionMatrix={confusionMatrix}
            confusionMatrixStats={confusionMatrixStats}
            classNames={classNames}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
