const DATE_OF_FIRST_PUZZLE = new Date(2024, 6, 25)
const ALLOW_MOBILE_SHARE = true; 

let targetGameNumber = 0

const alertContainer = document.querySelector("[data-alert-container]")
const statsAlertContainer = document.querySelector("[data-stats-alert-container]")
const shareButton = document.querySelector("[data-share-button]")
const playButton = document.querySelector("[data-play-button]")

const firstStatisticGrid = document.querySelector("[data-statistics-first]");
const secondStatisticGrid = document.querySelector("[data-statistics-second]");

let puzzleList = []

let canInteract = false;

window.dataLayer = window.dataLayer || [];

fetchData()

function fetchData() {
    const msOffset = Date.now() - DATE_OF_FIRST_PUZZLE
    const dayOffset = msOffset / 1000 / 60 / 60 / 24
    let targetIndex = Math.floor(dayOffset + 0)
    targetGameNumber = targetIndex + 1

    fetchCumulativeData()
    fetchGameState()
}

function showAlert(message, isWin = false, duration = 1000) {
    if (duration === null) {
        clearAlerts()
    }

    const alert = document.createElement("div")
    alert.textContent = message
    alert.classList.add("alert")
    
    if (isWin) alert.classList.add("win")
    else alert.classList.add("loss")
    
    alertContainer.prepend(alert)
    if (duration == null) return

    setTimeout(() => {
        alert.classList.add("hide")
        alert.addEventListener("transitionend", () => {
            alert.remove()
        })
    }, duration)
}

function clearAlerts() {
    const alerts = document.querySelectorAll('.alert')

    alerts.forEach((alert) => {
        alert.remove()
    })
}

function showShareAlert(message, duration = 1000) {
    clearAlerts()

    const alert = document.createElement("div")
    alert.textContent = message
    alert.classList.add("alert")

    statsAlertContainer.append(alert)

    setTimeout(() => {
        alert.classList.add("hide")
        alert.addEventListener("transitionend", () => {
            alert.remove()
        })
    }, duration)
}

function showPage(pageId, oldPage = null) {
    if (oldPage === null) {
        const page = document.querySelector('.page.active')
        if (page != null) {
            oldPage = page.id
        } else {
            oldPage = "game"
        }
    }

    if (pageId != "welcome" && pageId != "game" && pageId != "info" && pageId != "stats") {
        console.log("Invalid page: " + pageId + ". Openning 'game' page.")
        pageId = "game"
    }

    const pages = document.querySelectorAll('.page')
    pages.forEach(page => {
        page.classList.remove('active')
    })

    document.getElementById(pageId).classList.add('active')
    if (pageId === "game") {
        updateBodyColor(true)
        openGame()
    }
    else if (pageId === "stats") {
        updateBodyColor(false)
        updateAllStats();
        pauseTimer()
    } else if (pageId === "welcome") {
        updateBodyColor(false)
        generateWelcomeMessage()
    } else if (pageId === "info") {
        updateBodyColor(false)
        updateInfoPage()
        pauseTimer()
    }

    if (oldPage != null) lastPage = oldPage
}

function updateBodyColor(isWhite) {
    document.body.classList.remove('white')
    document.body.classList.remove('off-white')

    document.body.classList.add((isWhite) ? 'white' : 'off-white')
}

function startInteraction() {
    document.addEventListener("keydown", handleKeyPress)

    canInteract = true

    hideNext()
}

function stopInteraction() {
    canInteract = false

    showNext()
}

function storeGameStateData() {
    localStorage.setItem("countdownGameState", JSON.stringify(gameState))
}

function storeCumulativeData() {
    localStorage.setItem("countdownCumulativeData", JSON.stringify(cumulativeData))
}

function fetchGameState() {
    const localStateJSON = localStorage.getItem("countdownGameState")
    let localGameState = null
    if (localStateJSON != null) {
        localGameState = JSON.parse(localStateJSON)

        if (localGameState.puzzleNumber === targetGameNumber) {
            gameState = localGameState
        } else {
            console.log("Game state was reset since puzzle does not match: " + localGameState.puzzleNumber + " & " + targetGameNumber)
            resetGameState()
        }
    } else {
        console.log("Game state was reset since localStorage did not contain 'conundrumGameState'")
        resetGameState()
    }

    updateCumulativeData()

    if (gameState.hasOpenedPuzzle === true || gameState.games[gameState.currentGame].wasStarted === true) {
        loadPuzzleFromState(gameState.currentGame)
        showPage("welcome")
    } else {
        loadPuzzle(gameState.currentGame)
        showPage('info')
        
    }
}

function fetchCumulativeData() {
    const localStoreJSON = localStorage.getItem("countdownCumulativeData")
    if (localStoreJSON != null) {
        console.log("Cumulative Data was Found: " + localStoreJSON)
        cumulativeData = JSON.parse(localStoreJSON)
        storeCumulativeData()
    } else {
        console.log("Cumulative Data was reset")
        resetCumulativeData()
    }
}

function resetCumulativeData() {
    cumulativeData = []
    storeCumulativeData()
}

function generateWelcomeMessage() {
    console.log("generating message")

    const welcomeHeader = document.querySelector("[data-welcome-header]")
    const welcomeMessage = document.querySelector("[data-welcome-message]")
    const welcomeButton = document.querySelector("[data-welcome-button]")
    const welcomeDate = document.querySelector("[data-welcome-date]")
    const welcomeNumber = document.querySelector("[data-welcome-number]")

    if (gameState.isComplete != true) {
        welcomeHeader.textContent = "Welcome Back"
        welcomeMessage.innerHTML = "Click below to finish todays game."
        welcomeMessage.classList.add('long')
        welcomeButton.textContent = "Continue"
        welcomeButton.onclick = () => {
            showPage('game')
            fireEvent("continue-game")
        }
    } else {
        welcomeHeader.textContent = "Hello"
        welcomeMessage.innerHTML = "There will be another <br> Uimhir tomorrow.<br> See you then!"
        welcomeMessage.classList.remove('long')
        welcomeButton.textContent = "See Stats"
        welcomeButton.onclick = () => {
            showPage('stats')
            fireEvent("from-welcome-to-stats")
        }
    }

    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth();
    let dd = today.getDate();

    let months = [
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]

    if (dd < 10) dd = '0' + dd;

    const formattedToday = months[mm] + " " + dd + ", " + yyyy
    welcomeDate.textContent = formattedToday

    welcomeNumber.textContent = "No. " + (targetGameNumber)
}

function updateInfoPage() {
    //drawWelcomeCircle(27/30, "00:27")

    if (gameState.games[0].wasStarted === false) {
        playButton.textContent = "Play"
        playButton.onclick = function () {
            showPage("game")
            fireEvent("play-game")
        } 
    } else {
        playButton.textContent = "Continue"
        playButton.onclick = function () {
            showPage("game")
        } 
    }
}

function processStats(cumulativeState) {
    let result = {
        today: {
            streak: 0,
            gamesPlayed: 0,
            wins: 0,
            threes: 0,
            fours: 0,
            tens: 0,
            gradeText: "N/A"
        },
        overall: {
            daysPlayed: cumulativeState.length,
            gamesPlayed: 0,
            wins: 0,
            threes: 0,
            fours: 0,
            tens: 0,
            gradeText: "N/A",
            down: null
        }
    }

    cumulativeState.forEach((entry, i) => {
        let lastEntry = null
        if (i !== 0) {
            lastEntry = cumulativeState[i - 1];
        }

        let isNext = true;
        if (lastEntry !== null) {
            let currentNumber = Number(entry.number)
            let lastNumber = Number(lastEntry.number)
            isNext = (currentNumber === (lastNumber + 1))

            //console.log("Current Number: " + currentNumber + " LastNumber: " + lastNumber + " isNext: " + isNext)
        }

        if (isNext) {
            result.today.streak += 1
        } else {
            result.today.streak = 1
        }

        if (i === (cumulativeState.length - 1)) {
            result.today.gamesPlayed += entry.distances.length;
            const evaluatedDistances = evaluateDistances(entry.distances)

            result.today.wins += evaluatedDistances.zeros
            result.today.threes += evaluatedDistances.threes
            result.today.fours += evaluatedDistances.fours
            result.today.tens += evaluatedDistances.tens
        }

        result.overall.gamesPlayed += entry.distances.length;
        const evaluatedDistances = evaluateDistances(entry.distances)

        result.overall.wins += evaluatedDistances.zeros
        result.overall.threes += evaluatedDistances.threes
        result.overall.fours += evaluatedDistances.fours
        result.overall.tens += evaluatedDistances.tens
    })

    if (result.today.gamesPlayed > 0) {
        let grade = getGrade(
            result.today.gamesPlayed,
            result.today.wins,
            result.today.threes,
            result.today.fours,
            result.today.tens
        )
        result.today.gradeText = grade + "%"
    }

    if (result.overall.gamesPlayed > 0) {
        let overallGrade = getGrade(
            result.overall.gamesPlayed,
            result.overall.wins,
            result.overall.threes,
            result.overall.fours,
            result.overall.tens
        )
        result.overall.gradeText = overallGrade + "%"
    }

    if (result.overall.daysPlayed > 2) {
        const last = cumulativeState[cumulativeState.length - 1]
        const previous = cumulativeState[cumulativeState.length - 2]
        console.log("State more than 2: " + last.grade)

        const grade = parseFloat(last.grade) - parseFloat(previous.grade)

        result.overall.down = (Number.isInteger(grade)) ? grade.toFixed(0) : grade.toFixed(2)
    } else if (result.overall.daysPlayed === 1) {
        console.log("State is 1")
        result.overall.down = -1
    } else {
        console.log("State is 0")
        result.overall.down = null
    }

    return result;
}

function evaluateDistances(distances) {
    // Initialize counters for each category
    let result = {
        zeros: 0,
        threes: 0,
        fours: 0,
        tens: 0
    };

    // Loop through the array and increment counters based on the value
    for (let distance of distances) {
        if (distance === 0) {
            result.zeros++;
        } else if (distance > 0 && distance <= 3) {
            result.threes++;
        } else if (distance > 3 && distance <= 10) {
            result.fours++;
        } else if (distance > 10) {
            result.tens++;
        }
    }

    return result;
}

function updateAllStats() {
    const results = processStats(cumulativeData)

    //updateStats(todaysStatisticGrid, results.today.streak, results.today.wins, results.today.threes, results.today.fours, results.today.tens, results.today.gradeText)
    updateStats(results.overall.daysPlayed, results.overall.wins, results.overall.threes, results.overall.fours, results.overall.tens, results.overall.gradeText, results.overall.down)
}

function updateStats(daysPlayed, wins, threes, fours, tens, grade, down) {
    let firstStatisticsArray = Array.from(firstStatisticGrid.querySelectorAll('.statistic'));
    let secondStatisticsArray = Array.from(secondStatisticGrid.querySelectorAll('.statistic'));

    const daysPlayedData = firstStatisticsArray[0].querySelector('.statistic-data');
    const winsData = firstStatisticsArray[1].querySelector('.statistic-data');
    const threesData = secondStatisticsArray[0].querySelector('.statistic-data');
    const foursData = secondStatisticsArray[1].querySelector('.statistic-data');
    const tensData = secondStatisticsArray[2].querySelector('.statistic-data');
    const gradeData = secondStatisticsArray[3].querySelector('.statistic-data');
    const downData = document.querySelector('[data-stat-down]')

    daysPlayedData.textContent = daysPlayed
    winsData.textContent = wins
    threesData.textContent = threes
    foursData.textContent = fours
    tensData.textContent = tens
    gradeData.textContent = grade

    console.log("Down is: " + down)

    if (down === null) {
        downData.textContent = "Play today's game to earn a grade!"
    } else if (down > 0) {
        downData.textContent = "Up " + down + "% vs. last play!"
    } else if (down == 0) {
        downData.textContent = "Same as last play!"
    } else if (down == -1) {
        downData.textContent = "Play multiple days to see your improvement!"
    } else {
        downData.textContent = "Down " + Math.abs(down) + "% vs. last play!"
    }

    
}

function getGrade(games, wins, threes, fours, tens) {
    const maxScore = games * 5;
    const currentScore = (wins * 5) + (threes * 3) + (fours * 1);
    const grade = Math.round((currentScore / maxScore) * 100).toFixed(0);

    return grade;
}

function pressShare() {
    if (gameState.isComplete == false) {
        showShareAlert("Complete todays puzzle to share!")
        return;
    }

    let lastEntry = cumulativeData[cumulativeData.length - 1]
    const evaluatedDistances = evaluateDistances(lastEntry.distances)
    let grade = getGrade(
        lastEntry.distances.length,
        evaluatedDistances.zeros,
        evaluatedDistances.threes,
        evaluatedDistances.fours,
        evaluatedDistances.tens
    )

    let textToCopy = "Try Countdown! \nwww.independent.ie/countdown \n Puzzle: " + targetGameNumber + " " + "\n" + " My score today: " + grade + "% \n" 

    if (navigator.share && detectTouchscreen() && ALLOW_MOBILE_SHARE) {
        navigator.share({
            text: textToCopy
        })
    } else {
        navigator.clipboard.writeText(textToCopy)
        showShareAlert("Link Copied! Share with Your Friends!")
    }

    fireEvent("pressed-share");
}

function detectTouchscreen() {
    var result = false
    if (window.PointerEvent && ('maxTouchPoints' in navigator)) {
        if (navigator.maxTouchPoints > 0) {
            result = true
        }
    } else {
        if (window.matchMedia && window.matchMedia("(any-pointer:coarse)").matches) {
            result = true
        } else if (window.TouchEvent || ('ontouchstart' in window)) {
            result = true
        }
    }
    return result
}

function fireEvent(eventName) {
    const event = new CustomEvent(eventName)

    document.dispatchEvent(event)
    pushEventToDataLayer(event)

    console.log("EVENT: " + eventName)
}

function pushEventToDataLayer(event) {
    const eventName = event.type
    const eventDetails = event.detail

    window.dataLayer.push({
        'event': eventName,
        ...eventDetails
    })

    console.log(window.dataLayer)
}