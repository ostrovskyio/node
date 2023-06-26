const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const winston = require('winston');
const { transports } = require('winston');
const amqp = require('amqplib');

const fileTransport = new transports.File({ filename: 'logs.log' });

const rabbitMqTransport = new transports.RabbitMQ({
  exchange: 'logs',
  level: 'info',
  uri: 'amqp://localhost'
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    fileTransport,
    rabbitMqTransport
  ]
});

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  logger.info('A client connected.');

  socket.on('disconnect', () => {
    logger.info('A client disconnected.');
  });

  socket.on('stream', (image) => {
    socket.broadcast.emit('stream', image);
  });
});

http.listen(3000, () => {
  logger.info('Server listening on port 3000');
});
