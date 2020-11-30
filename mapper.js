// Google Maps mapping script

// This initMap function builds the map. initMap() is set as the callback for the google maps API request.
async function initMap() {
    let directionsService = await new google.maps.DirectionsService;
    let directionsDisplay = await new google.maps.DirectionsRenderer;
    let local_waypoints = []; // Pulled from back-end API
    let session_trip;
    
    session_trip = await axios.get('https://mapper-project.herokuapp.com/edittrip/');
    if (session_trip.data =="Unauthorized"||session_trip.data=="Not your trip") {
        console.log(session_trip);
        session_trip = null;
    } else {
        console.log(session_trip);
        let edit_origin = session_trip.data[0].rows[0].startLocation;
        let edit_destination = session_trip.data[0].rows[0].endLocation;
        let edit_waypoints = [];

        for (let i = 0; i < session_trip.data[1].rows.length; i++) {
            edit_waypoints.push({location: session_trip.data[1].rows[i].stopID, stopover: true});
        }

        local_waypoints = edit_waypoints;

        document.getElementById('start').value = edit_origin;
        document.getElementById('end').value = edit_destination;

        $('#originWaypoint').replaceWith(startCardAssembler($('#start').val()));
        $('#destinationWaypoint').replaceWith(endCardAssembler($('#end').val()))
        $('#loadingBox').replaceWith(
            `<div class="box" id="loadingBox" style="text-align: center;">
                <span style="font-size: 20px; color: black;">Suggestions are loading...</span><br>
                <progress class="progress is-large is-primary" max="100">15%</progress>
            </div>`);

        await edit_Waypoint(directionsService, directionsDisplay, edit_origin, edit_destination, local_waypoints);
        window.scrollTo(0, 700);
        session_trip = null;
    }


    let options = {
        zoom: 3,
        center: {lat:35.9132, lng:-79.0558}
    }

    // New map object initialized at <div id="map"> 
    let map = await new google.maps.Map(document.getElementById('map'), options);
    await directionsDisplay.setMap(map);

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
    $('main').on('input', '#waypoint-input', debouncedFunction(waypoint_db_autocomplete, 100));
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
            document.getElementById("waypoint-input").value = event.currentTarget.childNodes[1].lastElementChild.innerText;
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
            makeRoute(directionsService, directionsDisplay);
            // loading button
            window.scrollTo(0,700)
        } catch {
            window.alert("Looks like that isn't working... maybe try again with different inputs?");
            console.log("Creating a trip Didn't work lol")
        }
    }

        async function waypointHandler(event) {
            let newWaypoint = {
                location: document.getElementById('waypoint-input').value,
                stopover: true
            }
            local_waypoints.push(newWaypoint);
            await add_Waypoint(directionsService, directionsDisplay, local_waypoints);
            window.scrollTo(0, 700);
        }

        async function add_Waypoint(directionsService, directionsDisplay, local_waypoints) {
            let save_directionsService = directionsService;
            await directionsService.route({
                origin: document.getElementById('start').value,
                destination: document.getElementById('end').value,
                travelMode: 'DRIVING',
                waypoints: local_waypoints,
                optimizeWaypoints: true,
            },async function(response, status) {
                if (status === 'OK') {
                    $('#originWaypoint').replaceWith(startCardAssembler($('#start').val()));
                    $('#destinationWaypoint').replaceWith(endCardAssembler($('#end').val()));
                    $('#loadingBox').replaceWith(
                        `<div class="box" id="loadingBox" style="text-align: center;">
                            <span style="font-size: 20px; color: black;">Suggestions are loading...</span><br>
                            <progress class="progress is-large is-primary" max="100">15%</progress>
                        </div>`);
                    await directionsDisplay.setDirections(response);
                    await waypointMaker(response.routes[0].waypoint_order, response.request.waypoints, local_waypoints);
                    calculate_distance(response);
                } else {
                    window.alert("Looks like that isn't working... maybe try again with different inputs?");
                    directionsService = save_directionsService;
                    local_waypoints.pop();
                }
            });
    
            async function start() {
                window.setTimeout(stateTrav,1000, directionsDisplay);
            }
            start();
        }

        async function edit_Waypoint(directionsService, directionsDisplay, edit_origin, edit_destination, local_waypoints) {
            let save_directionsService = directionsService;
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
                    window.alert("Looks like that isn't working... maybe try again with different inputs?");
                    directionsService = save_directionsService;
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
                } catch {
                    console.log("deleting all stops from the backend didn't work");
                }
            let newresult;
            for (i=0; i<waypointOrder.length; i++) {
                console.log(waypointOrder);
                console.log(waypoints);
                let waypointNum = i; //
                console.log("waypointNum: ")
                console.log(waypointNum);
                $('#listWaypoints').append(waypointCardAssembler(waypointNum,local_waypoints[i]));
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
            let save_directionsService = directionsService;
            await directionsService.route({
                origin: document.getElementById('start').value,
                destination: document.getElementById('end').value,
                travelMode: 'DRIVING',
                waypoints: local_waypoints,
                optimizeWaypoints: true,
            },async function(response, status) {
                if (status === 'OK') {
                    $('#loadingBox').replaceWith(
                        `<div class="box" id="loadingBox" style="text-align: center;">
                            <span style="font-size: 20px; color: black;">Suggestions are loading...</span><br>
                            <progress class="progress is-large is-primary" max="100">15%</progress>
                        </div>`);
                    await directionsDisplay.setDirections(response);
                    await delete_waypointMaker(response.routes[0].waypoint_order, response.request.waypoints, local_waypoints);
                    calculate_distance(response);
                } else {
                    window.alert("Looks like that isn't working... maybe try again with different inputs?");
                    directionsService = save_directionsService;
                }
            });
        
            async function start() {
                window.setTimeout(stateTrav, 1000, directionsDisplay);
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
                    } catch {
                        console.log("adding a stop didn't work")
                    }
            }
        }
    
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
            let save_directionsService = directionsService;
            await directionsService.route({
                origin: document.getElementById('start').value,
                destination: document.getElementById('end').value,
                travelMode: 'DRIVING',
                waypoints: local_waypoints,
                optimizeWaypoints: true,
            },async function(response, status) {
                if (status === 'OK') {
                    $('#originWaypoint').replaceWith(startCardAssembler($('#start').val()));
                    $('#destinationWaypoint').replaceWith(endCardAssembler($('#end').val()));
                    $('#loadingBox').replaceWith(
                        `<div class="box" id="loadingBox" style="text-align: center;">
                            <span style="font-size: 20px; color: black;">Suggestions are loading...</span><br>
                            <progress class="progress is-large is-primary" max="100">15%</progress>
                        </div>`);
                    await directionsDisplay.setDirections(response);
                    calculate_distance(response);
                } else {
                    window.alert("Looks like that isn't working... maybe try again with different inputs?");
                    directionsService = save_directionsService;
                }
            });
    
            async function start() {
                window.setTimeout(stateTrav,1000, directionsDisplay);
            }
            start();

        }
    
       
    
    
    
        // Makes an array of all the states the route passes through (Adjust incrementation for price savings) There is a better way to do this...
        /*
        async function stateTrav(directionsDisplay) {
            let states = [];
            console.log(directionsDisplay.directions);
            let step_length = directionsDisplay.directions.routes[0].overview_path.length;
    
            for (let i = 0; i < step_length - 5; i = i + 5) {
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
        */

        async function stateTrav(directionsDisplay) {
            let latLngArr = [];
            let dirDisplay = await directionsDisplay;
            console.log(dirDisplay.directions);
            let step_length = dirDisplay.directions.routes[0].overview_path.length;
    
            for (let i = 0; i < step_length; i = i + 1) {
                let LAT = dirDisplay.directions.routes[0].overview_path[i].lat();
                let LNG = dirDisplay.directions.routes[0].overview_path[i].lng();
                let latLng = {LAT, LNG};
                latLngArr.push(latLng);
            }

            // let radius
            // calc_radius(step_length)
            getStopsInStates(latLngArr, {latDeg: 0.15, lngDeg: 0.15});
            return latLngArr;
        }

        /*
        async function calc_radius_degrees(step_length) {
            let radiusDegs = {
                latDeg,
                lngDeg
            }

            radiusDegs.latDeg =
        }
        */
    
        // asks google geocode API which state the LatLng falls within - 11/29/2020 DEPRECATED
       /*
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
        */
    
        // call this to get the State abbreviation for a given latitude and longitude - 11/29/2020 DEPRECATED
        /*
        async function getState(LAT, LNG) {
            let result = await revGeocode(LAT, LNG);
            return result;
        }
        */
    
        function startCardAssembler(waypoint){
            return (`<div class="waypointCard box" id="originWaypoint" style="background-color: #CCFFCC; margin-bottom: 10px;">
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
            return (`<div class="waypointCard box" id="destinationWaypoint" style="background-color: #FFCCCC;">
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
            console.log(waypoint);
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
                console.log("current card: (latlng): ");
                console.log(current_card.id);
                let waypointLatLng = current_card.id;
                let newWaypoint = {
                    location: waypointLatLng,
                    stopover: true
                }
                local_waypoints.push(newWaypoint);
                await add_Waypoint(directionsService, directionsDisplay, local_waypoints);
                }
               
            


    
    
            function attractionsCardAssembler(attraction) {
                return(`<div class="box attractionBoxes" id="${attraction.Latitude}, ${attraction.Longitude}">
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
    
            /*
            async function getStopsInStates(states){
                let result= await axios.post('https://mapper-project.herokuapp.com/stopsinstates', { states: states }, { headers: {'Access-Control-Allow-Origin': '*'}});
                $('#loadingBox').replaceWith(`<div class="box" id="loadingBox" style="text-align: center;">
                        <span style="font-size: 20px; color: black;">Suggestions are loaded</span><br>
                        <progress class="progress is-large is-primary" value="100" max="100">100%</progress>
                        <span style="font-size: 20px; color: black;">Scroll down and add stops to trip</span><br>
                    </div>`);
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
            */

            async function getStopsInStates(latLngArr, radiusDegs){
                let result= await axios.post('https://mapper-project.herokuapp.com/stopsinstates', { latAndLng: latLngArr, radius: radiusDegs }, { headers: {'Access-Control-Allow-Origin': '*'}});
                $('#loadingBox').replaceWith(`<div class="box" id="loadingBox" style="text-align: center;">
                        <span style="font-size: 20px; color: black;">Suggestions are loaded</span><br>
                        <progress class="progress is-large is-primary" value="100" max="100">100%</progress>
                        <span style="font-size: 20px; color: black;">Scroll down and add stops to trip</span><br>
                    </div>`);
                $('#attractionsOne').empty();
                $('#attractionsTwo').empty();
                $('#attractionsThree').empty();
                console.log("What attractions the backend comes up with: ");
                console.log(result);
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
}


    

