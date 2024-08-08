import { redisClient } from "./data/redisConnector"

async function joinPool(userId: string) {
    //insert user to pool
    await redisClient.lPush('user-pool', userId)
    //expire unMathced user
    await redisClient.expire(`user-pool${userId}`, 3600)

}

async function randomMatch(userId: string) {
    try {
        //limited as a precaution. OutOfMemoryException.
        const poolUserList = await redisClient.lRange('user-pool', 0, 15)

        const randomIndex = Math.floor(Math.random() * poolUserList.length)

        if (poolUserList[randomIndex] === userId || poolUserList.length < 2) {
            return "cannot find any match"
        } else {
            await redisClient.lRem('user-pool', 1, poolUserList[randomIndex])
            return poolUserList[randomIndex]
        }

    } catch (err) {
        console.log(err)
        return "cannot find any match"
    }
}


function locationBased(userId: string) {



}

export {
    randomMatch, locationBased, joinPool
}



