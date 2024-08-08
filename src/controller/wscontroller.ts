import { v4 as uuid, v4 } from "uuid"
import WebSocket from "ws";
import { redisClient } from "../data/redisConnector"

const wsPort = process.env.WS_PORT || 3003

const wsServer = new WebSocket.Server({ port: wsPort as number }, () => {
    console.log(`ws Server is running on http://localhost:${wsPort}`)
})



const handleWs = () => {
    wsServer.on("connection", async (connection) => {
        console.log(`Client connected`)

        const userUUID = v4()

        redisClient.set('key', 'value')

        const redisResult = await redisClient.get("key")
        console.log(redisResult)

        connection.on("error", (error: Error) => {
            console.log("Connection Error: " + error.message)
        })

        connection.on("close", () => {
            console.log("Client connection closed");
        })

        connection.on("message", (message: string) => {
            console.log(`Received message: ${message}`)
        })

        // Send message to client
        connection.send("Hello my lord!");
    })

    wsServer.on("error", (error: Error) => {
        console.log("WebSocket server error: " + error.message)
    })

}

export default handleWs
