import * as tf from '@tensorflow/tfjs';
import { generateTrainingData, ALPHABET } from './trainingData';

export const trainAndSaveModel = async (language: 'ASL' | 'FSL'): Promise<void> => {
  console.log(`Training ${language} model...`);
  
  // Generate training data
  const examples = generateTrainingData(language);
  
  // Shuffle data
  const shuffled = examples.sort(() => Math.random() - 0.5);
  
  // Split into train/val (80/20)
  const splitIdx = Math.floor(shuffled.length * 0.8);
  const trainExamples = shuffled.slice(0, splitIdx);
  const valExamples = shuffled.slice(splitIdx);
  
  // Convert to tensors
  const trainX = tf.tensor2d(trainExamples.map(e => e.landmarks));
  const trainY = tf.tensor2d(
    trainExamples.map(e => {
      const oneHot = new Array(26).fill(0);
      oneHot[ALPHABET.indexOf(e.label)] = 1;
      return oneHot;
    })
  );
  
  const valX = tf.tensor2d(valExamples.map(e => e.landmarks));
  const valY = tf.tensor2d(
    valExamples.map(e => {
      const oneHot = new Array(26).fill(0);
      oneHot[ALPHABET.indexOf(e.label)] = 1;
      return oneHot;
    })
  );
  
  // Create model
  const model = tf.sequential({
    layers: [
      tf.layers.dense({ 
        inputShape: [63], 
        units: 128, 
        activation: 'relu',
        kernelInitializer: 'heNormal'
      }),
      tf.layers.batchNormalization(),
      tf.layers.dropout({ rate: 0.3 }),
      tf.layers.dense({ 
        units: 64, 
        activation: 'relu',
        kernelInitializer: 'heNormal'
      }),
      tf.layers.batchNormalization(),
      tf.layers.dropout({ rate: 0.3 }),
      tf.layers.dense({ 
        units: 32, 
        activation: 'relu',
        kernelInitializer: 'heNormal'
      }),
      tf.layers.dropout({ rate: 0.2 }),
      tf.layers.dense({ 
        units: 26, 
        activation: 'softmax' 
      })
    ]
  });
  
  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });
  
  // Train
  await model.fit(trainX, trainY, {
    epochs: 50,
    batchSize: 32,
    validationData: [valX, valY],
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(
          `Epoch ${epoch + 1}: loss=${logs?.loss.toFixed(4)}, ` +
          `acc=${logs?.acc.toFixed(4)}, ` +
          `val_loss=${logs?.val_loss.toFixed(4)}, ` +
          `val_acc=${logs?.val_acc.toFixed(4)}`
        );
      }
    }
  });
  
  // Save model
  const savePath = `localstorage://${language.toLowerCase()}-model`;
  await model.save(savePath);
  console.log(`${language} model saved to ${savePath}`);
  
  // Cleanup
  trainX.dispose();
  trainY.dispose();
  valX.dispose();
  valY.dispose();
  model.dispose();
};

export const loadTrainedModel = async (language: 'ASL' | 'FSL'): Promise<tf.LayersModel | null> => {
  try {
    const loadPath = `localstorage://${language.toLowerCase()}-model`;
    const model = await tf.loadLayersModel(loadPath);
    console.log(`Loaded trained ${language} model from ${loadPath}`);
    return model;
  } catch (e) {
    console.warn(`No trained ${language} model found in localStorage`, e);
    return null;
  }
};
