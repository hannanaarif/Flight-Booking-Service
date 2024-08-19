const { where } = require('sequelize');
const {Logger}=require('../config');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');

class crudRepository{
    constructor(model){
        this.model=model;
    }
    async create(data){
           const response=await this.model.create(data);
           return response;
    }
    async destroy(data){
           const response=await this.model.destroy({
            where:{
                id:data
            }
           });
           if(!response){
            throw new AppError('Not able to find the resource',StatusCodes.NOT_FOUND);
           }
           return response;     
    }
    async get(data){
           console.log("Logs from CRuD");
           const response=await this.model.findByPk(data);
           if(!response){
            throw new AppError('Not able to find the resource',StatusCodes.NOT_FOUND);
           }
           return response;     
    }
    async getAll(data){
           const response=await this.model.findAll();
           return response;  
    }

    async update(id,data){
           const response=await this.model.update(data,{
            where: {
                id: id
              }
            });
    
            if (response[0] === 0) {
              const ErrorResponse = {
                message: 'Failed to update the data',
                error: new AppError(['Failed to update the data'], StatusCodes.INTERNAL_SERVER_ERROR)
              };
              throw ErrorResponse;
            }
            return response[0];
          }
    
    }


module.exports=crudRepository;