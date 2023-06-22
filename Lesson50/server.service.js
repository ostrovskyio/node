const { ServiceBroker } = require('moleculer');
const { Service } = require('moleculer-io');
const io = require('socket.io');

const broker = new ServiceBroker();

broker.createService({
  name: 'server',
  mixins: [Service],

  started() {
    const server = io(this.server);
    server.on('connection', (socket) => {
      this.clientConnected(socket);

      socket.on('message', (data) => {
        this.receiveMessage(socket, data);
      });

      socket.on('disconnect', () => {
        this.clientDisconnected(socket);
      });
    });
  },

  methods: {
    clientConnected(socket) {
      console.log('Client connected');
    },

    receiveMessage(socket, data) {
      console.log('Message from client:', data);
      socket.emit('message', 'Message received: ' + data);
    },

    clientDisconnected(socket) {
      console.log('Client disconnected');
    },
  },
});

broker.start();
