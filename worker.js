let ws = null;
let reconnectIntervalId = null;
const broadcastChannel = new BroadcastChannel("WebsocketChannel");


function startWebsocket(cb) {
    if (!ws || ws.closed) {
        ws = new WebSocket('ws://localhost:8080');
        ws.onopen = function open() {
            clearInterval(reconnectIntervalId);
            cb();
        };

        ws.onmessage = function onmessage(event) {
            broadcastChannel.postMessage(JSON.parse(event.data));
        }

        ws.onclose = function close() {
            ws = null;
            reconnectIntervalId = setInterval(startWebsocket, 1000);
        };
    }
    else {
        cb();
    }
}

onconnect = function (event) {
    const port = event.ports[0];
    port.onmessage = function (e) {
        if (ws && !ws.closed) {
            ws.send(e.data);
            port.postMessage(`Sent message to server ${e.data}`);
        }
        else {
            port.postMessage('Failed to send message, websocket closed: ', ws.closed);
        }
    }
    startWebsocket(() => {
        port.postMessage({type: 'WORKER_READY'});
    });
};