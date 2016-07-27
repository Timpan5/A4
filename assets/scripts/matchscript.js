function buttons(match) {
    var btn = document.createElement("BUTTON");
    var t = document.createTextNode(match);

    btn.appendChild(t);
    btn.setAttribute("id", match);
    btn.setAttribute("class", "person");
    btn.setAttribute("type", "submit");
    btn.setAttribute("value", match);//, place.geometry.location, place.opening_hours.open_now, place.rating]);
    document.getElementById("ppl").appendChild(btn) 
    document.getElementById("ppl").innerHTML =  document.getElementById("ppl").innerHTML  + "<br>";
}

$(document).onload(function(){
  console.log("OIESWNNGLEWNGOEIWSGNOLEWSNOLEISNGO");
  var match = document.getElementById("matches").value;
  var matches = match.split(":");
  for (i = 0; i < matches.length; i ++){
    buttons(matches[i]);
  }
});