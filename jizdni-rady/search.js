
class Printer {
  clear() {
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
allStations.sort()
for (let station of allStations) {
  addIntoSelect('from', station)
  addIntoSelect('to', station)
}

function search() {
  let from = document.getElementById('from').value
  let to = document.getElementById('to').value

  printer.clear()

  if (from.startsWith('---') || to.startsWith('---')) {
    printer.line('Vyberte začátek a konec cesty prosím.')
  } else if (from == to) {
    printer.line('Začátek a konec se shodují, nemusíte nikam cestovat :)')
  } else {
    geoRoutes = shedule.search(from, to)
    timeRoutes = []
    for (let geoRoute of geoRoutes) {
      timeRoutes = timeRoutes.concat(geoRoute.searchTimes())
    }
    sortedTimeRoutes = timeRoutes.sort((a, b) => { return a.arrival() - b.arrival() })
    printer.routes(sortedTimeRoutes)
  }
}

document.getElementById('search').onclick = search
