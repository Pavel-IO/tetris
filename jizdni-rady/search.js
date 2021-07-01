
class Printer {
  clear() {
    // TODO: tady to zavazi, kdyz se vypisuji jen chybove stavy
    document.getElementById('result').innerHTML = '<p><b>Spoje jsou řazeny podle času příjezdu od nejdřívějšího</b></p>'
  }

  line(line) {
    document.getElementById('result').innerHTML += line + '<br>'
  }

  route(route) {
    let out = '<div class="resultRoute">'
    out += `<div class="resultCaption">Odjezd <b>${intToTime(route.departure())}</b>, příjezd <b>${intToTime(route.arrival())}</b>, `
    out += `celkový čas <b>${intToTime(route.totalTime())}</b>, ${route.transfersCount()} přestupů</div><br>`

    out += `Trasa:<br>`
    out += '<div class="transfers">'
    let last = undefined
    for (let indexSegment in route.segments) {
      let segment = route.segments[indexSegment]
      let direct = route.directLine(indexSegment)

      if (last) {
        out += `<span class="resultTransfer">Doba na přestup ${intToTime(segment.departure - last.arrival)}</span><br>`
      }

      out += `Linka ${direct.lineName()}, odjezd v <b>${intToTime(segment.departure)}</b> z ${direct.begin}`
      out += ` &rarr; příjezd v <b>${intToTime(segment.arrival)}</b> do ${direct.destination},`
      out += ` doba jízdy ${intToTime(segment.totalTime)}<br>`
      last = segment
    }
    out += '</div>'
    out += '<br>'
    out += '</div>'
    return out
  }

  routes(routes) {
    for (let route of routes) {
      this.line(this.route(route))
    }
  }

  lineShedule(line, direction) {
    // direction: 1 = forward, 0 = backward
    let out = '<div class="sheduleLine">'
    out += `<h3>Linka ${line.name} - směr ${direction ? 'tam' : 'zpět'}</h3>`
    out += '<table class="table table-bordered">'

    let formatStation = (departures, index, f, s) => {
      let station = line.getStations()[index]
      out = '<tr>'
      out += `<th scope="row">${station.name}</th>`
      for (let ftime of departures) {
        out += `<td>${intToTime(ftime + line.sumTime(f, s))}</td>`
      }
      out += '</tr>'
      return out
    }

    if (direction) {
      for (let stationIndex in line.getStations()) {
        out += formatStation(line.forward, stationIndex, 0, stationIndex)
      }
    } else {
      let sI = line.getStations().length - 1
      for (let stationIndex = sI; stationIndex >= 0; stationIndex--) {
        out += formatStation(line.backward, stationIndex, stationIndex, sI)
      }
    }
    out += '</table>'
    out += '</div>'
    return out
  }
}

printer = new Printer()
shedule = new GeographicalSearcher(lines)

function addIntoSelect(id, item) {
  var select = document.getElementById(id)
  var option = document.createElement('option')
  option.text = item
  select.add(option)
}

allStations = []
for (let line of lines) {
  for (let stop of line.getStations()) {
    allStations.push(stop.name)
  }
}
allStations = [...new Set(allStations)]
allStations.sort()
for (let station of allStations) {
  addIntoSelect('from', station)
  addIntoSelect('to', station)
}

function search() {
  let from = document.getElementById('from').value
  let to = document.getElementById('to').value

  let hours = parseInt(document.getElementById('time_hours').value)
  let minutes = parseInt(document.getElementById('time_minutes').value)
  let beginTime = 60 * hours + minutes

  printer.clear()

  if (from.startsWith('---') || to.startsWith('---')) {
    printer.line('Vyberte začátek a konec cesty prosím.')
  } else if (from == to) {
    printer.line('Začátek a konec se shodují, nemusíte nikam cestovat :)')
  } else {
    geoRoutes = shedule.search(from, to)
    timeRoutes = []
    for (let geoRoute of geoRoutes) {
      timeRoutes = timeRoutes.concat(geoRoute.searchTimes(beginTime))
    }
    sortedTimeRoutes = timeRoutes.sort((a, b) => { return a.arrival() - b.arrival() })
    printer.routes(sortedTimeRoutes)
  }
}

document.getElementById('search').onclick = search

let jizdniRad = ''
for (let line of lines) {
  jizdniRad += printer.lineShedule(line, 1)
  jizdniRad += printer.lineShedule(line, 0)
}
document.getElementById('shedule').innerHTML = jizdniRad
