const express=require('express');
const {Logger, ServerConfig}=require('./config');
const apiRoutes=require('./routes');
const app=express();
const CRON=require('./utils/common/cron-jobs');

const PORT=ServerConfig.PORT;
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/api',apiRoutes);


app.listen(PORT,()=>{
    console.log(`Successfully started the server on PORT: ${PORT}`);
    Logger.info("Successfully started the server",{});
    CRON();
})