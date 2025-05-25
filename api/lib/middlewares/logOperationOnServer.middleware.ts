import { RequestHandler, Request, Response, NextFunction } from 'express';

const requestLogger: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
    console.log(`[${request.method} ${request.url} ${new Date().toISOString()}]`);
    next();
}

export default requestLogger