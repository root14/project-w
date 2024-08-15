import express, { Request, Response, Application } from "express"
import { PrismaClient } from "@prisma/client"
import dotenv from "dotenv"
import authRoute from "./route/auth"
import verifyJWT from "./middleware/jwtVerify"
import * as http from "http"

import path from "path"
import { Server } from "socket.io"
import handleSocketConnections from './controller/socketController';

dotenv.config()

const app = express()
const server = app.listen(3001)

export const prisma = new PrismaClient()
export const io = new Server(server)

const port = process.env.PORT || 3001

/*
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})*/

async function main() {
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    app.use("/api/v1/auth", authRoute)
    //app.use("/api/v1", verifyJWT, )

    app.use(express.static(path.join(__dirname, 'public')))

    app.get('/hey', (req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'))
    })

    handleSocketConnections()

}

main()
    .then(async () => {
        await prisma.$connect()
    }).catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
