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