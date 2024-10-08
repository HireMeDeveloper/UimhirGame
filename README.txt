Summary:
    This is a file that compiles a handful of notes to make testing the implementation easier.

Notes on Implementation:
    Start Date:
        The puzzle picked for each day is based on how many days it has been since the DATE_OF_FIRST_PUZZLE variable.
        Set this variable to change which day should be the first puzzle in the game.
        This can be found at the top of main.js.
    Events:
        There are a handful of events, as requested, that are sent to the data layer.
        Each of these events are based around the buttons that players use in the game.
            fromWelcomToStats: this event is fired when a player presses the stats button from the welcome page.
            pressedShare: this event is fired when a player presses the share button.
            gameThreeToStats: this event is fired when a player presses the stats button from the game 3 page.
            continueGame: this event is fired when a player presses the continue button from the welcome page.
            playNextGame: this event is fired when a player presses the play next button after completing a game.
        These events fire at the start and end of the puzzle.
            onGameStart: fires when the first game is started in the puzzle
            onFirstCompletion: fires when the player finished the third game of the puzzle

Testing:

Questions:
