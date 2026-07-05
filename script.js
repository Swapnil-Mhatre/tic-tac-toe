function gameBoard() {
  const rows = 3;
  const cols = 3;
  let board = [];
  const winningPatterns = [
    // Rows
    [
      [0, 0],
      [0, 1],
      [0, 2],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 2],
    ],
    [
      [2, 0],
      [2, 1],
      [2, 2],
    ],
    // Columns
    [
      [0, 0],
      [1, 0],
      [2, 0],
    ],
    [
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [0, 2],
      [1, 2],
      [2, 2],
    ],
    // Diagonals
    [
      [0, 0],
      [1, 1],
      [2, 2],
    ],
    [
      [0, 2],
      [1, 1],
      [2, 0],
    ],
  ];
  let isGameOver = false;
  let isGameDraw = false;

  const initBoard = () => {
    for (let i = 0; i < rows; i++) {
      board[i] = [];
      for (let j = 0; j < cols; j++) {
        board[i].push(cell());
      }
    }
  };

  const getBoard = () => board;
  const getDrawStatus = () => isGameDraw;
  const getGameStatus = () => isGameOver;
  const resetGameStatus = () => {
    isGameOver = false;
    isGameDraw = false;
  };

  const makeMove = (row, col, player) => {
    if (board[row][col].getValue() !== 0) {
      return false;
    }
    board[row][col].addToken(player);
    if (checkWinner(player)) {
      isGameOver = true;
    } else if (checkDraw()) {
      isGameOver = true;
      isGameDraw = true;
    }

    return true;
  };

  const printBoard = () => {
    return board.map((row) => row.map((cell) => cell.getValue()));
  };

  const checkWinner = (player) => {
    return winningPatterns.some((pattern) => {
      return pattern.every(([row, col]) => {
        return board[row][col].getValue() === player;
      });
    });
  };

  const checkDraw = () => {
    return board.every((row) => row.every((col) => col.getValue() !== 0));
  };

  initBoard();

  return {
    initBoard,
    getBoard,
    printBoard,
    makeMove,
    checkWinner,
    getGameStatus,
    getDrawStatus,
    resetGameStatus,
  };
}

function cell() {
  let value = 0;

  const addToken = (player) => {
    value = player;
  };
  const getValue = () => value;

  return { addToken, getValue };
}

function gameController(playerOne = "Player One", playerTwo = "Player Two") {
  let isComputerPlaying = false;
  let isComputerThinking = false;
  const board = gameBoard();
  const players = [
    {
      name: playerOne,
      marker: "X",
    },
    {
      name: playerTwo,
      marker: "O",
    },
  ];

  let activePlayer = players[0];

  const getComputerVal = () => isComputerPlaying;
  const setComputer = (val) => (isComputerPlaying = val);
  const getComputerChance = () => isComputerThinking;
  const setComputerChance = (val) => {
    isComputerThinking = val;
  };

  const switchplayer = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };
  const getActivePlayer = () => activePlayer;
  const setActivePlayer = () => (activePlayer = players[0]);

  // used for logging the game into console before ui implementation
  const printNewRound = () => {
    console.log(board.printBoard());
  };

  function computerMove() {
    function getRandomIndex() {
      const boardArea = board.getBoard().length;
      return Math.floor(Math.random() * boardArea);
    }

    let rowIdx = getRandomIndex();
    let colIdx = getRandomIndex();

    while (board.getBoard()[rowIdx][colIdx].getValue() !== 0) {
      rowIdx = getRandomIndex();
      colIdx = getRandomIndex();
    }

    playRound(rowIdx, colIdx);
  }

  const playRound = (row, column) => {
    const moved = board.makeMove(row, column, activePlayer.marker);
    if (moved) switchplayer();
  };

  return {
    playRound,
    getActivePlayer,
    setActivePlayer,
    getBoard: board.getBoard,
    initBoard: board.initBoard,
    isGameOver: board.getGameStatus,
    isGameDraw: board.getDrawStatus,
    resetGameStatus: board.resetGameStatus,
    computerMove,
    setComputer,
    getComputerVal,
    getComputerChance,
    setComputerChance,
  };
}

function ScreenController() {
  const display = gameController();
  const DOMBoard = document.querySelector(".board");
  const status = document.querySelector(".status");
  const startBtn = document.querySelector("#start_game");
  const restartBtn = document.querySelector("#reset_btn");
  const startCon = document.querySelector(".start_game");
  const restartCon = document.querySelector(".buttons-container");
  const gameMode = ["Vs Computer", "Vs Player"];

  const updateScreen = () => {
    renderBoard();
    updateStatus();
    handleComputerTurn();
  };

  function updateStatus() {
    const activePlayer = display.getActivePlayer().marker;

    if (display.getComputerChance()) {
      status.textContent = "Computer is thinking...";
      return;
    }

    if (display.getComputerVal()) {
      status.textContent = "Your Turn (X)";
      return;
    }

    status.textContent = `${activePlayer}'s turn`;
  }

  function renderBoard() {
    const board = display.getBoard();
    DOMBoard.textContent = "";

    board.forEach((row, rowidx) => {
      const DOMrow = document.createElement("div");
      DOMrow.classList.add("row");
      DOMBoard.appendChild(DOMrow);
      row.forEach((cell, colidx) => {
        const DOMcell = document.createElement("div");
        DOMcell.classList.add("cell");
        DOMcell.dataset.row = rowidx;
        DOMcell.dataset.col = colidx;
        DOMcell.textContent = cell.getValue();
        if (cell.getValue() === 0) {
          DOMcell.textContent = "";
        }
        DOMrow.appendChild(DOMcell);
      });
    });
  }

  function handleComputerTurn() {
    const activePlayer = display.getActivePlayer().marker;

    if (
      display.getComputerVal() &&
      !display.isGameOver() &&
      activePlayer === "O"
    ) {
      display.setComputerChance(true);

      updateStatus();
      
      setTimeout(() => {
        display.computerMove();

        if (display.isGameOver()) gameOver(activePlayer);

        display.setComputerChance(false);

        updateScreen();
      }, 1000);
    }
  }

  function createModeButtons(mode, container) {
    const button = document.createElement("button");
    button.classList.add("mode");
    button.textContent = mode;
    button.dataset.mode = mode;

    container.appendChild(button);
  }

  function chooseMode(evt) {
    if (evt.target.dataset.mode === "Vs Computer") display.setComputer(true);
    else display.setComputer(false);
    updateScreen();
    if (display.isGameOver()) {
      restartGame();
      return;
    }
    gameLaunch();
  }

  function gameLaunch() {
    const gameContainer = document.querySelector(".game_container");
    startCon.style.display = "none";
    gameContainer.style.display = "flex";
  }

  function handleModeButton(button, container) {
    button.style.display = "none";
    gameMode.forEach((mode) => createModeButtons(mode, container));
    const buttons = container.querySelectorAll("button.mode");
    buttons.forEach((button) => button.addEventListener("click", chooseMode));
  }

  startBtn.addEventListener("click", () => {
    handleModeButton(startBtn, startCon);
  });

  const gameOver = (player = "X") => {
    const gameOverCon = document.querySelector(".game_over");
    const gameContainer = document.querySelector(".game_container");
    const declaration = document.querySelector(".declaration");
    const isDraw = display.isGameDraw();

    if (isDraw) declaration.textContent = `Game is Draw nobody Won`;
    else declaration.textContent = `${player} has won the game!!`;
    gameContainer.style.display = "none";
    gameOverCon.style.display = "flex";
  };

  function restartGame() {
    const gameOverCon = document.querySelector(".game_over");
    gameOverCon.style.display = "none";
    display.resetGameStatus();
    display.initBoard();
    display.setActivePlayer();
    gameLaunch();
    updateScreen();
  }
  restartBtn.addEventListener("click", () => {
    handleModeButton(restartBtn, restartCon);
  });

  function clickHandlerBoard(e) {
    if (display.getComputerChance()) return;
    const selectedrow = e.target.dataset.row;
    const selectedColumn = e.target.dataset.col;
    const currentPlayer = display.getActivePlayer().marker;

    if (!selectedColumn && !selectedrow) return;
    display.playRound(selectedrow, selectedColumn);
    if (display.isGameOver()) gameOver(currentPlayer);
    updateScreen();
  }
  DOMBoard.addEventListener("click", clickHandlerBoard);
}

ScreenController();
