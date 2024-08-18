const express=require('express');
const router = express.Router();
const {BookingController}=require('../../controllers');

console.log("Router.POST");
router.post('/',BookingController.createBooking);

module.exports=router