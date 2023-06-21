const io = require('socket.io')(3000);

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('message', (data) => {
    console.log('Message from client:', data);
    socket.emit('message', 'Message received: ' + data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});
