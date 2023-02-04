import express from 'express';
import {config} from 'dotenv';
import course from './routes/Course.js';
import user from './routes/User.js';
import payment from './routes/Pyment.js';
import other from './routes/Other.js';
import ErrorMiddleware from './middlewares/Error.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
config({path:"config/config.env"})
const app = express();
app.use(express.json())
app.use(express.urlencoded({
    extended:true
}));
app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true
}))
app.use(cookieParser());
app.use('/api/v1',course)
app.use('/api/v1',user)
app.use('/api/v1',payment)
app.use('/api/v1',other)
export default app;

app.get('/',(req,res)=>{
    res.send(
        `
        <h1>Shikkah Backend is working. Click <a href=${process.env.FRONTEND_URL}>here</a>to visit frontend.</h1>
        `
    )
})
app.use(ErrorMiddleware)