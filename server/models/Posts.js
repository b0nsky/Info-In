const { database } = require("../config/mongodb");
const { ObjectId } = require('mongodb')

class Post {
    static async findAll() {
        const postsCollection = database.collection("posts")
        const options = {
            sort: { title: 1 },
            projection: { }
        }

        try {
            // const posts = await postsCollection.find({}, options).toArray()

            const posts = await postsCollection.aggregate([
                {
                    $lookup: {
                        from: "users", 
                        localField: "author", 
                        foreignField: "_id", 
                        as: "author" 
                    }
                },
                { $unwind: "$author" } 
                
            ]).toArray();
            return posts
        } catch (err) {
            throw new Error(`Post tidak ditemukan: ${err.message}`)
        }
    }

    static async findById(id) {
        const postsCollection = database.collection("posts");

        try {
            const post = await postsCollection.aggregate([
                { $match: { _id: id } }, 
                {
                    $lookup: {
                        from: "users", 
                        localField: "author", 
                        foreignField: "_id", 
                        as: "author" 
                    }
                },
                { $unwind: "$author" } 
            ]).toArray();

            if (post.length === 0) {
                throw new Error('Post tidak ditemukan');
            }

            return post[0]; 
        } catch (err) {
            throw new Error(`Post tidak ditemukan: ${err.message}`);
        }
    }

    static async create({ content, tags, imgUrl, author }) {
        const postsCollection = database.collection("posts");

        try {
            const newPost = {
                content,
                tags,
                imgUrl,
                author,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const result = await postsCollection.insertOne(newPost);
            return { ...newPost, _id: result.insertedId.toString() };
        } catch (err) {
            throw new Error(`Gagal menambahkan post: ${err.message}`);
        }
    }

    static async addComment(postId, content, username) {
    const postsCollection = database.collection('posts');

    try {
        const commentId = new ObjectId();

        const updateResult = await postsCollection.updateOne(
            { _id: new ObjectId(postId) },
            {
                $push: {
                    comments: {
                        _id: commentId,
                        content,
                        username,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                },
                $set: { updatedAt: new Date().toISOString() }
            }
        );

        if (updateResult.modifiedCount === 0) {
            throw new Error('Post not found or comment not added');
        }

        const updatedPost = await postsCollection.aggregate([
            { $match: { _id: new ObjectId(postId) } },
            {
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "author"
                }
            },
            { $unwind: "$author" }
        ]).toArray();

        const newComment = {
            _id: commentId,
            content,
            username,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        updatedPost[0].comments.push(newComment);

        return updatedPost[0];
    } catch (err) {
        throw new Error(`Failed to add comment: ${err.message}`);
    }
}



    static async addLike(postId, userId, username) {
        const postsCollection = database.collection('posts');

        try {
            const updateResult = await postsCollection.updateOne(
                { _id: new ObjectId(postId) },
                {
                    $push: {
                        likes: {
                            _id: new ObjectId(userId),  // Menambahkan userId
                            username,
                            createdAt: new Date().toISOString(),  // Menyimpan waktu like
                        }
                    },
                    $set: { updatedAt: new Date().toISOString() }  // Tetap memperbarui updatedAt post-nya
                }
            );

            if (updateResult.modifiedCount === 0) {
                throw new Error('Post not found or like not added');
            }

            return await postsCollection.findOne({ _id: new ObjectId(postId) });
        } catch (err) {
            throw new Error(`Failed to add like: ${err.message}`);
        }
    }
}

module.exports = Post