/**
 * Урок 3. Работа с файловой системой. Класс Buffer. Модуль Streams
 * 
 * Пример запуска скрипта: node stream.js
 */

import fs from "fs";

const ip1 = "89.123.1.41";
const ip2 = "34.48.240.111";

const readStream = fs.createReadStream('./access.log', 'utf8');
const writeStream1 = fs.createWriteStream(`./${ip1}_requests.log`, { encoding: 'utf8' });
const writeStream2 = fs.createWriteStream(`./${ip2}_requests.log`, { encoding: 'utf8' });

readStream.on('data', (chunk) => {
    let str1 = chunk.match(/^89\.123\.1\.41.+/gm).join("\r\n");
    let str2 = chunk.match(/^34\.48\.240\.111.+/gm).join("\r\n");
    writeStream1.write(str1);
    writeStream1.write("\r\n");
    writeStream2.write(str2);
    writeStream2.write("\r\n");
});

readStream.on('end', () => {
    console.log('File reading finished');
    writeStream1.end(() => console.log('File1 writing finished'));
    writeStream2.end(() => console.log('File2 writing finished'));
});
readStream.on('error', () => console.log(err));