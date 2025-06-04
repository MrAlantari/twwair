import Controller from '../interfaces/controller.interface';
import { Request, Response, NextFunction, Router } from 'express';
import { Server, Socket } from "socket.io";
import DataService from '../modules/services/data.service';
import config from '../config';

class IndexController implements Controller {
    public path = '/*';
    public router = Router();
    private dataService = new DataService();

    constructor(private io: Server) {
        this.initializeRoutes();
        this.initializeSocket();
    }

    private initializeRoutes() { }

    private initializeSocket() {
        this.io.on("connection", (socket: Socket) => {
            socket.on('requestData', async () => {
                console.log("działa?")
                const data = this.getDevicesData(socket);
            })
        })
    }

    private getDevicesData = async (socket: Socket) => {
        try {
            let data = [];

            for (let i = 0; i < config.supportedDevicesNum; i++) {
                const devicesData = await this.dataService.query(i.toString());
                data.push(devicesData);
            }
            console.log("emit może działa?");

            socket.emit("intervalData", data);
        } catch (error) {
            console.error("Błąd podczas pobierania danych:", error);
        }
    };
}

export default IndexController;