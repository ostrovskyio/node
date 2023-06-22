const { ServiceBroker } = require('moleculer');
const fs = require('fs');

const broker = new ServiceBroker();

broker.createService({
  name: 'write',

  actions: {
    writeToFile(ctx) {
      const outputFilePath = 'book2.txt';
      const data = ctx.params.data;

      return new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(outputFilePath);

        writeStream.write(data, 'utf8', (err) => {
          if (err) {
            reject(err);
          } else {
            writeStream.end();
            writeStream.on('finish', () => resolve());
            writeStream.on('error', err => reject(err));
          }
        });
      });
    },
  },
});

broker.start().then(() => {
  broker.repl();
});
