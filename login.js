import fs from 'fs';
import { AccessToken, Uuid } from './jwt.js';
import crypto from 'crypto';

const saveRefreshUuid = (username, refreshUuid) => {

    return new Promise((resolve, reject) => {
        try{
            const db = JSON.parse(fs.readFileSync('./db.json'));
            db[username] = refreshUuid;
            fs.writeFileSync('./db.json', JSON.stringify(db));
            resolve(true);
        }catch(err){
            reject(err);
        }
    });
}

const checkRefreshUuid = (username, refreshUuid) => {

    return new Promise((resolve , reject) => {
        try{
            const db = JSON.parse(fs.readFileSync('./db.json'));
            
            if(db[username] === refreshUuid){
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
        }catch(err){
            reject(err);
        }
    })
}

const checkExpirationDate = (accessToken) => {
    
    return new Promise((resolve, reject) => {

        if(!accessToken) resolve(false);

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
        const refreshUuid = new Uuid().uuid;

        const savedRefreshToken = await saveRefreshUuid(username, refreshUuid);

        if(savedRefreshToken){
            res.cookie('accessToken', accessToken);
            res.cookie('refreshUuid', refreshUuid);
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
    const refreshUuid = req.cookies.refreshUuid;

    const isVerified = await isVerifiedAccessToken(accessToken);
    const isNotExpired = await checkExpirationDate(accessToken);

    if(isVerified && isNotExpired){
        next();
    }else if(isVerified && !isNotExpired){

        const subPayload = accessToken.split('.')[1];
        const user = JSON.parse(Buffer.from(subPayload, 'base64').toString()).sub;
        const isMatched = await checkRefreshUuid(user, refreshUuid);

        if(isMatched){
            const accessToken = new AccessToken(user).token
            const newRefreshUuid = new Uuid().uuid;
            await saveRefreshUuid(user, newRefreshUuid); // 한번 사용된 uuid 값은 새로운 값으로 변경
            res.cookie('accessToken', accessToken);
            res.cookie('refreshUuid', newRefreshUuid);
            next();
        }else{
            res.redirect('/login')
        }
    }else{
        res.redirect('/login');
    }
    
}

const isNotLoggedIn = async (req, res, next) => {
    
    const accessToken = req.cookies.accessToken;
    const refreshUuid = req.cookies.refreshUuid;

    const isVerified = await isVerifiedAccessToken(accessToken);
    const isNotExpired = await checkExpirationDate(accessToken);

    if(isVerified && isNotExpired){
        res.redirect('/');
    }else if(isVerified && !isNotExpired){

        const subPayload = accessToken.split('.')[1];
        const user = JSON.parse(Buffer.from(subPayload, 'base64').toString()).sub;
        const isMatched = await checkRefreshUuid(user, refreshUuid);

        if(isMatched){
            const accessToken = new AccessToken(user).token
            const newRefreshUuid = new Uuid().uuid;
            res.cookie('accessToken', accessToken);
            res.cookie('refreshUuid', newRefreshUuid);
            res.redirect('/');
        }else{
            next();
        }
    }else{
        next();
    }
}

export { login , isLoggedIn , isNotLoggedIn };
