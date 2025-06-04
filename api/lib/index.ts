import App from './app';
import IndexController from "./controllers/index.controller";
import DataController from './controllers/data.controller';
import UserController from './controllers/user.controller';
import {Server} from "socket.io";
import DataService from './modules/services/data.service';

const app: App = new App([]);
const io = app.getIo();

const controllers = createControllers(io)

controllers.forEach((controller) => {
    app.app.use("/", controller.router)
})

app.listen();



function createControllers(io: Server) {
    const dataService = new DataService();

    return [
        new UserController(),
        new DataController(dataService),
        new IndexController(io)
    ];
}