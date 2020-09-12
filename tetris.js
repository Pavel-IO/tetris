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

function addClass(id, name) {
    var element = document.getElementById(id);
    var arr = element.className.split(' ');
    if (arr.indexOf(name) == -1) {
        element.className += ' ' + name;
    }
}

function clearClasses(id) {
    var element = document.getElementById(id);
    element.className = 'field';
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

function updateGame() {
  iterBoard(function(i, j) {
    if (board[i][j]) {
        addClass(formatId(i, j), 'selected');
    } else {
        clearClasses(formatId(i, j));
    }
  });
}

function resetGame() {
    if (confirm('Opravdu resetovat celou hru?')) {
        iterBoard(function(i, j) { board[i][j] = false; });
    }
    updateGame();
}

function clickField(obj) {
    var i = getI(obj.id);
    var j = getJ(obj.id);
    board[i][j] = !board[i][j];
    if (board[i][j]) {
        addClass(obj.id, 'selected');
    } else {
        clearClasses(obj.id);
    }
    checkFullness();
}

function finishRow(row) {
    var emptyRow = function(row) {
        for (var j = 0; j < COLS; j++) {
            board[row][j] = false;
        }
    };
    var shiftRowDown = function(row) {
        for (var j = 0; j < COLS; j++) {
            board[row][j] = board[row-1][j];
        }
    } 
    for (k = row; k > 0; k--) {
        shiftRowDown(k);
    }
    emptyRow(0);
    updateGame();
}

function isRowFull(row) {
    isFull = true;
    for (var j = 0; j < COLS; j++) {
        isFull = isFull && board[row][j];
    }
    return isFull;
}

function checkFullness() {
    for (var i = 0; i < ROWS; i++) {
        if (isRowFull(i)) {
            clearClasses('finishRow_'+i);
        } else {
            addClass('finishRow_'+i, 'hidden');
        }
    }
}

function nextMove() {
    shape = shapes.getRandomShape();
    iterChoice(function(i, j) {
        if (shape[i][j]) {
            addClass(formatChoiceId(i, j, 0), 'selected');
        } else {
            clearClasses(formatChoiceId(i, j, 0));
        }
    });
}