const { ObjectId } = require('mongodb'); 
const User = require('../models/Users');

const userTypeDefs = `#graphql
type User {
    _id: ID!
    name: String
    username: String
    email: String
    password: String

    followers: [User]
    following: [User]
}

type Comment {
    content: String!
    username: String!
    createdAt: String
    updatedAt: String
}

type Like {
    username: String!
    createdAt: String
    updatedAt: String
}

type Follow {
    _id: ID!
    following: User!
    follower: User!
    createdAt: String
    updatedAt: String
}

type LoginResponse {
    userId: ID!
    token: String!
}

type Query {
    searchUsers(keyword: String!): [User]
    getUser(id: ID!): User
}

type Mutation {
    register(name: String!, username: String!, email: String!, password: String!): User
    login(username: String!, password: String!): LoginResponse!
    followUser(followingId: ID!): Follow
}
`

const userResolvers = {
    Query: {
        searchUsers: async (parent, args, contextValue, info) => {
            const keyword = args.keyword;
            return await User.searchUsers(keyword);
        },
        getUser: async (parent, args, contextValue, info) => {
            try {
                const objectId = new ObjectId(args.id);
                const user = await User.getUserById(objectId);
                return user;
            } catch (err) {
                throw new Error(`User tidak ditemukan: ${err.message}`);
            }
        }
    },

    Mutation: {
        register: async (parent, args, contextValue, info) => {
            const { name, username, email, password } = args;
            const newUser = await User.register({ name, username, email, password });
            return newUser;
        },
        login: async (parent, args, contextValue, info) => {
            const { username, password } = args;
            const { userId, token } = await User.login({ username, password });
            return {
                userId,
                token,
            };
        },
    },
};

module.exports = {
    userTypeDefs,
    userResolvers
}
