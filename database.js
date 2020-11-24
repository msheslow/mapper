const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const app = express()
const axios = require('axios');
const { exec } = require('child_process');
const expressSession = require('express-session');
const cors = require('cors');
const bodyParser= require('body-parser');
const { RSA_NO_PADDING } = require('constants');
app.use(bodyParser.json());
let port = process.env.PORT || 8080

app.use(express.static(__dirname))

app.use(expressSession({
    name: "mapperSessionCookie",
    secret: ["username", "tripID"],
    resave: false,
    saveUninitialized: false
}));

app.enable("trust-proxy")

app.post('/login', async (req, res) => {
    let user = req.body.user
    let password = req.body.password
    let result = await checkLogin(user, password)
    if (result == "User does not exist"){
        res.status(404).send("Not found");
        return
    } else if (result == "Incorrect password"){
        res.status(403).send("Unauthorized");
        return
    } else {
        req.session.username = user;
        res.json(user);
        return user;
    }
})


//adds user to database
app.post('/createlogin', async (req, res) => {
    let user = req.body.user
    let password = req.body.password
    let result = await addUser(user, password)
    if (result == "Success"){
        req.session.username = user;
        res.json(user);
        return user;
    } else {
        res.status(403).send("User exists");
        return;
    } 
})

// allows user to logout
app.get('/logout', (req, res) => {
    delete req.session.username;
    res.json(true);
})

//returns JSON object with all trips for logged in user
app.get('/tripids', async (req, res) => {
    if (req.session.username == undefined) {
        // res.send(req.session.username)
        res.status(403).send("Unauthorized");
        return;
    }
    let result = await getUsersTripNumbers(req.session.username)
    res.json(result);   
} );

//gets the details for the trip specified, sets that trip as the current trip
app.get('/gettrip/:id', async (req, res) => {
    let tripID = req.params.id
    let username = req.session.username
    if (username == undefined) {
        res.status(403).send("Unauthorized");
        return;
    }
    req.session.tripID = tripID
    let result = await getTripDetails(tripID, username)
    if (result == -1){
        res.status(403).send("Not your trip")
        return;
    } else {
        res.json(result)
        return
    } 
})

app.get('/edittrip', async (req, res) => {
    let tripID = req.session.tripID
    let username = req.session.username
    if (username == undefined || tripID== undefined) {
        res.json("Unauthorized");
        return;
    }
    let result = await getTripDetails(tripID, username)
    if (result == -1){
        res.json("Not your trip")
        return;
    } else {
        res.json(result)
        return
    } 
})



// add stop to trip, stopID must be passed in body of request
app.post('/addstop', async (req, res) => {
    let tripID = req.session.tripID
    let username = req.session.username
    let stopID = req.body.stopID
    if (tripID == undefined) {
        res.status(403).send("Unauthorized");
        return;
    }
    let result;
    if (username == undefined){
        result = await getTripDetails(tripID, "guest")
    } else {
        result = await getTripDetails(tripID, username)
    }
    if (result == -1){
        res.status(403).send("Not your trip")
        return;
    } else {
        let returnedStop = await addTripStop(tripID, stopID, username)
        res.json(returnedStop)
        return
    } 
})

//deletes stop specified in the body
app.post('/deletestop', async (req, res) => {
    if (req.body.stopID == undefined || req.session.tripID == undefined){
        res.status(403).send("Please provide stopID you would like to delete")
    }
    await searchWrapper(`DELETE FROM stops WHERE stopID = "${req.body.stopID}" AND tripID = "${req.session.tripID}"`)
    res.json(true)
})

app.get('/deleteallstops', async (req, res) => {
    if (req.session.tripID == undefined){
        res.status(403).send("Please provide stopID you would like to delete")
    }
    await deleteAllStops(req.session.tripID)
    res.json(true)
})

//deletes stop specified in the body
app.post('/stopsinstates', async (req, res) => {
    let states = req.body.states 
    if (states == undefined ){
        res.status(403).send("Please specify states you would like to see")
    }
    let results = await getSitesInStates(states)
    res.json(results)
})

app.post('/autofill/', async (req, res) => {
    let wordFrag = req.body.wordFrag
    let result = await autofillLocations(wordFrag)
    res.json(result)
})

//starts new trip
app.post('/starttrip', async (req, res) => {
    let startLocation = req.body.startLocation
    let destination = req.body.destination
    if (startLocation == undefined || destination == undefined){
        res.status(403).send("missing credentials")
        return
    }
    let result;
    if (req.session.username == undefined) {
        result = await createTrip("guest", startLocation, destination)
    } else {
        result = await createTrip(req.session.username, startLocation, destination)
    }
    if (result == "Trip Exists"){
        res.status(403).send("Trip Exists")
        return
    } else {
        req.session.tripID = result.rows[0].tripID
        res.json(result)
        return result;
    } 
})

//deletes trip that was last requested
app.post('/deletetrip', async (req, res) => {
    if (req.session.username== undefined){
        res.status(403).send("missing credentials")
    }
    req.session.tripID=""
    await searchWrapper(`DELETE FROM stops WHERE tripID = "${req.body.tripID}"`)
    await searchWrapper(`DELETE FROM trips WHERE rowid = "${req.body.tripID}"`)
    res.json(true)
})

// updates start location or destination
//deletes trip that was last requested
app.post('/updateroute', async (req, res) => {
    let start = req.body.newStartLocation
    let destination = req.body.newEndLocation
    let user = req.session.username
    let tripID = req.session.tripID
    if (tripID == undefined || user == undefined || start == undefined || destination == undefined){
        res.status(403).send("missing credentials")
    }
    await searchWrapper(`UPDATE trips SET startLocation ="${start}", endLocation ="${destination}" WHERE rowid ="${tripID}"`)
    res.json(true)
})

app.listen(port, () => {
    console.log("Mapper up and running on port " + port);
});
//returns trip details

//Start of database wrappers

let db = new sqlite3.Database('db.sqlite', (e) => {
  if (e) {
    return console.error(e.message);
  }
});


let sql 


//returns all destinations in database
function getAllPlaces(){
    sql = `SELECT Name FROM combinedSites`
    searchWrapper(sql)
}


//executes the sql comand passed as a parameter
async function searchWrapper(sql){
    return new Promise(function (resolve, reject) {
        db.all(sql, [], function (err, rows){
            if (err) {
                reject(err)
            } else {
                resolve({rows: rows})
            }
        })
    })
}

async function deleteAllStops(trip){
    
    return await searchWrapper(`DELETE FROM stops WHERE tripID = "${trip}"`)
}


//Finds all the sites in the state listed in the route object, states must be spelled out strings in an array
async function getSitesInStates(states){
    sql = ""
    //Creates a SQL command that selects all stops in states
    for (state of states){
        sql = sql+`
        SELECT * 
        FROM citiesAndSites
        WHERE State LIKE "${state}" AND Type <> "City/Town"
        UNION`
    }
    sql = sql.slice(0,-5)
    // Ensures that out of ~100,000 possible stops, only the 100 most popular stops (Weight=popularity) are returned.
    sql = "SELECT * FROM (SELECT * FROM ("+sql+`)
    ORDER BY Weight DESC
    LIMIT 100) WHERE Checked = 0 AND Type = "National Historic Register"`
    let ans = await searchWrapper(sql)
    //iterates through each suggestion to get the description if it doesn't exist
    for (place of ans.rows) {
        //Checks to see if Wikipedia needs to be queried for this stop
        if ((place.Description == -1 || place.Description.startsWith("https://")) && place.Checked==0){
            let wikiName = place.Name.split(" ").join("_")
            let wikiRequest = "https://en.wikipedia.org/api/rest_v1/page/summary/"+wikiName
            let result
            // queries Wikipedia for description
            try {
                await searchWrapper(`UPDATE citiesAndSites SET Checked =1 WHERE Name="${place.Name}"`)
                result = await axios.get(wikiRequest)
                if (result.data.type=="standard"){
                    await searchWrapper(`UPDATE citiesAndSites SET Description ="${result.data.extract}" WHERE Name="${place.Name}"`)
                }
            //logs to console if suggestion is not in Wikepedia
            } catch {
            }
        }
    }
    sql = ""
    for (state of states){
        sql = sql+`
        SELECT * 
        FROM citiesAndSites
        WHERE State LIKE "${state}" AND Type <> "City/Town" AND Description <>-1 AND Description NOT LIKE "https%"
        UNION`
    }
    sql = sql.slice(0,-5)
    sql = "SELECT * FROM ("+sql+`)
    ORDER BY Weight DESC
    LIMIT 100`
    return await searchWrapper(sql)
    
}

async function autofillLocations(inputString){
    sql = `SELECT Name, State FROM citiesAndSites
            WHERE  Name LIKE "${inputString}%"
            ORDER BY Weight DESC
            LIMIT 4`
    return await searchWrapper(sql)
}
// Creates a database instance for a trip
async function createTrip(username, startLocation, endLocation){
    let sqlTrip = `SELECT * from trips WHERE username = "${username}" AND startLocation = "${startLocation}" AND endLocation = "${endLocation}"`
    //Checks if user is already in database, if not adds user
    let res = await searchWrapper(sqlTrip)
    if (res.rows[0] != undefined) {
        return "Trip Exists"
    } 
    let sqlAddCommand = `INSERT INTO trips VALUES ("${username}", "${startLocation}", "${endLocation}")`
    await searchWrapper(sqlAddCommand)

    let rowid = await searchWrapper(`SELECT rowid as tripID FROM trips WHERE username = "${username}" AND startLocation = "${startLocation}" AND endLocation = "${endLocation}"`)
    return rowid
}



// Creates stops on trip that can be matched by ID to respective trip
async function addTripStop(tripID, stopID, username){
    let sqlStopCommand = `INSERT INTO stops VALUES ("${stopID}", "${tripID}")`
    await searchWrapper(`UPDATE citiesAndSites Set Weight = Weight+1 WHERE Name = "${stopID}"`)
    await searchWrapper(sqlStopCommand)

    return  await getTripDetails(tripID, username)
}

async function getNPS(){
    let ans = await searchWrapper(`SELECT * FROM citiesAndSites WHERE Type = "National Park"`)
    let ret = []
    for (place of ans.rows){
        ret.push(place.Name)
    }
    return ret
}


//returns all of a user's saved trip numbers
async function getUsersTripNumbers(username){
    // let getTripIDsSQL = `SELECT DISTINCT T.rowid as tripID FROM stops S, trips T, users U WHERE U.username = "${username}" AND U.username = T.username AND T.rowid = S.tripID`
    // console.log(getTripIDsSQL)
    let resu = await searchWrapper(`SELECT rowid as tripID FROM trips WHERE username="${username}"`)
    return resu
}



//returns start location, destination, and stops for trip
async function getTripDetails(tripID, username){
    let tripOwner = await searchWrapper(`SELECT username FROM trips WHERE rowid="${tripID}"`)
    if (tripOwner.rows[0].username != username){
        return -1
    }
    let endpointRequestSQL = `SELECT startLocation, endLocation
                              FROM trips
                              WHERE rowid="${tripID}"`
    let endpoints = await searchWrapper(endpointRequestSQL)
    let stopRequestSQL = `SELECT stopID 
                          FROM stops 
                          WHERE tripID = "${tripID}"`
    let stops = await searchWrapper(stopRequestSQL)
    let result =[endpoints, stops]
    return result
}

//checks if login details are valid
async function checkLogin(username, password) {
    let sqlCheckUserName = `SELECT * from users WHERE username = "${username}" `
    //Checks if user is already in database, if not adds user
    let res = await searchWrapper(sqlCheckUserName)
    if (res.rows[0] == undefined) {
        return "User does not exist"
    } else if (res.rows[0].password ==password){
        return "Success"
    }
    return "Incorrect password"
}

// creates a new user
async function addUser(username, password){
    //Checks if user is already in database, if not adds user
    let log = await checkLogin(username, password)
    if (log != "User does not exist"){
        return "User exists"
    } else {
        let sqlUserCommand = `INSERT INTO users (username, password) VALUES ("${username}", "${password}")`
    
        await searchWrapper(sqlUserCommand)
        return "Success"
    }
}


// closes database
// function closeDB(){
//     db.close((e) => {
//     if (e) {
//         return console.error(e.message);
//     }
//     console.log('Close the database connection.');
//     });
// }

    
async function test(){
    console.log(await searchWrapper(`DELETE FROM citiesAndSites WHERE Name LIKE "%island%"`))
}
test()
// // // // //writeSearch(route)
// dUser("arisf", "arispassword")
// createTrip("arisf", "Wake Forest", "Sedona, AZ")
// addTripStop(1,"Great Sand Dunes National Park")
// console.log(await getUsersTripNumbers("arisf"))
// addUser("asd", "arisotherpassowrd")
// removeTripStop(2, "Black Canyon of the Gunnison")
// removeTrip(1)
// let res = checkLogin("arisf", "arispassword")
// console.log("res"+res)

// closeDB()
// close the database connection