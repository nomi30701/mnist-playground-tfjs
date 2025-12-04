import React, { memo } from "react";

const TrainingConfig = memo(({
  config,
  setConfig,
  isTraining,
  startTraining,
  stopTraining,
  evaluateModel,
  isEvaluating,
  hasModel,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: name === "backend" ? value : Number(value),
    }));
  };

  return (
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
              name="trainDataSize"
              value={config.trainDataSize}
              min={1000}
              max={60000}
              step={1000}
              onChange={handleChange}
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
              name="testDataSize"
              value={config.testDataSize}
              min={1000}
              max={10000}
              step={1000}
              onChange={handleChange}
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
              name="batchSize"
              value={config.batchSize}
              min={1}
              max={512}
              step={1}
              onChange={handleChange}
              disabled={isTraining}
            />
          </div>
          <div className="col-6">
            <label className="form-label fw-semibold small">
              <i className="bi bi-cpu me-2"></i>Backend
            </label>
            <select
              className="form-select form-select-sm"
              name="backend"
              value={config.backend}
              onChange={handleChange}
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
              name="epochs"
              value={config.epochs}
              min={1}
              max={100}
              step={1}
              onChange={handleChange}
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
              name="learningRate"
              value={config.learningRate}
              min={0.0001}
              max={1}
              step={0.0001}
              onChange={handleChange}
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
                onClick={stopTraining}
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
              disabled={isTraining || isEvaluating || !hasModel}
            >
              <i className="bi bi-clipboard-data me-1"></i>
              {isEvaluating ? "Evaluating..." : "Evaluate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default TrainingConfig;
