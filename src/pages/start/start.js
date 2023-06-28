import "./start.scss";
import { Link } from "react-router-dom";

const start = () => {
    return (
        <div className="start">
            <h1 className="start__title"> Welcome to the Game</h1>
            <div>
            <Link to="/Game">
            <button className="start__button">Click here to Start</button>
            </Link>
            <Link to ="/WatchLearning">
                <button className="start__machinelearning">Click to watch MachineLearning</button>
            </Link>
            </div>
        </div>
    )
}

export default start;