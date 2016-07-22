var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');

http.createServer(function (req, res) {

   // Send the HTTP header 
   // HTTP Status: 200 : OK
   // Content Type: text/plain
   var file = fs.readFileSync("./index.html", 'utf8');
   res.writeHead(200, {"Content-Type": "text/html"});
   res.end(file);
   //response.writeHead(200, {'Content-Type': 'text/plain'});
   
   // Send the response body as "Hello World"
   //response.end('Hello World\n');
}).listen(8081);

// Console will print the message
console.log('Server running at http://127.0.0.1:8081/');