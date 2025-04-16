import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";

import config from './config';
import Controller from "./interfaces/controller.interface";


class App {
    public app: express.Application;
    private server: http.Server;
    public io: Server;
    private intervalId: NodeJS.Timeout;

    private testingData = {
      temperature: 22.5,
      humidity: 55,
      pressure: 1005
    };
 
    constructor(controllers: Controller[]) {
        this.app = express();
        this.server = http.createServer(this.app);

        this.initializeMiddlewares();
        this.initializeSocket();
        this.initializeControllers(controllers);
        this.connectToDatabase();
    }
 
    private initializeControllers(controllers: Controller[]): void {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router);
        });
    }
 
    public listen(): void {
        this.app.listen(config.port, () => {
            console.log(`App listening on the port ${config.port}`);
        });
    }
 
    private initializeMiddlewares(): void {
        this.app.use(bodyParser.json());
    }

    private initializeSocket(): void {
      this.io = new Server(this.server, {
          cors: {
              origin: "http://localhost:5173",
              methods: ["GET", "POST"],
              allowedHeaders: ["Authorization"],
              credentials: true
          },
      });
   
   
      this.io.on("connection", (socket: Socket) => {
          console.log(`Nowe połączenie: ${socket.id}`);
   
   
          socket.on("message", (data: string) => {
              console.log(`Wiadomość od ${socket.id}: ${data}`);
              this.io.emit("message", data);
          });

          this.intervalId = setInterval(() => {

            this.testingData = {
              temperature: this.testingData.temperature + (Math.random() * 2 - 1),
              humidity: this.testingData.humidity + (Math.random() * 2 - 1),
              pressure: this.testingData.pressure + (Math.random() * 2 - 1)
            };

            //this.io.emit('sensor-testing-data', this.testingData);
            //console.log(this.testingData);
          
          } ,10000)
   
          socket.on("disconnect", () => {
              console.log(`Rozłączono: ${socket.id}`);
              clearInterval(this.intervalId);
          });
      });
   
   
      this.server.listen(config.socketPort, () => {
          console.log(`WebSocket listening on port ${config.socketPort}`);
        });
      }
      
      
      public getIo(): Server {
         return this.io;
      }
      

    private async connectToDatabase(): Promise<void> {
        mongoose.set('debug', true);
        console.log('Połączono z bazą: ', mongoose.connection.name);
        try {
            // Próba nawiązania połączenia z bazą danych MongoDB
            await mongoose.connect(config.databaseUrl);
            console.log('Connection with database established');
          } catch (error) {
            // Obsługa błędu w przypadku nieudanego połączenia
            console.error('Error connecting to MongoDB:', error);
          }
         
          // Obsługa błędów połączenia po jego ustanowieniu
          mongoose.connection.on('error', (error) => {
            console.error('MongoDB connection error:', error);
          });
         
          // Obsługa zdarzenia rozłączenia z bazą danych
          mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
          });
         
          // Nasłuchiwanie sygnału zamknięcia aplikacji (np. `Ctrl + C` lub `SIGINT` w systemach UNIX)
          process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
          });
         
          process.on('SIGTERM', async () => {
            // Zamknięcie połączenia z bazą danych przed zakończeniem procesu
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });
    }
}
export default App;
 