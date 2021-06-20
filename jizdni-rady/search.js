
printer = new Printer()
shedule = new Shedule(lines)
foundRoutes = shedule.search('Bites', 'Arnolec')
printer.routes(foundRoutes)
