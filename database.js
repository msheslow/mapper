const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const app = express()
const axios = require('axios');
const { exec } = require('child_process');
const expressSession = require('express-session');
const cors = require('cors');
const bodyParser= require('body-parser');
app.use(bodyParser.json());
let port = process.env.PORT || 8080

app.use(express.static(__dirname))

app.use(expressSession({
    name: "mapperSessionCookie",
    secret: ["username", "tripID"],
    resave: false,
    saveUninitialized: false
}));


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
        console("username: "+req.session.username)
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

// add stop to trip, stopID must be passed in body of request
app.post('/addstop', async (req, res) => {
    let tripID = req.session.tripID
    let username = req.session.username
    let stopID = req.body.stopID
    if (username == undefined || tripID == undefined) {
        res.status(403).send("Unauthorized");
        return;
    }
    let result = await getTripDetails(tripID, username)
    if (result == -1){
        res.status(403).send("Not your trip")
        return;
    } else {
        let returnedStop = await addTripStop(tripID, stopID)
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

//deletes stop specified in the body
app.post('/stopsinstates', async (req, res) => {
    let states = req.body.states 
    if (states == undefined ){
        res.status(403).send("Please states you would like to see")
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
    if (startLocation == undefined || destination == undefined || req.session.username == undefined){
        res.status(403).send("missing credentials")
        return
    }
    let result = await createTrip(req.session.username, startLocation, destination)
    if (result == "Trip Exists"){
        res.status(403).send("Trip Exists")
        return
    } else {
        req.session.tripID = result
        res.json(result)
        return result;
    } 
})

//deletes trip that was last requested
app.post('/deletetrip', async (req, res) => {
    if (req.session.tripID == undefined || req.session.username== undefined){
        res.status(403).send("missing credentials")
    }
    await searchWrapper(`DELETE FROM stops WHERE tripID = "${req.session.tripID}"`)
    await searchWrapper(`DELETE FROM trips WHERE rowid = "${req.session.tripID}"`)
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
    console.log("User Login Example up and running on port " + port);
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


//Finds all the sites in the state listed in the route object, states must be spelled out strings in an array
async function getSitesInStates(states){
    sql = ""
    for (state of states){
        sql = sql+`
        SELECT * 
        FROM citiesAndSites
        WHERE State LIKE "${state}" AND Type <> "City/Town"
        UNION`
    }
    sql = sql.slice(0,-5)
    sql = "SELECT * FROM ("+sql+`)
    ORDER BY Weight DESC
    LIMIT 100`
    let ans = await searchWrapper(sql)
    // console.log(ans)
    for (place of ans.rows) {
        if ((place.Description == -1 || place.Description.startsWith("https://")) && place.Checked==0){
            let wikiName = place.Name.split(" ").join("_")
            let wikiRequest = "https://en.wikipedia.org/api/rest_v1/page/summary/"+wikiName
            let result
            try {
                await searchWrapper(`UPDATE citiesAndSites SET Checked =1 WHERE Name="${place.Name}"`)
                result = await axios.get(wikiRequest)
                if (result.data.type=="standard"){
                    await searchWrapper(`UPDATE citiesAndSites SET Description ="${result.data.extract}" WHERE Name="${place.Name}"`)
                    // console.log(result.data.extract)
                }
            } catch {
                console.log("wiki sad :(")
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
            LIMIT 6`
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
async function addTripStop(tripID, stopID){
    let sqlStopCommand = `INSERT INTO stops VALUES ("${stopID}", "${tripID}")`
    await searchWrapper(`UPDATE citiesAndSites Set Weight = Weight+1 WHERE Name = "${stopID}"`)
    return await searchWrapper(sqlStopCommand)
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
    let tripOwner = await searchWrapper(`SELECT username FROM trips`)
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
function closeDB(){
    db.close((e) => {
    if (e) {
        return console.error(e.message);
    }
    console.log('Close the database connection.');
    });
}

    

// // // // //writeSearch(route)
// async function test(){
//     console.log(await searchWrapper(`INSERT INTO users VALUES ("arisf", "arispassword")`))
//     console.log(await searchWrapper(`INSERT INTO trips VALUES ("arisf", "New York, New York", "Charlotte, North Carolina")`))
//     console.log(await searchWrapper(`INSERT INTO trips VALUES ("arisf", "Raleigh, North Carolina", "Sedona, Arizona")`))
//     console.log(await searchWrapper(`INSERT INTO stops VALUES ("2", "Los Duranes Chapel")`))
//     // console.log(await getSitesInStates(["New Mexico", "Utah"]))
// }
// test()
// // // // addUser("arisf", "arispassword")
// createTrip("arisf", "Wake Forest", "Sedona, AZ")
// addTripStop(1,"Great Sand Dunes National Park")
// console.log(await getUsersTripNumbers("arisf"))
// addUser("asd", "arisotherpassowrd")
// getTripDetails(1)
// removeTripStop(2, "Black Canyon of the Gunnison")
// getTripDetails(2)
// removeTrip(1)
// let res = checkLogin("arisf", "arispassword")
// console.log("res"+res)

// closeDB()
// close the database connection