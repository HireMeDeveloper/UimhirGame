let gameHasStarted = false
let timerStarted = false

let currentTarget
let activeGame

let expectedInput = "number" // number, operation, equals
let buttonsPressed = []

let gameState = {
    games: [
        {
            largeNumbers: 2,
            currentAnswer: null,
            numbers: [],
            extraNumbers: [],
            sums: [
                []
            ],
            buttonsPressed: [],
            isComplete: false,
            distance: null
        },
        {
            largeNumbers: 3,
            currentAnswer: null,
            numbers: [],
            extraNumbers: [],
            sums: [
                []
            ],
            buttonsPressed: [],
            isComplete: false,
            distance: null
        },
        {
            largeNumbers: 1,
            currentAnswer: null,
            numbers: [],
            extraNumbers: [],
            sums: [
                []
            ],
            buttonsPressed: [],
            isComplete: false,
            distance: null
        }
    ],
    puzzleNumber: 0,
    hasOpenedPuzzle: false,
    wasStarted: false,
    currentGame: 0,
    isComplete: false
}

let cumulativeData = []

const FLIP_ANIMATION_DURATION = 500
const DANCE_ANIMATION_DURATION = 500

const keyboard = document.querySelector("[data-keyboard]")
const targetElement = document.querySelector("[data-target]")
const answerTextElement = document.querySelector("[data-answer]")
const sums = document.querySelector("[data-sums]")
const nextButton = document.querySelector("[data-next]")

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
                largeNumbers: 2,
                currentAnswer: null,
                numbers: generateNumbers(2),
                extraNumbers: [],
                sums: [
                    []
                ],
                buttonsPressed: [],
                isComplete: false,
                distance: null
            },
            {
                largeNumbers: 3,
                currentAnswer: null,
                numbers: generateNumbers(3),
                extraNumbers: [],
                sums: [
                    []
                ],
                buttonsPressed: [],
                isComplete: false,
                distance: null
            },
            {
                largeNumbers: 1,
                currentAnswer: null,
                numbers: generateNumbers(1),
                extraNumbers: [],
                sums: [
                    []
                ],
                buttonsPressed: [],
                isComplete: false,
                distance: null
            }
        ],
        puzzleNumber: targetGameNumber,
        hasOpenedPuzzle: false,
        wasStarted: false,
        currentGame: 0,
        isComplete: false
    }

    storeGameStateData()
}

function openGame() {
    if (gameState.isComplete) {
        loadPuzzleFromState(gameState.currentGame)
    } else {
        loadPuzzle(gameState.currentGame)
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
console.log("Start Timer")

    if (timerStarted) return

    startInteraction()

    timerStarted = true
    let timerDuration = getTimerDuration(40)
    updateTimer(timerDuration, timerDuration)

    updateCumulativeData()
}

function getTimerDuration(seconds) {
    return seconds * 100;
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

    drawGameCircle(totalHundredths / maxTime, formattedTime)

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

    stopInteraction()
    activeGame.isComplete = true;
    storeGameStateData()

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

        //answerText.textContent = currentSolution
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

function updateButtonsPressedForCurrentPuzzle() {
    const keys = keyboard.querySelectorAll('.key');
    let buttonsPressed = []

    keys.forEach((key, i)=> {
        if (key.classList.contains('green')) {
            buttonsPressed.push(i)
        }
    })

    activeGame.buttonsPressed = buttonsPressed;
    storeGameStateData()
}

function applyButtonsPressedForCurrentPuzzle() {
    const keys = keyboard.querySelectorAll('.key');

    keys.forEach((key, i) => {
        if (activeGame.buttonsPressed.includes(i)) {
            key.classList.add('green')
        }
    })
}

function loadPuzzleFromState(index) {
    loadPuzzle(index)
    if (gameState.currentGame >= 2) {
        gameState.isComplete = true;
        storeGameStateData()
    } 

    let currentGame = gameState.games[gameState.currentGame]

    applyButtonsPressedForCurrentPuzzle()

    if (currentGame.isWin) {
        currentGuess = currentGame.solution.split('')
        checkGuess()
    } else {
        timerEnd()
    }
}

function loadPuzzle(index) {
    activeGame = gameState.games[index]
    gameState.currentGame = index
    storeGameStateData()

    updateExtraButtons()
    updateSums()

    // Load in target number
    console.log("First: " + activeGame.numbers[0])
    currentTarget = activeGame.numbers[0]
    targetElement.textContent = currentTarget

    // Load in 6 main buttons
    const smallKeys = keyboard.querySelectorAll('.key.small');
    smallKeys.forEach((key, i) => {
        key.textContent = activeGame.numbers[i + 1]

        key.onclick = function () {
            pressNumber(this);
        }
    })

    updateGameText()
}

function generateNumbers(large) {
    // Arrays of large and small numbers
    const largeNumbers = [25, 50, 75, 100];
    const smallNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Shuffle an array (Fisher-Yates shuffle algorithm)
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
        return array;
    }

    // Generate a random number between 100 and 999
    const firstRandomNumber = Math.floor(Math.random() * 900) + 100;

    // Shuffle large and small numbers
    const shuffledLargeNumbers = shuffle([...largeNumbers]);
    const shuffledSmallNumbers = shuffle([...smallNumbers]);

    // Get the required amount of large numbers and the remaining small numbers
    const selectedLargeNumbers = shuffledLargeNumbers.slice(0, large);
    const selectedSmallNumbers = shuffledSmallNumbers.slice(0, 6 - large);

    // Combine the random number, large and small numbers
    return [firstRandomNumber, ...selectedLargeNumbers, ...selectedSmallNumbers];
}

function updateExtraButtons() {
    // Update the 4 medium keys
    const smallKeys = keyboard.querySelectorAll('.key.medium');
    const extraNumbers = activeGame.extraNumbers;

    smallKeys.forEach((key, i) => {
        if (extraNumbers.length > i) {
            key.classList.remove('grey')
            key.classList.add('white')

            key.textContent = extraNumbers[i]

            key.onclick = function () {
                pressNumber(this);
            }
        } else if (i < 4) {
            key.classList.remove('white');
            key.classList.add('grey');

            key.textContent = "";
            key.onclick = null;
        } else {
            key.onclick = function () {
                pressOperation(this)
            }
        }
    })

    extraNumbers.forEach((number, i) => {
        const key = smallKeys[i]
        key.textContent = number
    })
    
}

function updateSums() {
    const sumsArray = sums.querySelectorAll('div');

    sumsArray.forEach((sum, i) => {
        if (activeGame.sums.length > i) {
            let currentSum = activeGame.sums[i]
            let sumText = ""

            if (currentSum[0] != null) sumText += (currentSum[0] + "    ");
            if (currentSum[1] != null) sumText += (currentSum[1] + "    ");
            if (currentSum[2] != null) sumText += (currentSum[2] + "    ");
            if (currentSum[4] != null) {
                sumText += "=    " + currentSum[4];
            } else if (currentSum[3] != null) {
                let result = calculateResult(currentSum[0], currentSum[1], currentSum[2])
                sumText += "=    " + result;

                currentSum.push(result)
                storeGameStateData()

                console.log("i: " + i + " length - 1: " + (sumsArray.length - 1))

                if (i === activeGame.sums.length - 1) {
                    completeSum()
                } 
            }
                
            sum.textContent = sumText;
            sum.classList.remove('hidden')
        } else {
            sum.textContent = "YOU CANT SEE THIS"
            sum.classList.add('hidden')
        }
    })

    updateCurrentAnswer()
}

function updateCurrentAnswer() {
    if (activeGame.sums.length < 2) {
        answerTextElement.textContent = "";
        answerTextElement.style.setProperty('--color', 'grey')
    } else {
        const lastLastSum = activeGame.sums[activeGame.sums.length - 2]

        answerTextElement.textContent = lastLastSum[4];
        answerTextElement.style.setProperty('--color', 'orange')
    }
}

function calculateResult(number1, operation, number2) {
    number1 = parseFloat(number1);
    number2 = parseFloat(number2);

    let result = null
    
    if (operation === "+") {
        result = (number1 + number2);
    } else if (operation === "-") {
        result = number1 - number2;
    } else if (operation === "*") {
        result = number1 * number2;
    } else if (operation === "/") {
        result = number1 / number2;
    }

    return (Number.isInteger(result)) ? result : result.toFixed(2);
}


function handleKeyPress(e) {
    if (canInteract) {
        if (e.key === "Delete") {
            pressClear()
            return
        }

        if (e.key === "Backspace") {
            pressBackspace()
            return
        }
    } else {
        if (e.key === "Enter" && gameState.currentGame < 2) {
            playNext()
        }
    }
}

function pressBackspace() {
    // Remove the last sum
    const lastSum = activeGame.sums[activeGame.sums.length - 1]
    if (lastSum.length === 0) return;
    else if (lastSum.length <= 3) {
        // Free up the last button
        let button = buttonsPressed.pop()
        button.classList.remove('green')

        updateButtonsPressedForCurrentPuzzle()

        expectedInput = (lastSum.length === 2) ? "operation" : "number"

        lastSum.pop()
        updateSums()
    } else {
        return;
    }

}

function pressNumber(key) {
    if (canInteract === false) return;
    console.log("expectedInput: " + expectedInput);

    if (expectedInput != "number") return;

    if (key.classList.contains('green')) return;
    key.classList.add('green');

    buttonsPressed.push(key)
    updateButtonsPressedForCurrentPuzzle()

    const lastSum = activeGame.sums[activeGame.sums.length - 1]

    lastSum.push(key.textContent)
    storeGameStateData()
    updateSums()

    if (lastSum.length === 1) {
        expectedInput = "operation"
    } else {
        expectedInput = "equals"
    }
}

function pressOperation(key) {
    if (canInteract === false) return;
    console.log("expectedInput: " + expectedInput);

    if (expectedInput != "operation") return;

    if (key.classList.contains('green')) return;
    key.classList.add('green');

    buttonsPressed.push(key)
    updateButtonsPressedForCurrentPuzzle()

    const lastSum = activeGame.sums[activeGame.sums.length - 1]

    lastSum.push(key.textContent)
    storeGameStateData()
    updateSums()

    expectedInput = "number"
}

function pressEquals() {
    if (canInteract === false) return;
    if (expectedInput != "equals") return;

    const lastSum = activeGame.sums[activeGame.sums.length - 1]

    lastSum.push('=')
    storeGameStateData()
    updateSums()

    expectedInput = "number"
}

function completeSum() {
    const lastSum = activeGame.sums[activeGame.sums.length - 1]
    activeGame.extraNumbers.push(lastSum[4])
    storeGameStateData()

    updateExtraButtons();

    activeGame.sums.push([])
    storeGameStateData()
}

function resetButtons() {
    const keys = keyboard.querySelectorAll('.key');

    keys.forEach(key => {
        if (key.classList.contains('green')) {
            key.classList.remove('green')
        }
    })

    expectedInput = "number"
}

function pressClear() {
    if (canInteract === false) return;
    expectedInput = "number"

    let lastSumIndex = activeGame.sums.length - 1
    let lastSum = activeGame.sums[lastSumIndex]

    if (lastSum.length === 0) {
        if (activeGame.sums.length <= 1) return;
        activeGame.sums.pop();
    }

    lastSumIndex = activeGame.sums.length - 1
    lastSum = activeGame.sums[lastSumIndex]

    if (lastSum.length === 5) {
        activeGame.extraNumbers.pop()
        storeGameStateData()
        updateExtraButtons()
    }

    let removedButtons = Math.min(lastSum.length, 3)
    for (let i = 0; i < removedButtons; i++) {
        let button = buttonsPressed.pop()
        updateButtonsPressedForCurrentPuzzle()

        button.classList.remove('green')
    }

    activeGame.sums[lastSumIndex] = []
    storeGameStateData()
    updateSums()
}

function shakeKeys(keys) {
    //const inputKeys = getAllInputKeys()

    keys.forEach((key, i) => {
        key.classList.add("shake")
        key.addEventListener("animationend", () => {
            key.classList.remove("shake")
        }, { once: true })
    });
}

function playNext() {
    enableTimerDisplay()

    resetButtons()

    const currentGameNumber = gameState.currentGame
    loadPuzzle(currentGameNumber + 1)
    timerStarted = false;
    
    startTimer()
}

function showNext() {
    console.log("showing next")
    nextButton.classList.remove("hidden")
}

function hideNext() {
    console.log("hiding next")
    nextButton.classList.add("hidden")
}

function updateGameText() {
    gameText.textContent = "Game" 
    gameLettersText.textContent = (gameState.currentGame + 1) + " of 3"
}