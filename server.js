/**
 * Урок 5. HTTP-cервер на Node.js
 * 
 * Пример запуска скрипта: node server.js
 * 
 * Пример задания директории: http://localhost:3000/D://Distr
 * Пример задания файла: http://localhost:3000/D://Distr//example.txt
 */


import cluster from "cluster";
import os from "os";
import fs from "fs";
import http from "http";

function isFile(value) {
    let stat = fs.statSync(value);
    return stat.isFile();
}

function writeResponse(response, value) {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    const text = `<html>${value}</html>`;
    response.write(text);
}

const numCPUs = os.cpus().length;
if (cluster.isPrimary) {
    console.log(`Master ${process.pid} is running`);
    for (let i = 0; i < numCPUs; i++) {
        console.log(`Forking process number ${i}...`);
        cluster.fork();
    }
} else {
    console.log(`Worker ${process.pid} started...`);

    // создание сервера
    http.createServer((request, response) => {
        console.log(`Worker ${process.pid} handle this request...`);
        setTimeout(() => {
            if (request.method === 'GET') {
                let [currentPath] = process.argv.slice(1, 2);
                console.log("argv", currentPath);
                currentPath = currentPath.match(/([\w:\.]*\\)+/g).join();
                console.log(55, currentPath);
                currentPath = currentPath.replace(/\\/g, '//');
                console.log(57, currentPath);
                let tmp = "empty";
                console.log(60, request.url);
                if (request.url === '/') {
                    tmp = currentPath;
                } else {
                    tmp = request.url.replace(/\//, ''); // удалить первый / из адреса
                }

                try {
                    if (isFile(tmp)) {
                        console.log("это файл");
                        fs.readFile(tmp, 'utf8', (err, data) => {
                            writeResponse(response, data);
                        });
                    } else {
                        console.log("это директория");
                        const dir = fs.readdirSync(tmp).join("<br/>");
                        writeResponse(response, dir);
                    }

                } catch (error) {
                    writeResponse(response, error.message);
                }

            } else if (request.method === 'POST') {
                writeResponse(response, "метод POST не обрабатывается");
            } else {
                response.statusCode = 405;
                response.end();
            }
        }, 5000);
    }).listen(3000, 'localhost');
}
