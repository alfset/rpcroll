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

    if (typeof targets === 'string') {
        return createProxyMiddleware({
            target: targets,
            changeOrigin: true,
            pathRewrite: {
                [`^/${endpoint}`]: '',
            },
        });
    }

    const targetMiddleware = (req, res, next) => {
        const target = targets[Math.floor(Math.random() * targets.length)];
        createProxyMiddleware({
            target,
            changeOrigin: true,
            pathRewrite: {
                [`^/${endpoint}`]: '',
            },
        })(req, res, next);
    };

    return targetMiddleware;
}

module.exports = getProxyMiddleware;