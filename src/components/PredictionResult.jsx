import React, { memo } from "react";

const PredictionResult = memo(({ predictedDigit, confidence, allProbabilities }) => {
  return (
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
  );
});

export default PredictionResult;
