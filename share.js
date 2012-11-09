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
	console.log("PARENT", directory, parent);
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
};

var server = connect(
    connect.logger(),
	connect.static('my_html_files')
    );
	
var server2 = connect(
    connect.logger(),
	function (request, response) {
	    if (request.method == 'POST') {
		response.writeHead(200, { 
		    'Content-Type': 'text/html'
		    ,'Access-Control-Allow-Origin': '*'});
		request.content = "";
		   request.addListener("data", function(chunk) {
		    request.content += chunk;
		   });
	        request.addListener("end", function(chunk) {
		    console.log(querystring.parse(request.content).file, querystring.parse(request.content).body);
		    fs.writeFile(querystring.parse(request.content).file, querystring.parse(request.content).body, function(err) {
			if(err) {
			    console.log(err);
			    response.end("File Save failed. Is the file locked perhaps?", 'utf-8');
			} else {
			    console.log("The file was saved!");
			    response.end("Saved", 'utf-8');
			}
		    }); 
		});
		response.end("POST RECEIVED!");
	    } else if (request.method == 'GET') {
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
					console.log("DATA", data);
					response.end(data, 'utf-8');
				}
			)
			
		} else if (query.saveFile != null) {
			response.writeHead(200, { 
				'Content-Type': 'text/html'
				,'Access-Control-Allow-Origin': '*'});
			if (typeof query.line === 'string') {
				file = query.line;
			} else {
				file = query.line.join("\n");
			}			
		} else {
		    console.log("FAIL!", require('url').parse(request.url, true))
			response.writeHead(404);
			response.end();
		}
		} else {
		    console.log("FAIL2!")
			response.writeHead(404);
			response.end();		
		}
	    }
	}
	);

var options = {db: {type: 'none'}, browserChannel: {cors: '*'}}; // See docs for options. {type: 'redis'} to enable persistance.

// Attach the sharejs REST and Socket.io interfaces to the server
sharejs.attach(server, options);

port = parseInt(process.argv[2]);

//server.listen(8000);
http.createServer(server).listen(port);
http.createServer(server2).listen(port+1);
console.log('Server running at http://127.0.0.1:8000/');