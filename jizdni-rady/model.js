class Stop {
  constructor(name, time) {
    this.name = name
    this.time = time
  }
}

// Definice jizniho radu, jak jezdi spoje
class Line {
  constructor(name, stops) {
    this.name = name
    this.stops = stops
  }

  getStops() {
    return this.stops
  }

  add(stop) {
    this.stops.push(stop)
  }
}

// konkretni usek cesty pri hledani spojeni mezi misty
class DirectLine {
  constructor(line, begin) {
    this.line = line
    this.begin = begin
    this.destination = undefined
  }

  isSameLine(line) {
    return this.line.name == line.name
  }

  getDestination() {
    return this.destination
  }

  updateDestination(destination) {
    this.destination = destination
  }

  clone() {
    let newDirectLine = new DirectLine(undefined, undefined)
    newDirectLine.line = this.line
    newDirectLine.begin = this.begin
    newDirectLine.destination = this.destination
    return newDirectLine
  }

  str() {
    return `Linka ${this.line.name} z ${this.begin} do ${this.destination}`
  }
}

// mozny usek cesty mezi dvema, sklada se z vice linek
class Route {
  constructor(line, station) {
    this.stations = [station]
    this.transfers = [new DirectLine(line, station)]
  }

  containStation(station) {
    return this.stations.includes(station)
  }

  isInDestination(destination) {
    return this.getLast() == destination
  }

  isAtBegin() {
    return this.stations.length == 1
  }

  getLastLine() {
    return this.transfers[this.transfers.length - 1].line
  }

  str() {
    return this.transfers.map((direct) => direct.str()).join(', ')
  }

  clone() {
    let clonedRoute = new Route(undefined, undefined)
    clonedRoute.stations = this.stations.map((x) => x)
    clonedRoute.transfers = this.transfers.map((x) => x.clone())
    return clonedRoute
  }

  getLast() {
    return this.stations[this.stations.length - 1]
  }

  addStation(line, station) {
    this.stations.push(station)

    let lastDirectLine = this.transfers[this.transfers.length - 1]
    if (lastDirectLine.isSameLine(line)) {
      lastDirectLine.updateDestination(station)
    } else {
      this.transfers.push(new DirectLine(line, lastDirectLine.getDestination()))
      this.transfers[this.transfers.length - 1].updateDestination(station)
    }
    return this
  }
}

class Shedule {

  constructor(lines) {
    this.lines = lines
  }

  searchStops(name) {
    let routes = []
    for (let line of this.lines) {
      for (let stop of line.getStops()) {
        if (stop.name == name) {
          routes.push(new Route(line, stop.name))
        }
      }
    }
    return routes
  }

  searchDirections(route) {
    // najde vsechny mozne pokracovaci smery aktualni cestey mimo tech, ktere by se cyklily
    let directions = []
    for (let line of this.lines) {
      if (route.isAtBegin() && line.name != route.getLastLine().name) {
        continue
      }
      let stations = line.getStops()
      let checkAndPush = (sRef, sTrg) => {
        if (stations[sRef].name == route.getLast()) {
          if (!route.containStation(stations[sTrg].name)) {
            directions.push([line, stations[sTrg].name])
          }
        }
      }
      for (let s = 1; s < stations.length; s++) {
        checkAndPush(s, s - 1)
      }
      for (let s = 0; s < stations.length - 1; s++) {
        checkAndPush(s, s + 1)
      }
    }
    return directions
  }

  search(from, to) {
    if (from == to) {
      return []
    }
    let routes = this.searchStops(from)
    let found = []
    while (routes.length > 0) {
      for (let routeIndex = routes.length - 1; routeIndex >= 0; routeIndex--) {
        let route = routes[routeIndex]
        if (route.isInDestination(to)) {
          found.push(routes.splice(routeIndex, 1)[0])
        } else {
          let directions = this.searchDirections(route)
          if (directions.length == 0) {
            routes.splice(routeIndex, 1)  // jsem na konci cesty a nejsem v cili, tj. slepa ulicka, mazu
          } else {
            // jsou dalsi kroky, kde jsem jeste nebyl, naklonuji aktualni cestu a vlozim do planu
            for (let k = 1; k < directions.length; k++) {
              routes.push(route.clone().addStation(...directions[k]))
            }
            route.addStation(...directions[0])
          }
        }
      }
    }
    return found
  }
}

class Printer {
  printLine(line) {
    document.write(line + '<br>')
  }

  routes(routes) {
    for (let route of routes) {
      this.printLine(route.str())
    }
  }
}

