const axios=require('axios');
const {BookingRepository}=require('../repositories');
const {ServerConfig}=require('../config');
const db=require('../models');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');
const {Enums}=require('../utils/common');
const {BOOKED,CANCELLED}=Enums.BOOKING_STATUS;

const bookingRepository= new BookingRepository();

async function createBooking(data){
      console.log("DATA",data);
      const transaction=await db.sequelize.transaction();
      try {
          const flight=await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
          console.log("flight DATA",flight.data);
          const flightdata=flight.data.data;
          if(data.noofSeats>flightdata.totalSeats){
            throw new AppError('Not Enough seats available',StatusCodes.BAD_REQUEST);
          }
          const totalBillingAmount=data.noofSeats*flightdata.price;
          console.log("totalBillingAmount",totalBillingAmount);
          const bookingPayload={...data,totalCost:totalBillingAmount};

          console.log('Going for booking',bookingPayload);
          const booking=await bookingRepository.create(bookingPayload,transaction);
          console.log('Going for patch');
          await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`,{
            seats:data.noofSeats
          });
          await transaction.commit();
          return booking;

      } catch(error){
        await transaction.rollback();
        throw error;
      }
      
}

async function makePayment(data){
  console.log("makePayment service",data);
  const transaction=await db.sequelize.transaction();
  try { 
    console.log("Booking id from makepayments",data.bookingId);
    const bookingDetails=await bookingRepository.get(data.bookingId,transaction);
    if(bookingDetails.status==CANCELLED){
      throw new AppError('The booking has expired',StatusCodes.BAD_REQUEST);
    }
    const bookingTime=new Date(bookingDetails.createdAt);
    const currentTime=new Date();

    if(currentTime-bookingTime>300000){
      console.log("To=imeout function",data.bookingId, typeof data.bookingId);
      await cancelBooking(data.bookingId);
      throw new AppError('The Booking Session has Expired',StatusCodes.BAD_REQUEST)
    }

    if(bookingDetails.totalCost!=data.totalCost){
      throw new AppError('The amount of payment doesnt match',StatusCodes.BAD_REQUEST);
    }

    if(bookingDetails.userId!=data.userId){
      throw new AppError('The user corresponding to the booking doesnt match',StatusCodes.BAD_REQUEST);
    }

    //we assume here payment is successfull    
    const response=await bookingRepository.update(data.bookingId,{status:BOOKED},transaction);

    await transaction.commit();
    return response;
    
  } catch (error) {
    console.log("Error catch makepayments");
    await transaction.rollback();
    if(error instanceof AppError) throw error;

  }
}

async function cancelBooking(bookingId){

  const transaction=await db.sequelize.transaction();
  try {
    console.log('Try Block of cancelBooking',bookingId);
    const bookingDetails=await bookingRepository.get(bookingId,transaction);
    if(bookingDetails.status==CANCELLED){
      console.log('status Booking Block');
      await transaction.commit();
      return true;
    }
    console.log("about to call to revert the seats");
    console.log(bookingDetails.flightId,bookingDetails.noofSeats);
    await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${bookingDetails.flightId}/seats`,{
      seats:bookingDetails.noOfSeats,
      dec:0
    });
    await bookingRepository.update(bookingId,{status:CANCELLED},transaction);
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw new AppError('The cancel to the not possible',StatusCodes.BAD_REQUEST);
  }
}

async function cancelOldBookings(){
  try{
    console.log("Inside cancel old bookings");
    const Time=new Date((Date.now()-1000*300));
    const response=await bookingRepository.cancelOldBookings(Time);
    return response;
  }catch(error){

  }
}

module.exports={
    createBooking,
    makePayment,
    cancelBooking,
    cancelOldBookings
}
