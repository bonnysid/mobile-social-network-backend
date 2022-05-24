import { NextFunction, Request, Response } from 'express';
import ApiError from '../errors/ApiError';
import { createResponse } from '../dto';

export const ErrorHandlingMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ApiError) {
        return res.json(createResponse({ isError: true, errorMessage: err.message }));
    }
    return res.status(500).json({message: "Непредвиденная ошибка!"})
}
