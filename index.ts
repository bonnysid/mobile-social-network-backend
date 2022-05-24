require('dotenv').config();
const models = require('./models');
import * as path from 'path';
import express from 'express';
import cors from 'cors';
import sequelize from './db';
import { ErrorHandlingMiddleware, LoggingMiddleware } from './middlewares';
import router from './router';
import * as ws from './controllers/ws';

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(LoggingMiddleware);
app.use('/api', router);

app.use(ErrorHandlingMiddleware);

const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        app.listen(PORT, () => console.log(`Server was started on PORT=${PORT}`));
    } catch (e) {
        console.log(e);
    }
}

start();

