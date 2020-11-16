
// //Schema:
// // CREATE TABLE "nationalParks" (
// "index" INTEGER,
//   "parkCode" TEXT,
//   "parkName" TEXT,
//   "State" TEXT,
//   "Acres" INTEGER,
//   "Latitude" REAL,
//   "Longitude" REAL
// )

// CREATE TABLE "nationalRegister" (
// "index" INTEGER,
//   "iden" REAL,
//   "propertyName" TEXT,
//   "Restricted Address" INTEGER,
//   "Name of Multiple Property Listing" TEXT,
//   "State" TEXT,
//   "County" TEXT,
//   "City" TEXT,
//   "Street & Number" TEXT,
//   "Architects/Builders" TEXT,
//   "localSignificance" INTEGER,
//   "stateSignificance" INTEGER,
//   "nationalSignificance" INTEGER,
//   "internationalSignificance" INTEGER,
//   "Level of Significance - Not Indicated" INTEGER,
//   "Significant Persons" TEXT,
//   "External Link" TEXT
// , cityLat REAL, cityLong REAL)

// CREATE TABLE "zipCodes" (
// "index" INTEGER,
//   "zip" INTEGER,
//   "latitude" REAL,
//   "longitude" REAL,
//   "city" TEXT,
//   "state_id" TEXT,
//   "state_name" TEXT,
//   "population" INTEGER,
//   "density" REAL,
//   "county_name" TEXT,
//   "timezone" TEXT
// )

const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('db.sqlite', (e) => {
  if (e) {
    return console.error(e.message);
  }
});

let sql 

function getAllPlaces(){
    sql = `SELECT Name FROM combinedSites`
    executeSearch(sql)
}

function executeSearch (sql) {
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
    for (row of rows){
        console.log(row)
    }
    return rows
    });
}

function writeSearch(route){
    sql = ""
    for (state of route.states){
        sql = sql+`
        SELECT *
        FROM combinedSites 
        WHERE State LIKE "${state}" 
        UNION`
    }
    sql = sql.substring(0, sql.length-5)
    return executeSearch(sql)
}

function createTrip(username, startLocation, endLocation){
    let sqlAddCommand = `INSERT INTO trips VALUES (${username}, ${startLocation}, ${endLocation})`
}

function addTripStop(tripID, stopID){
    let sqlStopCommand = `INSERT INTO stops VALUES (${stopID}, ${tripID})`
}

function addUser(usern4ame, password){
    let sqlCheckUserName = `SELECT * FROM users WHERE username ="${username}"`
    let sqlUserCommand = `INSERT INTO stops VALUES (${username}, ${password})`
}


function closeDB(){
    db.close((e) => {
    if (e) {
        return console.error(e.message);
    }
    console.log('Close the database connection.');
    });
}

































class Route {
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
        this.states[0]="NC"
    }

    checkGoogleMaps(){
        // will eventually check if google recognizes the stop
        return true
    }

    getGasPrices(){
        //API key: http://api.eia.gov/series/?api_key=dd2080a6766dea4065bfde327132dced&series_id=TOTAL.RUUCUUS.M
    }
}

class Preferences {
    constructor (acceptablePhysicalExertion = 0, localHistory = 0, nationalHistory = 0, peopleOfInterest = []){
        this.acceptablePhysicalExertion= acceptablePhysicalExertion
        this.localHistory = localHistory
        this.nationalHistory = nationalHistory
        this.peopleOfInterest = peopleOfInterest
    }
}

let preferences = new Preferences(0, 0, 0, [])

let route = new Route("chapel hill", "charlotte", preferences )

writeSearch(route)

//getAllPlaces()
closeDB()
// close the database connection