import { browser } from "@tensorflow/tfjs";

export function inference(model, canvasEl) {
  const tensor = browser
    .fromPixels(canvasEl, 1) // grayscale
    .toFloat()
    .div(255.0) // normalize to [0, 1]
    .neg()
    .add(1) // invert pixel values: background to 0, digit to 1
    .resizeBilinear([28, 28])
    .expandDims(0); // add batch dimension [1, 28, 28, 1]

  const predictions = model.predict(tensor);
  const predictedDigit = predictions.argMax(-1).dataSync()[0];

  tensor.dispose();

  return { predictions, predictedDigit };
}
