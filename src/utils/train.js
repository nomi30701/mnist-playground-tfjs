import { tidy } from "@tensorflow/tfjs";

let isTraining = true;

/**
 *
 * @param {*} model
 * @param {*} data
 * @param {*} options - {epochs, batchSize, trainDataSize, testDataSize}
 * @returns
 */
export async function train(
  model,
  data,
  options = {
    BATCH_SIZE: 512,
    TRAIN_DATA_SIZE: 5500,
    TEST_DATA_SIZE: 1000,
    EPOCHS: 10,
  },
  chartOptions,
  setOptions
) {
  isTraining = true;

  const BATCH_SIZE = options.BATCH_SIZE;
  const TRAIN_DATA_SIZE = options.TRAIN_DATA_SIZE;
  const TEST_DATA_SIZE = options.TEST_DATA_SIZE;

  // training data [images, labels]
  const [trainXs, trainYs] = tidy(() => {
    const d = data.nextTrainBatch(TRAIN_DATA_SIZE);

    // reshape to [batch_size, 28, 28, 1]
    return [d.xs.reshape([TRAIN_DATA_SIZE, 28, 28, 1]), d.labels];
  });

  // test data [images, labels]
  const [testXs, testYs] = tidy(() => {
    const d = data.nextTestBatch(TEST_DATA_SIZE);

    // reshape to [batch_size, 28, 28, 1]
    return [d.xs.reshape([TEST_DATA_SIZE, 28, 28, 1]), d.labels];
  });

  let batchCounter = 0;

  // Time tracking
  let batchTimes = [];
  let epochTimes = [];
  let batchStartTime = 0;
  let epochStartTime = 0;

  return model.fit(trainXs, trainYs, {
    batchSize: BATCH_SIZE,
    validationData: [testXs, testYs],
    epochs: options.EPOCHS,
    shuffle: true,
    callbacks: {
      onBatchBegin: () => {
        batchStartTime = performance.now();
      },

      onBatchEnd: (batch, logs) => {
        if (!isTraining) {
          model.stopTraining = true;
          return;
        }

        // Calculate batch time
        const batchEndTime = performance.now();
        const batchTime = batchEndTime - batchStartTime;
        batchTimes.push(batchTime);

        // Calculate average batch time
        const avgBatchTime =
          batchTimes.reduce((a, b) => a + b, 0) / batchTimes.length;
        setOptions.setAvgBatchTime(avgBatchTime);

        batchCounter++;

        setOptions.setBatchLoss(logs.loss);
        setOptions.setBatchAccuracy(logs.acc);
        setOptions.setBatchCount(batch + 1);

        if (chartOptions.batchLossChartInstance.current) {
          chartOptions.batchLossChartInstance.current.data.labels.push(
            batchCounter
          );
          chartOptions.batchLossChartInstance.current.data.datasets[0].data.push(
            logs.loss
          );
          chartOptions.batchLossChartInstance.current.update();
        }

        if (chartOptions.batchAccuracyChartInstance.current) {
          chartOptions.batchAccuracyChartInstance.current.data.labels.push(
            batchCounter
          );
          chartOptions.batchAccuracyChartInstance.current.data.datasets[0].data.push(
            logs.acc
          );
          chartOptions.batchAccuracyChartInstance.current.update();
        }
      },

      onEpochBegin: () => {
        epochStartTime = performance.now();
      },

      onEpochEnd: (epoch, logs) => {
        if (!isTraining) {
          return;
        }

        // Calculate epoch time
        const epochEndTime = performance.now();
        const epochTime = epochEndTime - epochStartTime;
        epochTimes.push(epochTime);

        // Calculate average epoch time
        const avgEpochTime =
          epochTimes.reduce((a, b) => a + b, 0) / epochTimes.length;
        setOptions.setAvgEpochTime(avgEpochTime);

        setOptions.setEpochLoss(logs.loss);
        setOptions.setEpochAccuracy(logs.acc);
        setOptions.setEpochCount(epoch + 1);
        setOptions.setValidLoss(logs.val_loss);
        setOptions.setValidAccuracy(logs.val_acc);

        if (chartOptions.epochLossChartInstance.current) {
          chartOptions.epochLossChartInstance.current.data.labels.push(
            epoch + 1
          );
          chartOptions.epochLossChartInstance.current.data.datasets[0].data.push(
            logs.loss
          );
          chartOptions.epochLossChartInstance.current.data.datasets[1].data.push(
            logs.val_loss
          );
          chartOptions.epochLossChartInstance.current.update();
        }

        if (chartOptions.epochAccuracyChartInstance.current) {
          chartOptions.epochAccuracyChartInstance.current.data.labels.push(
            epoch + 1
          );
          chartOptions.epochAccuracyChartInstance.current.data.datasets[0].data.push(
            logs.acc
          );
          chartOptions.epochAccuracyChartInstance.current.data.datasets[1].data.push(
            logs.val_acc
          );
          chartOptions.epochAccuracyChartInstance.current.update();
        }
      },
    },
  });
}

export function stopTraining() {
  isTraining = false;
}
