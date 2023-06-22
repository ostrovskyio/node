const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('A client connected.');

  socket.on('disconnect', () => {
    console.log('A client disconnected.');
  });

  socket.on('stream', (image) => {
    socket.broadcast.emit('stream', image);
  });
});

http.listen(3000, () => {
  console.log('Server listening on port 3000');
});
