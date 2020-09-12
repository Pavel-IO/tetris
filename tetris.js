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
    addClass(formatChoiceId(0, 0, 0), 'selected');
}
