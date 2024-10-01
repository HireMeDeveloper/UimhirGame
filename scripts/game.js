let gameHasStarted = false
let timerStarted = false

let gameState = {
    games: [

    ],
    wasStarted: false,
    currentGame: 0,
    isComplete: false
}

let cumulativeData = []

const FLIP_ANIMATION_DURATION = 500
const DANCE_ANIMATION_DURATION = 500

const keyboard = document.querySelector("[data-keyboard]")

const gameText = document.querySelector("[data-game-text]")
const gameLettersText = document.querySelector("[data-game-letters]")
const answerElement = document.querySelector("[data-answer-element]")
const answerText = document.querySelector("[data-answer-text]")
const canvas = document.getElementById('circleCanvas');

let currentTimerTime = 0
let currentTimerMax = 0

function loadGame() {
    
}

function resetGameState() {
    gameState = {
        games: [
            {
                wasStarted: false
            },
            {
                wasStarted: false
            },
            {
                wasStarted: false
            }
        ],
        currentGame: 0,
        isComplete: false
    }

    storeGameStateData()
}

function openGame() {
    if (gameState.isComplete) {
        loadPuzzleFromState(gameState.currentGame)
    }

    if (gameState.hasOpenedPuzzle === false) {
        startTimer()
        fireEvent("start-first-game")
        gameState.hasOpenedPuzzle = true;
        storeGameStateData()
    } else {
        unpauseTimer()
    }

    if (gameHasStarted) return
    gameHasStarted = true;
}

function startTimer() {
    if (timerStarted) return

    startInteraction()

    timerStarted = true
    let timerDuration = getTimerDuration(7)
    updateTimer(timerDuration, timerDuration)

    updateCumulativeData()
}

function getTimerDuration(wordSize) {
    console.log("Requested a timer from word size: " + wordSize)
    if (wordSize > 9) wordSize = 9;
    return ((30 + (10 * (wordSize - 7))) * 100);
}

function stopTimer() {
    timerStarted = false
}

function pauseTimer() {
    timerStarted = false
}

function unpauseTimer() {
    if (currentTimerTime === 0) return;
    timerStarted = true

    updateTimer(currentTimerTime, currentTimerMax)
}

function updateTimer(totalHundredths, maxTime) {
    if (timerStarted === false) return;

    currentTimerTime = totalHundredths
    currentTimerMax = maxTime

    let seconds = Math.floor(totalHundredths / 100);
    let hundredths = totalHundredths % 100;
    let formattedHundreds = (hundredths < 10) ? ((hundredths === 0) ? '00' : '0' + hundredths) : hundredths
    let formattedTime = `00:${(seconds < 10) ? '0' + seconds : seconds}`;

    drawCircle(totalHundredths / maxTime, formattedTime)

    //let timerText = document.querySelector('.text-timer')
    //timerText.textContent = formattedTime

    if (totalHundredths > 0) {
        setTimeout(() => {
            updateTimer(totalHundredths - 1, maxTime)
        }, 10)
    } else {
        timerEnd()
    }
}

function timerEnd() {
    timerStarted = false

    updateTimerDisplay(false)
}

function updateTimerDisplay(hasWon) {
    if (hasWon) {
        canvas.classList.remove('no-display')
        answerElement.classList.add('no-display')

        drawWinCircle()
    } else {
        canvas.classList.add('no-display')
        answerElement.classList.remove('no-display')

        answerText.textContent = currentSolution
    }
}

function enableTimerDisplay() {
    canvas.classList.remove('no-display')
    answerElement.classList.add('no-display')
}

function updateCumulativeData() {
    let games = 0;
    let wins = 0;

    gameState.games.forEach(game => {
        if (game.wasStarted) games += 1;
        if (game.isWin) wins += 1;
    })

    let hasEntry = cumulativeDataHasEntry(gameState.gameNumber)
    console.log("Has entry: " + hasEntry)

    if (hasEntry === false) {
        console.log("Pushing in new entry");

        cumulativeData.push({
            number: gameState.gameNumber,
            games: games,
            wins: wins
        })

        storeCumulativeData()
    } else {
        console.log("Updating old entry");

        let entryIndex = getCumulativeDataEntryIndex(gameState.gameNumber);

        cumulativeData[entryIndex] = {
            number: gameState.gameNumber,
            games: games,
            wins: wins
        }

        storeCumulativeData()
    }
}

function cumulativeDataHasEntry(gameNumber) {
    return cumulativeData.some(entry => {
        if (entry.number === gameNumber) {
            console.log("Found an equal number")
            return true;
        } else {
            console.log("Found no equal number")
            return false;
        }
    })
}

function getCumulativeDataEntryIndex(gameNumber) {
    const index = cumulativeData.findIndex(entry => entry.number === gameNumber);
    return index !== -1 ? index : null;
}

function loadPuzzleFromState(index) {
    loadPuzzle(index)
    if (gameState.currentGame >= 2) {
        gameState.isComplete = true;
        storeGameStateData()
    } 

    let currentGame = gameState.games[gameState.currentGame]

    if (currentGame.isWin) {
        currentGuess = currentGame.solution.split('')
        checkGuess()
    } else {
        timerEnd()
    }

}

function loadPuzzle(index) {
    const activeGame = gameState.games[index]
    gameState.currentGame = index
    storeGameStateData()

    currentPuzzle = activeGame.puzzle;
    currentSolution = activeGame.solution

    updateGameText()
}

function getAllInputKeys() {
    return keyboard.querySelectorAll('*');
}

function handleKeyPress(e) {
    if (canInteract) {
        if (e.key === "Delete") {
            return
        }

        if (e.key === "Backspace") {
            return
        }
    } else {
        if (e.key === "Enter" && gameState.currentGame < 2) {
            playNext()
        }
    }
}

function pressButton(key) {
    if (canInteract === false) return;
}

function checkGuess() {
    console.log("guess was: " + currentGuess)

    if (currentGuess.join('').toLowerCase() === currentSolution.toLowerCase()) {
        win()
    } else {
        shakeKeys(currentKeys)
    }
}

function win() {
    
}

function shakeKeys(keys) {
    const inputKeys = getAllInputKeys()

    keys.forEach((key, i) => {
        key.classList.add("shake")
        key.addEventListener("animationend", () => {
            key.classList.remove("shake")
        }, { once: true })
    });
}

function clearGuess() {
    
}

function resetGuess() {
    
}

function playNext() {
    clearAlerts()
    resetGuess()

    enableTimerDisplay()

    const currentGameNumber = gameState.currentGame
    loadPuzzle(currentGameNumber + 1)
    timerStarted = false;
    
    startTimer()
}

function updateGameText() {
    gameText.textContent = "Game" 
    gameLettersText.textContent = (gameState.currentGame + 1) + " of 3"
}