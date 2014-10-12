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
            userLat = global(position.coords.latitude);
            userLng = global(position.coords.longitude);

            //set up the map to display
            map = new GMaps({
                div: '#canvas',
                lat: lati,
                lng: lngi
            });

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

            //check user's location and then call fusion api
            if (userLat != null && userLng != null) {
                callfusion(userLat,userLng);
            }
        }

        function onError(error) {
            $('#status').html('Sorry. Cannot get your location ' + error);
        }

        function refresh() {
            navigator.geolocation.getCurrentPosition(onSuccess, onError);
        }
    });
    //check if user's location is available


    function callfusion(userLat,userLng) {
        var query = "SELECT 'StopID', 'Name', 'Latitude','Longitude' FROM " +
            '1-LTbc4YJWKl7YNa8ap-1BOMF2o5MNJDyC9alLufj';
        var encodedQuery = encodeURIComponent(query);
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

                console.log(data);


            }
        })
    }

    var rad = function (x) {
        return x * Math.PI / 180;
    };

    var getDistance = function (p1, p2) {
        var R = 6378137; // Earth’s mean radius in meter
        var dLat = rad(p2.lat() - p1.lat());
        var dLong = rad(p2.lng() - p1.lng());
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d; // returns the distance in meter
    };
})()
