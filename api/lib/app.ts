import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

import config from './config';
import Controller from "./interfaces/controller.interface";

class App {
    public app: express.Application;
 
    constructor(controllers: Controller[]) {
        this.app = express();

        this.initializeMiddlewares();
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
 