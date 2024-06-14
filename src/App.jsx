import './assets/App.css';
import { useState } from 'react';
import ButtonComponent from './components/ButtonComponent';
import ChartCanvasComponent from './components/ChartCanvasComponent';
import LossInfoComponent from './components/LossInfoComponent';
import HyperparmSettingComponent from './components/HyperparmSettingComponent';
import DrawCanvasComponent from './components/DrawCanvasComponent';

function App() {
  const [isDrawCanvasVisible, setDrawCanvasVisible] = useState(true);
  const toggleDrawCanvas = () => {
    setDrawCanvasVisible(!isDrawCanvasVisible);
  };
 
  return (
    <>
      <h1>Mnist dataset playground</h1>
      <div id='canvas-container'>
        <ChartCanvasComponent />
        {isDrawCanvasVisible && <DrawCanvasComponent />}
      </div>
      <LossInfoComponent />
      <HyperparmSettingComponent />
      <ButtonComponent toggleDrawCanvas={toggleDrawCanvas} isBoardOpen={isDrawCanvasVisible}/>
      <p style={{ fontSize: '15px' }}>
        Reference from: 
        <a href="https://www.tensorflow.org/js/tutorials/transfer/image_classification" target="_blank" rel="noopener noreferrer">
        https://www.tensorflow.org/js/tutorials/transfer/image_classification
        </a>
      </p>
    </>
  )
}

export default App
