let ws = null
let reconnectIntervalId = null
const broadcastChannel = new BroadcastChannel("WebsocketChannel")


function startWebsocket(cb) {
    if (!ws || ws.closed) {
        ws = new WebSocket('ws://localhost:8080')
        ws.onopen = () => {
            clearInterval(reconnectIntervalId)
            cb()
        }

        ws.onmessage =(event) => {
            broadcastChannel.postMessage(JSON.parse(event.data))
        }

        ws.onclose = () => {
            ws = null
            reconnectIntervalId = setInterval(startWebsocket, 1000)
        }
    }
    else {
        cb()
    }
}

onconnect = (event) => {
    const port = event.ports[0]
    port.onmessage = (e) => {
        if (ws && !ws.closed) {
            ws.send(e.data)
        }
        else {
            port.postMessage('Failed to send message - websocket closed')
        }
    }
    startWebsocket(() => {
        port.postMessage({type: 'WORKER_READY'})
    })
}