const { StatusCodes } = require("http-status-codes")
const {Booking}=require('../models');
const crudRepository = require("./crud-repository");

class BookingRepository extends crudRepository{
    constructor(){
        super(Booking);
    }
    async createBooking(data,transaction){
        const response=await Booking.create(data,{transaction:transaction});
        return response;
    }
    async get(data,transaction){
        const response=await this.model.findByPk(data,{transaction:transaction});
        if(!response){
         throw new AppError('Not able to find the resource',StatusCodes.NOT_FOUND);
        }
        return response;     
    }
    async update(id,data,transaction){
        console.log("update for Booking repo");
        const response=await this.model.update(data,{
         where: {
             id: id
           }
         },{transaction:transaction});
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

module.exports=BookingRepository;