const {StatusCodes}=require('http-status-codes');
const {BookingService}=require('../services');
const {SuccessResponse,ErrorResponse} = require('../utils/common');
const booking = require('../models/booking');
const { message } = require('../utils/common/success-response');
const inMemDb={};


async function createBooking(req,res){
    try {
        console.log('Booking controller');
        const flight=await BookingService.createBooking({
            flightId:req.body.flightId,
            userId:req.body.userId,
            noofSeats:req.body.noofSeats,
        })
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

async function makePayment(req,res){
    try {

        const idempotencyKey=req.headers['x-idempotency-key'];
        if(!idempotencyKey ){
            return res.status(StatusCodes.BAD_REQUEST)
                      .json({message:'idempotency key missing'});
        }
        if(inMemDb[idempotencyKey]){
            return res.status(StatusCodes.BAD_REQUEST)
                      .json({message:'cannot retry on successful payments'});
        }
        inMemDb[idempotencyKey]=idempotencyKey;
        const flight=await BookingService.makePayment({
           totalCost:req.body.totalCost,
           userId:req.body.userId,
           bookingId:req.body.bookingId
        })
        inMemDb[idempotencyKey]=idempotencyKey;
        SuccessResponse.data=flight;
        return res
        .status(StatusCodes.CREATED)
        .json(SuccessResponse)
           
    } catch (error) {
        console.log("Error from controller",error);
        console.log("error status code",error.StatusCodes);
        ErrorResponse.error=error;
        return res.status(error.statuscode)
        .json(ErrorResponse);
    }
}

module.exports={
    createBooking,
    makePayment
}