function largeNav()
{
    var navPos = $("nav#menu").position();

    if ( $(window).width() >= 100 )
    {
        $(window).scroll(function()
        {
            if ( $(window).scrollTop() >= 330
                    && ! $("nav#menu").hasClass("sticky") )
            {
                $("nav#menu").addClass("sticky");
                $("div#map").addClass("left");
                
                if ( $(window).width() < 1400 )
                {
                    $("div#match").addClass("left");
                    $("div#pics").addClass("left");
                }
            }
            else if ( $(window).scrollTop() < 330
                    && $("nav#menu").hasClass("sticky") )
            {
                $("nav#menu").removeClass("sticky");
                $("div#map").removeClass("left");
                $("div#pics").removeClass("left");
                $("div#match").removeClass("left");
            }
        });
    }
    else // smaller than 1280
    {}
}

function mDown(obj) {
    if (! $("div#chat").hasClass("dis")){
        $("div#chat").addClass("dis");
    } else {
        $("div#chat").removeClass("dis");
    }
}

function logIn() {
	var $title = $("input[name=email]").val();
	var $password = $("input[name=password]").val();
	alert($password);
}

function register() {
	document.location.href = "signup.html";
}

function signup() {
	document.location.href = "main.html";
}

function ghLogin() {
	//Hardcoded host, includes port for local testing, change to 'hostname'
	$(location).attr('href', "http://" + window.location.host + "/auth")
}

function ghRegister() {
	
}

$(document).ready(function() {
    // Run initially
    largeNav();
    
    // Run on window resize
    $(window).resize(function()
    {
       $(window).off('scroll');
       largeNav();
    });

});

//Check login credentials
$(function(){
	
	if($('body').is('.credentials')){
		var credentials = $("#credentials").html();
		var split = credentials.split(":");
		var result = split[0];
		var method = split[1];
		var user = split[2];

		var access = $("#access").html();
		$.cookie('access', access);
		//$.cookie('access');
	}
});