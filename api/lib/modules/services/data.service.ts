import DataModel from '../schemas/data.schema';
import { IData } from 'modules/models/data.model';

export default class DataService {


   public async getAll() {
       try {
           const data = await DataModel.find();
           return data;
       } catch (error) {
           throw new Error(`Query failed: ${error}`);
       }
   }

   public async deleteById(id: string): Promise<boolean> {
        try {
            const result = await DataModel.deleteOne({"_id": id});
            return result.deletedCount > 0;
        } catch (error) {
            throw new Error(`Query failed: ${error}`);
        }
   }

   public async addNew(data: IData) {
        try {
            const newData = new DataModel(data);
            const savedData = await newData.save();
            return savedData;
        } catch (error) {
            throw new Error(`Query failed: ${error}`);
        }
    }
}
