(function () {
    var map;
    var global = window.eval;
    //set up layout and screen size
    var h = $('#canvas').height();
    var mapContent = $('#canvas').height(h).css({ "margin-top": "30px" })
    var h1 = mapContent.height();
    var w = $('#canvas').width();
    var lati = -12.043333;
    var lngi = -77.028333;

    //init userLocation
    window.userLat = null;
    window.userLng = null;

    $(document).on('ready', function () {

        //get the user's location
        refresh();

        function onSuccess(position) {
            var radius = 9000;
            userLat = global(position.coords.latitude);
            userLng = global(position.coords.longitude);

            //set up the map to display
            map = new GMaps({
                div: '#canvas',
                lat: lati,
                lng: lngi
            });

            //check user's location and then call fusion api
            if (userLat != null && userLng != null) {
                callfusion(map, userLat, userLng, radius);
            }

            //draw marker at user 's location
            map.addMarker({
                lat: userLat,
                lng: userLng,
                title: 'Your Location',
                click: function (e) {
                    alert('Your Location');
                }
            });
            //draw route from user's location to pho's location
            map.drawRoute({
                origin: [userLat, userLng],
                destination: [lati, lngi],
                travelMode: 'driving',
                strokeColor: 'blue',
                strokeOpacity: 0.6,
                strokeWeight: 6
            });
            //zoom map to fit two markers           
            map.fitZoom();


        }

        function onError(error) {
            $('#status').html('Sorry. Cannot get your location ' + error);
        }

        function refresh() {
            navigator.geolocation.getCurrentPosition(onSuccess, onError);
        }
    });
    //check if user's location is available


    function callfusion(map, userLat, userLng,radius) {
        var query = "SELECT 'StopID', 'Name', 'Latitude','Longitude' FROM " +
            '1-LTbc4YJWKl7YNa8ap-1BOMF2o5MNJDyC9alLufj';
        var encodedQuery = encodeURIComponent(query);
        var UserLocation = { lat: userLat, lng: userLng };
        var availableStop = [];
        //construct URL
        var url = ['https://www.googleapis.com/fusiontables/v1/query'];
        url.push('?sql=' + encodedQuery);
        url.push('&key=AIzaSyAwIA36CmNEXNOpiGRASEze6CJRBtiqKuA');
        url.push('&callback=?');
        $.ajax({
            url: url.join(''),
            dataType: 'jsonp',
            success: function (data) {
                //have to catch for error here

                console.log(data.rows);
                availableStop = getStopByDistance(data.rows, UserLocation, radius)
                if (availableStop.length != 0) {
                    availableStop.forEach(function (element, index) {
                        map.addMarker({
                            lat: element[2],
                            lng: element[3],
                            title: element[0],
                            click: function (e) {
                                alert(element[1]);
                            }
                        });
                        // map.fitZoom();
                    })
                    map.fitZoom();
                } else {
                    alert("There is no stop around your area. Please increase your radius and search again. Current radius " + radius + " meter(s)");
                }
            }
        });

    }

    var rad = function (x) {
        return x * Math.PI / 180;
    };


    var getDistance = function (center, p2) {
        var R = 6378137; // Earth’s mean radius in meter
        var dLat = rad(p2[2] - center.lat);
        var dLong = rad(p2[3] - center.lng);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(center.lat)) * Math.cos(rad(p2[2])) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d; // returns the distance in meter
    };

    //get all stop within the radius, default to 100m
    function getStopByDistance(stops, center, radius) {
        var availableStops = [];
        var radius = radius | 100;
        stops.forEach(function (element, index) {
            if (getDistance(center, element) <= radius) {
                availableStops.push(element);
            }
        });
        return availableStops;
    }
})()
