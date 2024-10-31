let gameHasStarted = false
let timerStarted = false

let footerVisible = false

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
            distance: null,
            wasStarted: false
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
            distance: null,
            wasStarted: false
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
            distance: null,
            wasStarted: false
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

const keyboard = document.querySelector("[data-keyboard]")
const targetElement = document.querySelector("[data-target]")
const answerTextElement = document.querySelector("[data-answer]")
const sums = document.querySelector("[data-sums]")
const nextButton = document.querySelector("[data-next]")

const gameText = document.querySelector("[data-game-text]")
const gameLettersText = document.querySelector("[data-game-letters]")
const answerElement = document.querySelector("[data-answer-element]")
const canvas = document.getElementById('circleCanvas');
const solutionSumParent = document.querySelector('[data-solution-sums]')
const solutionText = document.querySelector('[data-solution-text]')

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
                distance: null,
                wasStarted: false
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
                distance: null,
                wasStarted: false
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
                distance: null,
                wasStarted: false
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
        fireEvent("onGameStart")
        gameState.hasOpenedPuzzle = true;
        storeGameStateData()
    } else {
        unpauseTimer()
    }

    if (gameHasStarted) return
    gameHasStarted = true;
}

function startTimer() {
    //console.log("Start Timer")

    if (timerStarted) return

    startInteraction()

    timerStarted = true
    let timerDuration = getTimerDuration(45)
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
    if (activeGame.isComplete == true) return;
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
    }
}

function enableTimerDisplay() {
    canvas.classList.remove('no-display')
    answerElement.classList.add('no-display')
}

function cumulativeDataHasEntry(gameNumber) {
    return cumulativeData.some(entry => {
        if (entry.number === gameNumber) {
            //console.log("Found an equal number")
            return true;
        } else {
            //console.log("Found no equal number")
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
    updateTimerDisplay(parseFloat(currentGame.distance) == 0)

    applyButtonsPressedForCurrentPuzzle()
    restoreOperationButtons()

    removeAllFlip()

    showNext()
}

function removeAllFlip() {
    const mediumKeys = keyboard.querySelectorAll('.key.medium');
    const extraNumbers = activeGame.extraNumbers;

    mediumKeys.forEach((key, i) => {
        if (extraNumbers.length > i) {
            key.classList.add('grey')
            key.textContent = extraNumbers[i]
            key.style.fontSize = getFontSizeFromDigits(extraNumbers[i].toString().length)

            console.log("FOUND A EXTRA AT INDEX: " + i)

            key.onclick = function () {
                pressNumber(this);
            }
        } else if (i < 4) {
            key.classList.remove('grey');
            key.classList.remove('flip');
            key.classList.add('white');

            key.textContent = "";
            key.onclick = null;
        }
    })
}

async function loadPuzzle(index) {
    activeGame = gameState.games[index]
    gameState.currentGame = index
    storeGameStateData()

    if (activeGame.wasStarted === false) {
        activeGame.wasStarted = true;
        storeGameStateData()
    }

    updateExtraButtons()
    updateSums()

    calculateSolution(activeGame.numbers)

    if (activeGame.isComplete === false) answerTextElement.classList.remove('win')

    // Load in target number
    //console.log("First: " + activeGame.numbers[0])
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

async function calculateSolution(numbers) {
    const solutionSums = solutionSumParent.querySelectorAll('.sum')
    findClosestSolution(numbers).then((solution) => {
        solutionSums.forEach((sum, i) => {
            if (solution.sums.length > i) {
                const currentSum = solution.sums[i]

                sum.textContent = currentSum[0] + " " + currentSum[1] + " " + currentSum[2] + " " + currentSum[3] + " " + currentSum[4]
            } else {
                sum.textContent = ""
            }
        })

        solutionText.textContent = (solution.closestSolution === solution.target) ? "Exact Solution" : "Closest Solution"

        updateSolutionHeaderText()
    })
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
    return [firstRandomNumber, ...selectedLargeNumbers, ...selectedSmallNumbers].sort((a, b) => b - a);
}

function resetExtraButtons() {
    const mediumKeys = keyboard.querySelectorAll('.key.medium');
    mediumKeys.forEach((key, i) => {
        if (i < 4) {
            key.classList.remove('grey');
            key.classList.add('white');

            key.textContent = "";
            key.onclick = null;
        }
    })
}

function updateExtraButtons() {
    // Update the 4 medium keys
    const mediumKeys = keyboard.querySelectorAll('.key.medium');
    const extraNumbers = activeGame.extraNumbers;

    mediumKeys.forEach((key, i) => {
        if (extraNumbers.length > i && i < 4) {
            if (key.classList.contains('white')) {
                flipKey(key, extraNumbers[i])
            } else {
                key.classList.add('grey')
                key.textContent = extraNumbers[i]
                //console.log("Extra numbers of i: " + extraNumbers[i])
                key.style.fontSize = getFontSizeFromDigits(extraNumbers[i].toString().length)

                key.onclick = function () {
                    pressNumber(this);
                }
            }
        } else if (i < 4) {
            key.classList.remove('grey');
            key.classList.remove('flip');
            key.classList.add('white');

            key.textContent = "";
            key.onclick = null;
        } else {
            key.onclick = function () {
                pressOperation(this)
            }
        }
    })
}

function getFontSizeFromDigits(digits) {
    if (digits <= 3) {
        //console.log(digits + " Getting font size: 1em")
        return "1em";
    } else if (digits < 9) {
        let size = (digits - 3) * 0.08;
        //console.log(digits + " Getting font size: " + (1 - size) + "em")
        return (1 - size) + "em";
    } else {
        //console.log(digits + " Getting font size: 0.4em")
        return "0.52em";
    }
}

function updateSums() {
    const sumsArray = sums.querySelectorAll('.sum');

    sumsArray.forEach((sum, i) => {
        let sumNumberElement = sum.querySelector('.sum-number')
        let sumTextElement = sum.querySelector('.sum-text')

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

                //console.log("i: " + i + " length - 1: " + (sumsArray.length - 1))

                if (i === activeGame.sums.length - 1) {
                    completeSum()
                }
            }
                
            sumTextElement.textContent = sumText;
            sumNumberElement.classList.add('green')

            sumTextElement.classList.remove('hidden')
        } else {
            sumNumberElement.classList.remove('green')
            sumTextElement.classList.add('hidden')
        }
    })

    updateCurrentAnswer()
    updateSolutionHeaderText()
}

function updateCurrentAnswer() {
    let answerText = "N/A";

    if (activeGame.sums.length < 2) {
        answerTextElement.classList.add('hidden')
    } else {
        const lastLastSum = activeGame.sums[activeGame.sums.length - 2]
        answerText = lastLastSum[4];
        answerTextElement.classList.remove('hidden')
    }

    answerTextElement.textContent = answerText
    activeGame.currentAnswer = (answerText != "N/A") ? answerText : null;
    storeGameStateData()

    checkCurrentAnswer()
}

function updateSolutionHeaderText() {
    var solutionInfo = solutionText.textContent

    var distance = activeGame.distance;
    if (distance === null) distance = 11;
    console.log("Distance was: " + distance)

    if (distance === 0) {

    } else if (distance <= 3) {
        solutionInfo = "So close!! Here is the solution"
    } else if (distance <= 10) {
        solutionInfo = "Not bad. Here is the solution"
    } else {
        solutionInfo = "The numbers didn't suit you! Solution below"
    }

    solutionText.textContent = solutionInfo
}

function checkCurrentAnswer() {
    const currentAnswer = activeGame.currentAnswer
    if (currentAnswer === null) {
        console.log("Current Answer was null: " + currentAnswer)
        activeGame.distance = null;
        storeGameStateData()
        updateCumulativeData()
        return;
    }

    const currentTarget = activeGame.numbers[0]
    const difference = Math.abs(parseFloat(currentTarget) - parseFloat(currentAnswer))
    console.log("Current answer of: " + currentAnswer + " with target of: " + currentTarget + " resulted in distance of: " + difference)

    activeGame.distance = difference;
    storeGameStateData()
    updateCumulativeData()

    if (difference === 0) {
        win()
    } 
}

function win() {
    stopTimer()
    drawWinCircle()

    answerTextElement.classList.add('win')

    activeGame.isComplete = true
    storeGameStateData()

    stopInteraction()
}

function completeGame() {
    
}

function findSolution() {
    
}

function updateCumulativeData() {
    let distances = [];
    let grade = "N/A";

    gameState.games.forEach(game => {
        if (game.wasStarted) {
            console.log("Distance was: " + game.distance)
            distances.push(game.distance)
        }
    })

    if (distances.length > 0) {
        const evaluatedDistances = evaluateDistances(distances)
        grade = getGrade(
            distances.length,
            evaluatedDistances.zeros,
            evaluatedDistances.threes,
            evaluatedDistances.fours,
            evaluatedDistances.tens
        )
    }

    let hasEntry = cumulativeDataHasEntry(gameState.puzzleNumber)

    if (hasEntry === false) {
        console.log("Pushing in new entry");

        cumulativeData.push({
            number: gameState.puzzleNumber,
            distances: distances,
            grade: grade
        })

        storeCumulativeData()
    } else {
        console.log("Updating old entry");

        let entryIndex = getCumulativeDataEntryIndex(gameState.puzzleNumber);

        cumulativeData[entryIndex] = {
            number: gameState.puzzleNumber,
            distances: distances,
            grade: grade
        }

        storeCumulativeData()
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
    } else if (operation === "x") {
        result = number1 * number2;
    } else if (operation === "÷") {
        result = number1 / number2;
    }

    return (Number.isInteger(result)) ? result : parseFloat(result.toFixed(2));
}

function handleKeyPress(e) {
    if (e.key === "t" || e.key === "T") {
        //setFooterVisible(!footerVisible);
        return
    }

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
    if (canInteract === false) return

    // Remove the last sum
    const lastSum = activeGame.sums[activeGame.sums.length - 1]
    if (lastSum.length === 0) {
        let key = document.querySelector('[data-backspace]')
        shakeKey(key)
        return;
    }
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

    if (expectedInput != "number" || activeGame.sums.length >= 6) {
        shakeKey(key)
        return;
    } 

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
        pressEquals();
    }
}

function pressOperation(key) {
    if (canInteract === false) return;
    //console.log("expectedInput: " + expectedInput);

    const lastSum = activeGame.sums[activeGame.sums.length - 1]

    if (expectedInput == "number" && lastSum.length > 1) {
        pressBackspace();
        pressOperation(key)
        return
    }

    if (expectedInput != "operation") {
        shakeKey(key)
        return;
    }

    if (key.classList.contains('green')) return;
    key.classList.add('green');

    buttonsPressed.push(key)
    updateButtonsPressedForCurrentPuzzle()

    lastSum.push(key.textContent)
    storeGameStateData()
    updateSums()

    expectedInput = "number"
}

function pressEquals() {
    if (canInteract === false) return;
    if (expectedInput != "equals") {
        let key = document.querySelector('[data-equals]')
        shakeKey(key)
        return;
    }

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

    restoreOperationButtons()

    activeGame.sums.push([])
    storeGameStateData()
}

function restoreOperationButtons() {
    const keys = keyboard.querySelectorAll('.key');

    keys.forEach(key => {
        if (key.textContent === '+' || key.textContent === '-' || key.textContent === '÷' || key.textContent === 'x') {
            key.classList.remove('green')
        } 
    })
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
        if (activeGame.sums.length <= 1) {
            let key = document.querySelector('[data-clear]')
            shakeKey(key)
            return;
        }
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

function playNext() {
    enableTimerDisplay()

    resetButtons()
    resetExtraButtons()

    const currentGameNumber = gameState.currentGame
    loadPuzzle(currentGameNumber + 1)
    timerStarted = false;
    
    startTimer()
}

function showNext() {
    console.log("Showing Next")

    if (gameState.currentGame < 2) {
        console.log("Less than 3")
        nextButton.textContent = "Play Next"
        nextButton.onclick = function () {
            playNext()
            fireEvent("playNextGame")
        }
    } else {
        console.log("More than 3")
        nextButton.textContent = "See Stats"
        nextButton.onclick = function () {
            showPage("stats")
            fireEvent("gameThreeToStats")
        }

        if (gameState.isComplete === false) {
            fireEvent("onFirstCompletion")
            gameState.isComplete = true;
            storeGameStateData()
        }
    }

    setFooterVisible(true)
}

function setFooterVisible(isVisible) {
    const mediumKeys = keyboard.querySelectorAll('.key.medium');
    const largeKeys = keyboard.querySelectorAll('.key.large');

    if (isVisible) {
        nextButton.classList.remove("no-display")
        
        mediumKeys.forEach((key, i) => {
            if (i >= 4) {
                key.classList.add('grid-hidden')
            }
        })

        largeKeys.forEach((key, i) => {
            key.classList.add('grid-hidden')
        })
    } else {
        nextButton.classList.add("no-display")

        mediumKeys.forEach((key, i) => {
            if (i >= 4) {
                key.classList.remove('grid-hidden')
            }
        })

        largeKeys.forEach((key, i) => {
            key.classList.remove('grid-hidden')
        })

    }

    footerVisible = isVisible
}



function hideNext() {
    //console.log("hiding next")
    //nextButton.classList.add("no-display")

    setFooterVisible(false)
}

function updateGameText() {
    gameText.textContent = "Game " + (gameState.currentGame + 1) + "/3"
    //gameLettersText.textContent = (gameState.currentGame + 1) + " of 3"
}

function flipKey(key, newText) {
    console.log("flip")

    key.classList.add("flip")

    key.addEventListener("transitionend", () => {
        console.log("transitionend")
        key.classList.remove("flip")
        key.classList.remove('white')
        key.classList.add('grey')

        key.textContent = newText
        key.style.fontSize = getFontSizeFromDigits(newText.toString().length)

        key.onclick = function () {
            pressNumber(this);
        }

        updateExtraButtons()
    }, { once: true })
}

function shakeKey(key) {
    key.classList.add("shake")
    key.addEventListener("animationend", () => {
        key.classList.remove("shake")
    }, { once: true })
}

async function findClosestSolution(numbers) {
    const target = numbers[0]; // The first number is the target
    let candidates = numbers.slice(1); // Remaining 6 numbers
    let closestSolution = null;
    let closestDifference = Infinity;
    let bestSums = [];
    const MAX_SUMS = 4; // Limit to 4 sums

    function applyOperation(a, op, b) {
        let result = null;
        switch (op) {
            case '+':
                result = a + b;
                break;
            case '-':
                result = a - b;
                break;
            case 'x':
                result = a * b;
                break;
            case '÷':
                result = (b !== 0) ? a / b : null;
                break;
            default:
                result = null;
        }

        if (result === null) return null;
        return (Number.isInteger(result)) ? result : parseFloat(result).toFixed(2);
    }

    function calculateSums(nums, history = [], depth = 0, results = []) {
        // If we've reached the maximum number of sums, stop recursion
        if (depth >= MAX_SUMS) {
            if (nums.length === 1) {
                let result = nums[0];
                let diff = Math.abs(result - target);
                if (diff < closestDifference) {
                    closestDifference = diff;
                    closestSolution = result;
                    bestSums = history;
                }
            }
            return;
        }

        // Try every pair of numbers with every operation
        for (let i = 0; i < nums.length; i++) {
            for (let j = i + 1; j < nums.length; j++) {
                let num1 = nums[i], num2 = nums[j];

                // Remove num1 and num2 from nums for the recursive call
                let remaining = nums.filter((_, idx) => idx !== i && idx !== j);

                ['+', '-', 'x', '÷'].forEach(op => {
                    let result = applyOperation(num1, op, num2);
                    if (result === null) return; // Skip invalid operations (e.g., division by zero)

                    let newHistory = [...history, [num1, op, num2, '=', result]];

                    // Compare current result with closestDifference
                    let diff = Math.abs(result - target);
                    if (diff < closestDifference) {
                        closestDifference = diff;
                        closestSolution = result;
                        bestSums = newHistory;
                    }

                    // Recur with the result added as a new number, and increase depth
                    calculateSums([result, ...remaining], newHistory, depth + 1, [...results, result]);

                    // Recur ignoring the result, keeping the unused numbers, but also increasing depth
                    calculateSums(remaining, history, depth + 1, results);
                });
            }
        }

        // Also consider previously generated results at the current depth
        for (let res of results) {
            calculateSums([res, ...nums], history, depth + 1, results);
        }
    }

    // Start the recursive search
    calculateSums(candidates);

    // Filter for only the valid sums
    bestSums = bestSums.filter(([, , , , result]) =>
        result === closestSolution || bestSums.some((sum) => sum[0] === result || sum[2] === result)
    );

    // Return the closest solution and the steps (sums)
    return {
        closestSolution: closestSolution,
        sums: bestSums,
        target: target
    };
}