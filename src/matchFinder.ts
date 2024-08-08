import { redisClient } from "./data/redisConnector"

async function joinPool(userId: string) {
    //insert user to pool
    await redisClient.sAdd('user-pool', userId)
    //expire unMathced user
    await redisClient.expire(`user-pool${userId}`, 3600)

}

async function randomMatch(userId: string) {
    try {
        //limited as a precaution. OutOfMemoryException.


        const cardinality = await redisClient.sCard('user-pool')

        if (cardinality > 2) {

            const poolUserList = await redisClient.sPop('user-pool')
            if (poolUserList.at(0) === userId) {
                await redisClient.sAdd('user-pool', userId)
                return "kendine denk geldin"
            } else {
                return poolUserList
            }
        } else {
            return "not enough peope in pool"
        }

    } catch (err) {
        console.log(err)
        return `match finder err ${err}`
    }
}


function locationBased(userId: string) {



}

export {
    randomMatch, locationBased, joinPool
}



