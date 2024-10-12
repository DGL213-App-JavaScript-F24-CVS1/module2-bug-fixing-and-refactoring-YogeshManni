"use strict";

(() => {
  window.addEventListener("load", (event) => {
    // *****************************************************************************
    // #region Constants and Variables

    // Canvas references
    const canvas = document.querySelector("canvas");
    const ctx = canvas.getContext("2d");

    // UI references
    const restartButton = document.querySelector("#restart");
    const colorSelectButtons = document.querySelectorAll(".color-select");

    // Constants
    const CELL_COLORS = {
      white: [255, 255, 255],
      black: [0, 0, 0],
      red: [255, 0, 0],
      green: [0, 255, 0],
      blue: [0, 0, 255],
    };
    const CELLS_PER_AXIS = 9;

    const CELL_WIDTH = canvas.width / CELLS_PER_AXIS;
    const CELL_HEIGHT = canvas.height / CELLS_PER_AXIS;
    // maximum weighted score
    const MAXIMUM_WEIGHTED_SCORE = 1000;
    // User's current scorer
    let weightedScore = 0;
    //number of cells flooded
    let floodArea = 0;
    // intialize moveHistory array from storing data
    const moveHistory = [];
    // Game objects
    let replacementColor = CELL_COLORS.white;
    let grids = [];

    // #endregion
    const undoButton = document.getElementById("undoButton");
    // *****************************************************************************
    // #region Game Logic

    function startGame(startingGrid = []) {
      // initialize weightedScore same as maximum score
      weightedScore = MAXIMUM_WEIGHTED_SCORE;

      if (startingGrid.length === 0) {
        startingGrid = initializeGrid();
      }

      initializeHistory(startingGrid);

      render(grids[0]);
    }

    function initializeGrid() {
      const newGrid = [];
      for (let i = 0; i < CELLS_PER_AXIS * CELLS_PER_AXIS; i++) {
        newGrid.push(chooseRandomPropertyFrom(CELL_COLORS));
      }

      return newGrid;
    }

    // function to update scores whenever required
    function renderScores() {
      document.getElementById("weightedScore").innerText = weightedScore;
    }

    function updateWeightedScore(floodArea) {
      if (floodArea === 0) return;

      const MAX_MOVES = 8; // Maximum number of moves

      // deduct score based on flood Area
      const deduction = ((MAX_MOVES - floodArea + 1) / MAX_MOVES) * 8 + 2;

      weightedScore -= parseFloat(deduction); // Deduct the score based on the floodArea (which is moves here)
      if (weightedScore < 0) weightedScore = 0; // Set weightedScore to 0 if it goes below 0
      renderScores();
    }

    function initializeHistory(startingGrid) {
      grids = [];
      grids.push(startingGrid);
    }

    function saveCurrentGameState(_startingGrid) {
      //save the inital state of grid
      const moveRecord = {
        gridState: _startingGrid, // Current state of the grid
        playerScore: weightedScore, // Current score of the player
        selectedColor: replacementColor, // Color selected in the move
      };

      moveHistory.push(moveRecord); // Add to history
    }

    function render(grid) {
      for (let i = 0; i < grid.length; i++) {
        ctx.fillStyle = `rgb(${grid[i][0]}, ${grid[i][1]}, ${grid[i][2]})`;
        ctx.fillRect(
          (i % CELLS_PER_AXIS) * CELL_WIDTH,
          Math.floor(i / CELLS_PER_AXIS) * CELL_HEIGHT,
          CELL_WIDTH,
          CELL_HEIGHT
        );
      }
    }

    function undoMove() {
      if (moveHistory.length > 0) {
        const lastMove = moveHistory.pop(); // Remove the last move
        grids.pop(); // Remove last grid state
        weightedScore = lastMove.playerScore; // Restore score
        replacementColor = lastMove.selectedColor;
        render(lastMove.gridState); // Re-render the board, score and color
        renderScores();
      }
    }

    function updateGridAt(mousePositionX, mousePositionY) {
      const gridCoordinates = convertCartesiansToGrid(
        mousePositionX,
        mousePositionY
      );
      // console.log(gridCoordinates);
      const newGrid = grids[grids.length - 1].slice(); //Makes a copy of the most recent grid state
      floodArea = 0; // reset flooadArea to 0 before calculating total cells flooded

      //save game state
      saveCurrentGameState(newGrid.slice());

      floodFill(
        newGrid,
        gridCoordinates,
        newGrid[gridCoordinates.row * CELLS_PER_AXIS + gridCoordinates.column]
      );

      // update score
      updateWeightedScore(floodArea);

      grids.push(newGrid);
      //console.log(grids);
      render(grids[grids.length - 1]);
    }

    function floodFill(grid, gridCoordinate, colorToChange) {
      if (arraysAreEqual(colorToChange, replacementColor)) {
        return;
      } //The current cell is already the selected color
      else if (
        !arraysAreEqual(
          grid[gridCoordinate.row * CELLS_PER_AXIS + gridCoordinate.column],
          colorToChange
        )
      ) {
        return;
      } //The current cell is a different color than the initially clicked-on cell
      else {
        grid[gridCoordinate.row * CELLS_PER_AXIS + gridCoordinate.column] =
          replacementColor;

        // Recursive approach
        floodFill(
          grid,
          {
            column: Math.max(gridCoordinate.column - 1, 0),
            row: gridCoordinate.row,
          },
          colorToChange
        );
        floodFill(
          grid,
          {
            column: Math.min(gridCoordinate.column + 1, CELLS_PER_AXIS - 1),
            row: gridCoordinate.row,
          },
          colorToChange
        );
        floodFill(
          grid,
          {
            column: gridCoordinate.column,
            row: Math.max(gridCoordinate.row - 1, 0),
          },
          colorToChange
        );
        floodFill(
          grid,
          {
            column: gridCoordinate.column,
            row: Math.min(gridCoordinate.row + 1, CELLS_PER_AXIS - 1),
          },
          colorToChange
        );

        floodArea += 1;
      }
      return;
    }

    function reset() {
      weightedScore = MAXIMUM_WEIGHTED_SCORE;
      renderScores();
      moveHistory.length = 0;
      floodArea = 0;
      replacementColor = CELL_COLORS.white;
    }
    function restart() {
      reset();
      startGame(grids[0]);
    }

    // #endregion

    // *****************************************************************************
    // #region Event Listeners

    canvas.addEventListener("mousedown", gridClickHandler);
    function gridClickHandler(event) {
      updateGridAt(event.offsetX, event.offsetY);
    }

    restartButton.addEventListener("mousedown", restartClickHandler);
    function restartClickHandler() {
      restart();
    }

    colorSelectButtons.forEach((button) => {
      button.addEventListener("mousedown", () => {
        // save the state before replacing color
        const newGrid = grids[grids.length - 1].slice();
        grids.push(newGrid);
        saveCurrentGameState(newGrid.slice());

        replacementColor = CELL_COLORS[button.name];
      });
    });

    undoButton.addEventListener("mousedown", () => undoMove());
    // #endregion

    // *****************************************************************************
    // #region Helper Functions

    // To convert canvas coordinates to grid coordinates
    function convertCartesiansToGrid(xPos, yPos) {
      return {
        column: Math.floor(xPos / CELL_WIDTH),
        row: Math.floor(yPos / CELL_HEIGHT),
      };
    }

    // To choose a random property from a given object
    function chooseRandomPropertyFrom(object) {
      const keys = Object.keys(object);
      return object[keys[Math.floor(keys.length * Math.random())]]; //Truncates to integer
    }

    // To compare two arrays
    function arraysAreEqual(arr1, arr2) {
      if (arr1.length != arr2.length) {
        return false;
      } else {
        for (let i = 0; i < arr1.length; i++) {
          if (arr1[i] != arr2[i]) {
            return false;
          }
        }
        return true;
      }
    }

    // #endregion

    //Start game
    startGame();
  });
})();
