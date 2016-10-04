
var http = require('http');
var fs = require('fs'); // Using the filesystem module
var url = require('url');



function onRequest(req, res) {
	//console.log(req);

	var parsedUrl = url.parse(req.url);
	console.log("The Request is: " + parsedUrl.pathname);

	// res.writeHead(200, {'Content-Type': 'text/plain'});	
	// res.end('You Requested ' + parsedUrl.pathname);

	// Read in the file they requested
	fs.readFile(__dirname + parsedUrl.pathname, 
		// Callback function, called when reading is complete
		function (err, data) {
			// if there is an error
			if (err) {
				res.writeHead(500);
				return res.end('Error loading ' + parsedUrl.pathname);
			}
			// Otherwise, send the data, the contents of the file
			res.writeHead(200);
			res.end(data);
  		}
  	);
	
}

var httpServer = http.createServer(onRequest);
httpServer.listen(8081);

console.log("Server is running and waiting");

// WebSocket Portion
// WebSockets work with the HTTP server
var socketio = require('socket.io');
var io = socketio.listen(httpServer);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 
	// We are given a websocket object in our function
	function (socket) {
	
		console.log("We have a new client: " + socket.id);
	
		// When this user "send" from clientside javascript, we get a "message"
		// client side: socket.send("the message");  or socket.emit('message', "the message");
		socket.on('message', 
			// Run this function when a message is sent
			function (data) {
				console.log("message: " + data);
				
				// Call "broadcast" to send it to all clients (except sender), this is equal to
				// socket.broadcast.emit('message', data);
				//socket.broadcast.send(data);
				
				// To all clients, on io.sockets instead
				io.sockets.emit('message', data);
			}
		);
		
		// When this user emits, client side: socket.emit('otherevent',some data);
		socket.on('otherevent', function(data) {
			// Data comes in as whatever was sent, including objects
			console.log("Received: 'otherevent' " + data);
		});

		socket.on('drawing', function(fooye) {
			console.log(fooye);
			io.sockets.emit('drawing', fooye);
		});
		
		
		socket.on('disconnect', function() {
			console.log("Client has disconnected");
		});
	}
);







