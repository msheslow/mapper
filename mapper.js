// Google Maps mapping script

// This initMap function builds the map. initMap() is set as the callback for the google maps API request.
async function initMap() {
    let directionsService = await new google.maps.DirectionsService;
    let directionsDisplay = await new google.maps.DirectionsRenderer;
    let waypoints = []; // THIS NEEDS TO BE PULLED FROM SERVER
    
    let options = {
        zoom: 3,
        center: {lat:35.9132, lng:-79.0558}
    }

    // New map object initialized at <div id="map"> 
    let map = await new google.maps.Map(document.getElementById('map'), options);
    await directionsDisplay.setMap(map);

    // eventHandler function for onsite action
    let planRouteHandler = async function() {
        console.log(document.getElementById('start').value);
        makeRoute(directionsService, directionsDisplay);
    };

    let waypointHandler = async function() {
        waypoints.push(document.getElementById('addWaypoint').value);
        console.log(waypoints[0]);
        addRoute(directionsService, directionsDisplay, waypoints);
    };
    
    document.getElementById('generate-map').addEventListener('click', planRouteHandler);
    document.getElementById('add').addEventListener('click', waypointHandler);


    // Sets the selected <input> html elements to become autocomplete objects
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
            types: ['(regions)'],
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
}

// makeRoute draws the route line between two locations on the map
async function makeRoute(directionsService, directionsDisplay) {
    await directionsService.route({
        origin: document.getElementById('start').value,
        destination: document.getElementById('end').value,
        travelMode: 'DRIVING'
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

async function addRoute(directionsService, directionsDisplay, waypoints) {
    await directionsService.route({
        origin: document.getElementById('start').value,
        destination: document.getElementById('end').value,
        travelMode: 'DRIVING',
        waypoints: waypoints,
        optimizeWaypoints: true
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

// Makes an array of all the states the route passes through (Adjust incrementation for price savings)
async function stateTrav(directionsDisplay) {
    let states = [];
    let step_length = directionsDisplay.directions.routes[0].overview_path.length;

    for (let i = 0; i < step_length; i = i + 5) {
        let LAT = directionsDisplay.directions.routes[0].overview_path[i].lat();
        let LNG = directionsDisplay.directions.routes[0].overview_path[i].lng();
        let state = await getState(LAT, LNG);
        console.log(state);
        if (!states.includes(state)) {
            states.push(state);
        }
    }

    console.log(states);
    return;
}

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
                state_name = data.short_name;
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