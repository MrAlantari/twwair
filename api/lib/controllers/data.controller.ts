import Controller from '../interfaces/controller.interface';
import { Request, Response, NextFunction, Router } from 'express';
import { checkIdParam } from '../middlewares/deviceIdParam.middleware';
import { IData } from '../modules/models/data.model';
import DataService from '../modules/services/data.service';
import { config } from 'process';
import _config from '../config'


class DataController implements Controller {
    public path = '/api/data';
    public router = Router();
    private dataService = new DataService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/latest`, this.getLatestReadingsFromAllDevices);
        this.router.get(`${this.path}/:id`, checkIdParam, this.getAllDeviceData);
        this.router.get(`${this.path}/:id/latest`, checkIdParam, this.getPeriodData);
        this.router.get(`${this.path}/:id/:num`, checkIdParam, this.getPeriodData);

        this.router.post(`${this.path}/:id`, checkIdParam, this.addData);

        this.router.delete(`${this.path}/all`, this.cleanAllDevices);
        this.router.delete(`${this.path}/:id`, checkIdParam, this.cleanDeviceData);
    }

    //GET

    private getLatestReadingsFromAllDevices = async (request: Request, response: Response, next: NextFunction) => {
        const allNewestData = await this.dataService.getAllNewest();
        response.status(200).json(allNewestData);
    };

    private getAllDeviceData = async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;
        const allData = await this.dataService.query(id);
        response.status(200).json(allData);
    };

    private getPeriodData = async (request: Request, response: Response, next: NextFunction) => {
        const { id, num } = request.params;

        let limit = parseInt( num );

        if ( !num ) {
            limit = 1;
        }

        const data = await this.dataService.getNewest(id, limit);
        response.status(200).json(data);
    };

    //POST

    private addData = async (request: Request, response: Response, next: NextFunction) => {
        const { air } = request.body;
        const { id } = request.params;

        console.log(air[0])

        const data: IData = {
            temperature: air[0].temperature,
            pressure: air[1].pressure,
            humidity: air[2].humidity,
            deviceId: parseInt(id),
            readingDate: new Date()
        }

        console.log(data)

        try {

            await this.dataService.createData(data);
            response.status(200).json(data);
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response.status(400).json({ error: 'Invalid input data.' });
        }
    };

    //DELETE

    private cleanDeviceData = async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;
        this.dataService.deleteData( id );
        response.status( 200 ).json( `Data of device ${ id } has been deleted` );
    }

    private cleanAllDevices = async (request: Request, response: Response, next: NextFunction) => {
        for (let i = 0; i < _config.supportedDevicesNum; i++){
            this.dataService.deleteData( i.toString() );
            response.status( 200 ).json( `Data of device ${ i } has been deleted` );
        }
    }
}

export default DataController;
