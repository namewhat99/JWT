import { AccessToken, Uuid } from './jwt.js';
import crypto from 'crypto';
import { RedisClient } from './redis.js';

const saveRefreshUuid = (username, refreshUuid) => {

    return new Promise(async (resolve, reject) => {
        try{
            const redisClient = new RedisClient();

            await redisClient.connect();
            await redisClient.set(username, refreshUuid);
            await redisClient.disconnect();
            
            resolve(true);
        }catch(err){
            reject(err);
        }
    });
}

const checkRefreshUuid = (username, refreshUuid) => {

    return new Promise(async (resolve , reject) => {
        try{

            const redisClient = new RedisClient();
            await redisClient.connect();

            const clientRefreshUuid = await redisClient.get(username);

            await redisClient.disconnect();

            if(clientRefreshUuid === refreshUuid){
                resolve(true);
            }else{
                resolve(false)
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

        const savedRefreshUuid = await saveRefreshUuid(username, refreshUuid);

        if(savedRefreshUuid){

            res.cookie('accessToken', accessToken);
            res.cookie('refreshUuid', refreshUuid , { httpOnly : true });

            res.set({
                'authorization' : `Bearer ${accessToken}`,
                'refresh_uuid' : refreshUuid
            }).status(200).json({loggedIn : true});
        }else{
            res.status(500).json({loggedIn : false});
        }
    }else{
        res.status(401).json({loggedIn : false});
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
    
    const accessToken = req.headers.authorization.split(' ')[1];
    const refreshUuid = req.cookies.refreshUuid;

    const isVerified = await isVerifiedAccessToken(accessToken);
    const isNotExpired = await checkExpirationDate(accessToken);

    if(isVerified && isNotExpired){
        console.log('accessToken 유효')
        next();
    }else if(isVerified && !isNotExpired){

        const subPayload = accessToken.split('.')[1];
        const user = JSON.parse(Buffer.from(subPayload, 'base64').toString()).sub;
        console.log(user , refreshUuid) // refreshUuid 가 안담겨있다
        const isMatched = await checkRefreshUuid(user, refreshUuid);

        if(isMatched){
            const accessToken = new AccessToken(user).token
            const newRefreshUuid = new Uuid().uuid;
            await saveRefreshUuid(user, newRefreshUuid); // 한번 사용된 uuid 값은 새로운 값으로 변경

            req.headers.authorization = `Bearer ${accessToken}`;
            req.headers.refreshUuid = newRefreshUuid;
            console.log('accessToken 재발행')
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
