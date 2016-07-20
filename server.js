var http = require('http');
var fs = require('fs');
var qs = require('querystring');
var url = require('url');
var pg = require('pg');


//PSQL - Database URL may change automatically, check settings page config variables
const Pool = require('pg-pool');
const config = {
	user: 'ltkqbskivefqvj',
	password: 'RUinqM5ypw2qjNNS6Ky7TykoO8',
	host: 'ec2-204-236-228-133.compute-1.amazonaws.com',
	port: '5432',
	database: 'd6l1i0e4ue6m2c',
	ssl: true
};
var pool = new Pool(config);

//OAuth
var oauth2 = require('simple-oauth2')({
	clientID: '22064ceb97630ea6a4a3', 
	clientSecret: 'ae8770a86cab42c44fd3e29a4da4a4110525b5ee',
	site: 'https://github.com/login',
	tokenPath: '/oauth/access_token',
	authorizationPath: '/oauth/authorize'
});

var authorization_uri = oauth2.authCode.authorizeURL({
	redirect_uri: 'http://localhost:5000/callback', //HARDCODED PORT
	scope: 'notifications',
	state: '3(#0/!~'
});

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
	
	//Signup page
	else if (pathname.substr(1) == 'signup.html') {
		fs.readFile("signup.html", function (err, data) {
		sendData({'Content-Type': 'text/html'}, data, response);
		console.log('Sent signup.html');
		});

	}
	
	//Access OAuth
	else if (pathname.substr(1) == 'auth') {
		//response.redirect(authorization_uri);
		response.writeHead(302, {'Location': authorization_uri});
		response.end();
	}
	
	//Callback OAuth
	else if (pathname.substr(1) == 'auth') {
		var code = request.query.code;
		
		oauth2.authCode.getToken({
			code: code,
			redirect_uri: 'http://localhost:5000/callback' //HARDCODED PORT
		}, saveToken);
 
		function saveToken(error, result) {
			if (error) { console.log('Access Token Error', error.message); }
			token = oauth2.accessToken.create(result);
		}

	}
	
	
	//Register new user
	else if (pathname.substr(1) == 'signup') {
		var body = '';
		
		request.on('data', function (data) {
			body += data;
		});
		
		request.on('end', function () {
            var post = qs.parse(body);
			create(post.firstName, post.Lastname, post.email, post.password);
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

//Create new user
function create(first, last, user, pass) { 
	console.log(first, last, user, pass);
	
	pool.query('SELECT * FROM login WHERE email=$1', [user], function(err, result) {
	//console.log(result.rows); 
	
	if (result.rows.length) {
		//User already exists
		console.log("Create: User already exists");
	}
	
	else {
		//Create this user
		pool.query('INSERT INTO login VALUES ($1, $2)', [user, pass], function(err) {
			pool.query('INSERT INTO name VALUES ($1, $2, $3)', [user, first, last], function(err) {
			});
		});
		
		//Now redirect to main
	}

});
	
}