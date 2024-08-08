import { v4 as uuid, v4 } from "uuid"
import WebSocket from "ws";

import { jwtValidate } from "../util/jwtValidate"
import { joinPool, randomMatch } from "../matchFinder";

const wsPort = process.env.WS_PORT || 3003

const wsServer = new WebSocket.Server({ port: wsPort as number }, () => {
    console.log(`ws Server is running on http://localhost:${wsPort}`)
})

const handleWs = () => {
    wsServer.on("connection", async (connection, request) => {
        console.log(`Client connected`)

        if (jwtValidate(request.headers.authorization || "")) {

            connection.on("error", (error: Error) => {
                console.log("Connection Error: " + error.message)
            })

            connection.on("close", () => {
                console.log("Client connection closed");
            })

            connection.on("message", async (message: string) => {
                const { userId } = JSON.parse(message)
                joinPool(userId)

                let findedUser

                findedUser = await randomMatch(userId)

                /*
                await setInterval(async () => {
                    findedUser = randomMatch()
                }, 5000)*/


                console.log(`finded user is ${findedUser}`)
            })



        } else {
            //cannot validate jwt
            console.log("cannot validate jwt for a user")
            connection.send("cannot validate your jwt")
            connection.close()
        }
    })

    wsServer.on("error", (error: Error) => {
        console.log("WebSocket server error: " + error.message)
    })
}

export default handleWs
