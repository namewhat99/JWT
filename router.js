import express from 'express';
import checkLogin from './login.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
});

router.post('/api/login' , checkLogin)

export default router;