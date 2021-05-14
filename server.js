const fs = require('fs');
const path = require('path');
const express = require('express');
const morgan = require('morgan')
const WebSocket = require('ws');

const images = path.join(__dirname, 'images');
const app = new express();
app.use(morgan('combined'))


app.get('/', function(request, response){
    response.sendFile('./index.html', { root: __dirname });
});

app.get('/worker.js', function(request, response){
    response.sendFile('./worker.js', { root: __dirname });
});


const wss = new WebSocket.Server({ port: 8080 });

let index = 0;
const chunks = fs.readdirSync(images)
    .sort((a, b) => Number(a.replace('.jpg', '')) - Number(b.replace('.jpg', '')))
    .map(file => fs.readFileSync(path.join(images, file), {encoding: 'base64'}));


wss.on('connection', function connection(ws) {
    console.log('new websocket connection!');

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });

    ws.on('close', function () {
        console.log('connection closed!');
    })
});


setInterval(() => {
    wss.clients.forEach((client) => {
        index = index % chunks.length;
        client.send(JSON.stringify({type: 'FRAME', content: chunks[index]}));
        index++;
    })
    // Video length is 53 seconds.
}, (53 * 1000) / chunks.length);


app.listen(5000, () => {
    console.log("listening on http://localhost:5000/")
})
