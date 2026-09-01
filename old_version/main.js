import Node from "./node.js";
import ParseGrid from "./parser.js";
import Tile from "./tile.js";
import Vector from "./vector.js";

const Directions = Object.freeze({
  UP: "up",
  RIGHT: "right",
  DOWN: "down",
  LEFT: "left",
});

const numberOfRows = 20;
const numberOfColumns = 41;

// This needs to be fine-tuned
const minimumStepsToExit = 50;

// Number of mazes to iterate through to find a valid path
const numberOfMazesToTry = 10;

// Chance out of 1.00 a dead end will contain treasure
const treasureChance = 0.25;

let mainGrid;
let allDeadEnds;

function InitializeArrays() {
  mainGrid = new Array(GetGridDimensions(numberOfRows))
    .fill(null)
    .map(() =>
      new Array(GetGridDimensions(numberOfColumns)).fill(new Tile(true)),
    );
  allDeadEnds = [];
}

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
  mainGrid[y][x] = new Tile(false, new Vector(x, y));
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

function FindDeadEnds() {
  const totalNumberOfRows = GetGridDimensions(numberOfRows);
  const totalNumberOfColumns = GetGridDimensions(numberOfColumns);
  const maxRowBoundary = totalNumberOfRows - 1;
  const maxColumnBoundary = totalNumberOfColumns - 1;

  for (let y = 1; y < maxRowBoundary; y++) {
    for (let x = 1; x < maxColumnBoundary; x++) {
      if (mainGrid[y][x].isWall) {
        continue;
      }
      CheckIfTileIsDeadEnd(mainGrid[y][x], x, y);
    }
  }
}

function CheckIfTileIsDeadEnd(tile, x, y) {
  let numberOfAdjacentWalls = 0;
  const xModifier = [0, 1, 0, -1];

  const yModifier = [-1, 0, 1, 0];

  const numberOfDirectionChecks = 4;
  const numberOfWallsForDeadEnd = 3;

  for (let j = 0; j < numberOfDirectionChecks; j++) {
    if (mainGrid[y + yModifier[j]][x + xModifier[j]].isWall) {
      numberOfAdjacentWalls += 1;
    }
  }

  if (numberOfAdjacentWalls === numberOfWallsForDeadEnd) {
    tile.isDeadEnd = true;
    allDeadEnds.push(tile);
  }
}

function CreateEntranceAndExit() {
  let possibleExits = structuredClone(allDeadEnds);
  let possibleEntrances = structuredClone(allDeadEnds);
  let testEntranceIndex = GetRandInt(allDeadEnds.length);
  let testEntrance = possibleEntrances[testEntranceIndex];

  possibleExits.splice(testEntranceIndex, 1);
  possibleEntrances.splice(testEntranceIndex, 1);

  let validExitFound = 0;

  while (!validExitFound) {
    const testExitIndex = GetRandInt(possibleExits.length);

    const testExit = possibleExits[testExitIndex];
    if (IsValidPathLength(testEntrance, testExit)) {
      testEntrance.isEntrance = true;
      
      const totalNumberOfDeadEnds = allDeadEnds.length;

      for (let i = 0; i < totalNumberOfDeadEnds; i++) {
        if (allDeadEnds[i].pos.x === testExit.pos.x &&
            allDeadEnds[i].pos.y === testExit.pos.y) {
          allDeadEnds[i].isExit = true;
        }
        if (allDeadEnds[i].pos.x === testEntrance.pos.x &&
            allDeadEnds[i].pos.y === testEntrance.pos.y) {
          allDeadEnds[i].isEntrance = true;
        }
      }
      validExitFound = true;
    } else {
      possibleExits.splice(testExitIndex, 1);
    }

    if (possibleExits.length <= 0) {
      possibleExits = structuredClone(allDeadEnds);
      if (possibleEntrances.length > 0) {
        testEntranceIndex = GetRandInt(possibleEntrances.length);
        testEntrance = possibleEntrances[testEntranceIndex];
        possibleEntrances.splice(testEntranceIndex, 1);
      } else {
        throw new Error("No possible Entrance and Exit configuration allows for the minimum path length!");
      }
    }
  }
}

// Returns false if the shortest path from Entrance to Exit
// is shorter than the minimumStepsToExit value
function IsValidPathLength(entrance, exit) {
  let isPathValid = true;

  const checkedTiles = [];
  const queue = [];
  const currentNumberOfSteps = 0;

  // The queue consists of both the Tile objects, and 
  // the minimum number of steps to reach it
  queue.push({
    tile: mainGrid[entrance.pos.y][entrance.pos.x], 
    step: currentNumberOfSteps
  });

  while(queue.length > 0) {
    const currentTile = queue.shift();

    // If the current tile has already been checked continue
    // to the next iteration of the loop
    if (checkedTiles.includes(currentTile.tile)) {
      continue;
    }

    // End loop and return true if minimum steps has 
    // been passed
    if (currentTile.step > minimumStepsToExit) {
      break;
    }

    // If exit is found before reaching the minimum steps
    // end loop and return false
    if (
      currentTile.tile.pos.x === exit.pos.x &&
      currentTile.tile.pos.y === exit.pos.y
    ) {
      isPathValid = false;
      break;
    }

    checkedTiles.push(currentTile.tile);

    // Quick and dirty implementation - this should be
    // made into a function...
    const currentX = currentTile.tile.pos.x;
    const currentY = currentTile.tile.pos.y;

    // Up
    if (
      !mainGrid[currentY - 1][currentX].isWall &&
      !checkedTiles.includes(mainGrid[currentY - 1][currentX])
    ) {
      queue.push({
        tile: mainGrid[currentY - 1][currentX],
        step: currentTile.step + 1
      })
    }

    // Right
    if (
      !mainGrid[currentY][currentX + 1].isWall &&
      !checkedTiles.includes(mainGrid[currentY][currentX + 1])
    ) {
      queue.push({
        tile: mainGrid[currentY][currentX + 1],
        step: currentTile.step + 1
      })
    }

    // Down
    if (
      !mainGrid[currentY + 1][currentX].isWall &&
      !checkedTiles.includes(mainGrid[currentY + 1][currentX])
    ) {
      queue.push({
        tile: mainGrid[currentY + 1][currentX],
        step: currentTile.step + 1
      })
    }

    // Left
    if (
      !mainGrid[currentY][currentX - 1].isWall &&
      !checkedTiles.includes(mainGrid[currentY][currentX - 1])
    ) {
      queue.push({
        tile: mainGrid[currentY][currentX - 1],
        step: currentTile.step + 1
      })
    }
  }

  return isPathValid;
}

function PopulateTreasure() {
  const numberOfDeadEnds = allDeadEnds.length;
  for (let i = 0; i < numberOfDeadEnds; i++) {
    if (!allDeadEnds[i].isEntrance && !allDeadEnds[i].isExit) {
      if (Math.random() < treasureChance) {
        allDeadEnds[i].isTreasure = true;
      }
    }
  }
}

function GenerateMaze() {
  const startTime = performance.now();
  let validMazeFound = false;
  let count = 0;
  while (!validMazeFound) {
    if (count >= numberOfMazesToTry) {
      throw new Error(
        `${count} mazes created with no valid paths found!`
      )
    }
    InitializeArrays();
    CreateMaze();
    FindDeadEnds();
    try {
      CreateEntranceAndExit();
      validMazeFound = true;
    } catch (error) {
      count += 1;
    }
  }
  const endTime = performance.now();
  //console.log(`\nProcess took ${(endTime - startTime).toFixed(2)}ms to find a valid maze\n`);
}

// Main Process

// Visual Maze Generation
GenerateMaze();
PopulateTreasure();
ParseGrid(mainGrid);

// Diagnostics
//GetAverageTreasureCount();


// Generates 1000 mazes and counts how many treasure instances
// are generated in each one, Useful to see how changing the treasure
// spawn rates affects averages on a larger scale
function GetAverageTreasureCount() {
  const numberOfMazesToIterateThrough = 1000;
  const mazeTreasureCounts = [];

  for (let i = 0; i < numberOfMazesToIterateThrough; i++) {
    let treasureCount = 0;
    GenerateMaze();
    PopulateTreasure();
    const numberOfDeadEnds = allDeadEnds.length;
    for (let j = 0; j < numberOfDeadEnds; j++) {
      if (allDeadEnds[j].isTreasure) {
        treasureCount++;
      }
    }
    mazeTreasureCounts.push(treasureCount);
  }

  let counts = mazeTreasureCounts.reduce((acc, curr) => {
    acc[curr] = (acc[curr] || 0) +1;
    return acc;
  }, {});

  console.log(`\nChance any given dead end will contain treasure: ${treasureChance}/1.00\n`);
  console.log("Number of treasure items in each map:");
  console.log(counts);
}
