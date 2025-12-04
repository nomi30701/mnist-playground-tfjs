import React, { memo } from "react";
import MetricCard from "./MetricCard";

const TrainingMetricsSummary = memo(({ metrics, trainingStatus, config }) => {
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

  return (
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
            <MetricCard
              label="Avg Batch Time"
              value={`${metrics.avgBatchTime.toFixed(0)} ms`}
              valueClass="text-info"
            />
          </div>
          <div className="col-6">
            <MetricCard
              label="Avg Epoch Time"
              value={
                metrics.avgEpochTime >= 1000
                  ? `${(metrics.avgEpochTime / 1000).toFixed(2)} s`
                  : `${metrics.avgEpochTime.toFixed(0)} ms`
              }
              valueClass="text-info"
            />
          </div>
        </div>

        {/* Batch Metrics */}
        <h6 className="text-muted mb-3 small">
          <i className="bi bi-arrow-clockwise me-2"></i>
          Batch Progress
        </h6>
        <div className="row g-2 mb-4">
          <div className="col-4">
            <MetricCard
              label="Batch"
              value={`${metrics.batchCount}/${Math.ceil(
                config.trainDataSize / config.batchSize
              )}`}
              valueClass="text-info"
            />
          </div>
          <div className="col-4">
            <MetricCard
              label="Loss"
              value={metrics.batchLoss.toFixed(4)}
              valueClass="text-warning"
            />
          </div>
          <div className="col-4">
            <MetricCard
              label="Acc"
              value={`${(metrics.batchAccuracy * 100).toFixed(1)}%`}
              valueClass="text-success"
            />
          </div>
        </div>

        {/* Epoch Metrics */}
        <h6 className="text-muted mb-3 small">
          <i className="bi bi-collection me-2"></i>
          Epoch Summary
        </h6>
        <div className="row g-2 mb-3">
          <div className="col-6">
            <MetricCard
              label="Epoch"
              value={`${metrics.epochCount}/${config.epochs}`}
              valueClass="text-info"
            />
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
            <MetricCard
              label="Train Loss"
              value={metrics.epochLoss.toFixed(4)}
              valueClass="text-warning"
            />
          </div>
          <div className="col-6">
            <MetricCard
              label="Train Acc"
              value={`${(metrics.epochAccuracy * 100).toFixed(1)}%`}
              valueClass="text-success"
            />
          </div>
        </div>
        <div className="row g-2">
          <div className="col-6">
            <MetricCard
              label="Valid Loss"
              value={metrics.validLoss.toFixed(4)}
              valueClass="text-warning"
            />
          </div>
          <div className="col-6">
            <MetricCard
              label="Valid Acc"
              value={`${(metrics.validAccuracy * 100).toFixed(1)}%`}
              valueClass="text-success"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default TrainingMetricsSummary;
