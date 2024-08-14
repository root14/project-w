import WebSocket from 'ws';
import crypto from 'crypto';

const wsPort = process.env.WS_PORT || 3003;
const wsServer = new WebSocket.Server({ port: wsPort as number }, () => {
    console.log(`ws Server is running on http://localhost:${wsPort}`);
});

const connections = new Map<string, WebSocket>();

const handleWs = () => {
    wsServer.on('connection', (connection) => {
        const connectionId = crypto.randomUUID();
        console.log(`Client connected with ID ${connectionId}`);

        connections.set(connectionId, connection);

        connection.on('error', (error: Error) => {
            console.log('Connection Error: ' + error.message);
        });

        connection.on('close', () => {
            console.log(`Client connection with ID ${connectionId} closed`);
            connections.delete(connectionId);
        });

        connection.on('message', async (message: string) => {
            const { eventType, data } = JSON.parse(message);

            switch (eventType) {
                case 'findMeAMatch':
                    await handleFindMeAMatch(connectionId, connection);
                    break;

                case 'offer':
                    await handleWebRTCMessage('offer', data, connectionId);
                    break;

                case 'answer':
                    await handleWebRTCMessage('answer', data, connectionId);
                    break;

                case 'ice-candidate':
                    await handleWebRTCMessage('ice-candidate', data, connectionId);
                    break;

                case 'exitRoom':
                    connections.delete(connectionId);
                    break;

                default:
                    console.log('Unknown event type:', eventType);
                    break;
            }
        });
    });

    wsServer.on('error', (error: Error) => {
        console.log('WebSocket server error: ' + error.message);
    });
};

async function handleFindMeAMatch(connectionId: string, connection: WebSocket) {
    const waitingUsers = Array.from(connections.keys());

    if (waitingUsers.length > 1) {
        const matchedUserId = waitingUsers.find(id => id !== connectionId);

        if (matchedUserId) {
            const matchedConnection = connections.get(matchedUserId);

            if (matchedConnection) {
                connection.send(JSON.stringify({
                    eventType: 'match-found',
                    data: {
                        yourId: connectionId,
                        matchedUserId: matchedUserId,
                    }
                }));

                matchedConnection.send(JSON.stringify({
                    eventType: 'match-found',
                    data: {
                        yourId: matchedUserId,
                        matchedUserId: connectionId,
                    }
                }));

                connections.delete(connectionId);
                connections.delete(matchedUserId);
            }
        } else {
            connections.set(connectionId, connection);
        }
    } else {
        connections.set(connectionId, connection);
    }
}


async function handleWebRTCMessage(type: string, data: any, connectionId: string) {
    const connection = connections.get(connectionId);

    if (!connection) {
        console.log(`Connection with ID ${connectionId} not found`);
        return;
    }

    switch (type) {
        case 'offer':
        case 'answer':
        case 'ice-candidate':
            connection.send(JSON.stringify({ eventType: type, data }));
            break;

        default:
            console.log('Unknown WebRTC event type:', type);
            break;
    }
}

export default handleWs;
