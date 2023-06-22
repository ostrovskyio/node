const { ServiceBroker } = require('moleculer');
const fs = require('fs');
const zlib = require('zlib');

const broker = new ServiceBroker();

broker.createService({
  name: 'unzip',

  actions: {
    async unzipFile(ctx) {
      const gzipFilePath = 'book.txt.gz';
      const readStream = fs.createReadStream(gzipFilePath);
      const unzipStream = zlib.createGunzip();

      const chunks = [];

      return new Promise((resolve, reject) => {
        readStream.pipe(unzipStream)
          .on('data', chunk => chunks.push(chunk))
          .on('error', err => reject(err))
          .on('end', () => {
            const unzippedData = Buffer.concat(chunks).toString();
            resolve(unzippedData);
          });
      });
    },
  },
});

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
  broker.call('unzip.unzipFile')
    .then(unzippedData => {
      console.log('File unzipped.');

      broker.call('write.writeToFile', { data: unzippedData })
        .then(() => console.log('Data written to file.'))
        .catch(err => console.error('Error writing to file:', err))
        .finally(() => broker.stop());
    })
    .catch(err => console.error('Error unzipping file:', err));
});
