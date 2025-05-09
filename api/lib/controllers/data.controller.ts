import Controller from '../interfaces/controller.interface';
import { Request, Response, NextFunction, Router } from 'express';


class DataController implements Controller {
    public path = '/api/data';
    public router = Router();

    private testArr = [4, 5, 6, 3, 5, 3, 7, 5, 13, 5, 6, 4, 3, 6, 3, 6];

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get( `${ this.path }/get/latest`, this.getLatest );
        this.router.get( `${ this.path }/get/all`, this.getLatestReadingsFromAllDevices );
        this.router.get( `${ this.path }/get/:id`, this.getDataId );
        this.router.get( `${ this.path }/get/:id/:num`, this.getDataIdNum );

        this.router.post( `${ this.path }/push-data/:id`, this.addData );

        this.router.delete( `${ this.path }/delete/all`, this.deleteAll );
        this.router.delete( `${ this.path }/delete/:id`, this.deleteId );
    }

    //GET

    private getLatestReadingsFromAllDevices = async ( request: Request, response: Response ) => {
        response.status( 200 ).json( this.testArr );
    }

    private getDataId = async ( request: Request, response: Response ) => {
        const id: number = parseInt( request.params["id"] )

        response.status( 200 ).json( this.testArr[id] );
    }

    private getDataIdNum = async (request: Request, response: Response) => {
        const id: number = parseInt( request.params["id"] );
        const num: number = parseInt( request.params["num"] );

        response.status( 200 ).json( this.testArr.slice(id, id + num) )
    }

    private getLatest = async (request: Request, response: Response) => {
        const maxEl = Math.max( ...this.testArr ); 

        console.log( maxEl )
        console.log("123");

        response.status( 200 ).json(maxEl);
    }

    //POST

    private addData = async ( request: Request, response: Response ) => {
        const data = request.body;

        this.testArr.push( data );

        response.status( 200 ).json( data );
    }

    //DELETE

    private deleteId = async ( request: Request, response: Response ) => {
        const id: number = parseInt( request.params["id"] );

        this.testArr.splice(id, 1)

        response.status( 200 ).json( `Succesfully deleted element of id: ${ id }.` );
    }

    private deleteAll = async ( request: Request, response: Response ) => {
        this.testArr.length = 0;

        response.status( 200 ).json( "Succesfully deleted all elements." );
    }
}

export default DataController;
