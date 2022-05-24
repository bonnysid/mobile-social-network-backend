import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';

export const AuthMiddleware = (req: any, res: Response, next: NextFunction) => {
    if (req.method === "OPTIONS") {
        next()
    }
    try {
        const token = req.headers.authorization?.split(' ')[1] // Bearer asfasnfkajsfnjk
        if (!token) {
            return res.status(401).json({message: "Не авторизован"})
        }
        req.user = jwt.verify(token, String(process.env.SECRET_KEY))
        next()
    } catch (e) {
        res.status(401).json({message: "Не авторизован"})
    }
};
