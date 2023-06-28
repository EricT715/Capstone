import React, { useState, useEffect, useMemo } from "react";
import * as tf from "@tensorflow/tfjs";
import Game from "../game/game";
import MachineLearning from "../MachineLearning/MachineLearning";

const WatchLearning = () => {
  const [isTraining, setIsTraining] = useState(false);
  const [trainedModel, setTrainedModel] = useState(null);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [trainingData, setTrainingData] = useState([]);

  useEffect(() => {
    const initialTrainingData = [
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [0] },
      { input: [1, 0], output: [1] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
    ];

    setTrainingData(initialTrainingData);
  }, []);

  const handleEpochFinished = async (epoch) => {
    console.log(`Epoch ${epoch} finished.`);
    setCurrentEpoch(epoch);

    if (epoch === 100 && trainedModel) {
      await saveModel();
    }
  };

  const predictAction = (gameState) => {
    if (trainedModel) {
      const inputTensor = tf.tensor2d([[gameState.blockLeft, gameState.blockHeight]]);
      const prediction = trainedModel.predict(inputTensor);
      const actionIndex = tf.argMax(prediction).dataSync()[0];

      const actions = ["No Jump", "Jump"];
      const predictedAction = actions[actionIndex];

      return predictedAction;
    }

    return null;
  };

  const loadModel = async () => {
    const model = await tf.loadLayersModel("localstorage://my-model");
    setTrainedModel(model);
  };

  const saveModel = async () => {
    if (trainedModel) {
      await trainedModel.save("localstorage://my-model");
    }
  };

  const startTraining = async () => {
    setIsTraining(true);
    setTrainedModel(null);
    setCurrentEpoch(0);

    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 64, activation: "relu", inputShape: [2] }));
    model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));
    model.compile({ loss: "meanSquaredError", optimizer: "adam" });

    const numEpochs = 100;
    const inputTensor = tf.tensor2d(trainingData.map((item) => item.input));
    const outputTensor = tf.tensor2d(trainingData.map((item) => item.output));

    await model.fit(inputTensor, outputTensor, {
      epochs: numEpochs,
      callbacks: {
        onEpochEnd: (epoch) => {
          handleEpochFinished(epoch + 1);
        },
      },
    });

    setTrainedModel(model);
    setIsTraining(false);
    alert("Training is complete!"); // Display notification when training is done
    loadModel(); // Load the saved model after training is complete
  };

  const machineLearningComponent = useMemo(() => {
    if (isTraining) {
      return (
        <MachineLearning
          trainingData={trainingData}
          onEpochFinished={handleEpochFinished}
        />
      );
    }

    return null;
  }, [isTraining, trainingData, handleEpochFinished]);

  return (
    <div>
      <h1>Watch Learning Page</h1>
      {isTraining ? (
        <p>Training in progress... Epoch: {currentEpoch}</p>
      ) : (
        <p>Training complete! Model is ready.</p>
      )}

      {!isTraining && trainedModel && (
        <>
          <Game predictAction={predictAction} trainedModel={trainedModel} />
          <p>Model playing the game...</p>
        </>
      )}

      {isTraining ? (
        <button onClick={startTraining} disabled>
          Training in Progress
        </button>
      ) : (
        <button onClick={startTraining} disabled={isTraining || trainedModel}>
          Start Training
        </button>
      )}

      <button onClick={loadModel} disabled={isTraining || trainedModel}>
        Load Model
      </button>

      {machineLearningComponent}
    </div>
  );
};

export default WatchLearning;
