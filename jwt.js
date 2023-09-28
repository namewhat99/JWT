import crypto from "crypto"
import dotenv from "dotenv"

dotenv.config();
class Token{

    constructor(){
        this.encodedHeader;
    }
    /**
     * base64 인코딩과 base64 URL 인코딩 차이점으로 인해 해당 함수 구현
     * base64 에서 사용하는 특수문자들을 URL 에서 사용할 수 있는 문자로 바꾸는 작업이다.
     * + 는 - 로 , / 는 _ 로 , = 는 제거해서 반환한다
     * @param {*} str 
     * @returns 
     */
    base64URLEncode(buffer){
        return buffer.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    }

    /**
     *  header 의 정보를 base64URL 로 인코딩한다.
     *  header 를 utf-8 인코딩 기준으로 이진데이터 변환 (Buffer.from) 후 base64URL 로 인코딩한다.
     *  */ 
    encodeHeader(){

        const header = JSON.stringify({ alg: "HS256", typ: "JWT" });

        return this.encodedHeader = this.base64URLEncode(Buffer.from(header , 'utf-8'));
    }
}

class AccessToken extends Token{

    #secretKey;

    constructor(id){
        super(id);
        this.endcodedPayload;
        this.signature;
        this.username = id
        this.#secretKey = process.env.SECRET_KEY;
        this.token = this.generateToken();
    }

    encodePayload(username){

        const payLoad = JSON.stringify(
            {"iss":"lee" // 발급자
            ,"exp": 1000 * 60 * 30 // 만료시간이 30분 이후인 JWT 토큰
            ,"sub" : username // 유저 id
        });

        return this.encodedPayload = super.base64URLEncode(Buffer.from(payLoad , 'utf-8'));
    }

    // header 와 payload 를 합쳐서 signature 를 만든다.

    generateSignature(){
        this.signature = crypto.createHmac('sha256', this.#secretKey)
        .update(super.encodeHeader() + "." + this.encodePayload(this.username))
        .digest('base64url')
    }

    generateToken(){
        this.generateSignature();
        return this.encodedHeader + "." + this.encodedPayload + "." + this.signature;
    }
}

class RefreshToken extends Token{

    #secretKey;

    constructor(){
        super();
        this.endcodedPayload;
        this.signature;
        this.#secretKey = process.env.SECRET_KEY;
        this.token = this.generateToken();
    }

    encodePayload(){

        const payLoad = JSON.stringify(
            {"iss":"lee" // 발급자
            ,"exp": 1000 * 60 * 1440 // 만료시간이 1일인 refresh Token
            // username 은 지운다.
        });

        return this.encodedPayload = super.base64URLEncode(Buffer.from(payLoad , 'utf-8'));
    }

    // header 와 payload 를 합쳐서 signature 를 만든다.

    generateSignature(){
        this.signature = crypto.createHmac('sha256', this.#secretKey)
        .update(super.encodeHeader() + "." + this.encodePayload(this.username))
        .digest('base64url')
    }

    generateToken(){
        this.generateSignature();
        return this.encodedHeader + "." + this.encodedPayload + "." + this.signature;
    }
}

export { AccessToken, RefreshToken }