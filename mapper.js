// Google Maps mapping script

// This initMap function builds the map. initMap() is set as the callback for the google maps API request.
async function initMap() {
    let directionsService = await new google.maps.DirectionsService;
    let directionsDisplay = await new google.maps.DirectionsRenderer;
    let local_waypoints = []; // THIS NEEDS TO BE PULLED FROM SERVER
    

    let options = {
        zoom: 3,
        center: {lat:35.9132, lng:-79.0558}
    }

    // New map object initialized at <div id="map"> 
    let map = await new google.maps.Map(document.getElementById('map'), options);
    await directionsDisplay.setMap(map);

    // eventHandler function for onsite action
    let planRouteHandler = async function() {
     
    };

    async function createTripHandler(event){
        event.preventDefault();
        makeRoute(directionsService, directionsDisplay);
        try {
            let result= await axios.post('https://mapper-project.herokuapp.com/starttrip', { startLocation: $('#start').val(),
            destination: $('#end').val() }, { headers: {'Access-Control-Allow-Origin': '*'}});
            console.log("Created a trip!");
            console.log(result);
            document.cookie = "tripID=" + result;
            $('#originWaypoint').append(startCardAssembler($('#start').val()));
            $('#destinationWaypoint').append(endCardAssembler($('#end').val()));
            /*
            let result = getSitesinStates();
            for (i=0; i<result.data.rows.length; i++) {
                $('')
            }
            */
        } catch {
            // window.alert("This trip already exists! Please enter a start and end location that is different from a trip you have already created. If you want to edit this trip, click on the user icon in the top right corner and select 'Edit Trip'");
            console.log("Creating a trip Didn't work lol")
        }
    }

    async function waypointHandler(event) {
        let newWaypoint = {
            location: document.getElementById('addWaypoint').value,
            stopover: true
        }
        local_waypoints.push(newWaypoint);
        await addRoute(directionsService, directionsDisplay, local_waypoints);
    }

    // -------------- POPULATES THE WAYPOINT PART OF THE HTML WITH WAYPOINT CARDS ---------------
    async function waypointMaker(waypointOrder, waypoints){
        // ------- HTML stuff starts here -------
        $('#listWaypoints').empty()
        for (i=0; i<waypointOrder.length; i++) {
            console.log("line 273: " + waypointOrder[i]);
            let waypointNum = waypointOrder[i];
            console.log("line 275: " + waypointNum);
            $('#listWaypoints').append(waypointCardAssembler(waypoints[waypointOrder[i]].location.query), waypointNum);
        }
        // ---------- Back end stuff start here -------------
        try {
            let result= await axios.post('https://mapper-project.herokuapp.com/addstop', { stopID: $('#addWaypoint').val() }, { headers: {'Access-Control-Allow-Origin': '*'}});
            console.log("Created a stop!")
           
        } catch {
            console.log("Adding a stop Didn't work lol")
        }
    }

    async function deleteWaypointHandler(event) {
        event.preventDefault();
        console.log(event);
        let current_card = event.currentTarget.parentElement.parentElement.parentElement;
        console.log(current_card);
        let waypointNum = current_card.id;
        console.log("waypointNum: " + waypointNum);
        console.log("waypoints: " + local_waypoints);
        local_waypoints.splice(waypointNum, 1);
        deleteWaypoint(waypointNum);

        let result = await axios.post('https://mapper-project.herokuapp.com/deletestop', { stopID: /* this needs to be the name of the stop (ie. "Dallas, TX, USA") */ "placeholder"  }, { headers: {'Access-Control-Allow-Origin': '*'}});
    }


   // ---------- EVENT LISTENERS ---------------
    $('main').on('click', '#add', waypointHandler);
    $('main').on('click', '#generate-map', createTripHandler);
    $('main').on('click', '#anotherAdd', attractionCardAddHandler);// wat dis is?
    $('main').on('click', '#delete', deleteWaypointHandler)
   


    // Sets the selected <input> html elements to become autocomplete objects
    async function autocomplete(string){
        try {
            let result= await axios.post('https://mapper-project.herokuapp.com/autofill', { wordFrag: string }, { headers: {'Access-Control-Allow-Origin': '*'}});
            return result.data.rows
           
        } catch {
            console.log("Autocomplete didnt work lol")
        }
    }

    let start_autocomplete = await new google.maps.places.Autocomplete(
            document.getElementById('start'),
            {
                types: ['(regions)'],
                componentRestrictions: {'country': ['US']},
                fields: ['place_id', 'geometry', 'name']
    });

    let end_autocomplete = await new google.maps.places.Autocomplete(
            document.getElementById('end'),
            {
                types: ['(regions)'],
                componentRestrictions: {'country': ['US']},
                fields: ['place_id', 'geometry', 'name']
    });

    let addWaypoint_autocomplete = await new google.maps.places.Autocomplete(
        document.getElementById('addWaypoint'),
        {
            types: [
                'geocode',
                'establishment'
            ],
            componentRestrictions: {'country': ['US']},
            fields: ['place_id', 'geometry', 'name']
    });

    // Array of Markers that are places on the map
    let markers = [];

    // This for-loop places all the markers in the marker array onto the map by repeatedly calling the addMarker function
    for (let i = 0; i < markers.length; i++) {
        await addMarker(markers[i]);
    }

    // This addMarker function will place a single specified marker onto the map
    async function addMarker(properties) {
        let marker = await new google.maps.Marker({
            position: properties.coordinates,
            map: map
        });


        if (properties.content) {
            let infoWindow = await new google.maps.InfoWindow({
                content: properties.content
            });

            await marker.addListener('click', function() {
                infoWindow.open(map, marker);
            });
        }
    }

    // makeRoute draws the route line between two locations on the map
    async function makeRoute(directionsService, directionsDisplay) {
        await directionsService.route({
            origin: document.getElementById('start').value,
            destination: document.getElementById('end').value,
            travelMode: 'DRIVING',
            optimizeWaypoints: true,
        },async function(response, status) {
            if (status === 'OK') {
                await directionsDisplay.setDirections(response);
                window.scrollTo(0, 700);
            } else {
                window.alert('Please enter an origin and destination, then click "Plan Route"');
            }
        });

        async function start() {
            window.setTimeout(stateTrav,1000, directionsDisplay);
        }
        start();
    }

    async function addRoute(directionsService, directionsDisplay, local_waypoints) {
        await directionsService.route({
            origin: document.getElementById('start').value,
            destination: document.getElementById('end').value,
            travelMode: 'DRIVING',
            waypoints: local_waypoints,
            optimizeWaypoints: true,
        },async function(response, status) {
            if (status === 'OK') {
                await directionsDisplay.setDirections(response);
                window.scrollTo(0, 700);
                waypointMaker(response.routes[0].waypoint_order, response.request.waypoints);
            } else {
                window.alert('Please enter an origin and destination, then click "Plan Route"');
            }
        });

        async function start() {
            window.setTimeout(stateTrav,1000, directionsDisplay);
        }
        start();
    }



    // Makes an array of all the states the route passes through (Adjust incrementation for price savings)
    async function stateTrav(directionsDisplay) {
        let states = [];
        let step_length = directionsDisplay.directions.routes[0].overview_path.length;

        for (let i = 0; i < step_length; i = i + 5) {
            let LAT = directionsDisplay.directions.routes[0].overview_path[i].lat();
            let LNG = directionsDisplay.directions.routes[0].overview_path[i].lng();
            let state = await getState(LAT, LNG);
            if (!states.includes(state)) {
                states.push(state);
            }
        }
            getStopsInStates(states);
            return states;
    }

    //Eventually, this function needs to take in the array of states passed through and make a call to the backend to find stops in states (in order to build the cards for each site)
    /* 
    async function getSitesinStates() {
        try {
            let result= await axios.post('http://mapper-project.herokuapp.com/stopsinstates', { states: stateTrav(directionsDisplay) }, { headers: {'Access-Control-Allow-Origin': '*'}});
            console.log("result of states axios");
            console.log(result);
            return result;
        } catch {
            console.log("get sites in states didn't work");
        }
    }
    */

    // asks google geocode API which state the LatLng falls within
    async function revGeocode(LAT, LNG) {
        try {
            let KEY = "AIzaSyBhcNo_EDGsF_lGfThVgAVtweh_DlciUCQ";
            let url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${LAT},${LNG}&key=${KEY}`;
            let response = await axios.get(url);
            let data = response.data.results[0].address_components;
            let state_name;
            data.forEach(data => {
                if (data.types.includes("administrative_area_level_1")) {
                    state_name = data.long_name;
                }
            });
            return state_name;
        } catch (err) {
            console.log(err);
        }
        return;
    }

    // call this to get the State abbreviation for a given latitude and longitude
    async function getState(LAT, LNG) {
        let result = await revGeocode(LAT, LNG);
        return result;
    }

    function startCardAssembler(waypoint){
        return (`<div class="waypointCard box" style="background-color: #CCFFCC; margin-bottom: 10px;">
                                    <div class="columns">
                                        <div class="column is-four-fifths">
                                            <span style="font-size: 20px; color: black;">${waypoint}</span>
                                        </div>
                                        <div class="column" style="text-align: right;">
                                        </div>
                                    </div>
                                </div>`)

    }

        function endCardAssembler(waypoint){
        return (`<div class="waypointCard box" style="background-color: #FFCCCC;">
                                    <div class="columns">
                                        <div class="column is-four-fifths">
                                            <span style="font-size: 20px; color: black;">${waypoint}</span>
                                        </div>
                                        <div class="column" style="text-align: right;">
                                        </div>
                                    </div>
                                </div>`)

    }

    function waypointCardAssembler(waypoint, waypointNum){
        console.log("waypointNum: " + waypointNum);
        console.log('waypoint: ' + waypoint);
        return (`<div class="waypointCard box" id="${waypointNum}" style="background-color: #ECECEC; margin-bottom: 10px;">
                                    <div class="columns">
                                        <div class="column is-four-fifths">
                                            <span style="font-size: 20px; color: black;">${waypoint}</span>
                                        </div>
                                        <div class="column" style="text-align: right;">
                                            <button class="button del is-rounded is-small" id="delete"><i class="far fa-trash-alt"></i></button>
                                        </div>
                                    </div>
                                </div>`)

    }




        // Add a stop from suggested, stopID (this is not done)
        async function attractionCardAddHandler(event){
        event.preventDefault();
        try {
            let result= await axios.post('https://mapper-project.herokuapp.com/addstop', { stopID: $('#addWaypoint').val() }, { headers: {'Access-Control-Allow-Origin': '*'}});
            console.log("Created a stop in a different way!")
        } catch {
            console.log("Didn't work lol")
        }
        }


        function attractionsCardAssembler(attraction) {
            return (`<div class="box">
                        <span style="font-size: 30px;"><b>${attraction.Name}</b></span>
                        <button class="button is-rounded" id="anotherAdd"><i class="fas fa-plus-circle"></i></button><br>
                        <span style="color: gray; font-size:14px;">${attraction.Type}</span>
                        <span style="color: gray; font-size: 14px; font-weight: normal;">${attraction.Description}</span>
                    </div>`)
        }

        async function getStopsInStates(states){
            try {
                let result= await axios.post('https://mapper-project.herokuapp.com/stopsinstates', { states: states }, { headers: {'Access-Control-Allow-Origin': '*'}});
                console.log(result);
            } catch {
                console.log(result);
                console.log("Adding a stop Didn't work lol")
            }
            for(let i=0; i<result.rows.length; i+=3) {
                if (i=result.rows.length) {
                    return
                } else { $('#attractionsTwo').attractionsCardAssembler(result.rows[i]);}
                if (i+1>result.rows.length) {
                    return
                } else { $('#attractionsThree').attractionsCardAssembler(result.rows[i+1]);}
                if (i+2>result.rows.length) {
                    return;
                } else { $('#attractionsOne').attractionsCardAssembler(result.rows[i+2]);}
            }
        }

    //  console.log("reached")
    //  console.log(getStopsInStates(["Connecticut", "New York", "Pennsylvania", "Ohio"]))

        async function deleteWaypoint() {

            await directionsService.route({
                origin: document.getElementById('start').value,
                destination: document.getElementById('end').value,
                travelMode: 'DRIVING',
                waypoints: local_waypoints,
                optimizeWaypoints: true,
            },async function(response, status) {
                if (status === 'OK') {
                    await directionsDisplay.setDirections(response);
                    window.scrollTo(0, 700);
                    waypointMaker(response.routes[0].waypoint_order, response.request.waypoints);
                } else {
                    window.alert('Please enter an origin and destination, then click "Plan Route"');
                }
            });
        
            async function start() {
                window.setTimeout(stateTrav,1000, directionsDisplay);
            }
            start();
        }
    }

