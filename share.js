var connect = require('connect');
var sharejs = require('share').server;
var querystring = require('querystring');

var fs = require('fs');
var http = require("http");

function getDirectoryLink(directory, path) {
	var fileLink = "<a onClick=\"loadDirectory('" + directory + "/" + path + "')\">" + "" + " + " + path + "/" + "</a><br />";
	return fileLink;
}

function getParentDirectoryLink(directory, path) {
	var parent =  directory.replace(/\/[^/]*\/$/, "");
	var parent =  parent.replace(/\/[^/]*$/, "");
	var fileLink = "<a onClick=\"loadDirectory('" + parent + "" + "')\">" + "" + " + " + ".." + "/" + "</a><br />";
	return fileLink;
}

function getFileLink(directory, path) {
	var fileLink = "<a onClick=\"loadCode('" + directory + "/" + path + "')\">" + "" + " + " + path + "</a><br />";
	return fileLink;
}

function readDir(response, directory, string) {
	paths = fs.readdirSync(directory);
	response.write(getParentDirectoryLink(directory), 'utf-8');
	paths.forEach(function(path) {
		if (fs.statSync(directory + "/" + path).isDirectory()) {
			var fileLink = getDirectoryLink(directory,path);
		} else {
			var fileLink = getFileLink(directory, path);
		}
		response.write(fileLink, 'utf-8');
	});
	response.end();
}

function handlePost(request, response) {
    response.writeHead(200, { 
        'Content-Type': 'text/html'
	    ,'Access-Control-Allow-Origin': '*'});
	request.content = "";
	request.addListener("data", function(chunk) {
	    request.content += chunk;
	});
	request.addListener("end", function(chunk) {
		fs.writeFile(querystring.parse(request.content).file, querystring.parse(request.content).body, function(err) {
    		if(err) {
    		    response.end("File Save failed. Is the file locked perhaps?", 'utf-8');
    		} else {
    		    response.end("Saved", 'utf-8');
    		}
    	}); 
    });
	response.end("POST RECEIVED!");  
}

function handleGet(request, response) {
    var query = require('url').parse(request.url, true).query;
    	if (query != null) {
    		if (query.getFiles != null) {
    				response.writeHead(200, { 
    					'Content-Type': 'text/html'
    					,'Access-Control-Allow-Origin': '*'});
    				readDir(response, query.getFiles, "");
    		} else if (query.getFile != null) {
    			response.writeHead(200, { 
    					'Content-Type': 'text/html'
    					,'Access-Control-Allow-Origin': '*'});
    			fs.readFile(query.getFile, 'utf8', 
    				function(err, data) {
    					response.end(data, 'utf-8');
    				}
    			)	
    		} else {
    			response.writeHead(404);
    			response.end();
    		}
		} else {
			response.writeHead(404);
			response.end();		
		}
}

var server = connect(
    connect.logger(),
	connect.static(__dirname)
    );
	
var server2 = connect(
    connect.logger(),
	function (request, response) {
	    if (request.method == 'POST') {
		    handlePost(request, response);  	
	    } else if (request.method == 'GET') {
		    handleGet(request, response);
	    }
	}
);

var options = {db: {type: 'none'}, browserChannel: {cors: '*'}}; // See docs for options. {type: 'redis'} to enable persistance.

sharejs.attach(server, options);

port = parseInt(process.argv[2]);

http.createServer(server).listen(port);
http.createServer(server2).listen(port+1);
console.log('Server running at http://127.0.0.1:' + port + ' - ' + port+1 + '' +  '/');