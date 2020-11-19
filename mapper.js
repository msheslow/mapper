// Google Maps mapping script

// This initMap function builds the map. initMap() is set as the callback for the google maps API request.
function initMap() {
    let directionsService = new google.maps.DirectionsService;
    let directionsDisplay = new google.maps.DirectionsRenderer;
    
    let options = {
        zoom: 3,
        center: {lat:35.9132, lng:-79.0558}
    }

    // New map object initialized at <div id="map"> 
    let map = new google.maps.Map(document.getElementById('map'), options);
    directionsDisplay.setMap(map);

    // eventHandler function for onsite action
    let eventHandler = function() {
        makeRoute(directionsService, directionsDisplay);
    };
    document.getElementById('generate-map').addEventListener('click', eventHandler);


    // Sets the selected <input> html elements to become autocomplete objects
    let start_autocomplete = new google.maps.places.Autocomplete(
            document.getElementById('start'),
            {
                types: ['(regions)'],
                componentRestrictions: {'country': ['US']},
                fields: ['place_id', 'geometry', 'name']
    });

    let end_autocomplete = new google.maps.places.Autocomplete(
            document.getElementById('end'),
            {
                types: ['(regions)'],
                componentRestrictions: {'country': ['US']},
                fields: ['place_id', 'geometry', 'name']
    });

    let addWaypoint_autocomplete = new google.maps.places.Autocomplete(
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
        addMarker(markers[i]);
    }

    // This addMarker function will place a single specified marker onto the map
    function addMarker(properties) {
        let marker = new google.maps.Marker({
            position: properties.coordinates,
            map: map
        });


        if (properties.content) {
            let infoWindow = new google.maps.InfoWindow({
                content: properties.content
            });

            marker.addListener('click', function() {
                infoWindow.open(map, marker);
            });
        }
    }
}

// makeRoute draws the route line between two locations on the map
function makeRoute(directionsService, directionsDisplay) {
    directionsService.route({
        origin: document.getElementById('start').value,
        destination: document.getElementById('end').value,
        travelMode: 'DRIVING'
    },function(response, status) {
        if (status === 'OK') {
            directionsDisplay.setDirections(response);
            window.scrollTo(0, 700);
        } else {
            window.alert('Please enter an origin and destination, then click "Plan Route"');
        }
    });
    console.log(directionsDisplay.getDirections());
}
