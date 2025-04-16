import App from './app';
import IndexController from "./controllers/index.controller";
import DataController from './controllers/data.controller';
import SensorController from './controllers/sensor.controller';

const app: App = new App([]);
const io = app.getIo();

const controllers = [
   new DataController(),
   new SensorController(io),
   new IndexController(io)
];

controllers.forEach((controller) => {
   app.app.use("/", controller.router);
});

   
app.listen();