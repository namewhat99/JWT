## 라이브러리 없이 JWT 로그인 구현<br>
  
- [base64URL 인코딩 ](#base64URL-)<br>
    - 먼저 문자열을 utf-8 을 기준으로 하여 binary 데이터로 만든다. 
    - 변환된 binary 데이터를 base64 로 인코딩한다.
    - base64 와 base64URL 의 차이는 + 는 - 로 , / 는 _ 로 , = 는 빈칸으로 바꾼다는 점 이다.
    - 이 부분은 Token 클래스의 base64URLEncode 함수로 구현됨

- [jwt.js](#jwt-)<br>

    - AccessToken 은 Token 클래스의 상속
    - JWT 의 Header 와 Payload 는 각각을 생성 후, base64URL 인코딩
    - Signature 는 인코딩한  Header 와 Payload 를 '.' 으로 합친 후, secretKey 와 함께 해시 알고리즘으로 암호화 한다.

- [JWT 인증 과정 ](#jwt-) <br>
   - 처음 사용자가 ID , PW 로 로그인 , 이때 정보가 맞으면 인증을 통과하고 AccessToken 과 uuid 발급, uuid 은 DB 에 저장하고 AccessToken 과 uuid 모두 쿠키에 저장.
   - 사용자는 uuid 을 저장하고 AccessToken 을 이용해서 인증을 진행한다. AccessToken 은 authorization header 담아서 서버에 요청
   - AccessToken 이 해당 서버에서 발행한 것이 맞고 만료 전 인 경우, 인가
   - AccessToken 이 해당 서버에서 발행한 것이 맞지만 만료된 경우, refresh_uuid 을 클라이언트에게 요청
   - 이 부분을 middleware 로 구현해서 각 페이지에서 인가를 확인한다.

-[공부할 거리 ](#jwt-) <br>
   - authorization header , bearer
   - axios 에는 header 에 고정적으로 값을 담을 수 있는 기능이 있는데 js 에도 있나?
   - refresh_uuid 를 검증할 때, DB 를 사용해도 되지만 경험으로 redis 사용 예정