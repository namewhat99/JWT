import express from 'express';
import router from './router.js';
import cookieParser from 'cookie-parser';

const app = express()
const PORT = 3002;

app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/' , router)

app.listen(PORT , () =>{
    console.log(`Server is running on port ${PORT}`)
})