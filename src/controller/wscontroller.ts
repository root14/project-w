import { v4 as uuid, v4 } from "uuid"
import WebSocket from "ws";

import { jwtValidate } from "../util/jwtValidate"
import { exitPool, randomMatch } from "../matchFinder";

const wsPort = process.env.WS_PORT || 3003

const wsServer = new WebSocket.Server({ port: wsPort as number }, () => {
    console.log(`ws Server is running on http://localhost:${wsPort}`)
})

const handleWs = () => {
    wsServer.on("connection", async (connection, request) => {
        const connectionId = crypto.randomUUID()
        console.log(`Client connected`)


        /*if (!jwtValidate(request.headers.authorization || "")) {
            //cannot validate jwt
            console.log("cannot validate jwt for a user")
            connection.send("cannot validate your jwt")
            connection.close()
            return
        }*/

        connection.on("error", (error: Error) => {
            console.log("Connection Error: " + error.message)
        })

        connection.on("close", () => {
            console.log("Client connection closed");
            exitPool(connectionId)
        })

        connection.on("message", async (message: string) => {
            const { eventType } = JSON.parse(message)

            switch (eventType) {
                case "findMeAMatch":
                    let findedUserId = await randomMatch(connectionId)

                    if (!findedUserId) {

                        connection.send(JSON.stringify("match not found"))
                    } else {

                        connection.send(JSON.stringify({
                            result: "match found.",
                            userId: findedUserId
                        }))
                    }
                    break;

                case "exitRoom":
                    exitPool(connectionId)
                    break;

                default:
                    console.log("default")
                    break;
            }


            /**  await setInterval(async () => {
                  randomMatch(userId).then((result) => {
                      console.log(`result is ${result}`)
                      if (result instanceof String) {
                          findedUser = result
                      }
 
                  })
              }, 5000) */


            //console.log(`finded user is ${findedUser}`)
        })
    })

    wsServer.on("error", (error: Error) => {
        console.log("WebSocket server error: " + error.message)
    })
}

export default handleWs
