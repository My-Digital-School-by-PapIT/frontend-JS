const http = require('http');
const ws = require('ws');
const wss = new ws.Server({noServer: true});

function accept(req, res) {
    if (!req.headers.upgrade || req.headers.upgrade.toLowerCase() != 'websocket') {
        res.end();
        return;
    }
    if (!req.headers.connection.match(/\bupgrade\b/i)) {
        res.end();
        return;
    }
    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onConnect);
}

function onConnect(ws) {
    ws.on('message', function (message) {
        message = message.toString();
        let name = message.match(/([\p{Alpha}\p{M}\p{Nd}\p{Pc}\p{Join_C}]+)$/gu) || "Guest";
        ws.send(`Hello from server, ${name}!`);
        setTimeout(() => ws.close(1000, "Bye!"), 5000);
        console.log(`Hello from client, ${name}!`);
    });
}

if (!module.parent) {
    http.createServer(accept).listen(8080);
    console.log('Server running at http://localhost:8080');
} else {
    exports.accept = accept;
}