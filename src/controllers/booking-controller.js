const {StatusCodes}=require('http-status-codes');
const {BookingService}=require('../services');
const { response } = require('express');
const {SuccessResponse,ErrorResponse} = require('../utils/common');


async function createBooking(req,res){
    try {
        console.log('Booking controller');
        const flight=await BookingService.createBooking({
            flightId:req.body.flightId,
            userId:req.body.userId,
            noofSeats:req.body.noofSeats,
        })
        console.log(flight);
        SuccessResponse.data=flight;
        return res
        .status(StatusCodes.CREATED)
        .json(SuccessResponse)
           
    } catch (error) {
        console.log("Error controoller");
        ErrorResponse.error=error;
        return res.status(error.statuscode)
        .json(ErrorResponse);
    }
}

module.exports={
    createBooking,
}