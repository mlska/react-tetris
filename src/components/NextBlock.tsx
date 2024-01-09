import { Block, SHAPES } from "../types";

interface NextBlockProps {
  upcomingBlock: Block | null;
}

function NextBlock({ upcomingBlock }: NextBlockProps) {
  const shape = upcomingBlock ? SHAPES[upcomingBlock].shape.filter((row) => row.some((cell) => cell)) : [];

  return (
    <div className="nextBlock">
      <h2>Next Block</h2>
      <div>
        {shape.map((row, rowIndex) => {
          return (
            <div key={rowIndex} className="row">
              {row.map((isSet, cellIndex) => {
                const cellClass = isSet ? upcomingBlock : "hidden";
                return <div key={`${rowIndex}-${cellIndex}`} className={`cell ${cellClass}`} />;
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default NextBlock;
