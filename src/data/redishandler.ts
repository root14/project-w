import { createClient } from 'redis'

const client = createClient({
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.REDIS_URL,
        port: 19908
    }
})

client.on('error', err => console.log('Redis Client Error', err))

async function connectRedis() {
    try {
        await client.connect()
        console.log("connected to redis")
    } catch (error) {
        console.log(error)
    }
}

export { connectRedis }
