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

function readDir(response, directories, string) {
	if (directories.length == 0) {
		response.end("", 'utf-8');
		return;
	}
	var directory = directories.shift();		
		fs.stat(directory, function(err, stat) {
			var fileLink = "<a onClick=\"loadCode('" + directory + "')\">" + "" + " + " + directory + "</a><br />"
			response.write(fileLink, 'utf-8');
			if (stat.isDirectory()) {
				fs.readdir(directory, function(err, list) {				
					list.forEach(function(file) {
						directories.push(directory + "/" + file);
					});
					readDir(response, directories, string);
				});
			} else {
				readDir(response, directories, string);
			}
		});
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
				readDir(response, [query.getFiles], "");
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
					//console.log("ZZZZ", );
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
			//fs.readFile(query.saveFile, 'utf8', 
			//	function(err, data) {
			//		console.log("DATA", data);
					
			//	}
			//)
			
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