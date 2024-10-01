// require('dotenv').config();
// const { MongoClient, ObjectId } = require('mongodb');
// const { hashPassword } = require('../helpers/bcrypt');

// const uri = process.env.MONGO_DB;
// const client = new MongoClient(uri);

// const seedDatabase = async () => {
//     try {
//         await client.connect();
//         const database = client.db('Info-In');

//         const usersCollection = database.collection('users');
//         const postsCollection = database.collection('posts');
//         const followsCollection = database.collection('follows');

//         const user1 = {
//             _id: new ObjectId(),
//             name: 'John Doe',
//             username: 'johndoe',
//             email: 'john@example.com',
//             password: hashPassword('johndoe'),
//             followers: [],
//             following: []
//         };

//         const user2 = {
//             _id: new ObjectId(),
//             name: 'Jane Smith',
//             username: 'janesmith',
//             email: 'jane@example.com',
//             password: hashPassword('janesmith'),
//             followers: [],
//             following: []
//         };

//         const user3 = {
//             _id: new ObjectId(),
//             name: 'Alice Johnson',
//             username: 'alicejohnson',
//             email: 'alice@example.com',
//             password: hashPassword('alicejohnson'),
//             followers: [],
//             following: []
//         };

//         const users = [user1, user2, user3];
//         await usersCollection.insertMany(users);

//         await usersCollection.updateMany({ _id: user1._id }, { $set: { following: [user2._id, user3._id] } });
//         await usersCollection.updateMany({ _id: user2._id }, { $set: { following: [user1._id, user3._id] } });
//         await usersCollection.updateMany({ _id: user3._id }, { $set: { following: [user1._id, user2._id] } });

//         await usersCollection.updateMany({ _id: user2._id }, { $set: { followers: [user1._id] } });
//         await usersCollection.updateMany({ _id: user3._id }, { $set: { followers: [user1._id, user2._id] } });

//         const follows = [
//             { _id: new ObjectId(), following: user2._id, follower: user1._id, createdAt: new Date(), updatedAt: new Date() },
//             { _id: new ObjectId(), following: user3._id, follower: user1._id, createdAt: new Date(), updatedAt: new Date() },
//             { _id: new ObjectId(), following: user1._id, follower: user2._id, createdAt: new Date(), updatedAt: new Date() },
//             { _id: new ObjectId(), following: user3._id, follower: user2._id, createdAt: new Date(), updatedAt: new Date() },
//             { _id: new ObjectId(), following: user1._id, follower: user3._id, createdAt: new Date(), updatedAt: new Date() },
//             { _id: new ObjectId(), following: user2._id, follower: user3._id, createdAt: new Date(), updatedAt: new Date() }
//         ];

//         await followsCollection.insertMany(follows);

//         const post1 = {
//             _id: new ObjectId(),
//             content: 'This is my first post!',
//             tags: ['intro', 'welcome'],
//             imgUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqxQqzvtNVt_eoCurrrrGnPKSqi1qEkj8R1w&s",
//             author: user1._id,
//             comments: [
//                 { _id: new ObjectId(), content: 'Nice post!', username: user2.username, createdAt: new Date(), updatedAt: new Date() },
//                 { _id: new ObjectId(), content: 'Welcome to the platform!', username: user3.username, createdAt: new Date(), updatedAt: new Date() }
//             ],
//             likes: [
//                 { _id: new ObjectId(), username: user2.username, createdAt: new Date() },
//                 { _id: new ObjectId(), username: user3.username, createdAt: new Date() }
//             ],
//             createdAt: new Date(),
//             updatedAt: new Date()
//         };

//         const post2 = {
//             _id: new ObjectId(),
//             content: 'Loving the new features!',
//             tags: ['features', 'tech'],
//             imgUrl: 'https://seraphic.io/wp-content/uploads/2024/07/Top-5-New-Node.js-Features-Developers-Will-Love.png',
//             author: user2._id,
//             comments: [
//                 { _id: new ObjectId(), content: 'Looks amazing!', username: user1.username, createdAt: new Date(), updatedAt: new Date() },
//                 { _id: new ObjectId(), content: 'Can’t wait to try this out!', username: user3.username, createdAt: new Date(), updatedAt: new Date() }
//             ],
//             likes: [
//                 { _id: new ObjectId(), username: user1.username, createdAt: new Date() },
//                 { _id: new ObjectId(), username: user3.username, createdAt: new Date() }
//             ],
//             createdAt: new Date(),
//             updatedAt: new Date()
//         };

//         const post3 = {
//             _id: new ObjectId(),
//             content: 'Hammersonic!',
//             tags: ['Metal', 'Band'],
//             imgUrl: "https://blue.kumparan.com/image/upload/fl_progressive,fl_lossy,c_fill,q_auto:best,w_640/v1583380040/q0nircgb7fayljpzmnzf.png",
//             author: user3._id,
//             comments: [
//                 { _id: new ObjectId(), content: 'Great Concert!', username: user1.username, createdAt: new Date(), updatedAt: new Date() },
//                 { _id: new ObjectId(), content: 'Very insightful!', username: user2.username, createdAt: new Date(), updatedAt: new Date() }
//             ],
//             likes: [
//                 { _id: new ObjectId(), username: user1.username, createdAt: new Date() },
//                 { _id: new ObjectId(), username: user2.username, createdAt: new Date() }
//             ],
//             createdAt: new Date(),
//             updatedAt: new Date()
//         };

//         const posts = [post1, post2, post3];
//         await postsCollection.insertMany(posts);

//         console.log('Seeding complete!');
//     } finally {
//         await client.close();
//     }
// };

// seedDatabase().catch(console.dir);



require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_DB

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
    });

    const database = client.db('Info-In')

module.exports = { database }