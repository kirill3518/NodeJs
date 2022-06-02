const http = require("http");
const path = require("path");
const fs = require("fs");
const io = require('socket.io');
const { Worker } = require('worker_threads');

function start(workerData) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./worker.js', { workerData });
        worker.on('message', resolve);
        worker.on('error', reject);
    })
}

let dir = "";

const app = http.createServer((request, response) => {
    if (request.method === 'GET') {

        if (request.url === '/') {
            let [currentPath] = process.argv.slice(1, 2);
            currentPath = currentPath.match(/([\w:\.]*\\)+/g).join();
            currentPath = currentPath.replace(/\\/g, '//');
            dir = currentPath;
        } else {
            dir = request.url.replace(/\//, ''); // удалить первый / из адреса
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