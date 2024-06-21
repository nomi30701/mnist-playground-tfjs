import {MnistData} from './data.js';
import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';
import * as charts from './trainChart.js';
import { 
    Chart, 
    LineController, 
    LineElement, 
    PointElement, 
    LinearScale, 
    CategoryScale, 
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Title, Legend, BarElement);

const model = tf.sequential();
model.add(tf.layers.conv2d({
    inputShape: [28, 28, 1],
    kernelSize: 5,
    filters: 8,
    strides: 1,
    activation: 'relu',
}));
model.add(tf.layers.maxPooling2d({
    poolSize: [2, 2],
    strides: [2, 2]
}));
model.add(tf.layers.dropout(0.45));

model.add(tf.layers.conv2d({
    kernelSize: 5,
    filters: 16,
    strides: 1,
    activation: 'relu',
}));
model.add(tf.layers.maxPooling2d({
    poolSize: [2, 2],
    strides: [2, 2]
}));
model.add(tf.layers.dropout(0.45));

model.add(tf.layers.flatten());
model.add(tf.layers.dense({
    units: 128,
    activation: 'relu',
}));
model.add(tf.layers.dropout(0.5));
model.add(tf.layers.dense({
    units: 10,
    activation: 'softmax',
}));

// Compile model
// DEFAULT LEARNING_RATE = 0.01
// const optimizer = tf.train.adamax(LEARNING_RATE);
// model.compile({
//     optimizer: optimizer,
//     loss: 'categoricalCrossentropy',
//     metrics: ['accuracy'],
// });

let batchCount = 1;
let epochCount = 1;

// Train model
async function train(model, data) {
    // // set callback, Track the model's training process
    // const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
    // const container = {
    //     name: 'Model Training', tab: 'Model', styles: { height: '1000px' }
    // };
    // const fitCallbacks = tfvis.show.fitCallbacks(container, metrics);

    const LEARNING_RATE = document.getElementById('learning-rate').value;
    const optimizer = tf.train.adamax(LEARNING_RATE);
    model.compile({
        optimizer: optimizer,
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
    });

    // DEFAULT_BATCH_SIZE = 512
    const BATCH_SIZE = parseInt(document.getElementById('batch-size').value, 10);
    // train, test 8:2
    const TRAIN_DATA_SIZE = 5200;
    const TEST_DATA_SIZE = 1300;
    // DEFAULT EPOCHS = 20
    const EPOCHS = document.getElementById('epochs').value;

    // Get train data
    const train_batch_data = data.nextTrainBatch(TRAIN_DATA_SIZE);

    // Get test data
    const test_batch_data = data.nextTestBatch(TEST_DATA_SIZE);

    // return history
    return model.fit(
        train_batch_data.xs.reshape([TRAIN_DATA_SIZE, 28, 28, 1]),
        train_batch_data.labels,
        {
            batchSize: BATCH_SIZE,
            validationData: [test_batch_data.xs.reshape([TEST_DATA_SIZE, 28, 28, 1]), 
                            test_batch_data.labels],
            epochs: EPOCHS,
            shuffle: true,
            callbacks: {
                onBatchEnd: (batch, logs) => {
                    charts.batchLossChart.data.labels.push(batchCount);
                    charts.batchLossChart.data.datasets[0].data.push(logs.loss);
                    charts.batchLossChart.update();

                    charts.batchAccChart.data.labels.push(batchCount);
                    charts.batchAccChart.data.datasets[0].data.push(logs.acc);
                    charts.batchAccChart.update();

                    document.getElementById('batch-info').textContent = `Batch: ${batchCount} | Loss: ${logs.loss.toFixed(3)} | Accuracy: ${logs.acc.toFixed(3)}`;
                    batchCount++;
                },
                onEpochEnd: (epoch, logs) => {
                    charts.epochLossChart.data.labels.push(epochCount);
                    charts.epochLossChart.data.datasets[0].data.push(logs.loss);
                    charts.epochLossChart.data.datasets[1].data.push(logs.val_loss);
                    charts.epochLossChart.update();

                    charts.epochAccChart.data.labels.push(epochCount);
                    charts.epochAccChart.data.datasets[0].data.push(logs.acc);
                    charts.epochAccChart.data.datasets[1].data.push(logs.val_acc);
                    charts.epochAccChart.update();

                    document.getElementById('epoch-info').textContent = `Epoch: ${epochCount} | Train, Valid Loss: ${logs.loss.toFixed(3)}, ${logs.val_loss.toFixed(3)} | Train, Valid Acc: ${logs.acc.toFixed(3)}, ${logs.val_acc.toFixed(3)}`;
                    
                    epochCount++;
                }
            }
        }
    );
}

async function showExamples(data) {
    // Create a container in the visor
    const surface =
      tfvis.visor().surface({ name: 'Input Data Examples', tab: 'Model & Data'});
  
    // Get the examples
    const examples = data.nextTestBatch(20);
    const numExamples = examples.xs.shape[0];
  
    // Create a canvas element to render each example
    for (let i = 0; i < numExamples; i++) {
      const imageTensor = tf.tidy(() => {
        // Reshape the image to 28x28 px
        return examples.xs
          .slice([i, 0], [1, examples.xs.shape[1]])
          .reshape([28, 28, 1]);
      });
  
      const canvas = document.createElement('canvas');
      canvas.width = 28;
      canvas.height = 28;
      canvas.style = 'margin: 4px;';
      await tf.browser.toPixels(imageTensor, canvas);
      surface.drawArea.appendChild(canvas);
  
      imageTensor.dispose();
    }
  }

// ------------- Evaluate model
const classNames = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];

function doPrediction(model, data, testDataSize = 500) {
  const IMAGE_WIDTH = 28;
  const IMAGE_HEIGHT = 28;
  const testData = data.nextTestBatch(testDataSize);
  const testxs = testData.xs.reshape([testDataSize, IMAGE_WIDTH, IMAGE_HEIGHT, 1]);
  const labels = testData.labels.argMax(-1);
  const preds = model.predict(testxs).argMax(-1);

  testxs.dispose();
  return [preds, labels];
}

async function showAccuracy(model, data) {
  const [preds, labels] = doPrediction(model, data);
  const classAccuracy = await tfvis.metrics.perClassAccuracy(labels, preds);
  const container = {name: 'Accuracy', tab: 'Evaluation'};
  tfvis.show.perClassAccuracy(container, classAccuracy, classNames);

  labels.dispose();
}

async function showConfusion(model, data) {
  const [preds, labels] = doPrediction(model, data);
  const confusionMatrix = await tfvis.metrics.confusionMatrix(labels, preds);
  const container = {name: 'Confusion Matrix', tab: 'Evaluation'};
  tfvis.render.confusionMatrix(container, {values: confusionMatrix, tickLabels: classNames});

  labels.dispose();
}

async function run() {
    tfvis.show.modelSummary({name: 'Model Architecture', tab: 'Model & Data'}, model);
    // Load data
    const data = new MnistData();
    await data.load();
    await showExamples(data);
    await train(model, data);
    await showAccuracy(model, data);
    await showConfusion(model, data);
}


export {run, model};