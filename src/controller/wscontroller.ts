import { v4 as uuid } from "uuid";
import WebSocket from "ws";
import crypto from "crypto";

import { exitPool, randomMatch } from "../matchFinder";

const wsPort = process.env.WS_PORT || 3003;

const wsServer = new WebSocket.Server({ port: wsPort as number }, () => {
    console.log(`WebSocket running: ws://localhost:${wsPort}`);
});

const connections = new Map<string, WebSocket>();

const handleWs = () => {
    wsServer.on("connection", async (connection, request) => {
        const connectionId = crypto.randomUUID();
        console.log(`client connected: ${connectionId}`);
        connections.set(connectionId, connection);

        connection.on("error", (error: Error) => {
            console.log("connection error: " + error.message);
        });

        connection.on("close", () => {
            console.log("connection closed: " + connectionId);
            connections.delete(connectionId);
            exitPool(connectionId);
        });

        connection.on("message", async (message: string) => {
            const { eventType, data } = JSON.parse(message);

            switch (eventType) {
                case 'findMeAMatch':
                    await handleFindMatch(connectionId, connection);
                    break;

                case 'offer':
                    await handleOffer(data);
                    break;

                case 'answer':
                    await handleAnswer(data);
                    break;

                case 'ice-candidate':
                    await handleIceCandidate(data);
                    break;

                case 'exitRoom':
                    exitPool(connectionId);
                    break;

                default:
                    console.log('unknown eventType:', eventType);
                    break;
            }
        });
    });

    wsServer.on("error", (error: Error) => {
        console.log("WebSocket error: " + error.message);
    });
};

async function handleFindMatch(connectionId: string, connection: WebSocket) {
    let matchedUserId = await randomMatch(connectionId);

    if (!matchedUserId) {
        connection.send(JSON.stringify({
            eventType: 'match-not-found',
            result: "match-not-found"
        }));
    } else {
        const matchedConnection = connections.get(matchedUserId[0]);
        if (matchedConnection) {
            connection.send(JSON.stringify({
                eventType: 'match-found',
                result: "match-found",
                userId: matchedUserId,
                yourId: connectionId
            }));
            matchedConnection.send(JSON.stringify({
                eventType: 'match-found',
                result: "match-found",
                userId: connectionId,
                yourId: matchedUserId
            }));
        }
    }
}

async function handleOffer(data: any) {
    const { targetUserId, sdp } = data;
    const targetConnection = connections.get(targetUserId);

    if (targetConnection) {
        targetConnection.send(JSON.stringify({
            eventType: 'offer',
            data: { sdp }
        }));
    } else {
        console.log(`target user (${targetUserId}) cannot found.`)
    }
}

async function handleAnswer(data: any) {
    const { targetUserId, sdp } = data;
    const targetConnection = connections.get(targetUserId);

    if (targetConnection) {
        targetConnection.send(JSON.stringify({
            eventType: 'answer',
            data: { sdp }
        }));
    } else {
        console.log(`target user (${targetUserId}) cannot found.`)
    }
}

async function handleIceCandidate(data: any) {
    const { targetUserId, candidate } = data;
    const targetConnection = connections.get(targetUserId);

    if (targetConnection) {
        targetConnection.send(JSON.stringify({
            eventType: 'ice-candidate',
            data: { candidate }
        }));
    } else {
        console.log(`target user (${targetUserId}) cannot found.`)
    }
}

export default handleWs;
