import { sequential, layers, train } from "@tensorflow/tfjs";

/**
 * Create model for MNIST digit classification with Batch Normalization
 * Model Architecture:
 *
 * Input → [Conv(32, 3×3) → ReLU → BN → MaxPool(2×2)]
 *       → [Conv(64, 3×3) → ReLU → BN → MaxPool(2×2)]
 *       → Flatten → Dropout(0.5)
 *       → Dense(128) → ReLU → Dropout(0.5)
 *       → Dense(10) → Softmax
 *
 * @returns
 */
export function createModel(lr = 0.001) {
  const model = sequential();

  // layer_1 - 32 filters, 3x3 kernel
  model.add(
    layers.conv2d({
      inputShape: [28, 28, 1],
      kernelSize: 3,
      filters: 32,
      activation: "linear", // Activation moved after BatchNorm
      kernelInitializer: "heNormal",
    })
  );
  model.add(layers.batchNormalization()); // Batch Normalization
  model.add(layers.activation({ activation: "relu" })); // ReLU activation

  // layer_1 - pooling
  model.add(
    layers.maxPooling2d({
      poolSize: 2,
      strides: 2,
    })
  );

  // layer_2 - 64 filters, 3x3 kernel
  model.add(
    layers.conv2d({
      kernelSize: 3,
      filters: 64,
      activation: "linear", // Activation moved after BatchNorm
      kernelInitializer: "heNormal",
    })
  );
  model.add(layers.batchNormalization()); // Batch Normalization
  model.add(layers.activation({ activation: "relu" })); // ReLU activation

  // layer_2 - pooling
  model.add(
    layers.maxPooling2d({
      poolSize: 2,
      strides: 2,
    })
  );

  // layer_3 - Flatten
  model.add(layers.flatten());

  // layer_4 - Dropout
  model.add(
    layers.dropout({
      rate: 0.5,
    })
  );

  // layer_5 - fully connected layer
  model.add(
    layers.dense({
      units: 128,
      activation: "linear", // Activation moved after BatchNorm
      kernelInitializer: "heNormal",
    })
  );
  model.add(layers.batchNormalization()); // Batch Normalization
  model.add(layers.activation({ activation: "relu" })); // ReLU activation

  // output layer - 10 classes (0-9)
  model.add(
    layers.dense({
      units: 10,
      activation: "softmax",
    })
  );

  model.compile({
    optimizer: train.adam(lr),
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"],
  });

  return model;
}
