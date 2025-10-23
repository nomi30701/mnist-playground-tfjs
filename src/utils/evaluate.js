export function doPrediction(model, data, testDataSize = 500) {
  const IMAGE_WIDTH = 28;
  const IMAGE_HEIGHT = 28;
  const testData = data.nextTestBatch(testDataSize);
  const testxs = testData.xs.reshape([
    testDataSize,
    IMAGE_WIDTH,
    IMAGE_HEIGHT,
    1,
  ]);
  const labels = testData.labels.argMax(-1);
  const preds = model.predict(testxs).argMax(-1);

  testxs.dispose();
  return [preds, labels];
}

export function calculateConfusionMatrix(preds, labels) {
  const predsArray = preds.dataSync();
  const labelsArray = labels.dataSync();
  const numClasses = 10;

  // Initialize 10x10 confusion matrix
  const confusionMatrix = Array(numClasses)
    .fill(0)
    .map(() => Array(numClasses).fill(0));

  // Fill confusion matrix
  for (let i = 0; i < predsArray.length; i++) {
    const trueLabel = labelsArray[i];
    const predLabel = predsArray[i];
    confusionMatrix[trueLabel][predLabel]++;
  }

  return confusionMatrix;
}

export function getConfusionMatrixStats(confusionMatrix) {
  const numClasses = confusionMatrix.length;
  const stats = {
    accuracy: 0,
    precision: [],
    recall: [],
    f1Score: [],
  };

  let totalCorrect = 0;
  let totalSamples = 0;

  for (let i = 0; i < numClasses; i++) {
    let tp = confusionMatrix[i][i]; // True Positives
    let fp = 0; // False Positives
    let fn = 0; // False Negatives

    // Calculate FP and FN
    for (let j = 0; j < numClasses; j++) {
      if (j !== i) {
        fp += confusionMatrix[j][i]; // Predicted as i but actually j
        fn += confusionMatrix[i][j]; // Actually i but predicted as j
      }
    }

    totalCorrect += tp;
    totalSamples += confusionMatrix[i].reduce((sum, val) => sum + val, 0);

    // Calculate metrics
    const precision = tp / (tp + fp) || 0;
    const recall = tp / (tp + fn) || 0;
    const f1 = (2 * (precision * recall)) / (precision + recall) || 0;

    stats.precision.push(precision);
    stats.recall.push(recall);
    stats.f1Score.push(f1);
  }

  stats.accuracy = totalCorrect / totalSamples;

  return stats;
}
