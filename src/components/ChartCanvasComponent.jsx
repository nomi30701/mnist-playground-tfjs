import '../assets/canvas.css';
function ChartCanvasComponent() {
  return (
    <>
      <div id='chart-container'>
        <div>
          <p>Batch Loss</p>
          <canvas className="canvas" id="batchLossChart"></canvas>
        </div>
        <div>
          <p>Batch Accuracy</p>
          <canvas className="canvas" id="batchAccChart"></canvas>
        </div>
        <div>
          <p>Epoch Loss</p>
          <canvas className="canvas" id="epochLossChart"></canvas>
        </div>
        <div>
          <p>Epoch Accuracy</p>
          <canvas className="canvas" id="epochAccChart"></canvas>
        </div>
      </div>
    </>
  );
}

export default ChartCanvasComponent;