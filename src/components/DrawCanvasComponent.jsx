import '../assets/drawcanvas.css';
import { useRef, useState} from 'react';
import * as tf from '@tensorflow/tfjs';
import { model } from '../utils/mnistScript.js';

function DrawCanvasComponent() {
    const canvasRef = useRef(null);
    const modelRef = useRef(model);
    const [lastX, setLastX] = useState(0);
    const [lastY, setLastY] = useState(0);
    const [prediction, setPrediction] = useState(null);

    const drawOnCanvas = (event) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
    
        if (event.buttons === 1) {
            ctx.strokeStyle = 'White';
            ctx.lineWidth = 20;
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);
            ctx.closePath();
            ctx.stroke();
            setLastX(x);
            setLastY(y);
        } else {
            setLastX(0);
            setLastY(0);
        }
    };
    const startDrawing = (event) => {
        const rect = canvasRef.current.getBoundingClientRect();
        setLastX(event.clientX - rect.left);
        setLastY(event.clientY - rect.top);
    };
    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const predictDigit = async () => {
        const canvas = canvasRef.current;
        const imgTensor = tf.browser.fromPixels(canvas, 1);
        const resized = tf.image.resizeBilinear(imgTensor, [28, 28]).toFloat();
        const batched = resized.expandDims(0);
        const predictions = modelRef.current.predict(batched);
        setPrediction(predictions.argMax(1).dataSync()[0]);
    };

    return (
        <div id='drawCanvas-container'>
            <p style={{fontSize: '24px'}}>Drawing board</p>
            <canvas 
                id='draw-canvas' 
                ref={canvasRef} 
                width="280" 
                height="280" 
                onMouseDown={startDrawing}
                onMouseMove={drawOnCanvas}
                onMouseUp={predictDigit}
                />
            <p style={{ color: 'red', fontSize: '28px' }}>Predict: {prediction}</p>
            <button className='button' id='cleanBoard-btn' onClick={clearCanvas}>
                Clear
            </button>
        </div>
    )
}

export default DrawCanvasComponent;