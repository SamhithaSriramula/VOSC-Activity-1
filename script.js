const cells = document.querySelectorAll(".cell");

const statusText = document.getElementById("status");

const scoreXText = document.getElementById("scoreX");
const scoreOText = document.getElementById("scoreO");
const scoreDrawText = document.getElementById("scoreDraw");

const newRoundButton = document.getElementById("newRound");
const resetScoreButton = document.getElementById("resetScore");

const themeButton = document.getElementById("themeButton");

const modeSelect = document.getElementById("mode");
const difficultySelect = document.getElementById("difficulty");

const difficultyBox = document.getElementById("difficultyBox");

const playerOLabel = document.getElementById("playerOLabel");

const timerText = document.getElementById("timer");


let board = ["", "", "", "", "", "", "", "", ""];

let currentPlayer = "X";

let gameActive = true;

let scoreX = 0;
let scoreO = 0;
let scoreDraw = 0;

let timer;
let timeLeft = 15;


const winningPatterns = [

    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6]

];


// ===============================
// CELL CLICK
// ===============================

cells.forEach(function(cell) {

    cell.addEventListener("click", function() {

        const index = Number(cell.dataset.index);

        if (!gameActive) {
            return;
        }

        if (board[index] !== "") {
            return;
        }

        if (modeSelect.value === "ai" && currentPlayer === "O") {
            return;
        }

        makeMove(index, currentPlayer);

    });

});


// ===============================
// MAKE MOVE
// ===============================

function makeMove(index, player) {

    board[index] = player;

    cells[index].textContent = player;

    cells[index].classList.add(player.toLowerCase());

    const result = checkWinner();

    if (result) {
        endGame(result);
        return;
    }

    switchPlayer();

}


// ===============================
// CHECK WINNER
// ===============================

function checkWinner() {

    for (let pattern of winningPatterns) {

        const a = board[pattern[0]];
        const b = board[pattern[1]];
        const c = board[pattern[2]];

        if (
            a !== "" &&
            a === b &&
            b === c
        ) {

            return {
                player: a,
                pattern: pattern
            };

        }

    }


    if (!board.includes("")) {

        return {
            player: "draw",
            pattern: []
        };

    }

    return null;

}


// ===============================
// END GAME
// ===============================

function endGame(result) {

    gameActive = false;

    stopTimer();


    if (result.player === "draw") {

        scoreDraw++;

        scoreDrawText.textContent = scoreDraw;

        statusText.textContent = "It's a Draw!";

        return;

    }


    const winner = result.player;

    if (winner === "X") {

        scoreX++;

        scoreXText.textContent = scoreX;

    } else {

        scoreO++;

        scoreOText.textContent = scoreO;

    }


    statusText.textContent =
        "Player " + winner + " Wins!";


    // Highlight winning cells

    result.pattern.forEach(function(index) {

        cells[index].classList.add("winner");

    });

}


// ===============================
// SWITCH PLAYER
// ===============================

function switchPlayer() {

    if (currentPlayer === "X") {

        currentPlayer = "O";

    } else {

        currentPlayer = "X";

    }


    if (
        modeSelect.value === "ai" &&
        currentPlayer === "O"
    ) {

        statusText.textContent = "Computer's Turn";

        stopTimer();

        setTimeout(function() {

            computerMove();

        }, 600);

    } else {

        statusText.textContent =
            "Player " + currentPlayer + "'s Turn";

        startTimer();

    }

}


// ===============================
// COMPUTER MOVE
// ===============================

function computerMove() {

    if (!gameActive) {
        return;
    }


    let index;


    if (difficultySelect.value === "easy") {

        index = getRandomMove();

    }

    else if (difficultySelect.value === "medium") {

        index = getMediumMove();

    }

    else {

        index = getBestMove();

    }


    if (index !== -1) {

        makeMove(index, "O");

    }

}


// ===============================
// RANDOM MOVE
// ===============================

function getRandomMove() {

    const emptyCells = [];

    for (let i = 0; i < board.length; i++) {

        if (board[i] === "") {

            emptyCells.push(i);

        }

    }


    if (emptyCells.length === 0) {

        return -1;

    }


    const random =
        Math.floor(Math.random() * emptyCells.length);

    return emptyCells[random];

}


// ===============================
// MEDIUM AI
// ===============================

function getMediumMove() {

    // First try to win

    for (let i = 0; i < board.length; i++) {

        if (board[i] === "") {

            board[i] = "O";

            if (checkWinner()) {

                board[i] = "";

                return i;

            }

            board[i] = "";

        }

    }


    // Then block X

    for (let i = 0; i < board.length; i++) {

        if (board[i] === "") {

            board[i] = "X";

            if (checkWinner()) {

                board[i] = "";

                return i;

            }

            board[i] = "";

        }

    }


    // Otherwise random

    return getRandomMove();

}


// ===============================
// HARD AI
// ===============================

function getBestMove() {

    let bestScore = -Infinity;

    let bestMove = -1;


    for (let i = 0; i < board.length; i++) {

        if (board[i] === "") {

            board[i] = "O";

            let score = minimax(board, false);

            board[i] = "";


            if (score > bestScore) {

                bestScore = score;

                bestMove = i;

            }

        }

    }


    return bestMove;

}


// ===============================
// MINIMAX
// ===============================

function minimax(boardState, isMaximizing) {

    const result = evaluateBoard(boardState);


    if (result !== null) {

        return result;

    }


    if (isMaximizing) {

        let bestScore = -Infinity;


        for (let i = 0; i < boardState.length; i++) {

            if (boardState[i] === "") {

                boardState[i] = "O";

                let score =
                    minimax(boardState, false);

                boardState[i] = "";

                bestScore = Math.max(bestScore, score);

            }

        }


        return bestScore;

    }


    else {

        let bestScore = Infinity;


        for (let i = 0; i < boardState.length; i++) {

            if (boardState[i] === "") {

                boardState[i] = "X";

                let score =
                    minimax(boardState, true);

                boardState[i] = "";

                bestScore = Math.min(bestScore, score);

            }

        }


        return bestScore;

    }

}


// ===============================
// EVALUATE BOARD FOR AI
// ===============================

function evaluateBoard(boardState) {

    for (let pattern of winningPatterns) {

        const a = boardState[pattern[0]];
        const b = boardState[pattern[1]];
        const c = boardState[pattern[2]];


        if (
            a !== "" &&
            a === b &&
            b === c
        ) {

            if (a === "O") {
                return 10;
            }

            if (a === "X") {
                return -10;
            }

        }

    }


    if (!boardState.includes("")) {

        return 0;

    }


    return null;

}


// ===============================
// NEW ROUND
// ===============================

newRoundButton.addEventListener("click", function() {

    startNewRound();

});


function startNewRound() {

    board = ["", "", "", "", "", "", "", "", ""];

    currentPlayer = "X";

    gameActive = true;


    cells.forEach(function(cell) {

        cell.textContent = "";

        cell.classList.remove("x");

        cell.classList.remove("o");

        cell.classList.remove("winner");

    });


    statusText.textContent = "Player X's Turn";

    startTimer();

}


// ===============================
// RESET SCORE
// ===============================

resetScoreButton.addEventListener("click", function() {

    scoreX = 0;

    scoreO = 0;

    scoreDraw = 0;


    scoreXText.textContent = "0";

    scoreOText.textContent = "0";

    scoreDrawText.textContent = "0";


    startNewRound();

});


// ===============================
// TIMER
// ===============================

function startTimer() {

    stopTimer();

    timeLeft = 15;

    timerText.textContent = timeLeft;


    timer = setInterval(function() {

        timeLeft--;

        timerText.textContent = timeLeft;


        if (timeLeft <= 0) {

            stopTimer();

            switchPlayer();

        }

    }, 1000);

}


function stopTimer() {

    clearInterval(timer);

}


// ===============================
// GAME MODE
// ===============================

modeSelect.addEventListener("change", function() {

    if (modeSelect.value === "ai") {

        difficultyBox.style.display = "block";

        playerOLabel.textContent = "COMPUTER";

    }

    else {

        difficultyBox.style.display = "block";

        playerOLabel.textContent = "PLAYER O";

    }


    startNewRound();

});


// ===============================
// DARK / LIGHT MODE
// ===============================

themeButton.addEventListener("click", function() {

    document.body.classList.toggle("dark");


    if (document.body.classList.contains("dark")) {

        themeButton.textContent = "☀️";

    }

    else {

        themeButton.textContent = "🌙";

    }

});


// Start game

startNewRound();