# 🎨 MNIST Training Playground

<div align="center">

## 🎯 Training & Monitoring
<img src="./preview-1.png" width="90%" alt="Real-time training with live metrics and performance charts">

## ✍️ Interactive Prediction
<img src="./preview-2.png" width="90%" alt="Draw digits and analyze model predictions">

</div>

## ✨ Features

This interactive web application built with TensorFlow.js allows you to train and experiment with neural networks on the MNIST handwritten digit dataset:

- 🎯 **Interactive Training** - Train a CNN model directly in your browser
- 📊 **Real-time Visualization** - Monitor training metrics with live charts
- ✍️ **Draw & Predict** - Draw digits and get instant predictions
- 📈 **Comprehensive Metrics** - View batch and epoch-level performance
- 🔍 **Confusion Matrix** - Analyze model performance across all digit classes
- 🖼️ **Dataset Preview** - Visualize random samples from the MNIST dataset

## 💻 Technical Support

- ⚡ **WebGPU Acceleration** - Leverage GPU for faster training
- 🧠 **WebGL Backend** - Fallback option for wider browser compatibility
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

## 🎓 Training Features

The application provides comprehensive training capabilities:

| Feature                  | Description                                    | Use Case                                      |
| :----------------------- | :--------------------------------------------- | :-------------------------------------------- |
| 🔧 **Configurable Parameters** | Adjust training data size, batch size, epochs | 🎛️ Experiment with different training setups |
| 📊 **Live Metrics**      | Real-time loss and accuracy tracking           | 📈 Monitor training progress                  |
| 🎨 **Interactive Canvas** | Draw digits for instant prediction            | ✍️ Test model performance                     |
| 📉 **Performance Charts** | Batch and epoch-level visualizations          | 📊 Analyze training dynamics                  |
| 🔄 **Auto Prediction**   | Automatic inference after drawing              | ⚡ Seamless user experience                   |

## 🧠 Model Architecture

The CNN model uses modern deep learning practices with Batch Normalization for improved training stability:

### Architecture Overview

```
Input (28×28×1)
    ↓
[Conv2D(32, 3×3) → BatchNorm → ReLU → MaxPool(2×2)]
    ↓
[Conv2D(64, 3×3) → BatchNorm → ReLU → MaxPool(2×2)]
    ↓
Flatten → Dropout(0.5)
    ↓
[Dense(128) → BatchNorm → ReLU → Dropout(0.5)]
    ↓
Dense(10) → Softmax
```

### Layer Details

| Layer Type | Configuration | Output Shape | Parameters |
|:-----------|:-------------|:-------------|:-----------|
| **Input** | 28×28 grayscale | (28, 28, 1) | 0 |
| **Conv2D** | 32 filters, 3×3 kernel, HeNormal init | (26, 26, 32) | 320 |
| **BatchNorm** | - | (26, 26, 32) | 128 |
| **ReLU** | - | (26, 26, 32) | 0 |
| **MaxPool2D** | 2×2 pool, stride 2 | (13, 13, 32) | 0 |
| **Conv2D** | 64 filters, 3×3 kernel, HeNormal init | (11, 11, 64) | 18,496 |
| **BatchNorm** | - | (11, 11, 64) | 256 |
| **ReLU** | - | (11, 11, 64) | 0 |
| **MaxPool2D** | 2×2 pool, stride 2 | (5, 5, 64) | 0 |
| **Flatten** | - | (1600) | 0 |
| **Dropout** | rate=0.5 | (1600) | 0 |
| **Dense** | 128 units, HeNormal init | (128) | 204,928 |
| **BatchNorm** | - | (128) | 512 |
| **ReLU** | - | (128) | 0 |
| **Dropout** | rate=0.5 | (128) | 0 |
| **Dense** | 10 units (output) | (10) | 1,290 |
| **Softmax** | - | (10) | 0 |

**Total Parameters**: ~225,930

### Key Features

- 🎯 **Batch Normalization**: Applied after convolutions and dense layers for faster convergence
- 🔧 **He Normal Initialization**: Optimal weight initialization for ReLU activations
- 🛡️ **Dropout Regularization**: 50% dropout rate to prevent overfitting
- ⚡ **Adam Optimizer**: Adaptive learning rate optimization
- 📊 **Categorical Crossentropy**: Standard loss for multi-class classification

### Training Configuration

```javascript
{
  optimizer: 'adam',
  learningRate: 0.001,  // Configurable in UI
  loss: 'categoricalCrossentropy',
  metrics: ['accuracy']
}
```

### Why This Architecture?

1. **Batch Normalization**
   - Stabilizes training by normalizing layer inputs
   - Allows higher learning rates
   - Acts as regularization

2. **He Normal Initialization**
   - Specifically designed for ReLU activations
   - Prevents vanishing/exploding gradients

3. **Progressive Feature Extraction**
   - 32 filters → 64 filters: Gradually increases feature complexity
   - MaxPooling: Reduces spatial dimensions while preserving features

4. **Dropout for Robustness**
   - Applied after flatten and dense layers
   - Reduces overfitting on training data

### Expected Performance

With default settings (5,500 training samples, 10 epochs):
- **Training Accuracy**: ~98-99%
- **Validation Accuracy**: ~97-98%
- **Training Time**: ~2-5 minutes (depending on hardware)

## 🛠️ Installation Guide

1. Clone this repository

```bash
git clone https://github.com/yourusername/mnist-playground-tfjs.git
```

2. Navigate to the project directory

```bash
cd mnist-playground-tfjs
```

3. Install dependencies

```bash
npm install
```

## 🚀 Running the Project

Start development server

```bash
npm run dev
```

Build the project

```bash
npm run build
```

Preview production build

```bash
npm run preview
```

## 📊 Configuration Options

### Training Parameters

| Parameter          | Range          | Default | Description                              |
| :----------------- | :------------- | :------ | :--------------------------------------- |
| **Train Data**     | 1,000 - 60,000 | 5,500   | Number of training samples               |
| **Test Data**      | 1,000 - 10,000 | 1,000   | Number of validation samples             |
| **Batch Size**     | 1 - 512        | 128     | Number of samples per training batch     |
| **Epochs**         | 1 - 200        | 10      | Number of complete training iterations   |
| **Learning Rate**  | 0.0001 - 1     | 0.001   | Optimizer learning rate                  |
| **Backend**        | WebGPU/WebGL   | WebGPU  | Computational backend for training       |

### Training Metrics Display

- **Batch-Level Metrics**
  - Loss and accuracy per batch
  - Average batch processing time
  - Progress tracking

- **Epoch-Level Metrics**
  - Training and validation loss
  - Training and validation accuracy
  - Average epoch processing time

- **Confusion Matrix**
  - Overall accuracy
  - Per-class precision, recall, F1-score
  - Visual heatmap of predictions

## 🎨 Drawing & Prediction

### Interactive Canvas Features

1. **Draw Digits**
   - Use mouse or touch to draw on the 280x280 canvas
   - Automatic prediction after 0.5 seconds of inactivity
   - Manual prediction button available

2. **Prediction Display**
   - Predicted digit with confidence score
   - Probability distribution across all 10 digits
   - Color-coded confidence levels:
     - 🟢 Green (>80%): High confidence
     - 🟡 Yellow (50-80%): Medium confidence
     - 🔴 Red (<50%): Low confidence

3. **Canvas Controls**
   - **Clear Canvas**: Reset the drawing area
   - **Predict Now**: Trigger immediate prediction

> ⚠️ **Note**: Drawing is disabled during training and requires a trained model

## 📈 Understanding the Metrics

### Loss
- Measures how far predictions are from actual values
- Lower is better
- Should decrease during training

### Accuracy
- Percentage of correct predictions
- Higher is better
- Should increase during training

### Confusion Matrix
- Shows which digits are commonly confused
- Diagonal elements represent correct predictions
- Off-diagonal elements show misclassifications

### Per-Class Metrics
- **Precision**: Of all predicted X, how many were actually X?
- **Recall**: Of all actual X, how many were correctly identified?
- **F1-Score**: Harmonic mean of precision and recall

## 🎯 Best Practices

### For Better Training Results

1. **Start Small**: Begin with smaller datasets (5,000-10,000 samples) for faster experimentation
2. **Adjust Batch Size**: Larger batches (128-256) for stability, smaller for better generalization
3. **Monitor Overfitting**: Watch for diverging training and validation accuracy
4. **Experiment**: Try different learning rates and epochs to find optimal settings

### For Better Predictions

1. **Draw Clearly**: Make digits large and centered
2. **Use Bold Strokes**: Thicker lines work better
3. **Single Digit**: Draw one digit at a time
4. **Center Position**: Keep the digit in the middle of the canvas

## 🔧 Customization

### Using Custom Models

You can modify the model architecture in `src/utils/model.js`:

```javascript
export function createModel(lr = 0.001) {
  const model = sequential();

  // layer_1 - 32 filters, 3x3 kernel
  model.add(
    layers.conv2d({
      inputShape: [28, 28, 1],
      kernelSize: 3,
      filters: 32,
      activation: "linear",
      kernelInitializer: "heNormal",
    })
  );
  // ... more layers
  
  return model;
}
```

### Custom Dataset

To use a custom dataset:

1. Prepare your data in the MNIST format (28x28 grayscale images)
2. Update `src/utils/data.js` to load your dataset
3. Adjust the number of classes if needed

## 📱 Browser Compatibility

| Browser         | WebGPU | WebGL | Status |
| :-------------- | :----: | :---: | :----: |
| Chrome (113+)   |   ✅   |  ✅   |   ✅   |
| Edge (113+)     |   ✅   |  ✅   |   ✅   |
| Firefox         |   🚧   |  ✅   |   ✅   |
| Safari          |   🚧   |  ✅   |   ✅   |

> ⚡ **WebGPU Support**: WebGPU is currently supported in Chrome and Edge. Other browsers will automatically fall back to WebGL.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TensorFlow.js](https://www.tensorflow.org/js) - Machine learning library
- [Chart.js](https://www.chartjs.org/) - Data visualization
- [Bootstrap](https://getbootstrap.com/) - UI framework
- [Bootstrap Icons](https://icons.getbootstrap.com/) - Icon library
- [MNIST Dataloader](https://raw.githubusercontent.com/tensorflow/tfjs-examples/master/mnist-core/data.js) - Dataset source

## 📞 Contact

For questions or feedback, please open an issue on GitHub.

---

<div align="center">
Made with ❤️ using TensorFlow.js
</div>