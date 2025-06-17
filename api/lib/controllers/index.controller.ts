import Controller from '../interfaces/controller.interface';
import { Router } from 'express';
import { Server, Socket } from "socket.io";
import DataService from '../modules/services/data.service';
import config from '../config';
import TokenService from '../modules/services/token.service';

class IndexController implements Controller {
    public path = '/*';
    public router = Router();
    private dataService = new DataService();
    private tokenService = new TokenService();

    constructor(private io: Server) {
        this.initializeRoutes();
        this.initializeSocket();
    }

    private initializeRoutes() { }

    private initializeSocket() {
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token ||
                            socket.handshake.headers['x-auth-token'];
                
                if (!token)
                    return next(new Error('Authentication error: No token provided'));

                const user = await this.tokenService.verifyToken(token);

                socket.data.user = user;
                next()
            } catch (error) {
                console.error('Socket authentication failed:', error);
                next(new Error('Authentication failed'));
            }
        })

        this.io.on("connection", (socket: Socket) => {
            socket.on('requestData', async () => {
                try {
                    if (!socket.data.user) 
                        throw new Error('Unauthorized');
                    
                    const data = await this.getDevicesData();
                    socket.emit('intervalData', data);
                } catch (error) {
                    socket.emit('error', error.message);
                }
            })
        })
    }

    private async getDevicesData() {
        let data = [];

        for (let i = 0; i < config.supportedDevicesNum; i++) {
            const devicesData = await this.dataService.query(i.toString());
            data.push(devicesData);
        }
        return data;
    };
}

export default IndexController;