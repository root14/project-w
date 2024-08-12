import { redisClient } from "./data/redisConnector"

async function randomMatch(userId: string) {
    const cardinality = await redisClient.sCard('user-pool')
    await redisClient.expire(`user-pool${userId}`, 3600)
    let poolUser

    if (cardinality < 1) {
        //if no user in pool, add user
        await redisClient.sAdd('user-pool', userId)
    } else {
        //if someone waiting in pool, match
        poolUser = await redisClient.sPop('user-pool')
    }

    return poolUser
}

function locationBasedMatch(userId: string) { }

export {
    locationBasedMatch, randomMatch
}



