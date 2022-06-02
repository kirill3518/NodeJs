const { workerData, parentPort } = require('worker_threads');
const fs = require("fs");

function isFile(value) {
    let stat = fs.statSync(value);
    return stat.isFile();
}

function myReadStream(dirPath) {

    try {
        if (isFile(dirPath)) {
            console.log("это файл");
            return fs.readFileSync(dirPath, 'utf8');
        } else {
            console.log("это директория");
            return fs.readdirSync(dirPath).join("<br/>");
        }
    } catch (error) {
        return error.message;
    }
}

// parentPort.postMessage({ result: `You want to generate password ${workerData} bytes size` });

parentPort.postMessage(myReadStream(workerData));
