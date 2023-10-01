import express from 'express';
import router from './router.js';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from "path"

const app = express()
const PORT = 3002;
const pathDir = path.resolve();

app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(pathDir + '/public')));

app.use('/' , router)

app.listen(PORT , () =>{
    console.log(`Server is running on port ${PORT}`)
})