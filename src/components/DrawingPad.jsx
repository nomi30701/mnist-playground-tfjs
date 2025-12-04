import React, { useEffect, useRef, memo } from "react";

const DrawingPad = memo(({
  canvasRef,
  isTraining,
  hasModel,
  onPredict,
  onClear,
}) => {
  const isDrawing = useRef(false);
  const predictionTimerRef = useRef(null);

  // Initialize drawing canvas white background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [canvasRef]);

  const startDrawing = (event) => {
    isDrawing.current = true;
    const canvas = canvasRef.current;
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
    if (!isDrawing.current) return;

    const canvas = canvasRef.current;
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
    if (!isDrawing.current) return;

    isDrawing.current = false;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.closePath();

    // Schedule auto prediction when user stops drawing
    scheduleAutoPrediction();
  };

  // Touch events for mobile
  const startDrawingTouch = (event) => {
    event.preventDefault();
    isDrawing.current = true;
    const canvas = canvasRef.current;
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
    if (!isDrawing.current) return;

    const canvas = canvasRef.current;
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
    if (!isDrawing.current) return;

    isDrawing.current = false;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.closePath();

    // Schedule auto prediction
    scheduleAutoPrediction();
  };

  const scheduleAutoPrediction = () => {
    // Clear existing timer
    if (predictionTimerRef.current) {
      clearTimeout(predictionTimerRef.current);
    }

    // Set new timer
    predictionTimerRef.current = setTimeout(() => {
      if (hasModel && !isTraining) {
        onPredict();
      }
    }, 500);
  };

  const handleClear = () => {
    if (predictionTimerRef.current) {
      clearTimeout(predictionTimerRef.current);
    }
    onClear();
  };

  return (
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
          {!isTraining && !hasModel && (
            <span className="badge bg-secondary ms-2 small">
              <i className="bi bi-exclamation-circle me-1"></i>
              Train Model First
            </span>
          )}
        </h5>
        <div className="drawing-canvas-wrapper-compact mb-3">
          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            className="drawing-canvas"
            style={{
              touchAction: "none",
              opacity: isTraining || !hasModel ? 0.5 : 1,
              cursor: isTraining || !hasModel ? "not-allowed" : "crosshair",
              pointerEvents: isTraining || !hasModel ? "none" : "auto",
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
            onClick={handleClear}
            disabled={isTraining || !hasModel}
          >
            <i className="bi bi-eraser me-1"></i>
            Clear Canvas
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={onPredict}
            disabled={isTraining || !hasModel}
          >
            <i className="bi bi-cpu me-1"></i>
            Predict
          </button>
        </div>
        {(isTraining || !hasModel) && (
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
  );
});

export default DrawingPad;
