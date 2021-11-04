//Setting up our express server:
const app = require('express')();
//Supply the app to the HTTP server, which will allow express to handle the HTTP requests:
const http = require('http').createServer(app);
//Grab the socket.io module and have it listen to our server object & enable CORS (Cross-Origin Resource Sharing).
const io = require('socket.io')(http, {
   cors: {
       origin: "http://localhost:8080",
       methods: ["GET", "POST"]
   }
});

let players = [];
io.on('connection', function (socket) {
   console.log('A user connected: ' + socket.id);
   players.push(socket.id);
   if (players.length === 1) {
       io.emit('isPlayerA');
   }
   
//this is for a TWO player logic! It only emits for the first player - you’d have to adjust your logic for multiplayer (Check out socket rooms!)
   socket.on('dealCards', function () {
       io.emit('dealCards');
   });
   socket.on('cardPlayed', function (gameObject, isPlayerA) {
       io.emit('cardPlayed', gameObject, isPlayerA);
   });
   socket.on('disconnect', function () {
       console.log('A user disconnected: ' + socket.id);
       players = players.filter(player => player !== socket.id);
   });
});


http.listen(3000, function () {
  console.log('Server started!');
});
