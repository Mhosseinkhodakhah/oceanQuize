import express , {Router} from 'express'
import interServiceController from './controller';


const interservice = Router();

const controller = new interServiceController

interservice.put('/put-content-photo/:contentId' , controller.putPhoto)


export default interservice;