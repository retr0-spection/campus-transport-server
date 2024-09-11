import jwt from 'jsonwebtoken';
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

export const jwtDecode =  async (token) => {
    // invalid token - synchronous
    try {
        let decoded = jwt.verify(token, process.env.SECRETKEY);
        const user = await User.findOne({_id: decoded.id});
        return user
    } catch(err) {
        console.log(err.message)
        return null
    }
}