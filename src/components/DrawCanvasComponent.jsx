import '../assets/drawcanvas.css';
import { useRef, useState} from 'react';
import * as tf from '@tensorflow/tfjs';
import { model } from '../utils/mnistScript.js';

function DrawCanvasComponent() {
    const canvasRef = useRef(null);
    const modelRef = useRef(model);
    const [prediction, setPrediction] = useState(null);

    const drawOnCanvas = (event) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (event.buttons === 1) {
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI * 2, true); // x, y, radius, startAngle, endAngle, anticlockwise
            ctx.fill();
        }
    };
    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const predictDigit = async () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = new Uint8Array(imageData.data.length / 4);
        for (let i = 0; i < imageData.data.length; i += 4) {
            data[i / 4] = imageData.data[i + 3];
        }
        const imgTensor = tf.tensor(data, [canvas.height, canvas.width, 1]);
        const resized = tf.image.resizeBilinear(imgTensor, [28, 28]).toFloat();
        const batched = resized.expandDims(0);
        const predictions = modelRef.current.predict(batched);
        setPrediction(predictions.argMax(1).dataSync()[0]);
    };

    return (
        <div id='drawCanvas-container'>
            <p style={{fontSize: '24px'}}>Drawing board</p>
            <canvas id='draw-canvas' ref={canvasRef} width="280" height="280" onMouseMove={drawOnCanvas} onMouseUp={predictDigit} />
            <p style={{ color: 'red', fontSize: '28px' }}>Predict: {prediction}</p>
            <button className='button' id='cleanBoard-btn' onClick={clearCanvas}>
                Clean whiteboard
            </button>
        </div>
    )
}

export default DrawCanvasComponent;