import Controller from '../interfaces/controller.interface';
import { Request, Response, NextFunction, Router } from 'express';
import DataService from '../modules/services/data.service';
import { IData } from '../modules/models/data.model';


class DataController implements Controller {
   public path = '/api/data';
   public router = Router();
   private dataService = new DataService();


   constructor() {
       this.initializeRoutes();
   }


   private initializeRoutes() {
        this.router.get(`${this.path}/get`, this.getAll);
        this.router.delete(`${this.path}/delete/:id`, this.deleteById);
        this.router.post(`${this.path}/add`, this.addNew);
   }

   private getAll = async (request: Request, response: Response) => {
        let data = await this.dataService.getAll();
        console.log(data);
        response.send(data);
   }

   private deleteById = async (request: Request, response: Response) => {
        const id = request.params["id"];

        if (!id) {
            return response.status(400).json({ message: "Item is required" });
        }

        try {
            const wasDeleted = await this.dataService.deleteById(id);

            if (!wasDeleted) {
                return response.status(404).json({ message: "Item not found" });
            }
            
            return response.status(204).send();
        } catch (error) {
            return response.status(500).json({ message: "Server error", error });
        }
   }

   private addNew = async (request: Request, response: Response) => {
     try {
        const newData: IData = request.body;
        
        if (!newData.temperature || !newData.pressure || !newData.humidity || !newData.deviceId) {
            return response.status(400).json({ message: "Missing required fields" });
        }

        const createdData = await this.dataService.addNew(newData);
        response.status(201).json(createdData);
     } catch(error) {
        response.status(500).json({ message: error.message });
     }
   }
}


export default DataController;