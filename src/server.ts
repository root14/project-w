import express, { Request, Response, Application } from "express"
import { PrismaClient } from "@prisma/client"
import dotenv from "dotenv"
import authRoute from "./route/auth"
import verifyJWT from "./middleware/jwtVerify"

import { connectRedis } from "./data/redishandler"
import handleWs from "./controller/wscontroller"

dotenv.config()

const app = express()
export const prisma = new PrismaClient()

const port = process.env.PORT || 3001

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})

async function main() {
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    app.use("/api/v1/auth", authRoute)
    //app.use("/api/v1", verifyJWT, )

   connectRedis()
    handleWs()
}

main()
    .then(async () => {
        await prisma.$connect()
    }).catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
