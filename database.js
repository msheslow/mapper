
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

//returns all destinations in database
function getAllPlaces(){
    sql = `SELECT Name FROM combinedSites`
    executeSearch(sql)
}

//executes the sql comand passed as a parameter
function executeSearch (sql){
    let ans = []
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        console.log(rows)
    // for (row of rows){
    //     console.log(row)
    // }
    return ans
    });
}

//Finds all the sites in the state listed in the route object
function getSitesInStates(route){
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

// Creates a database instance for a trip
function createTrip(username, startLocation, endLocation){
    let sqlAddCommand = `INSERT INTO trips VALUES ("${username}", "${startLocation}", "${endLocation}")`
    return executeSearch(sqlAddCommand)
}

// removes a user's trip
function removeTrip(tripID){ 
    executeSearch(`DELETE FROM stops WHERE tripID = "${tripID}"`)
    return executeSearch(`DELETE FROM trips WHERE rowid = "${tripID}"`)
}

// Creates stops on trip that can be matched by ID to respective trip
function addTripStop(tripID, stopID){
    let sqlStopCommand = `INSERT INTO stops VALUES ("${stopID}", "${tripID}")`
    return executeSearch(sqlStopCommand)
}

// Removes stop on trip
function removeTripStop(tripID, stopID){
    let sqlRemoveStopCommand = `DELETE FROM stops WHERE stopID = "${stopID}" AND tripID="${tripID}"`
    return executeSearch(sqlRemoveStopCommand)
}

//returns all of a user's saved trip numbers
function getUsersTripNumbers(username){
    let getTripIDsSQL = `SELECT DISTINCT T.rowid FROM stops S, trips T, users U WHERE U.username = "${username}" AND U.username = T.username AND T.rowid = S.tripID`
    executeSearch(getTripIDsSQL)
}



//returns start location, destination, and stops for trip
function getTripDetails(tripID){
    let tripRequestSQL = `SELECT T.startLocation, T.endLocation, S.stopID FROM stops S, trips T WHERE T.rowid = "${tripID}" AND T.rowid = S.tripID`
    executeSearch(tripRequestSQL)
}

// creates a new user
function addUser(username, password){
    let sqlCheckUserName = `SELECT * from users WHERE username = "${username}" `
    let sqlUserCommand = `INSERT INTO users (username, password) VALUES ("${username}", "${password}")`
    //Checks if user is already in database, if not adds user
    db.all(sqlCheckUserName, [], (err, rows) => {
        if (err) {
            throw err;
        }
    //handles case where user needs to be added
    if (rows.length == 0) {
        db.all(sqlUserCommand, [], (err, rows) => {
            if (err) {
                throw err;
            }
            return "Success"
        });
    }
    });
    //Adds user to database and returns "Success"
    return "User already exists"
}


// closes database
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

//writeSearch(route)
// console.log(executeSearch(`SELECT T.rowid FROM trips T, stops S WHERE T.rowid=S.tripID`))
// addUser("arisf", "arispassword")
// createTrip("arisf", "Wake Forest", "Sedona, AZ")
// addTripStop(1,"Great Sand Dunes National Park")
// getUsersTripNumbers("arisf")
// addUser("asd", "arisotherpassowrd")
// getTripDetails(1)
// removeTripStop(2, "Black Canyon of the Gunnison")
// getTripDetails(2)
// removeTrip(1)
closeDB()
// close the database connection