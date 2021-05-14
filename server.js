const fs = require('fs')
const path = require('path')
const express = require('express')
const morgan = require('morgan')
const WebSocket = require('ws')


const app = new express()
app.use(morgan('combined'))
app.use('/static', express.static(path.join(__dirname, 'public')))

app.get('/', function(request, response){
    response.sendFile('./index.html', { root: __dirname })
});


let index = 0
const images = path.join(__dirname, 'images')
const frames = fs.readdirSync(images)
    .sort((a, b) => Number(a.replace('.jpg', '')) - Number(b.replace('.jpg', '')))
    .map(file => fs.readFileSync(path.join(images, file), {encoding: 'base64'}));


const wss = new WebSocket.Server({ port: 8080 })
wss.on('connection', function connection(ws) {
    console.log('new websocket connection!')

    ws.on('message', function incoming(message) {
        console.log('received: %s', message)
    });

    ws.on('close', function () {
        console.log('connection closed!')
    })
});


setInterval(() => {
    index = index % frames.length
    index++
    const frame = frames[index]
    wss.clients.forEach((client) => {
        client.send(JSON.stringify({
            type: 'FRAME',
            content: frame
        }))
    })
    // Video length is 53 seconds.
}, (53 * 1000) / frames.length)


app.listen(5000, () => {
    console.log("listening on http://localhost:5000/")
})
