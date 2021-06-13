function Shapes() {
    this.A = [[1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    this.B = [[1, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0]];
    this.C = [[1, 1, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0]];
    this.D = [[0, 1, 0, 0], [1, 1, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0]];
    this.E = [[1, 0, 0, 0], [1, 1, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0]];
    this.F = [[1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    this.G = [[1, 0, 0, 0], [1, 1, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0]];

    this.rndInt = function(max) {
        return Math.floor(Math.random() * (max + 1));
    };

    // rotate shape 90 degrees right (clockwise)
    this.rotateShape90 = function(shape) {
        var rotated = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                rotated[j][3-i] = shape[i][j];
            }
        }
        return rotated;
    };

    this.rotateShape = function(shape, count) {
        for (var k = 0; k < count; k++) {
            shape = this.rotateShape90(shape);
        }
        return shape;
    }

    this.getRandomShape = function() {
        var shapes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
        return this.rotateShape(this[shapes[this.rndInt(6)]], this.rndInt(3));
    };
}

function BoardUI() {
    this.locked = true;

    this.unlock = function() {
        this.locked = false;
        document.getElementById('confirmRound').disabled = false;
    }

    this.lock = function() {
        this.locked = true;
        document.getElementById('confirmRound').disabled = true;
    }

    this.addClass = function(id, name) {
        var element = document.getElementById(id);
        var arr = element.className.split(' ');
        if (arr.indexOf(name) == -1) {
            element.className += ' ' + name;
        }
    }

    this.clearClasses = function(id) {
        var element = document.getElementById(id);
        element.className = 'field';
    }

    this.toggleClass = function(condition, elmId, className) {
        if (condition) {
            this.clearClasses(elmId);
            this.addClass(elmId, className);
        } else {
            this.clearClasses(elmId);
        }
    }

    this.updateGame = function() {
        iterBoard(function(i, j) { boardUI.toggleClass(board[i][j], formatId(i, j), 'selected'); });
    }

    this.clickField = function(obj) {
        if (this.locked) {
            return ;
        }
        var i = getI(obj.id);
        var j = getJ(obj.id);
        board[i][j] = !board[i][j];
        boardUI.toggleClass(board[i][j], obj.id, 'active');   // possibly replace with updateGame()
        checkFullness();
    }
}

function Log() {
    this.storage = window.localStorage;

    this.init = function() {
        this.write('reset')
    }

    this.write = function(record) {
        record = this.getCurrentTime() + ': ' + record + '\n'
        let existing = this.storage.getItem('score');
        if (existing) {
            record += existing;
        }
        this.storage.setItem('score', record);
    }

    this.getLog = function() {
        let val = this.storage.getItem('score');
        return val ? val : ''
    }

    this.getCurrentTime = function() {
        let zeroFill = function(val) {
            return val < 10 ? '0' + val.toString(10) : val.toString(10)
        }
        let today = new Date();
        let date = today.getFullYear() + '-' + zeroFill(today.getMonth() + 1) + '-' + zeroFill(today.getDate());
        let time = today.getHours() + ':' + zeroFill(today.getMinutes()) + ':' + zeroFill(today.getSeconds());
        return date + ' ' + time;
    }

    this.saveScore = function(points, fails) {
        let record = 'points = ' + points + ', fails = ' + fails;
        log.write(record)
        this.updateView()
    }

    this.updateView = function() {
        document.getElementById('logView').value = this.getLog()
    }

    this.init()
}

function Points() {
    this.points = 0;
    this.fails = 0;

    this.filledRow = function() {
        this.points++;
        this.update();
    }

    this.reachedTop = function() {
        this.points -= 2;
        this.fails++;
        this.update();
    }

    this.update = function() {
        document.getElementById('points').innerHTML = this.points;
        log.saveScore(this.points, this.fails)
    }
}

function formatId(i, j) {
    return 'field_' + i + '_' + + j;
}

function formatChoiceId(i, j, c) {
    return 'field_choice' + c + '_' + i + '_' + + j;
}

function getI(id) {
    return id.split('_')[1];
}

function getJ(id) {
    return id.split('_')[2];
}

function iterBoard(fcn) {
    for (var i = 0; i < ROWS; i++) {
        for (var j = 0; j < COLS; j++) {
            fcn(i, j);
        }
    }
}

function iterChoice(fcn) {
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            fcn(i, j);
        }
    }
}

function resetGame() {
    if (confirm('Opravdu resetovat celou hru?')) {
        iterBoard(function(i, j) { board[i][j] = false; });
    }
    boardUI.updateGame();
}

function emptyRow(row) {
    for (var j = 0; j < COLS; j++) {
        board[row][j] = false;
    }
};

function finishRow(row) {
    var shiftRowDown = function(row) {
        for (var j = 0; j < COLS; j++) {
            board[row][j] = board[row-1][j];
        }
    }
    for (k = row; k > 0; k--) {
        shiftRowDown(k);
    }
    emptyRow(0);
    boardUI.updateGame();
}

function eraseTopRows() {
    for (var i = 0; i < ERASED_ROWS; i++) {
        for (var j = 0; j < COLS; j++) {
            board[i][j] = false;
        }
    }
    boardUI.updateGame();
}

function isRowFull(row) {
    isFull = true;
    for (var j = 0; j < COLS; j++) {
        isFull = isFull && board[row][j];
    }
    return isFull;
}

function isAnyInRow(row) {
    isAny = false;
    for (var j = 0; j < COLS; j++) {
        isAny = isAny || board[row][j];
    }
    return isAny;
}

function checkFullness() {
    for (var i = 0; i < ROWS; i++) {
        boardUI.toggleClass(!isRowFull(i), 'finishRow_' + i, 'hidden');
    }
}

function updateChoiceBoard(option) {
    choices[option] = shapes.getRandomShape();
    iterChoice(function(i, j) {
        boardUI.toggleClass(choices[option][i][j], formatChoiceId(i, j, option), 'selected');
    });
}

function initGame() {
    updateChoiceBoard(0);
    updateChoiceBoard(1);
    showHelp(0);
    log.updateView()
}

function updateRound(option) {
    choices[option] = shapes.getRandomShape();
    iterChoice(function(i, j) {
        boardUI.toggleClass(choices[option][i][j], formatChoiceId(i, j, option), 'selected');
    });
}

function selectedOption(option) {
    var colorizeChoice = function(option) {
        iterChoice(function(i, j) {
            boardUI.toggleClass(choices[option][i][j], formatChoiceId(i, j, option), 'active');
        });
    };

    activeChoice = option;
    colorizeChoice(option);
    boardUI.unlock();
    lockControls(true);
    showHelp(1);
}

function evaluatePoints() {
    for (var i = 0; i < ROWS; i++) {
        if (isRowFull(i)) {
            finishRow(i);
            points.filledRow();
        }
    }
    if (isAnyInRow(0)) {
        emptyRow(0);
        emptyRow(1);
        points.reachedTop();
    }
    checkFullness();
}

function confirmRound() {
    evaluatePoints();
    boardUI.updateGame();
    boardUI.lock();
    lockControls(false);
    updateRound(activeChoice);
    activeChoice = null;
    showHelp(0);
}

function lockControls(state) {
    document.getElementById('option0').disabled = state;
    document.getElementById('option1').disabled = state;
}
