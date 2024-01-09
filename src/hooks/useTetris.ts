import { useCallback, useEffect, useState } from "react";
import { Block, BlockShape, BoardShape, EmptyCell, SHAPES, TickSpeed } from "../types";
import {
  BOARD_HEIGHT,
  INITIAL_COLUMN,
  INITIAL_ROW,
  getEmptyBoard,
  getRandomBlock,
  hasCollisions,
  useTetrisBoard,
} from "./useTetrisBoard";
import { useInterval } from "./useInterval";

export function useTetris() {
  const [score, setScore] = useState(0);
  const [upcomingBlock, setUpcomingBlock] = useState<Block | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [tickSpeed, setTickSpeed] = useState<TickSpeed | null>(null);

  const [{ board, droppingRow, droppingColumn, droppingBlock, droppingShape }, dispatchBoardState] = useTetrisBoard();

  const startGame = useCallback(() => {
    const startingBlock = getRandomBlock();
    setScore(0);
    setUpcomingBlock(startingBlock);
    setIsCommitting(false);
    setIsPlaying(true);
    setIsPaused(false);
    setTickSpeed(TickSpeed.Normal);
    dispatchBoardState({ type: "start" });
  }, [dispatchBoardState]);

  const togglePause = useCallback(() => {
    setIsPaused((previousState) => !previousState);
  }, []);

  const stopGame = useCallback(() => {
    setIsPlaying(false);
    setUpcomingBlock(null);
    setIsPaused(false);
  }, []);

  const commitPosition = useCallback(() => {
    if (!hasCollisions(board, droppingRow + 1, droppingColumn, droppingShape)) {
      setIsCommitting(false);
      setTickSpeed(TickSpeed.Normal);
      return;
    }

    if (hasCollisions(board, INITIAL_ROW, INITIAL_COLUMN, SHAPES[upcomingBlock!].shape)) {
      setIsPlaying(false);
      setTickSpeed(null);
      return;
    }

    const newBoard = structuredClone(board) as BoardShape;
    addShapeToBoard(newBoard, droppingRow, droppingColumn, droppingBlock, droppingShape);

    let clearedRows = 0;
    for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
      if (newBoard[row].every((entry) => entry !== EmptyCell.Empty)) {
        clearedRows++;
        newBoard.splice(row, 1);
      }
    }

    setScore((actual) => actual + clearedRows * 100);

    const newBlock = upcomingBlock as Block;
    setUpcomingBlock(getRandomBlock());
    setTickSpeed(TickSpeed.Normal);

    dispatchBoardState({
      type: "commit",
      newBoard: [...getEmptyBoard(BOARD_HEIGHT - newBoard.length), ...newBoard],
      newBlock,
    });
    setIsCommitting(false);
  }, [board, dispatchBoardState, droppingBlock, droppingColumn, droppingRow, droppingShape, upcomingBlock]);

  const gameTick = useCallback(() => {
    if (isPaused) {
      return;
    } else if (isCommitting) {
      commitPosition();
    } else if (hasCollisions(board, droppingRow + 1, droppingColumn, droppingShape)) {
      setTickSpeed(TickSpeed.Sliding);
      setIsCommitting(true);
    } else {
      dispatchBoardState({ type: "drop" });
    }
  }, [board, commitPosition, dispatchBoardState, droppingColumn, droppingRow, droppingShape, isCommitting, isPaused]);

  useInterval(() => {
    isPlaying && gameTick();
  }, tickSpeed);

  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;

      event.key === "ArrowDown" && setTickSpeed(TickSpeed.Fast);
      event.key === "ArrowUp" && dispatchBoardState({ type: "move", isRotating: true });
      event.key === "ArrowLeft" && dispatchBoardState({ type: "move", isPressingLeft: true });
      event.key === "ArrowRight" && dispatchBoardState({ type: "move", isPressingRight: true });
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      event.key === "ArrowDown" && setTickSpeed(TickSpeed.Normal);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyDown);
    };
  }, [dispatchBoardState, isPlaying, isPaused]);

  const renderedBoard = structuredClone(board) as BoardShape;
  if (isPlaying) {
    addShapeToBoard(renderedBoard, droppingRow, droppingColumn, droppingBlock, droppingShape);
  }

  return {
    board: renderedBoard,
    startGame,
    togglePause,
    stopGame,
    isPaused,
    isPlaying,
    score,
    upcomingBlock,
  };
}

function addShapeToBoard(
  board: BoardShape,
  droppingRow: number,
  droppingColumn: number,
  droppingBlock: Block,
  droppingShape: BlockShape
) {
  droppingShape
    .filter((row) => row.some((isSet) => isSet))
    .forEach((row: boolean[], rowIndex: number) => {
      row.forEach((isSet: boolean, colIndex: number) => {
        if (isSet) {
          board[droppingRow + rowIndex][droppingColumn + colIndex] = droppingBlock;
        }
      });
    });
}
