import { v4 as uuid, v4 } from "uuid"
import WebSocket from "ws";
import { redisClient } from "../data/redisConnector"
import { jwtValidate } from "../util/jwtValidate"

const wsPort = process.env.WS_PORT || 3003

const wsServer = new WebSocket.Server({ port: wsPort as number }, () => {
    console.log(`ws Server is running on http://localhost:${wsPort}`)
})

const handleWs = () => {
    wsServer.on("connection", async (connection, request) => {
        console.log(`Client connected`)

        const token = request.headers.authorization
        if (jwtValidate(token || "")) {



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
        } else {
            //cannot validate jwt
        }
    })

    wsServer.on("error", (error: Error) => {
        console.log("WebSocket server error: " + error.message)
    })
}

export default handleWs
