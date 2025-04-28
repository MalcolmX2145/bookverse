import express from 'express';
import User from '../models/User.js';


const protectRoute = async (req, res, next) => {
    try {
        // get token
        const token = req.header('Authorization').replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No authorized token provided, access denied' });
        }
        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 

        // find user by id
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'Token is invalid' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("Authentication Error", error);
        res.status(401).json({ message: 'Token is invalid, access denied' });
    }
}

export default protectRoute;