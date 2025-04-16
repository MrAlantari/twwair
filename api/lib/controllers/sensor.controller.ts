import Controller from '../interfaces/controller.interface';
import {Request, Response, NextFunction, Router} from 'express';
import path from 'path';

import { Server, Socket } from "socket.io";

class SensorController implements Controller {
    public path = '/api/sensor';
    public router = Router();
    private io: Server;

    constructor(io: Server) {
        this.initializeRoutes();
        this.io = io;
    }

    private initializeRoutes() {
        this.router.post(this.path + "/data/post", this.postSensorData);
    }

    private postSensorData = async (request: Request, response: Response) => {
        const { temperature, humidity, pressure } = request.body;

        if (temperature === undefined || humidity === undefined || pressure === undefined) {
            return response.status(400).json({ error: 'Missing sensor data fields' });
        }

        const sensorData = {
            temperature: parseFloat(temperature),
            humidity: parseFloat(humidity),
            pressure: parseFloat(pressure),
            timestamp: new Date().toISOString()
        };

        this.io.emit('sensor-data', sensorData);

        response.status(200).json({
            status: 'success',
            message: 'Data broadcasted to clients',
            data: sensorData
        });
    }
}

export default SensorController;