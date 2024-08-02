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
                [`^/rpc/${endpoint}`]: '', // Ensure this matches the Vercel route
            },
        });
    }

    const targetMiddleware = (req, res, next) => {
        const target = targets[Math.floor(Math.random() * targets.length)];
        createProxyMiddleware({
            target,
            changeOrigin: true,
            pathRewrite: {
                [`^/rpc/${endpoint}`]: '',
            },
        })(req, res, next);
    };

    return targetMiddleware;
}

module.exports = (req, res) => {
    const endpoint = 'symphony'; // Use the correct endpoint name
    const middleware = getProxyMiddleware(endpoint);
    middleware(req, res);
};