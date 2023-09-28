import fs from 'fs';
import { AccessToken, RefreshToken } from './jwt.js';

const saveRefreshToken = (username, refreshToken) => {

    return new Promise((resolve, reject) => {
        try{
            const db = JSON.parse(fs.readFileSync('./db.json'));
            db[username] = refreshToken;
            fs.writeFileSync('./db.json', JSON.stringify(db));
            resolve(true);
        }catch(err){
            reject(err);
        }
    });
}

const checkAccessToken = (accessToken) => {
    
    return new Promise((resolve, reject) => {
        try{
            const payload = accessToken.split('.')[1];
            const { exp } = JSON.parse(Buffer.from(payload, 'base64').toString());
            const now = new Date().getTime();

            if(now > exp){
                resolve(false);
            }else{
                resolve(true);
            }
        }catch(err){
            reject(err);
        }
    });
}

const login = async (req, res) => {

    const { username, password } = req.body;

    if(username == 'admin' && password == '1234'){

        const accessToken = new AccessToken(username).token;
        const refreshToken = new RefreshToken().token;

        const savedRefreshToken = await saveRefreshToken(username, refreshToken);

        if(savedRefreshToken){
            res.cookie('accessToken', accessToken);
            res.cookie('refreshToken', refreshToken);
            res.redirect('/');
        }else{
            res.redirect('/login')
        }
    }
}

const isLoggedIn = async (req, res, next) => {
    
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if(accessToken){

        const canAccess = await checkAccessToken(accessToken);

        if(canAccess){
            next();
        }else{

            if(refreshToken){

                const subPayLoad = JSON.parse(Buffer.from(refreshToken.split('.')[1], 'base64').toString()).sub;
                const newAccessToken = new AccessToken(subPayLoad).token;   

                res.cookie('accessToken', newAccessToken);
                next();
            }else{
                res.redirect('/login');
            }
        }
    }else{
        res.redirect('/login');
    }
}

const isNotLoggedIn = (req, res, next) => {
    
    const accessToken = req.cookies.accessToken;

    if(accessToken){
        res.redirect('/');
    }else{
        next();
    }
}

export { login , isLoggedIn , isNotLoggedIn};
