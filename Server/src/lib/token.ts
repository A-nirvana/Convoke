import jwt from 'jsonwebtoken';
import { Response } from 'express';

export const generateToken = (id: any, res:Response) => {
    const token =  jwt.sign({ id }, process.env.JWT_SECRET!, {
        expiresIn: '30d',
    });

    res.cookie('jwt', token, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: true,
        secure: process.env.NODE_ENV === 'production' ? true : false,
    });
    return;
}