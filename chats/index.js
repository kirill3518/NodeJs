/**
 * Урок 6. Библиотека Socket.io. Workers в Node.js
 * 
 * Пример запуска скрипта: node chats/index.js
 */

const io = require('socket.io');
const http = require("http");
const path = require("path");
const fs = require("fs");
// const { workerData, parentPort } = require('worker_threads');
const crypto = require('crypto');

// const password = crypto.randomBytes(4).toString('hex');
// parentPort.postMessage({ result: `Password was generated: ${password}` });


const app = http.createServer((request, response) => {
    if (request.method === 'GET') {
        const filePath = path.join(__dirname, 'index.html');
        readStream = fs.createReadStream(filePath);
        readStream.pipe(response);
    } else if (request.method === 'POST') {
        let data = '';
        request.on('data', chunk => {
            data += chunk;
        });
        request.on('end', () => {
            const parsedData = JSON.parse(data);
            console.log(parsedData);
            response.writeHead(200, { 'Content-Type': 'json' });
            response.end(data);
        });
    } else {
        response.statusCode = 405;
        response.end();
    }
});

const socket = io(app);
socket.on('connection', function (socket) {
    console.log('New connection');
    // 
    const userName = crypto.randomBytes(4).toString('hex');
    socket.emit('USER_NAME', { msg: userName });

    socket.broadcast.emit('NEW_CONN_EVENT', { msg: 'The new client connected' });
    socket.on('CLIENT_MSG', (data) => {
        socket.emit('SERVER_MSG', { name: data.name, msg: data.msg.split('').reverse().join('') });
        socket.broadcast.emit('SERVER_MSG', { name: data.name, msg: data.msg.split('').reverse().join('') });
    });

    // socket.on('reconnect_attemp', function (attemp) {
    //     console.log('Reconnection');
    //     socket.broadcast.emit('RECONN_EVENT', { msg: 'The client reconnected' });
    // });

    socket.on('disconnect', function () {
        console.log('Disconnection');
        socket.broadcast.emit('DISCONN_EVENT', { msg: 'The client disconnected' });
    });
});

app.listen(3000, 'localhost');
