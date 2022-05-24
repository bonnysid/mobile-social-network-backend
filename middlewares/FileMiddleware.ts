import multer from 'multer';
import { Request } from 'express';

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'images/')
    },
    filename(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    },
});

const types = ['image/png', 'image/jpeg', 'image/jpg', 'text/plain'];

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (types.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

export const FileMiddleware = multer({
    storage,
    fileFilter,
});
