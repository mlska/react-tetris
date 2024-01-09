import { Dispatch, useReducer } from "react";
import { BlockShape, BoardShape, Block, SHAPES, EmptyCell } from "../types";

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const INITIAL_COLUMN = 3;
export const INITIAL_ROW = 0;

export type BoardState = {
  board: BoardShape;
  droppingRow: number;
  droppingColumn: number;
  droppingBlock: Block;
  droppingShape: BlockShape;
};

export function useTetrisBoard(): [BoardState, Dispatch<Action>] {
  const [boardState, dispatchBoardState] = useReducer(
    boardReducer,
    {
      board: [],
      droppingRow: 0,
      droppingColumn: 0,
      droppingBlock: Block.I,
      droppingShape: SHAPES.I.shape,
    },
    (emptyState) => {
      const state = {
        ...emptyState,
        board: getEmptyBoard(),
      };
      return state;
    }
  );

  return [boardState, dispatchBoardState];
}

export function getEmptyBoard(height = BOARD_HEIGHT) {
  return Array(height)
    .fill(null)
    .map(() => Array(BOARD_WIDTH).fill(EmptyCell.Empty));
}

export function getRandomBlock(): Block {
  const blocks = Object.values(Block);
  return blocks[Math.floor(Math.random() * blocks.length)] as Block;
}

export function rotateBlock(shape: BlockShape): BlockShape {
  const rows = shape.length;
  const columns = shape[0].length;

  const rotated = Array(rows)
    .fill(null)
    .map(() => Array(columns).fill(false));

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      rotated[column][rows - 1 - row] = shape[row][column];
    }
  }

  return rotated;
}

export function hasCollisions(board: BoardShape, row: number, column: number, shape: BlockShape): boolean {
  let hasCollision = false;
  shape
    .filter((row) => row.some((isSet) => isSet))
    .forEach((shapeRow: boolean[], rowIndex: number) => {
      shapeRow.forEach((isSet: boolean, colIndex: number) => {
        if (
          isSet &&
          (row + rowIndex >= board.length ||
            column + colIndex >= board[0].length ||
            column + colIndex < 0 ||
            board[row + rowIndex][column + colIndex] !== EmptyCell.Empty)
        ) {
          hasCollision = true;
        }
      });
    });
  return hasCollision;
}

type Action = {
  type: "start" | "drop" | "commit" | "move";
  newBoard?: BoardShape;
  newBlock?: Block;
  isPressingLeft?: boolean;
  isPressingRight?: boolean;
  isRotating?: boolean;
};

function boardReducer(state: BoardState, action: Action): BoardState {
  const newState = { ...state };

  switch (action.type) {
    case "start": {
      const firstBlock = getRandomBlock();
      return {
        board: getEmptyBoard(),
        droppingColumn: INITIAL_COLUMN,
        droppingRow: INITIAL_ROW,
        droppingBlock: firstBlock,
        droppingShape: SHAPES[firstBlock].shape,
      };
    }
    case "drop":
      newState.droppingRow++;
      break;
    case "commit":
      return {
        board: [...getEmptyBoard(BOARD_HEIGHT - action.newBoard!.length), ...action.newBoard!],
        droppingRow: 0,
        droppingColumn: 3,
        droppingBlock: action.newBlock!,
        droppingShape: SHAPES[action.newBlock!].shape,
      };
      break;
    case "move":
      {
        const rotatedShape = action.isRotating ? rotateBlock(newState.droppingShape) : newState.droppingShape;
        const columnOffset: number = (action.isPressingLeft && -1) || (action.isPressingRight && 1) || 0;
        if (
          !hasCollisions(
            newState.board,
            newState.droppingRow,
            newState.droppingColumn + columnOffset,
            newState.droppingShape
          )
        ) {
          newState.droppingColumn += columnOffset;
          newState.droppingShape = rotatedShape;
        }
      }
      break;
    default:
      {
        const unhandledType: never = action.type;
        throw new Error(`Unhandled action type: ${unhandledType}`);
      }
      break;
  }

  return newState;
}
