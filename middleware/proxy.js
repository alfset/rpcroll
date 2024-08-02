const {
    createProxyMiddleware
} = require('http-proxy-middleware');
const {
    RPC_ENDPOINTS
} = require('../config');

function getProxyMiddleware(endpoint) {
    const targets = RPC_ENDPOINTS[endpoint];
    if (!targets) {
        throw new Error(`No RPC endpoint configured for "${endpoint}"`);
    }

    const proxyOptions = {
        target: targets[0],
        changeOrigin: true,
        pathRewrite: {
            [`^/${endpoint}`]: '', // remove /endpoint from the beginning of the path
        },
        ws: true // Enable WebSocket proxying
    };

    // If there's only one target, use it directly
    if (typeof targets === 'string') {
        proxyOptions.target = targets;
        return createProxyMiddleware(proxyOptions);
    }

    // If there are multiple targets, round-robin or random selection
    const targetMiddleware = (req, res, next) => {
        const target = targets[Math.floor(Math.random() * targets.length)];
        createProxyMiddleware({
            ...proxyOptions,
            target
        })(req, res, next);
    };

    return targetMiddleware;
}

module.exports = getProxyMiddleware;