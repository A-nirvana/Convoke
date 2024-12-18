import { Request, Response, NextFunction } from "express"
import jwt from 'jsonwebtoken';
import { User } from "../models";

export const protectRoute = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            res.status(401).json({ message: "You are not authorized - No token provided" });
            return;
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);

        if (!decoded || typeof(decoded) === 'string' || !decoded.id) {
            res.status(401).json({ message: "You are not authorized" });
            return;
        }
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        req.user = user;

        next();
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}