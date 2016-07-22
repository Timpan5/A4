
// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.

var map;
var infowindow;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 15
  });
  infowindow = new google.maps.InfoWindow();

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      map.setCenter(pos);

      var marker=new google.maps.Marker({
        position:pos,
      });

      marker.setMap(map);

      //Mark nearby restaurants
      var service = new google.maps.places.PlacesService(map);

      service.nearbySearch({
        location: pos,
        radius: 3000,
        type: ['restaurant']
      } , callback);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }

}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
}

function callback(results, status) {

  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
}

function createMarker(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location

  });

  buttons(place);

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
    
  });
}

function buttons(place) {
    var btn = document.createElement("BUTTON");
    var t = document.createTextNode(place.name);
    btn.appendChild(t);
    if (place == "Subway"){
      console.log("se");
    }
    btn.setAttribute("id", place.name);
    btn.setAttribute("class", "food");
    btn.setAttribute("value", [place.name, place.geometry.location, place.opening_hours.open_now]);
    document.getElementById("rest").appendChild(btn) 
    document.getElementById("rest").innerHTML =  document.getElementById("rest").innerHTML  + "<br>";
}

$(document).ready(function(){
    $("#rest").on('click', '.food', function() {
      console.log(this.value);
    });
});
    