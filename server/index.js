const express = require('express');
const getProxyMiddleware = require('../middleware/proxy');
const {
    PORT,
    RPC_ENDPOINTS
} = require('../config');

const app = express();

Object.keys(RPC_ENDPOINTS).forEach(endpoint => {
    app.use(`/${endpoint}`, getProxyMiddleware(endpoint));
});

app.listen(PORT, () => {
    console.log(`Proxy server is running on http://localhost:${PORT}`);
});