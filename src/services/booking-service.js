const axios=require('axios');
const {BookingRepository}=require('../repositories');
const {ServerConfig}=require('../config');
const db=require('../models');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');

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


module.exports={
    createBooking
}
