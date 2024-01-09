interface ControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  startGame: () => void;
  stopGame: () => void;
  togglePause: () => void;
}

function Controls({ startGame, togglePause, stopGame, isPlaying, isPaused }: ControlsProps) {
  return (
    <div className="controls">
      <h2>Controls</h2>
      <button className={isPlaying ? "stopBtn" : "startBtn"} onClick={isPlaying ? stopGame : startGame}>
        {isPlaying ? "End" : "Start"}
      </button>
      <button
        className={isPaused ? "resumeBtn" : `pauseBtn ${isPlaying ? "" : "disabled"}`}
        onClick={togglePause}
        disabled={!isPlaying}
      >
        {isPaused ? "Resume" : "Pause"}
      </button>
    </div>
  );
}

export default Controls;
