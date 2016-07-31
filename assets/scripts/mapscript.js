
// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.

var map;
var infowindow;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 14
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

      var image = "http://maps.google.com/mapfiles/arrow.png"
      var marker=new google.maps.Marker({
        position:pos,
        icon: image
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
  

  

  var service = new google.maps.places.PlacesService(map);

  service.getDetails({
    placeId: place.place_id
  }, function(place, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      buttons(place);
      var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
      });
      google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
          place.formatted_address + '</div>');
        infowindow.open(map, this);
      });
    }
  });
}

function clearBox(elementID)
{
    document.getElementById(elementID).innerHTML = "";
}

function submit(place) {

    clearBox("dets");

    var service = new google.maps.places.PlacesService(map);

    service.getDetails( {
      placeId: place
    }, function(placee, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        console.log(placee.formatted_address);
    
        var name = document.createElement("P");
        var t = document.createTextNode("Name: "+placee.name+"");
        name.appendChild(t);
        document.getElementById("dets").appendChild(name);

        var name = document.createElement("P");
        var t = document.createTextNode("Location: "+placee.formatted_address+"");
        name.appendChild(t);
        document.getElementById("dets").appendChild(name);

        var today = new Date();
        var name = document.createElement("P");
        var t = document.createTextNode("Opens "+placee.opening_hours.weekday_text[today.getDay() - 1]+"");
        name.appendChild(t);
        document.getElementById("dets").appendChild(name);

        var name = document.createElement("P");
        var t = document.createTextNode("Phone Number: "+placee.formatted_phone_number+"");
        name.appendChild(t);
        document.getElementById("dets").appendChild(name);

        var name = document.createElement("P");
        var t = document.createTextNode("Rating: "+placee.rating+"");
        name.appendChild(t);
        document.getElementById("dets").appendChild(name);

        if (placee.photos){
          var input = document.createElement("input");
          input.setAttribute("type", "hidden");
          input.setAttribute("id", "input");
          input.setAttribute("value", placee.photos.length);
          document.getElementById("dets").appendChild(input);

          var ima = document.createElement("IMG");
          ima.setAttribute("src", placee.photos[0].getUrl({'maxWidth': 300, 'maxHeight': 300}));
          ima.setAttribute("alt", "Photo of restaurant");
          ima.setAttribute("class", "img");
          document.getElementById("dets").appendChild(ima);
        }
        
        var btn = document.createElement("BUTTON");
        var t = document.createTextNode("Find Matches");

        btn.appendChild(t);
        btn.setAttribute("id", "Matches");
        btn.setAttribute("class", "food");
        btn.setAttribute("type", "text");
        btn.setAttribute("value", placee.name);//, place.geometry.location, place.opening_hours.open_now, place.rating]);
        document.getElementById("dets").appendChild(btn);
      }
    });
}

function buttons(place) {
    var btn = document.createElement("BUTTON");
    var t = document.createTextNode(place.name);

    btn.appendChild(t);
    btn.setAttribute("id", place.name);
    btn.setAttribute("class", "deets");
    btn.setAttribute("type", "text");
    btn.setAttribute("value", place.place_id);

    document.getElementById("rest").appendChild(btn);
}

function matches(user){
    var btn = document.createElement("BUTTON");
    var t = document.createTextNode(user);

    btn.appendChild(t);
    btn.setAttribute("id", user);
    btn.setAttribute("class", "ppl");
    btn.setAttribute("type", "text");
    btn.setAttribute("value", user);

    document.getElementById("dets").appendChild(btn);
}

function getMatches() {
  
  var $dets = $("#dets");

  var user = $("#one").val();
  var location = $("#two").val();

  var load = user + "+" + location;

  var send = "matching";
  
  $.ajax(
    {
        url: send,
        method: "POST",
    data: load,
        dataType: "json"
    })
    .done(function( mat )
    {
    console.log("IHOWIEGHFWOEIHGOWEHGEWSOHI");
    console.log(mat);
    if (mat.users.length >= 1){
      for (i = 0; i < mat.users.length; i++){
        matches(mat.users[i]);
      }
    } else {
        var name = document.createElement("P");
        var t = document.createTextNode("No Matches Found");
        name.appendChild(t);
        document.getElementById("dets").appendChild(name);
      }
    });
}


$(document).ready(function(){
  $("#rest").on('click', '.deets', function() {
    var service = new google.maps.places.PlacesService(map);

    service.getDetails( {
      placeId: this.value
    }, function(placee, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        map.setCenter(placee.geometry.location)
      }
    });
    submit(this.value);
  });
  $("#details").on('click', '.food', function() {
    console.log(this.value);
    document.getElementById("dets").removeChild(document.getElementById("Matches"));
    document.getElementById("one").value = document.getElementById("val").value;
    document.getElementById("two").value = this.value;
    getMatches();
  });
});
    