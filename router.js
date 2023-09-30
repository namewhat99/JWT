import express from 'express';
import { isLoggedIn, isNotLoggedIn, login } from './login.js';

const router = express.Router();

router.get('/login' , isNotLoggedIn , (req, res) => {
    res.render('login.ejs');
});

router.get('/'  , (req , res) =>{
    res.render('main.ejs')
})

router.post('/api/login' , login)

// 리소스 요청 시 토큰의 검증이 이뤄진다.
router.get('/api/fetch' , isLoggedIn , (req , res) => {
    res.json({data : 'fetch'})
})

export default router;