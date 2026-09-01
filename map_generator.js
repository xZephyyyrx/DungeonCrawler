import Node from './node.js';
import Tile from './tile.js';
import Vector from './vector.js';
import { getRandInt } from './utils.js';

export default class MapGenerator {

  // Enum to simplify direction handling
  #directions = Object.freeze({
    UP: "up",
    RIGHT: "right",
    DOWN: "down",
    LEFT: "left"
  });

  // Maximum number of mazes that will be generated
  // to find a valid path from entrance to exit.
  // Maze gen will throw an error if the number of
  // mazes generated exceeds this
  #maxNumberOfMazesToTest;

  // Minimum steps that must exist from the entrance tile
  // to the exit tile
  #minimumStepsToExit;

  constructor(maxNumberOfMazesToTest = 10, minimumStepsToExit = 25) {
    this.#maxNumberOfMazesToTest = maxNumberOfMazesToTest;
    this.#minimumStepsToExit = minimumStepsToExit;
  }

  generateMaze(numberOfRows, numberOfColumns) {
    // Arrays
    let grid;
    let allDeadEnds = [];

    // Loop variables
    let validMazeFound = false;
    let numberOfMazesTested = 0;

    // Main maze generation loop
    while (!validMazeFound) {
      if (numberOfMazesTested >= this.#maxNumberOfMazesToTest) {
        throw new Error(`${this.#maxNumberOfMazesToTest} mazes tested with no valid path found!`);
      }
      ``
      // Creates a 2d array populated with wall tiles
      grid = this.initializeArrays(numberOfRows, numberOfColumns);

      // Removes walls from the grid to form a maze
      this.createMaze(grid, numberOfRows, numberOfColumns);

      // Marks each dead end tile in the grid as a dead end and
      // returns an array of all dead end tiles in the grid
      this.findDeadEnds(
        grid,
        allDeadEnds,
        this.convertToFullGridDimensions(numberOfRows),
        this.convertToFullGridDimensions(numberOfColumns)
      );

      // Attempts to mark one dead end tile as the entrance
      // and another as the exit. The entrance and exit will
      // only be created if the minimum steps between the 
      // two are greater or equal to the #minimumStepsToExit value
      // If no valid path can be found a new grid will be generated
      // and tested for a valid entrance and exit
      try {
        this.createEntranceAndExit(grid, allDeadEnds);
        validMazeFound = true;
      } catch (e) {
        numberOfMazesTested++;
      }

      // Ends loop early to test functionality
      validMazeFound = true;
    }

    return grid;
  }

  // Converts the number of rows and columns from just the
  // walkable pathways to pathways and walls
  convertToFullGridDimensions(value) {
    return value * 2 + 1;
  }
  
  // Defines the size of the maze grid according to the 
  // given number of rows and columns
  initializeArrays(rows, columns) {
    return new Array(this.convertToFullGridDimensions(rows))
      .fill(null)
      .map(() => 
        new Array(this.convertToFullGridDimensions(columns))
          .fill(new Tile(true)
        )
      )
  }

  // Uses a backtracking algorithm to carve out pathways from 
  // the passed grid of wall tiles
  createMaze(grid, rows, columns) {

    // Creates a grid to be populated with nodes. This allows 
    // the map to track the position of existing paths,
    // and to define completion by the node grid being fully populated
    const nodeGrid = new Array(rows)
      .fill(null)
      .map(() => new Array(columns));

    // Defines a random starting location on the grid and places a node
    // object at that position
    const startX = getRandInt(columns);
    const startY = getRandInt(rows);
    let currentNode = new Node(startX, startY);
    nodeGrid[startY][startX] = currentNode;

    // In addition to the temporary node grid, also updates the main
    // grid with the starting node's position
    this.clearTileOnMainGrid(
      grid,
      this.convertToFullGridDimensions(currentNode.x),
      this.convertToFullGridDimensions(currentNode.y)
    )

    // Generates a maze by checking the a random neighbour node position of
    // the current node. If that position is clear and inbounds, creates a 
    // new node at that position and sets that as the new current node.
    // Upon new node creation an empty tile is placed in the main grid along
    // with an empty tile connecting the two positions
    //
    // If no new node positions are available, backtracks to a previous node
    // and checks its remaining neighbours.
    //
    // Once the node grid is fully populated, ends the loop
    while (!this.isNodeGridComplete(nodeGrid, rows, columns)) {

      // Proceeds if the current node has unchecked neighbours
      if (this.isNewDirectionAvailable(currentNode)) {
        
        // Gets the direction of one of the current node's 
        // unchecked neighbours
        const newDirection = this.getNewDirection(currentNode);

        // Creates a new node based on the current node's position
        // and the new direction
        let newNode = this.createNewNode(currentNode, newDirection);

        // Validates the new node
        if (this.isNewNodeValid(newNode, nodeGrid, rows, columns)) {

          // If the new node is valid, removes walls from the tiles
          // both at the new node position, and from the tile approaching it
          // from the current node
          this.createPathOnMainGrid(grid, newNode, newDirection);

          // Adds the new node to the node grid
          nodeGrid[newNode.y][newNode.x] = newNode;

          // Removes the completed node from the current node's list
          // of neighbours to check
          this.removeDirectionFromNode(currentNode, newDirection);

          // Updates the new node to be the current node
          currentNode = newNode;

        } else {
          
          // If the node is invalid it is removed from the current
          // node's list of possible next nodes
          this.removeDirectionFromNode(currentNode, newDirection);
        }

      } else {

        // If the current node has no unchecked neighbours, 
        // the path backtracks, setting the previous node to the
        // new current node.
        //
        // If no previous nodes exist, the maze cannot be completed
        // and an error is thrown
        if (currentNode.previousNode !== null) {
          currentNode = currentNode.previousNode;
        } else {
          throw new Error("No valid path can be found!");
        }
      }
    }
  }

  // Replaces the wall tile with an empty space tile in the
  // main grid at the given position
  clearTileOnMainGrid(grid, x, y) {
    grid[y][x] = new Tile(false, new Vector(x, y));
  }

  // Returns true if every space in the node grid is populated
  // by a node object
  isNodeGridComplete(nodeGrid, rows, columns) {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        if (!nodeGrid[y][x]) {
          return false;
        }
      }
    }
    return true;
  }

  // Returns true if the current node has unchecked neighbours
  isNewDirectionAvailable(currentNode) {
    return currentNode.possiblePaths.length > 0;
  }

  // Returns the random direction of one of the current node's
  // unchecked neighbours
  getNewDirection(currentNode) {
    return currentNode.possiblePaths[
      getRandInt(currentNode.possiblePaths.length)
    ];
  }

  // Returns a new node based on the current node and the direction
  // the path is approaching from
  createNewNode(currentNode, direction) {
    let newX = currentNode.x;
    let newY = currentNode.y;

    switch (direction) {
      case this.#directions.UP:
        newY -= 1;
        break;
      case this.#directions.RIGHT:
        newX += 1;
        break;
      case this.#directions.DOWN:
        newY += 1;
        break;
      case this.#directions.LEFT:
        newX -= 1;
        break;
      default:
        throw new Error("Cannot create new Node from invalid direction!");
        break;
    }

    return new Node(newX, newY, currentNode);
  }

  // Validates that a new node is both inbounds, and that 
  // no node already exists at this position
  isNewNodeValid(node, nodeGrid, rows, columns) {
    return (
      node.x >= 0 &&
      node.x < columns &&
      node.y >= 0 &&
      node.y < rows &&
      nodeGrid[node.y][node.x] === undefined
    )
  }

  // Removes a given direction from a node's list of possible
  // next nodes
  removeDirectionFromNode(node, direction) {
    const index = node.possiblePaths.indexOf(direction);
    node.possiblePaths.splice(index, 1);
  }

  // Removes walls from the main grid both at the node's position,
  // and the tile approaching it based on the given direction
  createPathOnMainGrid(grid, node, direction) {
    const gridX = this.convertToFullGridDimensions(node.x);
    const gridY = this.convertToFullGridDimensions(node.y);

    this.clearTileOnMainGrid(grid, gridX, gridY);   

    switch(direction) {
      case this.#directions.UP:
        this.clearTileOnMainGrid(grid, gridX, gridY + 1);
        break;
      case this.#directions.RIGHT:
        this.clearTileOnMainGrid(grid, gridX - 1, gridY);
        break;
      case this.#directions.DOWN:
        this.clearTileOnMainGrid(grid, gridX, gridY - 1);
        break;
      case this.#directions.LEFT:
        this.clearTileOnMainGrid(grid, gridX + 1, gridY);
        break;
      default:
        throw new Error("Cannot create a path from an invalid direction!");
        break;
    }
  }

  // Finds and marks all dead ends in the maze and populates
  // the allDeadEnds array with all dead end tiles
  findDeadEnds(grid, allDeadEnds, rows, columns) {
    const maxRowBoundary = rows - 1;
    const maxColumnBoundary = columns - 1;
    
    for (let y = 1; y < maxRowBoundary; y++) {
      for (let x = 1; x < maxColumnBoundary; x++) {
        if (grid[y][x].isWall) {
          continue;
        }
        if (this.checkIfTileIsDeadEnd(grid, x, y)) {
          grid[y][x].isDeadEnd = true;
          allDeadEnds.push(grid[y][x]);
        }
      }
    }
  }

  // Returns true if a given tile has exactly three adjacent walls
  checkIfTileIsDeadEnd(grid, x, y) {
    let numberOfAdjacentWalls = 0;
    
    const xModifier = [0, 1, 0, -1];
    const yModifier = [-1, 0, 1, 0];

    const numberOfDirectionChecks = 4;
    const numberOfWallsForDeadEnd = 3;

    for (let i = 0; i < numberOfDirectionChecks; i++) {
      if (grid[y + yModifier[i]][x + xModifier[i]].isWall) {
        numberOfAdjacentWalls++;
      }
    }

    if (numberOfAdjacentWalls === numberOfWallsForDeadEnd) {
      return true;
    }
  }

  // Attempts to create an entrance and exit tile at two
  // dead ends in the grid with a minimum step count between
  // the two
  createEntranceAndExit(grid, allDeadEnds) {
    // Arrays of both every possible entrance and exit tile
    const possibleEntrances = structuredClone(allDeadEnds);
    const possibleExits = structuredClone(allDeadEnds);

    // Randomly chooses a tile from the list of possible
    // entrances to test
    let entranceIndex = getRandInt(allDeadEnds.length);
    let testEntrance = possibleEntrances[entranceIndex];

    let validPathFound = false;

    while (!validPathFound) {

      // Randomly chooses a tile from the list of possible
      // exits to test
      const exitIndex = getRandInt(possibleExits.length);
      const testExit = possibleExits[exitIndex];

      // If the shortest path between the entrance and exit
      // is a valid length, updates the tiles' isEntrance and
      // isExit flag to true and ends the loop
      if (this.isValidPathLength(grid, testEntrance, testExit)) {

        // Finds the tiles that correspond to the test entrance
        // and exit and sets their isEntrance and isExit flags
        // to true
        const totalNumberOfDeadEnds = allDeadEnds.length;
        for(let i = 0; i < totalNumberOfDeadEnds; i++) {
          if (
            allDeadEnds[i].pos.x === testEntrance.pos.x &&
            allDeadEnds[i].pos.y === testEntrance.pos.y
          ) {
            allDeadEnds[i].isEntrance = true;  
          } else if (
            allDeadEnds[i].pos.x === testExit.pos.x &&
            allDeadEnds[i].pos.y === testExit.pos.y
          ) {
            allDeadEnds[i].isExit = true;
          }
        }

        validPathFound = true;

      } else {

        // If the path length is invalid that exit is removed
        // from the list of possible exits
        possibleExits.splice(exitIndex, 1);
      }

      if (possibleExits.length <= 0) {
        if (possibleEntrances.length > 0) {

          // If no exit has been found that produces a
          // valid path length but possible entrances still exist,
          // repopulates the list of possible exits and sets another
          // test entrance
          possibleExits = structuredClone(allDeadEnds);
          entranceIndex = getRandInt(possibleEntrances.length);
          testEntrance = possibleEntrances[entranceIndex];
          possibleEntrances.splice(entranceIndex, 1);
        } else {

          // If both lists of possible entrances and exits have
          // been tested with no valid path found, an error is thrown
          // to the parent function allowing for either another maze
          // to be tested, or for the maze generation to be 
          // terminated
          throw new Error("No possible entrance and exit configuration can be found!");
        }
      }
    }
  } 

  // Returns true if the entrance cannot reach the exit in the 
  // number of steps specified in #minimumStepsToExit
  isValidPathLength(grid, entrance, exit) {
    let isPathValid = true;

    // Adjacent tiles to the current tile are added to the queue to
    // be checked in the appropriate order
    const queue = [];

    // Tracks which tiles have already been checked to avoid loops
    const checkedTiles = [];
    
    // The step count is tracked for each tile added to the queue
    const stepCount = 0;

    // The test entrance tile is set as the first tile in the queue
    queue.push({
      tile: grid[entrance.pos.y][entrance.pos.x],
      stepCount: stepCount
    });

    // Loops through each step in the queue, adding each new
    // valid neighbouring tile to the end of the queue along
    // with its step count
    //
    // The loop terminates when either the exit is found,
    // the step count reaches greater than the minimum required
    // steps, or every possible tile has been tested
    while(queue.length > 0) {

      // Sets the current tile to test to the first value in 
      // the queue and removes it from the queue
      const currentTile = queue.shift();

      // Continues to the next iteration of the loop if 
      // the current tile has already been checked
      if (checkedTiles.includes(currentTile.tile)) {
        continue;
      }

      // Exits the loop without testing the remaining tiles in
      // the queue if the step count reaches greater than the
      // minimum required steps
      if (currentTile.stepCount > this.#minimumStepsToExit) {
        break;
      }

      // Terminates the loop and returns false if the exit is
      // found before reaching the minimum required steps
      if (
        currentTile.tile.pos.x === exit.pos.x &&
        currentTile.tile.pos.y === exit.pos.y
      ) {
        isPathValid = false;
        break;
      }

      // Checks each neighbour tile and adds any empty tiles to
      // the queue
      Object.values(this.#directions).forEach(direction => {
        this.checkNeighbourTile(queue, grid, currentTile, direction);
      });

      // Adds the current tile to the list of checked tiles
      checkedTiles.push(currentTile.tile);
    }

    return isPathValid;
  }

  // Adds any empty neighbour tiles to the queue along with
  // an incremented step count
  checkNeighbourTile(queue, grid, tile, direction) {
    let x = tile.tile.pos.x;
    let y = tile.tile.pos.y;

    switch(direction) {
      case this.#directions.UP:
        y--;
        break;
      case this.#directions.RIGHT:
        x++;
        break;
      case this.#directions.DOWN:
        y++;
        break;
      case this.#directions.LEFT:
        x--;
        break;
      default:
        throw new Error("Cannot find a neighbour tile from an invalid direction!");
        break;
    }

    // If the neighbour tile is not a wall, adds it to the queue
    if (!grid[y][x].isWall) {
      queue.push({
        tile: grid[y][x],
        stepCount: tile.stepCount + 1
      });
    }
  }
}
