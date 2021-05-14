# Websocket Web Worker POC

Basic server-client code that use Websocket to stream video.  
Using shared worker concept to reduce the traffic between client and server when more than one tab is opened

Run
```bash
npm install
node server.js
```

- Open http://localhost:5000/
- Open multiple tabs
- Server "new websocket connection!" message appears only once
- Devtools network tab shows that the source of the image is locally
- Websocket connection is closed only if all tabs are closed
- Open `chrome://inspect/#workers` to inspect shared worker network traffic


