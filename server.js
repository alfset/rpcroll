const express = require('express');
const symphonyMiddleware = require('./rpc/symphony'); // Import the middleware

const app = express();
const PORT = 3000;

// Use the proxy middleware
app.use('/rpc/symphony', symphonyMiddleware);

// Start the server
app.listen(PORT, () => {
    console.log(`Proxy server is running on http://localhost:${PORT}`);
});