const io = require('socket.io-client');
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to server');

  socket.emit('message', 'Hello, server!');
});

socket.on('message', (data) => {
  console.log('Message from server:', data);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
