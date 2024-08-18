const { StatusCodes } = require("http-status-codes")
const {Booking}=require('../models');
const crudRepository = require("./crud-repository");

class BookingRepository extends crudRepository{
    constructor(){
        super(Booking);
    }
    async createBooking(data,transaction){
        cosnole.log("Booking Repo");
        const response=await Booking.create(data,{transaction:transaction});
        return response;
    }

}

module.exports=BookingRepository;