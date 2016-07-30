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

//Admin Control - Add/Update users
function submitUpdate() {
	
	var $output = $("#output")
	$output.empty();
	
	var email = $("#email").val();
	var password = $("#password").val();

	var load = email + "+" + password;
	
	var access = $("#access").html();
	var send = "userUpdate\/" + access;
	
	$.ajax(
    {
        url: send,
        method: "POST",
		data: load,
        dataType: "json"
    })
    .done(function( jsondata )
    {
		var decision = jsondata["decision"];
		var $msg = $("<p>");
		$msg.html(jsondata["reason"]);
		$output.append($msg);
		$("#email").val("");
		$("#password").val("");
    })
    .fail(function( jqXHR, textStatus, errorThrown )
    {
        alert( "Request failed: " + errorThrown );
    });
}

//Admin Control - Delete users
function submitDelete() {
	
	var $output = $("#output")
	$output.empty();
	
	var email = $("#target").val();
	
	var access = $("#access").html();
	var send = "userDelete\/" + access;
	
	$.ajax(
    {
        url: send,
        method: "POST",
		data: email,
        dataType: "json"
    })
    .done(function( jsondata )
    {
		var decision = jsondata["decision"];
		var $msg = $("<p>");
		$msg.html(jsondata["reason"]);
		$output.append($msg);
		$("#email").val("");
		$("#password").val("");


    })
    .fail(function( jqXHR, textStatus, errorThrown )
    {
        alert( "Request failed: " + errorThrown );
    });
}

//Admin Control - Get table names
function listTables() {
	
	var $output = $("#output")
	$output.empty();
	
	var $listOutput = $("#listOutput");
	$listOutput.empty();
	
	var access = $("#access").html();
	var send = "listTables\/" + access;
	
	$.ajax(
    {
        url: send,
        method: "GET",
        dataType: "json"
    })
    .done(function( jsondata )
    {
		var decision = jsondata["decision"];
		var $msg = $("<p>");
		$msg.html(jsondata["reason"]);
		$output.append($msg);

		var $listOutput = $("#listOutput");
		var $list = $("<ul>");
		$("<h4>").html("Existing Tables").appendTo($listOutput);
		$listOutput.append($list);
		
		var d = JSON.parse(JSON.stringify(jsondata["data"]));
		
		for (i = 0; i < d.length; i++) {
			var $li = $("<li>");
			$li.html(d[i]["table_name"]);
			$list.append($li);
		}
    })
    .fail(function( jqXHR, textStatus, errorThrown )
    {
        alert( "Request failed: " + errorThrown );
    });
}

//Admin Control - View tables
function getTables() {
	
	var $output = $("#output");
	$output.empty();
	var $tableOutput = $("#tableOutput");
	$tableOutput.empty();
	
	var tSelect = $("#tableSelect").val();
	var tFrom = $("#tableFrom").val();
	var tWhere = $("#tableWhere").val();
	
	if (tSelect == "") {
		tSelect = "*";
	}
	if (tWhere == "") {
		tWhere = "true";
	}

	var load = tSelect + "+" + tFrom + "+" + tWhere;
	
	var access = $("#access").html();
	var send = "viewTables\/" + access;
	
	$.ajax(
    {
        url: send,
        method: "POST",
		data: load,
        dataType: "json"
    })
    .done(function( jsondata )
    {
		
		
		var decision = jsondata["decision"];
		var $msg = $("<p>");
		$msg.html(jsondata["reason"]);
		$output.append($msg);
		
		$("#tableSelect").val("");
		$("#tableFrom").val("");
		$("#tableWhere").val("");
		
		var $table = $("<table>");
		$tableOutput.append($table);
		
		var fields = jsondata["data"]["fields"];
		
		var $attributes = $("<tr>");
		$table.append($attributes);
		
		for (i = 0; i < fields.length; i++) {
			var $th = $("<th>");
			$th.html(fields[i]["name"]);
			$attributes.append($th);
		}
		
		var rows = jsondata["data"]["rows"];
		
		for (i = 0; i < rows.length; i++) {
			var $tr = $("<tr>");
			$table.append($tr);

			for (j = 0; j < fields.length; j++) {
				var $td = $("<td>");
				$tr.append($td);
				$td.html(rows[i][fields[j]["name"]]);
			}
		}

    })
    .fail(function( jqXHR, textStatus, errorThrown )
    {
        alert( "Request failed: " + errorThrown );
    });
}

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
		//var user = $.cookie('access'); Gets the encrypted email/username
		
		if (access == "") {
			//Hardcoded with port, change when deployed to url only
			$(location).attr('href', "http://" + window.location.host);
		}
		else {
			//redirect to main
		}
		
	}
	
	if($('body').is('.admin')){
		$("#access").hide();
		//alert($("#access").html());
	}
});