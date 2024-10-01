const { ObjectId } = require("mongodb");
const User = require("../models/Users");
const { verifyToken } = require("../helpers/jwt");
require("dotenv").config();

async function auth(req) {
    const authorization = req.headers.authorization || "";

    if (!authorization) throw new Error("Invalid Token");

    const [type, token] = authorization.split(" ");
    if (type !== "Bearer") throw new Error("Invalid Token");

    const payload = verifyToken(token, process.env.JWT_SECRET);
    
    let userId;
    try {
        userId = new ObjectId(payload.userId);
    } catch (err) {
        throw new Error("Invalid User ID format");
    }

    const user = await User.getUserById(userId);

    if (!user) throw new Error("User not found");

    return user;
}




module.exports = auth;