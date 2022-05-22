/**
 * Урок 4. CLI-приложения
 * 
 * Пример запуска скрипта: node streamCli.js
 */

import fs from "fs";
import path from "path";
import readline from "readline";
import inquirer from "inquirer";

// Обработать данные из 3 урока
function myReadStream(filePath) {
    const ip1 = "89.123.1.41";
    const ip2 = "34.48.240.111";

    const readStream = fs.createReadStream(filePath, 'utf8');
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
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let dirname = "";

rl.question("Please enter the path to the file: ", function (inputedPath) {
    dirname = inputedPath;
    rl.close();
});

let files = [];

// Сформировать список папок и файлов начиная с заданной дериктории
function read(root) {
    let arr = fs.readdirSync(root);
    files = [...files, ...arr];
    for (let i = 0; i < arr.length; i++) {
        let name = [root, arr[i]].join('/');
        name = path.normalize(name);
        // console.log(name);
        let stat = fs.statSync(name);
        if (stat.isDirectory()) {
            read(name);
        }
    }
}

rl.on("close", function () {
    console.log("dirname=", dirname);
    // const list = fs.readdirSync(dirname).filter(isFile);
    files = [];
    read(dirname);

    inquirer
        .prompt([{
            name: "fileName",
            type: "list",
            message: "Choose file:",
            choices: files,
        }])
        .then((answer) => {
            console.log(answer.fileName);
            const filePath = path.join(dirname, answer.fileName);
            console.log(filePath);
            myReadStream(filePath);
        });
});
