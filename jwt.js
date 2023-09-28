import crypto from "crypto"
import dotenv from "dotenv"

dotenv.config();

export class Token{

    #secretKey;

    constructor(id){
        this.encodedHeader;
        this.endcodedPayload;
        this.signature;
        this.username = id
        this.#secretKey = process.env.SECRET_KEY;
        this.token = this.generateToken();
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

    // payload 의 정보를 base64URL 로 인코딩한다.

    encodePayload(username){

        const payLoad = JSON.stringify(
            {"iss":"lee" // 발급자
            ,"exp": 1000 // 만료시간이 30분 이후인 JWT 토큰
            ,"sub" : username // 유저 id
        });

        return this.encodedPayload = this.base64URLEncode(Buffer.from(payLoad , 'utf-8'));
    }

    // header 와 payload 를 합쳐서 signature 를 만든다.

    generateSignature(){
        this.signature = crypto.createHmac('sha256', this.#secretKey)
        .update(this.encodeHeader() + "." + this.encodePayload(this.username))
        .digest('base64url')
    }

    // header 와 payload 와 signature 를 합쳐서 JWT 토큰을 만든다.

    generateToken(){
        this.generateSignature();
        return this.token = this.encodedHeader + "." + this.encodedPayload + "." + this.signature;
    }
}