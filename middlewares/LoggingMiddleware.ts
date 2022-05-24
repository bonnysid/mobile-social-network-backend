import { NextFunction, Request, Response } from 'express';

export const LoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log('Method:', req.method);
    console.log('Url:', req.url);
    console.log('Data:', req.body);
    next();
}
