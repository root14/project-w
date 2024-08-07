import { Server } from "http";
import WebSocket from "ws";
import { v4 as uuid } from "uuid"

const wss = new WebSocket.Server({ port: 3001 })

async function handleWss() {

    wss.on('connection', (ws: WebSocket) => {

        const userId = uuid()

        console.log(`client connected, id: ${userId}`)

        ws.on('message', (message: string) => {
            console.log(`recieved message: ${message}`)
            ws.send(`server received your message: ${message}`)
        })

        ws.on('close', () => {
            console.log(`client disconnected, id:${userId}`)
        })

    })
}

export default handleWss