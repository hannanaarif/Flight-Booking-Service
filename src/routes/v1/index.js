const express=require('express');
const {InfoController}=require('../../controllers');
const router=express.Router();
const bookingRoutes=require('./booking');

router.get('/info',InfoController.info);
router.use('/bookings',bookingRoutes);

module.exports=router;