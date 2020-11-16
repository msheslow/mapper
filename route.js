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

    getGasPrices(){
        //API key: http://api.eia.gov/series/?api_key=dd2080a6766dea4065bfde327132dced&series_id=TOTAL.RUUCUUS.M
    }
}
