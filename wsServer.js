const WebSocket = require('ws')

// object to hold active WebSocket connections
const connections = {};

const WebSocketServer = (httpServer) => {
    const wss = new WebSocket.Server({ server: httpServer })

    wss.on('connection', (ws, req) => {
        console.log('A new WebSocket connection was established');

        // users provide their id through the url to connect to wsServer
        const userId = req.url.split('/')[1];
        // store the connection
        connections[userId] = ws;

        ws.on('message', (message) => {
            console.log(`Received: ${message}`);
            const { recipientId, text } = JSON.parse(message);

            // send message to correct user
            if (connections[recipientId]) {
                connections[recipientId].send(JSON.stringify({ from: userId, text }))
            };
        });

        ws.on('close', () => {
            console.log(`WebSocket connection closed for user: ${userId}`);
            delete connections[userId]
        });
    });

    console.log('WebSocket server is running...');
};

module.exports = WebSocketServer;