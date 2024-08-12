import { createClient } from 'redis'

const redisClient = createClient({
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.REDIS_URL,
        port: 19908
    }
})

redisClient.on('error', err => console.log('Redis Client Error', err))

async function connectRedis() {
    try {
        await redisClient.connect()
        console.log("connected to redis")
    } catch (error) {
        console.log(error)
    }
}

export { connectRedis, redisClient }
