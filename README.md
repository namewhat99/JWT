## 라이브러리 없이 JWT 구현<br>
  
- [base64URL 인코딩 ](#base64URL-)<br>
    - 먼저 문자열을 utf-8 을 기준으로 하여 binary 데이터로 만든다. 
    - 변환된 binary 데이터를 base64 로 인코딩한다.
    - base64 와 base64URL 의 차이는 + 는 - 로 , / 는 _ 로 , = 는 빈칸으로 바꾼다.
    - 이 부분은 Token 클래스의 base64URLEncode 함수로 구현됨

- [jwt.js](#jwt-)<br>

    - AccessToken 과 RefreshToken 은 Token 클래스의 상속
    - JWT 의 Header 와 Payload 는 각각을 생성 후, base64URL 인코딩
    - Signature 는 인코딩한  Header 와 Payload 를 '.' 으로 합친 후, secretKey 와 함께 해시 알고리즘으로 암호화 한다.
    - AccessToken 과 RefreshToken 모두 이 과정을 거쳐서 생성한다. 차이점은 RefreshToken 은 지속시간이 더 길고, 해당 사용자의 정보를 payload 에 담지 않는다는 점

- [JWT 인증 과정 ](#jwt-) 
