const Follow = require("../models/Follows");
const { ObjectId } = require('mongodb');
const User = require("../models/Users");

const followTypeDefs = `#graphql

type Follow {
    _id: ID!
    following: User!
    follower: User!
    createdAt: String
    updatedAt: String
}

type Mutation {
    followUser(followingId: ID!): Follow
}
`;

const followResolvers = {
    Mutation: {
        followUser: async (parent, args, context, info) => {
            const { followingId } = args;
            const { userId } = context;

            if (!userId) {
                throw new Error('User not authenticated');
            }

            if (userId === followingId) {
                throw new Error('Cannot follow yourself');
            }

            try {
                const follow = await Follow.create({
                    followingId: new ObjectId(followingId),
                    followerId: new ObjectId(userId)
                });

                await User.updateFollowing(userId, followingId);
                await User.updateFollowers(followingId, userId);

                const followingUser = await User.getUserById(followingId);
                const followerUser = await User.getUserById(userId);

                return {
                    _id: follow._id,
                    following: followingUser,
                    follower: followerUser,
                    createdAt: follow.createdAt,
                    updatedAt: follow.updatedAt
                };
            } catch (err) {
                throw new Error(`Failed to follow user: ${err.message}`);
            }
        }
    },
};

module.exports = {
    followTypeDefs,
    followResolvers
}