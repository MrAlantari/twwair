import DataModel from '../schemas/data.schema';
import { IData, Query } from "../models/data.model";
import config from '../../config'

export default class DataService {

    public async createData( dataParams: IData ) {
        try {
            const dataModel = new DataModel( dataParams );
            await dataModel.save();
        } catch ( error ) {
            console.error( 'Wystąpił błąd podczas tworzenia danych:', error );
            throw new Error( 'Wystąpił błąd podczas tworzenia danych' );
        }
    }

    public async query( deviceID: string ) {
        try {
            const data = await DataModel.find({ deviceId: deviceID }, { __v: 0, _id: 0 });
            return data;
        } catch (error) {
            throw new Error( `Query failed: ${ error }` );
        }
    }

    public async getNewest( deviceID: string, limit: number ) {
        try {
            const data = await DataModel.find({ deviceId: deviceID }, { __v: 0, _id: 0 })
                .limit( limit ).sort({ $natural: -1 });
            return data;
        } catch ( error ) {
            throw new Error( `Query failed: ${ error }` );
        }

    }

    public async getAllNewest() {
        let dataArray = [];
        for ( let i = 0; i < config.supportedDevicesNum; i++ ) {
            try {
                const data = await this.getNewest( i.toString(), 1 );
                dataArray.push( data );
            } catch ( error ) {
                console.error( `Error occured during getting data for device ${ i + 1 }: ${ error.message }` );
                dataArray.push({});
            }

        }
        return dataArray;
    }

    public async deleteData( deviceID: string ) {
        try {
            await DataModel.deleteOne({ deviceId: deviceID });
        } catch ( error ) {
            throw new Error( `Query failed ${ error }` );
        }
    }
}

