import "./game.scss";
import { useEffect, useState, useCallback } from "react";

const Game = ({ predictAction, trainedModel }) => {
  const [animate, setAnimate] = useState(false);
  const [score, setScore] = useState(0);
  const [obstacleSpeed, setObstacleSpeed] = useState(10);
  const [gameOver, setGameOver] = useState(false);
  const [countingScore, setCountingScore] = useState(true);

  const handleJump = useCallback(() => {
    if (!animate && !gameOver) {
      setAnimate(true);
      setTimeout(() => {
        setAnimate(false);
      }, 500);
    }
  }, [animate, gameOver]);

  const restartGame = () => {
    setScore(0);
    setObstacleSpeed(10);
    setGameOver(false);
    document.getElementById("block").style.animation = "";
    document.getElementById("block").style.display = "block";
    setCountingScore(true);
  };

  useEffect(() => {
    const character = document.getElementById("character");
    const block = document.getElementById("block");

    const checkCollision = () => {
      const characterTop = parseInt(
        window.getComputedStyle(character).getPropertyValue("top")
      );
      const blockLeft = parseInt(
        window.getComputedStyle(block).getPropertyValue("left")
      );
      const blockHeight = parseInt(
        window.getComputedStyle(block).getPropertyValue("height")
      );

      if (
        blockLeft < 20 &&
        blockLeft > 0 &&
        characterTop >= 150 &&
        blockHeight >= 50
      ) {
        block.style.animation = "none";
        block.style.display = "none";
        setGameOver(true);
        setCountingScore(false);
      } else if (blockLeft < -20) {
        if (countingScore) {
          setScore((prevScore) => {
            const newScore = prevScore + 1;
            if (newScore > 0 && newScore % 10 === 0) {
              setObstacleSpeed((prevSpeed) => prevSpeed + 10);
            }
            return newScore;
          });
        }
      }
    };

    const handleKeyDown = (event) => {
      if (event.code === "Space") {
        handleJump();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    const moveObstacle = () => {
      const obstacle = document.getElementById("block");
      const obstacleLeft = parseInt(
        window.getComputedStyle(obstacle).getPropertyValue("left")
      );
      obstacle.style.left = obstacleLeft - obstacleSpeed + "px";
    };

    const randomizeObstacleSize = () => {
      const obstacle = document.getElementById("block");
      const minHeight = 50;
      const maxHeight = 125;
      const randomHeight =
        Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
      obstacle.style.height = `${randomHeight}px`;
    };

    randomizeObstacleSize();

    const interval = setInterval(() => {
      const gameState = {
        characterTop: parseInt(
          window.getComputedStyle(character).getPropertyValue("top")
        ),
        blockLeft: parseInt(
          window.getComputedStyle(block).getPropertyValue("left")
        ),
        blockHeight: parseInt(
          window.getComputedStyle(block).getPropertyValue("height")
        ),
      };

      checkCollision();
      moveObstacle();

      if (!gameOver && trainedModel) {
        const predictedAction = predictAction(gameState);
        if (predictedAction === "jump") {
          handleJump();
        }
      }
    }, 10);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      clearInterval(interval);
    };
  }, [handleJump, obstacleSpeed, predictAction, gameOver, trainedModel, countingScore]);

  return (
    <div>
      <div id="game">
        <div id="character" className={animate ? "animate" : ""}></div>
        <div id="block"></div>
      </div>
      <div className="area">
      <div className="score">Score: {score}
      {!gameOver && (
        <button className="jumpbutton" onClick={handleJump} disabled={animate}>
          Jump
        </button>
      )}
      </div>
      {gameOver && (
        <div className="gamelost">
          <p className="Lost">You Lost</p>
          <button className="restart" onClick={restartGame}>Restart</button>
        </div>
      )}
      </div>
    </div>
  );
};

export default Game;