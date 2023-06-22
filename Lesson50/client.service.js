const { ServiceBroker } = require('moleculer');
const ioClient = require('socket.io-client');

const broker = new ServiceBroker();

broker.createService({
  name: 'client',

  started() {
    const socket = ioClient('http://localhost:3000');
    socket.on('connect', () => {
      this.connectedToServer(socket);
      socket.emit('message', 'Hello, server!');
    });

    socket.on('message', (data) => {
      this.receiveMessage(data);
    });

    socket.on('disconnect', () => {
      this.disconnectedFromServer();
    });
  },

  methods: {
    connectedToServer() {
      console.log('Connected to server');
    },

    receiveMessage(data) {
      console.log('Message from server:', data);
    },

    disconnectedFromServer() {
      console.log('Disconnected from server');
    },
  },
});

broker.start();
