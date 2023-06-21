const io = require('socket.io')(3000);

io.on('connection', (socket) => {
  console.log('Клієнт підключився');

  socket.on('message', (data) => {
    console.log('Повідомлення від клієнта:', data);
    socket.emit('message', 'Отримано повідомлення: ' + data);
  });

  socket.on('disconnect', () => {
    console.log('Клієнт відключився');
  });
});
