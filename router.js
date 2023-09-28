import express from 'express';
import { isLoggedIn, isNotLoggedIn, login } from './login.js';

const router = express.Router();

router.get('/login', isNotLoggedIn  , (req, res) => {
    res.render('login.ejs');
});

router.get('/' , isLoggedIn , (req , res) =>{
    res.render('main.ejs')
})

router.post('/api/login' , login)

export default router;