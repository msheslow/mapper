class route {
    constructor(startLocation = "Chapel Hill"){
        this.startLocation = startLocation
        this.desticantion = ""
        this.stops = []
        this.distance = 0
        this.cost = 0
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

    checkGoogleMaps(){
        // will eventually check if google recognizes the stop
        return true
    }

    getGasPrices(){
        //API key: http://api.eia.gov/series/?api_key=dd2080a6766dea4065bfde327132dced&series_id=TOTAL.RUUCUUS.M
    }
}