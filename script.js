function gameBoard() {
  const rows = 3;
  const cols = 3;
  let board = [];
  const winningPatterns = [
    // Rows
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    // Columns
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    // Diagonals
    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]]
  ];
  let isGameOver = false;

  const initBoard = () => {
    board = [];
    for (let i = 0; i < rows; i++) {
      board[i] = [];
      for (let j = 0; j < cols; j++) {
        board[i].push(cell());
      }
    }
    isGameOver = false;
  }

  const getBoard = () => board;

  const makeMove = (row, col, player) => {
    const reservedCell = board[row][col].getValue() === 0;
    if (reservedCell) {
      board[row][col].addToken(player);
      }
    if (checkWinner(player)) {
      isGameOver = true;
      gameOver(player);
    } 
  };

  const gameOver = (player) => {
    const gameOverCon = document.querySelector(".game_over");
    const gameContainer = document.querySelector(".game_container");
    const declaration = document.querySelector(".declaration");

    declaration.textContent = `${player} has won the game!!`
    gameContainer.style.display = "none";
    gameOverCon.style.display = "flex";
  }

  const printBoard = () => {
    return board.map((row) =>
      row.map((cell) => cell.getValue())
    );
  };

  const checkWinner = (player) => {
    return winningPatterns.some((pattern) => {
      return pattern.every(([row, col]) => {
        return board[row][col].getValue() === player;
      });
    });
  };

  initBoard();

  return {initBoard, getBoard, printBoard, makeMove, checkWinner };
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

  const switchplayer = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };
  const getActivePlayer = () => activePlayer;
  const setActivePlayer = () => activePlayer = players[0];

  const printNewRound = () => {
    board.printBoard();
  };

  const playRound = (row, column) => {
    board.makeMove(row, column, getActivePlayer().marker);
    switchplayer();
    printNewRound();
  };

  printNewRound();

  return {playRound, getActivePlayer, setActivePlayer, getBoard: board.getBoard, initBoard: board.initBoard };
}

function ScreenController() {
  const display = gameController();
  const DOMBoard = document.querySelector(".board");
  const status = document.querySelector(".status");
  const startBtn = document.querySelector("#start_game");
  const restartBtn = document.querySelector("#reset_btn");
  
  const updateScreen = () => {
    const board = display.getBoard();
    const activePlayer = display.getActivePlayer();

    DOMBoard.textContent = "";
    status.textContent = `${activePlayer.marker}'s turn `;

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
  };

  function gameLaunch () {
    const startCon = document.querySelector(".start_game");
    const gameContainer = document.querySelector(".game_container");
    startCon.style.display = "none";
    gameContainer.style.display = "flex";
  }
  startBtn.addEventListener("click", gameLaunch);

  function restartGame () {
    display.initBoard();
    display.setActivePlayer();
    gameLaunch();
    updateScreen();
  }
  restartBtn.addEventListener("click", restartGame);

  function clickHandlerBoard(e) {
    const selectedrow = e.target.dataset.row;
    const selectedColumn = e.target.dataset.col;

    if (!selectedColumn && !selectedrow) return;
    display.playRound(selectedrow, selectedColumn);
    updateScreen();
  }
  DOMBoard.addEventListener("click", clickHandlerBoard);

  updateScreen();
}

ScreenController();
