/**
 * Урок 6. Библиотека Socket.io. Workers в Node.js
 * 
 * Скрипт счетчика и файлового менеджера на сокетах.
 * Чтение директории и файлов вынесена в отдельный поток воркера
 * 
 * Пример запуска скрипта из текущего каталога count: node index.js
 * 
 * Пример задания директории для файлового менеджера: http://localhost:3000/D://Distr
 * Пример задания файла для файлового менеджера: http://localhost:3000/D://Distr//example.txt
 */

const http = require("http");
const path = require("path");
const fs = require("fs");
const io = require('socket.io');
const { Worker } = require('worker_threads');

function start(workerData) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, 'worker.js');
        // console.log(21, filePath);
        const worker = new Worker(filePath, { workerData });
        worker.on('message', resolve);
        worker.on('error', reject);
    })
}

let dir = "";

const app = http.createServer((request, response) => {
    if (request.method === 'GET') {

        if (request.url === '/') {
            dir = __dirname;
            // console.log(39, dir);
        } else {
            dir = request.url.replace(/\//, ''); // удалить первый / из адреса
            // console.log(42, dir);
        }

        const filePath = path.join(__dirname, 'index.html');
        readStream = fs.createReadStream(filePath);
        readStream.pipe(response);

    } else if (request.method === 'POST') {
        writeResponse(response, "метод POST не обрабатывается");
    } else {
        response.statusCode = 405;
        response.end();
    }
});

const socket = io(app);
let value = 0;
socket.on('connection', function (socket) {
    console.log('New connection');

    value = value + 1;
    socket.emit('COUNT_MSG', { count: value });
    socket.broadcast.emit('COUNT_MSG', { count: value });


    socket.on('disconnect', function () {
        console.log('Disconnection');

        value = value - 1;
        socket.emit('COUNT_MSG', { count: value });
        socket.broadcast.emit('COUNT_MSG', { count: value });
    });

    start(dir)
        .then(result => socket.emit('DIR_MSG', { dir: result }))
        .catch(err => socket.emit('DIR_MSG', { dir: err.message }));

});

app.listen(3000, 'localhost');