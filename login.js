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

const checkRefreshToken = (username, refreshToken) => {

    return new Promise((resolve , reject) => {
        try{
            const db = JSON.parse(fs.readFileSync('./db.json'));
            
            if(db[username] === refreshToken){
                resolve(true);
            }else{
                resolve(false);
            }
        }catch(err){
            reject(err);
        }
    })
}

const isVerifiedAccessToken = (accessToken) => {

    return new Promise((resolve , reject) => {
        try{

            if(!accessToken) resolve(false);

            const [header , payload , signature] = accessToken.split('.');
            const verifySignature = crypto.createHmac('sha256', process.env.SECRET_KEY).update(header + "." + payload).digest('base64url');

            if(signature == verifySignature){
                resolve(true);
            }else{
                resolve(false);
            }
        }catch{
            reject(err);
        }
    })
}

const checkExpirationDate = (accessToken) => {
    
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

/**
 * accessToken 을 통해 로그인 여부를 판단하는 middleWare,
 * isVerified 를 통해 accessToken 이 존재함과 해당 서버의 토큰이 맞는지 확인하고 isNotExpired 를 통해 만료되지 않았는지 확인한다.
 * 만약 올바른 accessToken 이면 그대로 진행 , 올바른 토큰이지만 만료되었으면 재발행, 
 * 올바르지 않은 token 이면 로그인 페이지로 redirection 한다.
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const isLoggedIn = async (req, res, next) => {
    
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    const isVerified = await isVerifiedAccessToken(accessToken);
    const isNotExpired = await checkExpirationDate(accessToken);

    if(isVerified && isNotExpired){
        next();
    }else if(isVerified && !isNotExpired){

        const subPayload = accessToken.split('.')[1];
        const user = JSON.parse(Buffer.from(subPayload, 'base64').toString()).sub;
        const isMatched = await checkRefreshToken(user, refreshToken);

        if(isMatched){
            const accessToken = new AccessToken(user).token
            res.cookie('accessToken', accessToken);
            next();
        }else{
            res.redirect('/login')
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
