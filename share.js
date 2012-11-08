var connect = require('connect');
var sharejs = require('share').server;

var fs = require('fs');
var http = require("http");


fs.readFile(__dirname + '/share.js', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  console.log(data);
});

function getDirectoryLink(directory, path) {
	var fileLink = "<a onClick=\"loadDirectory('" + directory + "/" + path + "')\">" + "" + " + " + path + "/" + "</a><br />";
	return fileLink;
}

function getFileLink(directory, path) {
	var fileLink = "<a onClick=\"loadCode('" + directory + "/" + path + "')\">" + "" + " + " + path + "</a><br />";
	return fileLink;
}

function readDir(response, directory, string) {
	paths = fs.readdirSync(directory);
	response.write(getDirectoryLink(directory,".."), 'utf-8');
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
			fs.writeFile(query.saveFile, file, function(err) {
				if(err) {
					console.log(err);
					response.end("File Save failed. Is the file locked perhaps?", 'utf-8');
				} else {
					console.log("The file was saved!");
					response.end("Saved", 'utf-8');
				}
			}); 			
		} else {
			response.writeHead(404);
			response.end();
		}
		} else {
			response.writeHead(404);
			response.end();		
		}
	}
	);

var options = {db: {type: 'none'}, browserChannel: {cors: '*'}}; // See docs for options. {type: 'redis'} to enable persistance.

// Attach the sharejs REST and Socket.io interfaces to the server
sharejs.attach(server, options);

//server.listen(8000);
http.createServer(server).listen(8000);
http.createServer(server2).listen(8001);
console.log('Server running at http://127.0.0.1:8000/');