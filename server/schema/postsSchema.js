const Post = require('../models/Posts'); 
const User = require('../models/Users');
const { ObjectId } = require('mongodb')
const Redis = require('ioredis')


const postTypeDefs = `#graphql

type Post {
    _id: ID!
    content: String!
    tags: [String]
    imgUrl: String
    author: User
    comments: [Comment]
    likes: [Like]
    createdAt: String
    updatedAt: String
}

type User {
    _id: ID!
    name: String
    username: String
    email: String
    password: String
    followers: [User]
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

type Query {
    getPost(id: ID!): Post
    getPosts: [Post]
}


type Mutation {
    addPost(content: String!, tags: [String], imgUrl: String): Post
    commentPost(postId: ID!, content: String!): Post
    likePost(postId: ID!): Post
}
`
const postResolvers = {
    Query: {
        getPost: async (parent, args, contextValue, info) => {
            try {
                const postId = new ObjectId(args.id)
                const post = await Post.findById(postId);
                return post;
            } catch (err) {
                throw new Error(`Post tidak ditemukan: ${err.message}`);
            }
        },
        getPosts: async () => {
            
            const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD} = process.env
            
            const redis = new Redis({
                port: Number(REDIS_PORT),
                host: REDIS_HOST,
                password: REDIS_PASSWORD,
                db: 0
            })

            const cache = await redis.get("posts")
            
            if (cache) {
                console.log(' ini dari cache')
                return JSON.parse(cache)
                
            }

            try {
                const posts = await Post.findAll()
                
                await redis.set("posts", JSON.stringify(posts))
                return posts
            } catch (err) {
                throw err
            }
        }
    },

    Mutation: {
        addPost: async (parent, args, context, info) => {
            const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;
            const redis = new Redis({
                port: Number(REDIS_PORT),
                host: REDIS_HOST,
                password: REDIS_PASSWORD,
                db: 0
            });

            const { content, tags, imgUrl } = args;
            const { userId } = context;

            if (!userId) {
                throw new Error('User not authenticated');
            }

            try {
                const newPost = await Post.create({
                    content,
                    tags,
                    imgUrl,
                    author: userId
                });

                const author = await User.getUserById(new ObjectId(userId));

                if (!author) {
                    throw new Error('User not found');
                }

                const postWithAuthor = {
                    ...newPost,
                    author 
                };

                await redis.del("posts");
                
                return postWithAuthor;
            } catch (err) {
                throw new Error(`Gagal menambahkan post: ${err.message}`);
            }
        },
        commentPost: async (parent, args, context, info) => {
            const { postId, content } = args;
            const { userId } = context;

            if (!userId) {
                throw new Error('User not authenticated');
            }

            try {
                const user = await User.getUserById(userId);
                if (!user) {
                    throw new Error('User not found');
                }
                
                const post = await Post.addComment(postId, content, user.username);
                return post;
            } catch (err) {
                throw new Error(`Failed to comment on post: ${err.message}`);
            }
        },
        likePost: async (parent, args, context, info) => {
            const { postId } = args;
            const { userId } = context;

            if (!userId) {
                throw new Error('User not authenticated');
            }

            try {
                const user = await User.getUserById(userId);
                if (!user) {
                    throw new Error('User not found');
                }
                
                const post = await Post.addLike(postId, userId, user.username);
                return post;
            } catch (err) {
                throw new Error(`Failed to like post: ${err.message}`);
            }
        },
    },
};

module.exports = {
    postTypeDefs,
    postResolvers
}