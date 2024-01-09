interface ScoreProps {
  score: number;
}

export default function Score({ score }: ScoreProps) {
  return (
    <div className="score">
      <h2>Score</h2>
      <div>{score}</div>
    </div>
  );
}
