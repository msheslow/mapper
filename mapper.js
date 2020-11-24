// Google Maps mapping script

// This initMap function builds the map. initMap() is set as the callback for the google maps API request.
async function initMap() {
    let directionsService = await new google.maps.DirectionsService;
    let directionsDisplay = await new google.maps.DirectionsRenderer;
    let local_waypoints = []; // Pulled from back-end API
    let session_trip;
    
    session_trip = await axios.get('https://mapper-project.herokuapp.com/edittrip/');
    if (session_trip.data =="Unauthorized"||session_trip.data=="Not your trip") {
        console.log(session_trip)
    } else {
        console.log(session_trip)
        let edit_origin = session_trip.data[0].rows[0].startLocation;
        let edit_destination = session_trip.data[0].rows[0].endLocation;
        let edit_waypoints = [];

        for (let i = 0; i < session_trip.data[1].rows.length; i++) {
            edit_waypoints.push({location: session_trip.data[1].rows[i].stopID, stopover: true});
        }

        local_waypoints = edit_waypoints;

        document.getElementById('start').value = edit_origin;
        document.getElementById('end').value = edit_destination;

        $('#originWaypoint').empty();
        $('#destinationWaypoint').empty();
        $('#originWaypoint').append(startCardAssembler($('#start').val()));
        $('#destinationWaypoint').append(endCardAssembler($('#end').val()))
        $('#loadingBox').append(
            `<div class="box" style="text-align: center;">
                <span style="font-size: 20px; color: black;">Suggestions are loading...</span><br>
                <progress class="progress is-large is-primary" max="100">15%</progress>
            </div>`);

        await edit_Waypoint(directionsService, directionsDisplay, edit_origin, edit_destination, local_waypoints);
        window.scrollTo(0, 700);
    }


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

    async function calculate_distance(result) {
        let totalDist = 0;
        let totalTime = 0;
        let computedDistance;
        let computedDays;
        let computedHours;
        let computedMinutes;
        let day_str;
        let hr_str;
        let min_str;
        let myroute = result.routes[0];
        for (i = 0; i < myroute.legs.length; i++) {
          totalDist += myroute.legs[i].distance.value;
          totalTime += myroute.legs[i].duration.value;
        }

        computedDays = Math.floor((totalTime / (24*60*60)));
        computedHours = Math.floor((totalTime % (24*60*60)) / (60*60));
        computedMinutes = Math.floor((totalTime % (60*60) / 60));

        computedDistance = totalDist / 1609.34;

        let distance_str = computedDistance.toFixed(2) + " mi";
        
        if (computedDays != 1) {
            day_str = " days, ";
        } else {
            day_str = " day, ";
        }
        if (computedHours != 1) {
            hr_str = " hours, ";
        } else {
            hr_str = " hour, ";
        }
        if (computedMinutes != 1) {
            min_str = " minutes";
        } else {
            min_str = " minute";
        }
        let time_str = computedDays + day_str + computedHours + hr_str + computedMinutes + min_str;
        console.log("total distance is: " + distance_str + "<br>total time is: " + time_str);
        document.getElementById("distance").innerHTML = "<b>Total Distance: </b>" + distance_str;
        document.getElementById("time").innerHTML = "<b>Estimated Travel Time: </b>" + time_str;
    }


    const debouncedFunction = (autocomplete, delay) => { 
        let timer 
        return function() { 
            const context = this
            const args = arguments 
            clearTimeout(timer) 
                timer 
            = setTimeout(() => autocomplete.apply(context, args), delay) 
        } 
    }  
    // ---------- EVENT LISTENERS ----------------
    $('main').on('click', '#add', waypointHandler);
    $('main').on('click', '#generate-map', createTripHandler);
    $('main').on('click', '#anotherAdd', attractionCardAddHandler);
    $('main').on('click', '#delete', deleteWaypointHandler)
    $('main').on('input', '#start', debouncedFunction(start_db_autocomplete, 100));
    $('main').on('input', '#end', debouncedFunction(end_db_autocomplete, 100));
    $('main').on('input', '#addWaypoint', debouncedFunction(waypoint_db_autocomplete, 100));
    // $('main').on('input', '#start', start_db_autocomplete);
    // $('main').on('input', '#end', end_db_autocomplete);
    // $('main').on('input', '#addWaypoint', waypoint_db_autocomplete);
    $('main').on('click', '.autocomplete-box',start_autocomplete_click_handler);


    

    async function start_autocomplete_click_handler(event) {
        let place_name = event.currentTarget.firstChild.nextSibling.innerText;

        if (event.currentTarget.parentElement.id == "start-column") {
            document.getElementById("start").value = place_name;
            $('#start-column').empty();
        } else if (event.currentTarget.parentElement.id == "end-column") {
            document.getElementById("end").value = place_name;
            $('#end-column').empty();
        } else if (event.currentTarget.parentElement.id == "waypoint-column") {
            console.log(event);
            document.getElementById("addWaypoint").value = event.currentTarget.childNodes[1].lastElementChild.innerText;
            $('#waypoint-column').empty();
        }

    }

    async function start_db_autocomplete(event){
        let input_string = event.currentTarget.value; 

        if (input_string.length == 0) {
            $('#start-column').empty();
            return false;
        }

        let result;
        try {
            result= await axios.post('https://mapper-project.herokuapp.com/autofill', { wordFrag: input_string }, { headers: {'Access-Control-Allow-Origin': '*'}});
            console.log(result.data.rows);
            result = result.data.rows
           
        } catch {
            console.log("Autocomplete didnt work lol")
        }
        $('#start-column').empty();

        for (place of result){
            $('#start-column').append(`<div class="autocomplete-box">
            <div>
            <span style="font-size: 10px; color: black;">${place.Name + ", " + place.State}</span>
            </div>
        </div>`)
        }
    }

    async function end_db_autocomplete(event){
        let input_string = event.currentTarget.value; 

        if (input_string.length == 0) {
            $('#end-column').empty();
            return false;
        }

        let result;
        try {
            result= await axios.post('https://mapper-project.herokuapp.com/autofill', { wordFrag: input_string }, { headers: {'Access-Control-Allow-Origin': '*'}});
            console.log(result.data.rows);
            result = result.data.rows
           
        } catch {
            console.log("Autocomplete didnt work lol")
        }
        $('#end-column').empty();

        for (place of result){
            $('#end-column').append(`<div class="autocomplete-box">
            <div>
            <span style="font-size: 10px; color: black;">${place.Name + ", " + place.State}</span>
            </div>
        </div>`)
        }
    }

    async function waypoint_db_autocomplete(event){
        let input_string = event.currentTarget.value; 

        if (input_string.length == 0) {
            $('#waypoint-column').empty();
            return false;
        }

        let result;
        try {
            result= await axios.post('https://mapper-project.herokuapp.com/autofill', { wordFrag: input_string }, { headers: {'Access-Control-Allow-Origin': '*'}});
            console.log(result.data.rows);
            result = result.data.rows
           
        } catch {
            console.log("Autocomplete didnt work lol")
        }
        $('#waypoint-column').empty();

        for (place of result){
            $('#waypoint-column').append(`<div class="autocomplete-box">
            <div>
            <span style="font-size: 10px; color: black;">${place.Name + ", " + place.State}</span>
            </div>
        </div>`)
        }
    }

    async function createTripHandler(event){
        event.preventDefault();
        try {
            let result= await axios.post('https://mapper-project.herokuapp.com/starttrip', { startLocation: $('#start').val(),
            destination: $('#end').val() }, { headers: {'Access-Control-Allow-Origin': '*'}});
            document.cookie = "tripID=" + result.data.rows[0].tripID;
            $('#originWaypoint').empty();
            $('#destinationWaypoint').empty();
            $('#originWaypoint').append(startCardAssembler($('#start').val()));
            $('#destinationWaypoint').append(endCardAssembler($('#end').val()));
            makeRoute(directionsService, directionsDisplay);
            // loading button
            window.scrollTo(0,700)
            $('#loadingBox').append(
                `<div class="box" style="text-align: center;">
                    <span style="font-size: 20px; color: black;">Suggestions are loading...</span><br>
                    <progress class="progress is-large is-primary" max="100">15%</progress>
                </div>`);
        } catch {
            console.log('Please enter an origin and destination, then click "Plan Route"');
            console.log("Creating a trip Didn't work lol")
        }
    }

        async function waypointHandler(event) {
            let newWaypoint = {
                location: document.getElementById('addWaypoint').value,
                stopover: true
            }
            local_waypoints.push(newWaypoint);
            await add_Waypoint(directionsService, directionsDisplay, local_waypoints);
            window.scrollTo(0, 700);
        }

        async function add_Waypoint(directionsService, directionsDisplay, local_waypoints) {
            await directionsService.route({
                origin: document.getElementById('start').value,
                destination: document.getElementById('end').value,
                travelMode: 'DRIVING',
                waypoints: local_waypoints,
                optimizeWaypoints: true,
            },async function(response, status) {
                if (status === 'OK') {
                    await directionsDisplay.setDirections(response);
                    await waypointMaker(response.routes[0].waypoint_order, response.request.waypoints, local_waypoints);
                    calculate_distance(response);
                } else {
                    console.log('Please enter an origin and destination, then click "Plan Route"');
                }
            });
    
            async function start() {
                window.setTimeout(stateTrav,1000, directionsDisplay);
            }
            start();
        }

        async function edit_Waypoint(directionsService, directionsDisplay, edit_origin, edit_destination, local_waypoints) {
            await directionsService.route({
                origin: edit_origin,
                destination: edit_destination,
                travelMode: 'DRIVING',
                waypoints: local_waypoints,
                optimizeWaypoints: true,
            },async function(response, status) {
                if (status === 'OK') {
                    await directionsDisplay.setDirections(response);
                    await waypointMaker(response.routes[0].waypoint_order, response.request.waypoints, local_waypoints);
                    calculate_distance(response);
                } else {
                    console.log('Please enter an origin and destination, then click "Plan Route"');
                }
            });
    
            async function start() {
                window.setTimeout(stateTrav,1000, directionsDisplay);
            }
            start();
        }
    
        // -------------- POPULATES THE WAYPOINT PART OF THE HTML WITH WAYPOINT CARDS ---------------
        async function waypointMaker(waypointOrder, waypoints, local_waypoints){
            let ordered_local_waypoints = [];
            for (let i = 0; i < local_waypoints.length; i++) {
                ordered_local_waypoints.push(local_waypoints[waypointOrder[i]]);
            }
            local_waypoints = ordered_local_waypoints;
            // ------- HTML stuff starts here -------
            $('#listWaypoints').empty()
            try{
                //placeholder
                let result = await axios.get('https://mapper-project.herokuapp.com/deleteallstops',{tripID: 1}, { headers: {'Access-Control-Allow-Origin': '*'}});
                    console.log("deleting all stops from the backend worked!")
                } catch {
                    console.log("deleting all stops from the backend didn't work")
                }
            let newresult;
            for (i=0; i<waypointOrder.length; i++) {
                console.log(waypointOrder);
                console.log(waypoints);
                let waypointNum = i; //
                console.log("waypointNum: ")
                console.log(waypointNum);
                $('#listWaypoints').append(waypointCardAssembler(waypointNum,local_waypoints[i].location));
                try {
                    newresult= await axios.post('https://mapper-project.herokuapp.com/addstop', { stopID: local_waypoints[i].location }, { headers: {'Access-Control-Allow-Origin': '*'}});
                    console.log("Created a stop! See it below")
                    console.log(newresult)
                } catch {
                    console.log("Adding a stop Didn't work lol")
                }
            }
            // ---------- Back end stuff start here -------------
            
        }
    
        async function deleteWaypointHandler(event) {
            let spliced_local_waypoints = [];

            event.preventDefault();
            console.log(event);
            let current_card = event.currentTarget.parentElement.parentElement.parentElement;

            for (let i = 0; i < local_waypoints.length; i++) {
                if (local_waypoints[i].location == current_card.innerText) {
                } else {
                    spliced_local_waypoints.push(local_waypoints[i]);
                }
            }
            local_waypoints = spliced_local_waypoints;

            await deleteWaypoint(directionsService, directionsDisplay, local_waypoints);
            window.scrollTo(0, 700);
        }
    
        async function deleteWaypoint(directionsService, directionsDisplay, local_waypoints) {
            
            await directionsService.route({
                origin: document.getElementById('start').value,
                destination: document.getElementById('end').value,
                travelMode: 'DRIVING',
                waypoints: local_waypoints,
                optimizeWaypoints: true,
            },async function(response, status) {
                if (status === 'OK') {
                    await directionsDisplay.setDirections(response);
                    await delete_waypointMaker(response.routes[0].waypoint_order, response.request.waypoints, local_waypoints);
                    calculate_distance(response);
                } else {
                    console.log('Please enter an origin and destination, then click "Plan Route"');
                }
            });
        
            async function start() {
                window.setTimeout(stateTrav,1000, directionsDisplay);
            }
            start();
        }
    
    
    
        // WHEN DELETING A WAYPOINT, CALL THIS INSTEAD  - BROKEN!!!!!! @ 3:51am 11/23 (lol)
        async function delete_waypointMaker(waypointOrder, waypoints, local_waypoints){
            let ordered_local_waypoints = [];
            for (let i = 0; i < local_waypoints.length; i++) {
                ordered_local_waypoints.push(local_waypoints[waypointOrder[i]]);
            }
            local_waypoints = ordered_local_waypoints;
            // ------- HTML stuff starts here -------
            $('#listWaypoints').empty()
            try{
                let result = await axios.get('https://mapper-project.herokuapp.com/deleteallstops', { headers: {'Access-Control-Allow-Origin': '*'}});
                    console.log("deleting all stops from the backend worked!")
                } catch {
                    console.log("deleting all stops from the backend didn't work")
                }
            let newresult;
            for (i=0; i<local_waypoints.length; i++) {
                let waypointNum = i;
                console.log("waypointNum (delete_waypointMaker): ");
                console.log(waypointNum);
            // POSSIBLE SOLUTION: Empty this HTML area right here - look in morning    
                $('#listWaypoints').append(waypointCardAssembler(waypointNum, local_waypoints[i].location));
                let waypointName = document.getElementById(waypointNum).getAttribute("waypoint-name");
                try{
                        newresult = await axios.post('https://mapper-project.herokuapp.com/addstop', { stopID: waypointName }, { headers: {'Access-Control-Allow-Origin': '*'}});
                        console.log("add a stop worked, see it below")
                        console.log(newresult)
                    } catch {
                        console.log("adding a stop didn't work")
                    }
            }
        }
    
    
    
       
    
        function removeSuggestions(){
            //will eventually close autocomplete suggestions
        }
    
        // Sets the selected <input> html elements to become autocomplete objects
        
    
        /*
        let start_autocomplete = await new google.maps.places.Autocomplete(
                document.getElementById('start'),
                {
                    types: ['(regions)'],
                    componentRestrictions: {'country': ['US']},
                    fields: ['place_id', 'geometry', 'name']
        });
        */
    
        /*
        let end_autocomplete = await new google.maps.places.Autocomplete(
                document.getElementById('end'),
                {
                    types: ['(regions)'],
                    componentRestrictions: {'country': ['US']},
                    fields: ['place_id', 'geometry', 'name']
        });
        */
    
    
    /*
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
        */
    
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
    
        async function makeRoute(directionsService, directionsDisplay) {
            await directionsService.route({
                origin: document.getElementById('start').value,
                destination: document.getElementById('end').value,
                travelMode: 'DRIVING',
                waypoints: local_waypoints,
                optimizeWaypoints: true,
            },async function(response, status) {
                if (status === 'OK') {
                    await directionsDisplay.setDirections(response);
                    calculate_distance(response);
                } else {
                    console.log('Please enter an origin and destination, then click "Plan Route"');
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
    
        function waypointCardAssembler(waypointNum,waypoint){
            return (`<div class="waypointCard box" id="${waypointNum}" waypoint-name="${waypoint}" style="background-color: #ECECEC; margin-bottom: 10px;">
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
                let current_card = event.currentTarget.parentElement.parentElement.parentElement.parentElement;
                console.log(current_card);
                let waypointName = current_card.id;
                let newWaypoint = {
                    location: waypointName,
                    stopover: true
                }
                local_waypoints.push(newWaypoint);
                await add_Waypoint(directionsService, directionsDisplay, local_waypoints);
                }
               
            


    
    
            function attractionsCardAssembler(attraction) {
                return(`<div class="box attractionBoxes" id="${attraction.Name + " - " + attraction.Type}">
                            <div>
                                <div class="columns">
                                    <div class="column is-10">
                                        <span style="font-size: 30px;"><b>${attraction.Name}</b></span><br>
                                        <span style="color: black; font-size:14px;"><b>${attraction.Type}</b></span>
                                    </div>
                                <div class="column">
                                        <button class="button is-rounded" id="anotherAdd"><i class="fas fa-plus-circle"></i></button><br>
                                </div>
                            </div>
                            <span style="color: gray; font-size: 14px; font-weight: normal;">${attraction.Description}</span>
                        </div>`)
            }
    
            async function getStopsInStates(states){
                let result= await axios.post('https://mapper-project.herokuapp.com/stopsinstates', { states: states }, { headers: {'Access-Control-Allow-Origin': '*'}});
                console.log("you hit this line")
                $('#loadingBox').empty();
                $('#loadingBox').append(
                    `<div class="box" style="text-align: center;">
                        <span style="font-size: 20px; color: black;">Suggestions are loaded</span><br>
                        <progress class="progress is-large is-primary" value="100" max="100">100%</progress>
                        <span style="font-size: 20px; color: black;">Scroll down and add stops to trip</span><br>
                    </div>`);
                console.log(result);
                $('#attractionsOne').empty();
                $('#attractionsTwo').empty();
                $('#attractionsThree').empty();
                for(let i=0; i<result.data.rows.length; i+=3) {
                    if (i!=result.data.rows.length) {
                        $('#attractionsTwo').append(attractionsCardAssembler(result.data.rows[i]));
                        } else { return }
                        if (i+1!=result.data.rows.length) {
                            $('#attractionsThree').append(attractionsCardAssembler(result.data.rows[i+1]));
                        } else { return}
                        if (i+2!=result.data.rows.length) {
                            $('#attractionsOne').append(attractionsCardAssembler(result.data.rows[i+2]));
                        } else { return}
                    }
            }
    
        //  console.log("reached")
        //  console.log(getStopsInStates(["Connecticut", "New York", "Pennsylvania", "Ohio"]))


}


    

