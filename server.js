var http = require('http');
var fs = require('fs');
var qs = require('querystring');
var url = require('url');
var pg = require('pg');
const Pool = require('pg-pool');




//PSQL - Database URL may change automatically, check settings page config variables
const config = {
	user: 'ltkqbskivefqvj',
	password: 'RUinqM5ypw2qjNNS6Ky7TykoO8',
	host: 'ec2-204-236-228-133.compute-1.amazonaws.com',
	port: '5432',
	database: 'd6l1i0e4ue6m2c',
	ssl: true
};

var pool = new Pool(config);

//Create server
var server = http.createServer( function (request, response) {  
   var pathname = url.parse(request.url).pathname;

   //Check requested resource
   console.log("Request: " + pathname);
   
   //Root directory
   if (pathname.substr(1) == '') {
		fs.readFile("index.html", function (err, data) {
		sendData({'Content-Type': 'text/html'}, data, response);
		console.log('Sent index.html');
		});
	}
	
	//Send css 
	else if (pathname.substr(1) == 'assets/css/style.css') {
		fs.readFile("assets/css/style.css", function (err, data) {
		sendData({'Content-Type': 'text/css'}, data, response);
		console.log('Sent css');
		});
	}
	
	//Send front-end js
	else if (pathname.substr(1) == 'assets/scripts/script.js') {
		fs.readFile("assets/scripts/script.js", function (err, data) {
		sendData({'Content-Type': 'text/javascript'}, data, response);
		console.log('Sent js');
		});
	}
	
	//Send jQuery library
	else if (pathname.substr(1) == 'assets/scripts/jquery-2.2.4.min.js') {
		fs.readFile("assets/scripts/jquery-2.2.4.min.js", function (err, data) {
		sendData({'Content-Type': 'text/javascript'}, data, response);
		console.log('Sent jquery');
		});
	}
	
	//Verify Signin
	else if (pathname.substr(1) == 'signin') {
		var body = '';
		
		request.on('data', function (data) {
			body += data;
		});
		
		request.on('end', function () {
            var post = qs.parse(body);
			auth(post.email, post.password);
        });

	}
	
	//Url not recognized
	else {	
        response.writeHead(404, {'Content-Type': 'text/html'});	
		response.end();
		console.log('Unknown request');
	}  
});

server.listen(process.env.PORT || 5000);
console.log('Server running');
console.log(process.env.PORT, process.env.DATABASE_URL);

//Send response back
function sendData(textHead, data, response) {
	    response.writeHead(200, {textHead});	
		response.write(data);
		response.end();
}

//Authentication
function auth(user, pass) {
	console.log(user, pass);
	
	pool.query('SELECT * FROM login WHERE email=$1', [user], function(err, result) {
	//console.log(result.rows); 
	
	if (result.rows.length && pass == result.rows[0].password) {
		//Correct username and password
		console.log("Login: Success");
	}
	
	else if (result.rows.length) {
		//Correct username wrong password
		console.log("Login: Wrong Password");
	}
	
	else {
		//Wrong username
		console.log("Login: Wrong Username");
	}
	

});
	
	

	
}