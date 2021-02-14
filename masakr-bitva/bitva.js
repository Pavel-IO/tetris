function DataModel() {
    this.board = []

    this.getValue = (i, j) => {
        return this.board[i][j]
    }

    this.setValue = (i, j, v) => {
        this.board[i][j] = v
    }

    this.init = () => {
        for (var i = 0; i < ROWS; i++) {
            this.board.push([])
            for (var j = 0; j < COLS; j++) {
              this.board[i].push(0)
            }
        }
    }

    this.init()
}

function Controls() {
    this.selectPanel = [
        ['c0', 0, document.getElementById('controlPanelC0')],
        ['c1', 1, document.getElementById('controlPanelC1')],
        ['c2', 2, document.getElementById('controlPanelC2')],
        ['c3', 3, document.getElementById('controlPanelC3')],
    ]

    this.initPanel = () => {
        for (let [color, code, obj] of this.selectPanel) {
            obj.onclick = () => {
                this.showCurrentColor(color)
                if (activeField) {
                    model.setValue(activeField[0], activeField[1], code)
                    board.updateGame()
                }
                this.removeAllActive()
                obj.classList.add('active')
            }
        }
    }

    this.removeAllActive = () => {
        for (let [color, code, obj] of this.selectPanel) {
            obj.classList.remove('active')
        }
    }

    this.updateActive = (i, j) => {
        for (let [color, code, obj] of this.selectPanel) {
            toggleClass(obj, model.getValue(i, j) == code, 'active')
        }
    }

    this.showCurrentColor = (color) => {
        document.getElementById('currentColor').innerText = color
    }

    this.showCurrentField = (position) => {
        document.getElementById('currentField').innerText = position
    }

    this.init = () => {
        this.initPanel()
    }

    this.init()
}

function Board() {
    this.locked = false

    this.unlock = () => {
        this.locked = false
        document.getElementById('confirmRound').disabled = false
    }

    this.lock = () => {
        this.locked = true
        document.getElementById('confirmRound').disabled = true
    }

    this.formatId = (i, j) => {
        return 'field_' + i + '_' + + j
    }

    this.getIJ = (id) => {
        let parts = id.split('_')
        return [parseInt(parts[1]), parseInt(parts[2])]
    }

    this.genBoard = () => {
        var output = '<table>'
        for (var i = 0; i < ROWS; i++) {
            output += '<tr>'
            for (var j = 0; j < COLS; j++) {
                output += '<td class="field" id="' + this.formatId(i, j) + '" onclick="board.clickField(this)"></td>'
            }
            output += '</tr>'
        }
        output += '<tr>'
        for (var j = 0; j < COLS; j++) {
            output += '<th>' + String.fromCharCode(65 + j) + '</th>'
        }
        output += '</tr>'
        output += '</table>'
        return output
    }

    this.clickField = (obj) => {
        if (this.locked) {
            return
        }
        let [i, j] = this.getIJ(obj.id)
        controls.updateActive(i, j)
        if (activeField) {
            let id = this.formatId(activeField[0], activeField[1])
            toggleClass(id, false, 'active')
        }
        activeField = [i, j]
        controls.showCurrentField(i + ' ' + String.fromCharCode(65 + j))
        toggleClass(obj.id, true, 'active')
    }

    this.iterBoard =(fcn) => {
        for (let i = 0; i < ROWS; i++) {
            for (let j = 0; j < COLS; j++) {
                fcn(i, j)
            }
        }
    }

    this.updateGame = () => {
        this.iterBoard((i, j) => {
            for (let [color, code, obj] of controls.selectPanel) {
                toggleClass(this.formatId(i, j), model.getValue(i, j) == code, color)
            }
        })
    }

    this.init = () => {
        document.getElementById('mainTableContainer').innerHTML = this.genBoard()
    }

    this.init()
}

function toggleClass(elmId, condition, className) {
    let obj = isString(elmId) ? document.getElementById(elmId) : elmId
    if (condition) {
        obj.classList.add(className)
    } else {
        obj.classList.remove(className)
    }
}

function isString(value) {
    return typeof value === 'string' || value instanceof String;
}
