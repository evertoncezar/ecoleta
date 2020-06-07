import {Request, Response, NextFunction} from 'express';
import database from '../database/connection';

class ItemsController {
    async index(request:Request, response:Response, next:NextFunction) {

        const items = await database('items').select('*');
    
        const serializedItems = items.map(item => {
            return {
                id: item.id,
                name: item.title,
                image_url: `http://192.168.68.108:3333/uploads/${item.image}` 
            }
        })
    
        return response.json(serializedItems).status(200);
    }
}

export default ItemsController;