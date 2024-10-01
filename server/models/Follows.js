const { database } = require('../config/mongodb')

class Follow {
    static async create({ followingId, followerId }) {
        const followsCollection = database.collection('follows');

        try {
            const newFollow = {
                following: followingId,
                follower: followerId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const result = await followsCollection.insertOne(newFollow);
            return {
                ...newFollow,
                _id: result.insertedId.toString()
            };
        } catch (err) {
            throw new Error(`Failed to create follow record: ${err.message}`);
        }
    }
}

module.exports = Follow;
