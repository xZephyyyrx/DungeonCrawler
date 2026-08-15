import Node from "./node.js";
import ParseGrid from "./parser.js";

const Directions = Object.freeze({
  UP: "up",
  RIGHT: "right",
  DOWN: "down",
  LEFT: "left",
});

const numberOfRows = 10;
const numberOfColumns = 10;
const mainGrid = new Array(GetGridDimensions(numberOfRows))
  .fill(null)
  .map(() => new Array(GetGridDimensions(numberOfColumns)).fill("x"));

function GetGridDimensions(numberOfNodes) {
  return numberOfNodes * 2 + 1;
}

// Returns a random int up to but not including the specified upper limit
function GetRandInt(upperLimit) {
  return Math.floor(Math.random() * upperLimit);
}

function CreateMaze() {
  const nodeGrid = new Array(numberOfRows)
    .fill(null)
    .map(() => new Array(numberOfColumns));

  const startX = GetRandInt(numberOfColumns);
  const startY = GetRandInt(numberOfRows);

  let currentNode = new Node(startX, startY);
  nodeGrid[startY][startX] = currentNode;
  AddPathToMainGrid(
    GetGridDimensions(currentNode.x),
    GetGridDimensions(currentNode.y),
  );

  // Add a flag so that once a column is confirmed full it isn't checked again
  while (!CheckAllPathsComplete(nodeGrid)) {
    if (IsNewDirectionAvailable(currentNode)) {
      const newDirection = GetNewDirection(currentNode);
      let newNode = CreateNewNode(currentNode, newDirection);
      if (CheckNewNode(newNode, nodeGrid)) {
        AddNodeAndPathToMainGrid(newNode, newDirection);
        nodeGrid[newNode.y][newNode.x] = newNode;
        RemoveDirection(currentNode, newDirection);
        currentNode = newNode;
      } else {
        RemoveDirection(currentNode, newDirection);
      }
    } else {
      if (currentNode.previousNode !== null) {
        currentNode = currentNode.previousNode;
      } else {
        throw new Error("No valid path can be found!");
      }
    }
  }
}

function IsNewDirectionAvailable(currentNode) {
  return currentNode.possiblePaths.length > 0;
}

function GetNewDirection(currentNode) {
  return currentNode.possiblePaths[
    GetRandInt(currentNode.possiblePaths.length)
  ];
}

function CreateNewNode(currentNode, direction) {
  let newX = currentNode.x;
  let newY = currentNode.y;

  switch (direction) {
    case Directions.UP:
      newY -= 1;
      break;
    case Directions.RIGHT:
      newX += 1;
      break;
    case Directions.DOWN:
      newY += 1;
      break;
    case Directions.LEFT:
      newX -= 1;
      break;
    default:
      throw new Error("Cannot create new node from invalid direction!");
      break;
  }

  return new Node(newX, newY, currentNode);
}

function CheckNewNode(node, nodeGrid) {
  return (
    node.x >= 0 &&
    node.x < numberOfColumns &&
    node.y >= 0 &&
    node.y < numberOfRows &&
    nodeGrid[node.y][node.x] === undefined
  );
}

function AddNodeAndPathToMainGrid(node, direction) {
  const gridX = GetGridDimensions(node.x);
  const gridY = GetGridDimensions(node.y);

  AddPathToMainGrid(gridX, gridY);

  switch (direction) {
    case Directions.UP:
      AddPathToMainGrid(gridX, gridY + 1);
      break;
    case Directions.RIGHT:
      AddPathToMainGrid(gridX - 1, gridY);
      break;
    case Directions.DOWN:
      AddPathToMainGrid(gridX, gridY - 1);
      break;
    case Directions.LEFT:
      AddPathToMainGrid(gridX + 1, gridY);
      break;
    default:
      throw new Error("Cannot create a path from an invalid direction!");
      break;
  }
}

function RemoveDirection(node, direction) {
  const index = node.possiblePaths.indexOf(direction);
  node.possiblePaths.splice(index, 1);
}

function AddPathToMainGrid(x, y) {
  mainGrid[y][x] = "o";
}

function CheckAllPathsComplete(nodeGrid) {
  for (let y = 0; y < numberOfRows; y++) {
    for (let x = 0; x < numberOfColumns; x++) {
      if (!nodeGrid[y][x]) {
        return false;
      }
    }
  }

  return true;
}

// Main Process
CreateMaze();
ParseGrid(mainGrid);
