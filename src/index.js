const express=require('express');
const {Logger, ServerConfig,Queue}=require('./config');
const apiRoutes=require('./routes');
const app=express();
const CRON=require('./utils/common/cron-jobs');
const amqplib=require('amqplib');

const PORT=ServerConfig.PORT;
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/api',apiRoutes);


app.listen(PORT,async()=>{
    console.log(`Successfully started the server on PORT: ${PORT}`);
    Logger.info("Successfully started the server",{});
    CRON();
    await Queue.connectQueue();
    console.log("Queue Connected");
})