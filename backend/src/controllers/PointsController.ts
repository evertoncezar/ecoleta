import {Request, Response, NextFunction} from 'express';
import database from '../database/connection';

class PointsController {

    async index(request: Request, response: Response, next: NextFunction){

        const {city, uf, items } = request.query;

        const parsedItems = String(items).split(',').map(item =>  Number(item.trim()));

        const points = await database('points')
        .join('point_items', 'points.id', '=', 'point_items.point_id')
        .whereIn('point_items.item_id', parsedItems)
        .where('city', String(city))
        .where('uf', String(uf))
        .distinct()
        .select('points.*'); 

        if (!points)
        {
            return response.status(400).json({message: 'Points not found'});
        }

        const serializedPoints = points.map(point => {
            return {
               ...point,
                image_url: `http://192.168.68.108:3333/uploads/${point.image}` 
            }
        })


        return response.status(200).json(serializedPoints);
    
}

    async show(request: Request, response: Response, next: NextFunction){
        const { id } = request.params;
        const point = await database('points').where('id', id).first();
        if (!point)
        {
            return response.status(400).json({message: 'Point not found'});
        }
        
        const serializedPoint =  {
                ...point,
                image_url: `http://192.168.68.108:3333/uploads/${point.image}` 
        };

        const items = await database('items')
        .join('point_items', 'items.id', '=', 'point_items.item_id')
        .where('point_items.point_id', id)
        .select('items.title');

        return response.status(200).json({
            ...serializedPoint,
            items
        });

    }

    async create(request: Request, response: Response, next: NextFunction) {
        const {
            name,
            email,
            whatsapp,
            city,
            uf,
            latitude,
            longitude,
            items
        } = request.body;
    
        const point = {
            image: request.file.filename,
            name,
            email,
            whatsapp,
            city,
            uf,
            latitude,
            longitude
        };

        //Criando uma transação
        const transaction = await database.transaction();
    
        const inserteds_points = await transaction('points').insert(point);
    
    
        const point_id = inserteds_points[0];
        const pointItems = items
            .split(',')
            .map( (item:String) => Number(item.trim()))
            .map( (item_id: number) =>{
            return {
                point_id: point_id,
                item_id,
            }
        });
    
        await transaction('point_items').insert(pointItems); 
        await transaction.commit();
        
        return response.json({
            id: point_id,
            ...point});
    
    }
}

export default PointsController;