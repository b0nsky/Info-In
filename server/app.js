require('dotenv').config();
const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require('@apollo/server/standalone');
const { verifyToken } = require('./helpers/jwt');
const { userTypeDefs, userResolvers } = require('./schema/usersSchema');
const { postTypeDefs, postResolvers } = require('./schema/postsSchema');
const { followTypeDefs, followResolvers } = require('./schema/followSchema');
const auth = require('./middlewares/auth');

const server = new ApolloServer({
    typeDefs: [
        userTypeDefs, postTypeDefs, followTypeDefs
    ],
    resolvers: [
        userResolvers, postResolvers, followResolvers
    ],

});

async function run() {
    const { url } = await startStandaloneServer(server, {
        listen: { port: process.env.PORT || 3000 },
        context: async ({ req, res }) => {
            try {
                const user = await auth(req)
                return { userId: user._id } 
            } catch (error) {
                console.error('Authentication error:', error)
                return { userId: null } 
            }
        }
})
    console.log(`🚀 Server ready at: ${url}`);
};

run()