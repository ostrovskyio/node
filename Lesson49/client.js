const io = require('socket.io-client');
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Підключено до сервера');

  socket.emit('message', 'Привіт, сервер!');
});

socket.on('message', (data) => {
  console.log('Повідомлення від сервера:', data);
});

socket.on('disconnect', () => {
  console.log('Відключено від сервера');
});
