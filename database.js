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
  console.log('Connected');
});

let sql = `
SELECT *
FROM nationalParks
WHERE State = "UT"
`

db.all(sql, [], (err, rows) => {
  if (err) {
    throw err;
  }
  rows.forEach((row) => {
    console.log(row);
  });
});

// close the database connection
db.close((e) => {
  if (e) {
    return console.error(e.message);
  }
  console.log('Close the database connection.');
});