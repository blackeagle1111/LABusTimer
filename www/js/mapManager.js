(function () {
    var map;
    //init userLocation
    var userLat = null;
    var userLng = null;

    $(document).on('ready', function () {

        //get the user's location
        refresh();

        function onSuccess(position) {
            var radius = 9000;
            userLat = position.coords.latitude;
            userLng = position.coords.longitude;
            var image = 'img/male-2.png';
            //set up the map to display
            /*
            map = new GMaps({
            div: '#canvas',
            lat: userLat,
            lng: userLng
            });
            */
            var mapOptions = {
                zoom: 10,
                center: new google.maps.LatLng(userLat, userLng)
            }
            map = new google.maps.Map(document.getElementById('map-canvas'),
                                mapOptions);
            //check user's location and then call fusion api
            if (userLat != null && userLng != null) {
                callfusion(map, userLat, userLng, radius);
            }

            //draw marker at user 's location           
            var myLocation = new google.maps.Marker({
                position: new google.maps.LatLng(userLat, userLng),
                map: map,
                icon: image,
                click: function (e) {
                    alert('Your Location');
                }
            });
            // map.fitZoom();
        }

        function onError(error) {
            $('#status').html('Sorry. Cannot get your location ' + error);
        }

        function refresh() {
            navigator.geolocation.getCurrentPosition(onSuccess, onError);
        }
    });
    //check if user's location is available


    function callfusion(map, userLat, userLng, radius) {
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

                //console.log(data.rows);
                availableStop = getStopByDistance(data.rows, UserLocation, radius)
                if (availableStop.length != 0) {
                    availableStop.forEach(function (element, index) {
                        var loc = new google.maps.LatLng(element[2], element[3]);
                        var ttl = element[0];
                        var image = 'img/busstop.png';
                        var busMarker = new google.maps.Marker({
                            position: loc,
                            mapa: map,
                            icon: image,
                            title: ttl,
                            click: function (e) {
                                //go to the stop template
                                window.location.href = '/app/routes/stops/' + element[1];
                                window.location.reload();
                            }
                        })

                    })
                    
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
    //callback function for onchange event in search bar in map.html
    function searchTerm() {
        var searchValue = $("#search").eval();
        if (searchValue != null)
            search(searchValue);
    }

    //callback funtion when onsubmit event is called in map.html
    function searchSubmit() {
        var searchValue = $("#search").eval();
        if (searchValue != null)
            search(searchValue);
    }


    //main search function; allow searching "VALUE" in Stoptable and Routetable
    function search(value) {
        var stopQuery = "SELECT 'StopID', 'Name', 'Latitude','Longitude' FROM " +
            Constant.StopTable + "WHERE 'StopID' LIKE '%''" + value + "'% AND 'Name' LIKE '%'" + value + "'%'";

        var encodedQuery = encodeURIComponent(stopQuery);

        var availableResult = [];
        //construct URL
        var url = [Constant.FusionURL];
        url.push('?sql=' + encodedQuery);
        url.push('&key=' + Constant.JSAPIKey);
        url.push('&callback=?');
        $.ajax({
            url: url.join(''),
            dataType: 'jsonp',
            success: function (data) {
                console.log(data);
            }
        })
    }
})()

//bus routes
//https://www.google.com/fusiontables/DataSource?docid=1Z77QR69JdcZcEsGxpBpom4JAg203Ef5K3GNBGdHu