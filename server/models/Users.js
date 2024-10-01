const { ObjectId } = require('mongodb');
const { database } = require('../config/mongodb');
const { hashPassword, comparePassword } = require('../helpers/bcrypt');
const { signToken } = require('../helpers/jwt');
const validator = require('validator')

class User {
    
    static async register({ name, username, email, password }) {
        if (!name || !username || !email || !password) {
            throw new Error('Name, username, email, and password are required')
        }
        if (password.length < 5) {
            throw new Error('Password must be at least 5 characters long')
        }
        if (!validator.isEmail(email)) {
            throw new Error('Email format is invalid')
        }
        const usersCollection = database.collection('users');

        const existingUser = await usersCollection.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            throw new Error('Username or email already exists');
        }
        
        const hashedPassword = hashPassword(password);

        const newUser = {
            _id: new ObjectId(),
            name,
            username,
            email,
            password: hashedPassword
        };

        await usersCollection.insertOne(newUser);

        return { ...newUser };
    }

    static async login({ username, password }) {
        const usersCollection = database.collection('users');
        const user = await usersCollection.findOne({ username });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Username / Password Salah');
        }

        const token = signToken({ userId: user._id });
        return {
            userId: user._id,
            token,
        };
    }

    static async searchUsers(keyword) {
        const usersCollection = database.collection('users');
        const regex = new RegExp(keyword, 'i');

        const users = await usersCollection.find({
            $or: [
                { name: { $regex: regex } },
                { username: { $regex: regex } }
            ]
        }).toArray();

        return users;
    }

    static async getUserById(userId) {
        const usersCollection = database.collection('users');
        const followsCollection = database.collection('follows');

        const userObjectId = new ObjectId(userId);

        const user = await usersCollection.findOne({ _id: userObjectId });
        
        if (!user) {
            throw new Error('User not found');
        }

        const followers = await followsCollection.find({ following: userObjectId }).toArray();
        const following = await followsCollection.find({ follower: userObjectId }).toArray();

        const followerIds = followers.map(follow => follow.follower);
        const followingIds = following.map(follow => follow.following);

        const followersDetails = await usersCollection.find({ _id: { $in: followerIds } }).toArray();
        const followingDetails = await usersCollection.find({ _id: { $in: followingIds } }).toArray();

        user.followers = followersDetails;
        user.following = followingDetails;

        return user;
    }


    static async updateFollowing(userId, followingId) {
        const usersCollection = database.collection('users');

        await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $addToSet: { following: new ObjectId(followingId) } }
        );
    }

    static async updateFollowers(userId, followerId) {
        const usersCollection = database.collection('users');

        await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $addToSet: { followers: new ObjectId(followerId) } }
        );
    }

}

module.exports = User;
