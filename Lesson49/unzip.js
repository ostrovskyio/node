const fs = require('fs');
const zlib = require('zlib');

const gzipFilePath = 'book.txt.gz';
const outputFilePath = 'book2.txt';

const readStream = fs.createReadStream(gzipFilePath);

const unzip = zlib.createGunzip();

const writeStream = fs.createWriteStream(outputFilePath);

readStream.pipe(unzip).pipe(writeStream);

writeStream.on('finish', () => {
  console.log('Файл розархівовано та записано у book2.txt.');
});
