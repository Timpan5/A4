var http = require('http');
var fs = require('fs');
var qs = require('querystring');
var url = require('url');
var pg = require('pg');
var rr = require("request");
var gh = require("github");
var crypto = require('crypto'), algorithm = 'aes-256-ctr', password = 'csc309';
var requestIp = require('request-ip');

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

//Port must be changed to use env
//Also change on github settings for authorization callback url
var authorization_uri = oauth2.authCode.authorizeURL({
	redirect_uri: 'http://localhost:5000/callback', //HARDCODED PORT
	scope: 'user:email',
	state: '*(A&S%f'
});

//Setup Github API access
var github = new gh({
    debug: true,
    protocol: "https",
    host: "api.github.com", 
    headers: {
        "user-agent": "A4" 
    },
    followRedirects: false, 
    timeout: 50000
});

//Create server
var server = http.createServer( function (request, response) {  
	var pathname = url.parse(request.url).pathname;
	//console.log("Path: " + pathname );
   
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

	//Send map css
	else if (pathname.substr(1) == 'assets/css/mapstyle.css') {
		fs.readFile("assets/css/mapstyle.css", function (err, data) {
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

	//Send Map js
	else if (pathname.substr(1) == 'assets/scripts/mapscript.js') {
		fs.readFile("assets/scripts/mapscript.js", function (err, data) {
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
	
	//Send jQuery cookies library
	else if (pathname.substr(1) == 'assets/scripts/jquery.cookie.js') {
		fs.readFile("assets/scripts/jquery.cookie.js", function (err, data) {
		sendData({'Content-Type': 'text/javascript'}, data, response);
		console.log('Sent jquery cookie library');
		});
	}
	
	//Send jQuery cookies library
	else if (pathname.substr(1,11) == 'assets/img/') {
		fs.readFile("assets/img/" + pathname.substr(12), function (err, data) {
		sendData({'Content-Type': 'text/javascript'}, data, response);
		console.log('Sent image' + pathname.substr(12));
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
			
			var encrypted = encrypt(post.email);
			
			/*
			console.log("===");
			console.log("Base username: " + post.email);
			console.log("Encrypted username: " + encrypted);
			console.log("Decrypted username: " + decrypt(encrypted));
			console.log("===");
			*/
			
			auth(post.email, post.password, response, request);
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
	else if (pathname.substr(1,8) == 'callback') {
		console.log("In callback");
		
		var para = url.parse(request.url,true);

        var code = para.query.code;
		
		oauth2.authCode.getToken({
			code: code,
			redirect_uri: 'http://localhost:5000/callback' //HARDCODED PORT, must match on github website
		}, saveToken);
 

		function saveToken(error, result) {
			if (error) { console.log('Access Token Error', error.message); }
			token = oauth2.accessToken.create(result);
			
			//console.log("Token: " + (JSON.stringify(token)));
			var tokenString = JSON.stringify(token);
			var tok = (JSON.parse(tokenString)["token"]);
			console.log("Tok: " + tok);
			
			github.authenticate({
				type: "oauth",
				token: (JSON.parse(tokenString)["token"])
			});
			
			var headers = {"User-Agent" : "Timpan5"};
			

			var email;
			
			rr({url : 'http://api.github.com/user/emails?' + tok, headers: headers}, function (error, res, body) {
				if (!error && res.statusCode == 200) {
					email = JSON.parse(body)[0].email;
					console.log(email); 
					
					//Login if already exists
					pool.query('SELECT * FROM name WHERE email=$1', [email], function(err, result) {
						if (result.rows.length) {
							sendLogin(response, "Success", "Github", email, 1);
							console.log('Sent loginResult.html - Success');
						}
						else {
							pool.query('SELECT * FROM login WHERE email=$1', [email], function(err, result) {
								//Check if already exists as manual
								if (result.rows.length) {
									sendLogin(response, "Fail", "Github", "Exists", 0);
									console.log('Sent loginResult.html - Fail');
								}
								//Create new user
								else {
									sendLogin(response, "Register", "Github", email, 1);
									console.log('Sent loginResult.html - Create User');
								}
							});
						}
					});
				}
					
				else {
					console.log("Get Email error:" + error);
				}
			});
	
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
			create(response, post.firstName, post.Lastname, post.email, post.password);
        });

	}
	
	else if (pathname.substr(1,11) == 'userUpdate\/') {
		
		var access = decrypt(decodeURI(pathname.substr(12)).replace(/\s/g, ""));
		var ip = requestIp.getClientIp(request);
		
		
		if (access == ip) {
			
			var body = '';
			var email;
			var password; 
			var split;
			
			request.on('data', function (data) {
				body += data;
			});
			
			request.on('end', function () {
				split = body.split("+");
				email = split[0];
				password = split[1];

				pool.query('SELECT * FROM login WHERE email=$1', [email], function(err, result) {
				
					if (result.rows.length) {
						pool.query('UPDATE login SET password=$1 WHERE email=$2', [password, email], function(err, result) {})
						var jsonObj = {"decision" : 1, "reason" : "Success: Changed password of " + email};
						sendData({'Content-Type': 'application/json'}, JSON.stringify(jsonObj), response);
					}
					
					else {
						pool.query('INSERT INTO login VALUES ($1, $2)', [email, password], function(err) {})
						var jsonObj = {"decision" : 1, "reason" : "Success: Created user for " + email};
						sendData({'Content-Type': 'application/json'}, JSON.stringify(jsonObj), response);
					}
				});
			});
		}
		
		else {
			var jsonObj = {"decision" : 0, "reason" : "Invalid Credentials"};
			sendData({'Content-Type': 'application/json'}, JSON.stringify(jsonObj), response);
		}
	}
	
	else if (pathname.substr(1,11) == 'userDelete\/') {
		
		var access = decrypt(decodeURI(pathname.substr(12)).replace(/\s/g, ""));
		var ip = requestIp.getClientIp(request);
		
		if (access == ip) {
			
			var body = '';
			var email;
			var password; 
			var split;
			
			request.on('data', function (data) {
				body += data;
			});

			request.on('end', function () {

				pool.query('DELETE FROM name WHERE email=$1', [body], function(err) {})
				pool.query('DELETE FROM login WHERE email=$1', [body], function(err) {})
				var jsonObj = {"decision" : 1, "reason" : "Success: Deleted records for " + body};
				sendData({'Content-Type': 'application/json'}, JSON.stringify(jsonObj), response);	
			});
		}
		
		else {
			var jsonObj = {"decision" : 0, "reason" : "Invalid Credentials"};
			sendData({'Content-Type': 'application/json'}, JSON.stringify(jsonObj), response);
		}
	}
	
	else if (pathname.substr(1,11) == 'listTables\/') {
		
		var access = decrypt(decodeURI(pathname.substr(12)).replace(/\s/g, ""));
		var ip = requestIp.getClientIp(request);
		
		if (access == ip) {
			pool.query('SELECT table_name FROM information_schema.tables WHERE table_schema=\'public\'', function(err, result) {
				//console.log(result.rows); 
				//for (i=0; i < result.rows.length; i++) {
				//	console.log(result.rows[i]); //just put result.rows into the json directly
				//}
				var jsonObj = {"decision" : 1, "reason" : "Success: Displaying all tables", "data" : result.rows};
				sendData({'Content-Type': 'application/json'}, JSON.stringify(jsonObj), response);	
			});
		}
		
		else {
			var jsonObj = {"decision" : 0, "reason" : "Invalid Credentials"};
			sendData({'Content-Type': 'application/json'}, JSON.stringify(jsonObj), response);
		}
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
function auth(user, pass, response, request) {
	console.log(user, pass);
	
	pool.query('SELECT * FROM login WHERE email=$1', [user], function(err, result) {
	//console.log(result.rows); 
	
	if (result.rows.length && pass == result.rows[0].password && user == "admin") {
		//Send to an admin control panel html page
		
		//Admin Key
		//var now = new Date();
		//var d = new Date(1900 + now.getYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
		var ip = requestIp.getClientIp(request);
		
		fs.readFile("admin.html", function (err, data) {
		response.writeHead(200, {'Content-Type': 'text/html'});	
		response.write(data);
		response.write("<div id=\"access\"> " + encrypt(ip) + " </div>");
		response.end();
		});
	}
	
	else if (result.rows.length && pass == result.rows[0].password) {
		//Correct username and password
		sendLogin(response, "Success", "Manual", user, 1);
		console.log('Sent loginResult.html - Success');
	}
	
	else if (result.rows.length) {
		//Correct username wrong password
		sendLogin(response, "Fail", "Manual", "Password", 0);
		console.log('Sent loginResult.html - Fail Password');
	}
	
	else {
		//Wrong username
		sendLogin(response, "Fail", "Manual", "Username", 0);
		console.log('Sent loginResult.html - Fail Username');
	}
});
	
}


//Create new user manually
function create(response, first, last, user, pass) { 
	//console.log(first, last, user, pass);
	
	//Check if user is Github exclusive
	pool.query('SELECT * FROM name WHERE email=$1', [user], function(err, result) {

		if (result.rows.length) {
			//User already exists
			sendLogin(response, "Fail", "Github", "Exclusive", 0);
			console.log("Create: User already exists from Github");
		}
	
		else {
			//Check if user exists in manual
			pool.query('SELECT * FROM login WHERE email=$1', [user], function(err, result) {

				if (result.rows.length) {
					//User already exists
					sendLogin(response, "Fail", "Manual", "Exists", 0);
					console.log("Create: User already exists");
				}
	
				else {
					//Create this user
					pool.query('INSERT INTO login VALUES ($1, $2)', [user, pass], function(err) {
						pool.query('INSERT INTO name VALUES ($1, $2, $3)', [user, first, last], function(err) {
						});
					});
					sendLogin(response, "Success", "Manual", user, 1);
				}
			});
		}
	});
}

//Send Login Result
function sendLogin(response, decision, source, user, access){
	fs.readFile("loginResult.html", function (err, data) {
		response.writeHead(200, {'Content-Type': 'text/html'});	
		response.write(data);
		response.write("<div id=\"credentials\"> "+ decision + ":" + source + ":" + user + "</div>");
		
		if (access) {
			response.write("<div id=\"access\"> " + encrypt(user) + " </div>");
		}
		else {
			response.write("<div id=\"access\"></div>");
		}
		
		response.end();
	});
}

//Encrypt
function encrypt(text){
	var cipher = crypto.createCipher(algorithm, password)
	var crypted = cipher.update(text,'utf8','hex')
	crypted += cipher.final('hex');
	return crypted;
}
 
//Decrypt 
function decrypt(text){
	var decipher = crypto.createDecipher(algorithm,password)
	var dec = decipher.update(text,'hex','utf8')
	dec += decipher.final('utf8');
	return dec;
}