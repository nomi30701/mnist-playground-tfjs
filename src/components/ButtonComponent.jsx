import '../assets/button.css';
import { useState } from 'react';
import { run } from '../utils/mnistScript.js';
import * as tfvis from '@tensorflow/tfjs-vis';

function ButtonComponent(props) {
  const [isVisorOpen, setVisorOpen] = useState(false);
  const [isTraining, setTraining] = useState(false);

  function togglePanel() {
    if (tfvis.visor().isOpen()) {
      tfvis.visor().close();
      setVisorOpen(false);
    } else {
      tfvis.visor().open();
      setVisorOpen(true);
    }
  }

  async function trainModel() {
    setTraining(true);
    await run();
    setTraining(false);
  }

  return (
    <>
      <button className='button' id='train-btn' onClick={trainModel} disabled={isTraining}>
        {isTraining ? 'Training model...' : 'Train model'}
      </button>
      <button className='button' id='togglePanel-btn' onClick={togglePanel}>
        {isVisorOpen ? 'Close visor' : 'Open visor'}
      </button>
      <button className='button' id='toggleBoard-btn' onClick={props.toggleDrawCanvas}>
        {props.isBoardOpen ? 'Close whiteboard' : 'Open whiteboard'}
      </button>
    </>
  );
}

export default ButtonComponent;