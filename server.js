import app from './app.js';
import connectDB from './config/database.js';
import cloudinary from 'cloudinary';
import nodeCron from 'node-cron';
import { Stats } from './models/Stats.js';
connectDB()
cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})
nodeCron.schedule("0 0 0 1 * *",async()=>{
    try {
        await Stats.create({})
    } catch (error) {
        console.log(error)   
    }
})

app.listen(process.env.PORT,()=>{
    console.log(`Shikkah server running at PORT  ${process.env.PORT}`)
})