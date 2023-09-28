import express from 'express';
import { isLoggedIn, isNotLoggedIn, login } from './login.js';

const router = express.Router();

// 지금 cookie 의 accessToken 값이 수정되면 로그인이 되지 않고 /login 으로 Redirect 된다.
// 그런데 지금 /login 으로 가면 바로 isNotLoggedIn 에 걸리는데 이때 isNotLoggedIn 은 accessToken 의 존재성만 확인하므로
// accessToken 이 존재하면 / 로 리다이렉트 되는 순환에 빠져서 무한 리다이렉트가 발생한다.
router.get('/login', isNotLoggedIn  , (req, res) => {
    res.render('login.ejs');
});

router.get('/' , isLoggedIn , (req , res) =>{
    res.render('main.ejs')
})

router.post('/api/login' , login)

export default router;