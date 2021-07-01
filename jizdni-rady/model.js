
// ted prakticky k nicemu, zapozdruje jen jmeno zastavky, lepsi pojmenovani by bylo Station
class Stop {
  constructor(name) {
    this.name = name
  }
}

// Definice jizniho radu, jak jezdi spoje
// seznam zastavek, vzdalenosti mezi nimi a casy, kdy, vyjizdi spoje
class Line {
  constructor(name, stations) {
    this.name = name
    this.stations = stations
    this.distances = []
    this.forward = []
    this.backward = []
  }

  getStations() {
    return this.stations
  }

  add(station) {
    this.stations.push(station)
  }

  setDistances(distances) {
    if (this.stations.length - 1 != distances.length) {
      alert(`Vzdalenosti ${distances.length} neodpovídají počtu stanic ${this.stations.length}.`)
    }
    this.distances = distances
  }

  addForward(time) {
    this.forward.push(time)
  }

  addBackward(time) {
    this.backward.push(time)
  }

  getStations() {
    return this.stations
  }

  findStation(name) {
    let index = -1
    for (let indexStop in this.stations) {
      if (this.stations[indexStop].name == name) {
        index = indexStop
        break
      }
    }
    if (index < 0) {
      alert(`Station ${name} was not found in ${this.stations}.`)
    }
    return parseInt(index)
  }

  sumTime(indexFrom, indexTo) {
    indexFrom = parseInt(indexFrom)
    indexTo = parseInt(indexTo)
    let cum = 0
    if (indexFrom > indexTo) {
      [indexFrom, indexTo] = [indexTo, indexFrom]
    }
    for (let k = indexFrom; k < indexTo; k++) {
      cum += this.distances[k]
    }
    return cum
  }

  // TODO: nehleda pres pulnoc
  findDepartures(from, to, time) {
    let indexFrom = this.findStation(from)
    let indexTo = this.findStation(to)
    let departs = []
    let processDeparts = (source, indexStartLine) => {
      for (let lineDepart of source) {
        let stationDepart = lineDepart + this.sumTime(indexStartLine, indexFrom)
        if (stationDepart > time) {
          let totalTime = this.sumTime(indexFrom, indexTo)
          departs.push(new Segment(stationDepart, totalTime))
        }
      }
    }
    if (indexFrom < indexTo) {
      processDeparts(this.forward, 0)
    } else {
      processDeparts(this.backward, this.stations.length - 1)
    }
    return departs
  }
}

// konkretni usek cesty na jedne lince pri hledani spojeni mezi misty
// je to vlastne cast linky ohranicena krajnimi stanicemi
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

  lineName() {
    return this.line.name
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

// Konkretni casovy interval, navazany na DirectLine a konkretni cas
class Segment {
  constructor(departure, totalTime) {
    this.departure = departure
    this.arrival = departure + totalTime
    this.totalTime = totalTime
  }

  assignDirectLine(directLine) {
    this.directLine = directLine
  }
}

// Konkretni geograficke spojeni mezi dvema stanicemi, sklada se z vice linek
// Udrzuje pouze geografickou informaci (nikoliv casovou), po prohledani grafu
// mam jednu instanci Route pro kazde mozne spojeni mezi dvema misty
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

  getDirectLine(index) {
    return this.transfers[index]
  }

  getLastLine() {
    return this.transfers[this.transfers.length - 1].line
  }

  str() {
    return this.transfers.map((direct) => direct.str()).join(' &rarr; ') + '<br>'
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

  // meznik, nahoru se resi geograficke hledani, dolu se resi casove hledani

  segmentsForInit(initSegment) {
    let parts = []
    let last = initSegment
    last.assignDirectLine(this.transfers[0])
    parts.push(last)
    for (let k = 1; k < this.transfers.length; k++) {
      let segments = this.transfers[k].line.findDepartures(this.transfers[k].begin, this.transfers[k].destination, last.arrival)
      if (segments.length == 0) {
        return []
      }
      last = segments[0]
      last.assignDirectLine(this.transfers[k])
      parts.push(last)
    }
    return parts
  }

  searchTimes(beginTime) {
    let times = []
    let initSegTime = this.transfers[0].line.findDepartures(this.transfers[0].begin, this.transfers[0].destination, beginTime - 1)
    for (let initSegment of initSegTime) {
      let segments = this.segmentsForInit(initSegment)
      if (this.transfers.length == segments.length) {
        times.push(new TimeRoute(this, segments))
      }
    }
    return times
  }
}

// Je postaveno na route ve vztahu 1:M; Route je geograficky mozna cesta, kterou muze byt
// mozne realizovat v ruznych casech. Pro kazdy mozny cas se vytvari instance Time Route
class TimeRoute {
  constructor(route, segments) {
    this.route = route
    this.segments = segments
  }

  totalTime() {
    return this.segments[this.segments.length - 1].arrival - this.segments[0].departure
  }

  transfersCount() {
    return this.route.transfers.length - 1
  }

  departure() {
    return this.segments[0].departure
  }

  arrival() {
    return this.segments[this.segments.length - 1].arrival
  }

  directLine(index) {
    return this.route.getDirectLine(index)
  }
}

// Prohledavani grafu z geografickeho pohledu a nalezani vsech moznych cesta mezi dvema mista
// Neresi cas, hleda vsechny existujici cesty. Je mozne, ze nektere budou po spocitani casu
// nerealizovatelne
class GeographicalSearcher {

  constructor(lines) {
    this.lines = lines
  }

  searchStops(name) {
    let routes = []
    for (let line of this.lines) {
      for (let stop of line.getStations()) {
        if (stop.name == name) {
          routes.push(new Route(line, stop.name))
        }
      }
    }
    return routes
  }

  searchDirections(route) {
    // najde vsechny mozne pokracovaci smery aktualni cesty mimo tech, ktere by se cyklily
    let directions = []
    for (let line of this.lines) {
      if (route.isAtBegin() && line.name != route.getLastLine().name) {
        continue
      }
      let stations = line.getStations()
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
    let found = []  // pole instanci Route
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

