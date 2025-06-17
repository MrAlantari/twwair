import Controller from '../interfaces/controller.interface';
import { Request, Response, NextFunction, Router } from 'express';
import { checkIdParam } from '../middlewares/deviceIdParam.middleware';
import { IData } from '../modules/models/data.model';
import DataService from '../modules/services/data.service';
import { auth } from '../middlewares/auth.middleware';
import _config from '../config'
import Joi from 'joi';


class DataController implements Controller {
    public path = '/api/data';
    public router = Router();

    constructor(private dataService: DataService) {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/latest`, this.getLatestReadingsFromAllDevices);
        this.router.get(`${this.path}/hour`, auth, this.getFromLastHour);
        this.router.get(`${this.path}/:id`, checkIdParam, this.getAllDeviceData);
        this.router.get(`${this.path}/:id/latest`, checkIdParam, this.getPeriodData);
        this.router.get(`${this.path}/:id/:num`, checkIdParam, this.getPeriodData);

        this.router.post(`${this.path}/:id`, checkIdParam, this.addData);

        this.router.delete(`${this.path}/all`, this.cleanAllDevices);
        this.router.delete(`${this.path}/:id`, checkIdParam, this.cleanDeviceData);
        this.router.delete(`${this.path}/from-range/:id`, auth, checkIdParam, this.deleteFromRange)
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

        let limit = parseInt(num);

        if (!num) {
            limit = 1;
        }

        const data = await this.dataService.getNewest(id, limit);
        response.status(200).json(data);
    };

    private getFromLastHour = async (request: Request, response: Response, next: NextFunction) => {
        const data = await this.dataService.getFromLastHour();

        if (!data || data.length === 0) {
        return response.status(404).json({
          success: false,
          message: 'No data found from the last hour'
        });
      }

      response.status(200).json(data);
    }

    //POST

    private addData = async (request: Request, response: Response, next: NextFunction) => {
        const { air } = request.body;
        const { id } = request.params;

        const schema = Joi.object({
            air: Joi.array()
                .items(
                    Joi.object({
                        id: Joi.number().integer().positive().required(),
                        value: Joi.number().positive().required()
                    })
                )
                .unique((a, b) => a.id === b.id),
            deviceId: Joi.number().integer().positive().valid(parseInt(id, 10)).required()
        });

        try {
            const validateData = await schema.validateAsync({ air, deviceId: parseInt(id, 10) })

            const data: IData = {
                temperature: air[0].value,
                pressure: air[1].value,
                humidity: air[2].value,
                deviceId: parseInt(id),
                readingDate: new Date()
            }

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
        this.dataService.deleteData(id);
        response.status(200).json(`Data of device ${id} has been deleted`);
    }

    private cleanAllDevices = async (request: Request, response: Response, next: NextFunction) => {
        for (let i = 0; i < _config.supportedDevicesNum; i++) {
            this.dataService.deleteData(i.toString());
            response.status(200).json(`Data of device ${i} has been deleted`);
        }
    }

    private deleteFromRange = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const { startDate, endDate } = request.body;
            const deviceId = request.params['id'];

            if (!startDate || !endDate) {
                return response.status(400).json({message: 'Wymagane parametry: startDate, endDate'});
            }

            const deletedCount = await this.dataService.deleteDataInRange(deviceId, startDate, endDate);

            response.status(200).json({
                message: `Usunięto odczyty dla urządzenia ${deviceId}`,
                deletedCount
            })
        } catch (error) {
            next(error)
        }
    }
}

export default DataController;
