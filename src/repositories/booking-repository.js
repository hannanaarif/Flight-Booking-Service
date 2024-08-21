const { StatusCodes } = require("http-status-codes")
const {Booking}=require('../models');
const crudRepository = require("./crud-repository");
const {Op} =require('sequelize');
const {Enums}=require('../utils/common');
const {CANCELLED,BOOKED}=Enums.BOOKING_STATUS;

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

       async cancelOldBookings(timestamp){
        console.log("cancel Booking repo",timestamp);
        const response=await Booking.update({status:CANCELLED},{
          where: {
            [Op.and]:[
              {
                createdAt:{
                  [Op.lt]:timestamp
                 }
              },
              {
                status:{
                  [Op.ne]:BOOKED
                }
              },
              {
                status:{
                  [Op.ne]:CANCELLED
                }
              }             
            ]
            
          }
        })
        console.log(response);
        return response
       }
 }

module.exports=BookingRepository;