runStatisticsTests()

function deepEqual(obj1, obj2) {
    if (obj1 === obj2) return true;

    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 == null || obj2 == null) {
        return false;
    }

    let keys1 = Object.keys(obj1);
    let keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
        if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
            return false;
        }
    }

    return true;
}

function statisticsUnitTest(testName, cumulativeData, expectedResults) {
    let results = processStats(cumulativeData);
    if (deepEqual(expectedResults, results)) {
        console.log("TEST (" + testName + "): PASSED");
    } else {
        console.log("TEST (" + testName + "): FAILED");
        console.log("Expected: " + JSON.stringify(expectedResults, null, 2) + " \nActual: " + JSON.stringify(results, null, 2));
    }
}

function runStatisticsTests() {
    statisticsUnitTest(
        "test1",
        [
            { number: 68, distances: [100, 5, 0] },
            {number: 69, distances: [904, 100, 0]}
        ],
        {
            today: {
                streak: 2,
                gamesPlayed: 3,
                wins: 1,
                threes: 0,
                fours: 0,
                tens: 2,
                gradeText: "33.33%"
            },
            overall: {
                daysPlayed: 2,
                gamesPlayed: 6,
                wins: 2,
                threes: 0,
                fours: 1,
                tens: 3,
                gradeText: "N/A"
            }
        }
    );
}

function timerUnitTest(testName, wordSize, expectedResult) {
    let results = getTimerDuration(wordSize);
    if (results === expectedResult) {
        console.log("TEST (" + testName + "): PASSED");
    } else {
        console.log("Test (" + testName + "): FAILED with RESULT: " + results + " and EXPECTED: " + expectedResult)
    }
}

function runTimerUnitTests() {
    timerUnitTest("test 1", 7, 3000)
    timerUnitTest("test 2", 8, 4000)
    timerUnitTest("test 3", 9, 5000)
}

runSolutionsTests()

function solutionUnitTest(testName, numbers, expectedResults) {
    let results = findClosestSolution(numbers)
    if (deepEqual(expectedResults, results)) {
        console.log("TEST (" + testName + "): PASSED");
    } else {
        console.log("TEST (" + testName + "): FAILED");
        console.log("Expected: " + JSON.stringify(expectedResults, null, 2) + " \nActual: " + JSON.stringify(results, null, 2));
    }
}

function runSolutionsTests() {
    solutionUnitTest(
        "solutionTest1",
        [
            755, 100, 50, 25, 9, 4, 1
        ],
        {
            closestSolution: 188,
            sums: [
                [100, '+', 50, '=', 150],
                [150, '+', 25, '=', 175],
                [175, '+', 9, '=', 184],
                [184, '+', 4, '=', 188]
            ],
            target: 755
        }
    )
}