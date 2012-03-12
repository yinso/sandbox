
function request2JSON (req) {
    /* request object cannot be directly stringified via JSON because it has a cyclic reference
     * this creates an JSON object from the request object 
     */
    return { url : req.url
	    , headers : req.headers 
	    , version : req.httpVersion
	    , method : req.method };
}

/* console log cannot directly handle objects to stringify it... this 
 * should be improvable with JSON...
 */
/*
var web = require('web'); 
web.listen(8080, 'localhost')
    .serve('/tmp/node')
    .handle(500, function(err) {
	
    })
    .log(console); 
//*/

function virtualToPhysical(path) {
    // we want this to be definable... 
    return '/tmp/node' + path; 
}

var http = require('http'); 
var fs = require('fs');
var mime = require('mime'); 
http.createServer(function (req, res) {
    console.log('request: ' + req.url); 
    if (req.url == '/favicon.ico') {
	res.writeHead(404);
	res.end(); 
    } else if (req.url == '/') {
	res.writeHead(200, {'Content-Type':'text/plain'}); 
	res.end('hello world');
    } else {
	fs.readFile(virtualToPhysical(req.url), function (err, data) {
	    if (err) {
		res.writeHead(500, {'Content-Type':'text/plain'});
		res.end('internal error: ' + err); 
	    } else {
		res.writeHead(200, {'Content-Type': mime.lookup(req.url)});
		res.end(data, 'utf-8'); 
	    }
	}); 
    }
}).listen(8080, "127.0.0.1");
console.log('Server running at http://127.0.0.1:8080/');
