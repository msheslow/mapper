export class route {
    constructor(startLocation = "Chapel Hill", destination = "San Francisco", preferences){
        this.startLocation = startLocation
        this.destination = destination
        this.stops = []
        this.states = ["Utah", "Colorado", "Nevada"]
        this.distance = 0
        this.cost = 0
        this.preferences = preferences
    }

    addStop(stopName){
        if (this.checkGoogleMaps()){
            this.stops.push(stopName)
            return true
        }
        return false
    }

    removeStop(stopName) {
        this.stops = this.stops.filter(a => a!= stopName)
    }

    recommendStops(numberOfStops = this.distance/20){
        //will eventually return the requested number of stopsrecommendStops(numbertops= this
        return ["greensboro", "winston-salem", "hickory", "asheville", "know"]
    }

    autofill(numberOfPlaces){
        return ["greensboro", "winston-salem", "hickory", "asheville", "know"]
    }

    formRoute(){
        //will eventually use dijkstra's algorithm to order stops
        this.distance = 1000
        this.cost = 1000
    }

    addStatesTravelled(){
        //will eventually find all the states that the route crosses to recommend stops
        this.states[0]="North Carolina"
    }

    checkGoogleMaps(){
        // will eventually check if google recognizes the stop
        return true
    }

    getGasPrices(){
        //API key: http://api.eia.gov/series/?api_key=dd2080a6766dea4065bfde327132dced&series_id=TOTAL.RUUCUUS.M
    }
}

export class Preferences {
    constructor (acceptablePhysicalExertion = 0, localHistory = 0, nationalHistory = 0, peopleOfInterest = []){
        this.acceptablePhysicalExertion= acceptablePhysicalExertion
        this.localHistory = localHistory
        this.nationalHistory = nationalHistory
        this.peopleOfInterest = peopleOfInterest
    }
}