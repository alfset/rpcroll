const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const getProxyMiddleware = require('../middleware/proxy');
const {
    PORT,
    RPC_ENDPOINTS
} = require('../config');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({
    server
});

wss.setMaxListeners(20);

// Setup proxy for each RPC endpoint
Object.keys(RPC_ENDPOINTS).forEach(endpoint => {
    app.use(`/${endpoint}`, getProxyMiddleware(endpoint));
});

wss.on('connection', (ws, req) => {
    const endpoint = req.url.split('/')[1];
    const targets = RPC_ENDPOINTS[endpoint];

    if (!targets) {
        ws.close();
        return;
    }

    const target = targets[Math.floor(Math.random() * targets.length)];
    const wsProxy = new WebSocket(target.replace(/^http/, 'ws'));

    const onMessage = (message) => {
        wsProxy.send(message);
    };

    const onProxyMessage = (message) => {
        ws.send(message);
    };

    const onProxyError = () => {
        ws.close();
    };

    const onWsError = () => {
        wsProxy.close();
    };

    ws.on('message', onMessage);
    wsProxy.on('message', onProxyMessage);
    wsProxy.on('error', onProxyError);
    ws.on('error', onWsError);

    ws.on('close', () => {
        wsProxy.close();
        ws.off('message', onMessage);
        ws.off('error', onWsError);
    });

    wsProxy.on('close', () => {
        ws.off('message', onProxyMessage);
        ws.off('error', onProxyError);
    });
});

server.listen(PORT, () => {
    console.log(`Proxy server is running on http://localhost:${PORT}`);
});