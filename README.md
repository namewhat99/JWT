# JWT <br>

<h3> 라이브러리 사용하지 않고 직접 header, payload, signature 구현 

- [X] 인증이 되면 AccessToken 과 RefreshToken 발행

- [X] AccessToken 과 RefreshToken cookie에 담아서 응답

- [X] 요청이 올 때 AccessToken 이 존재하고 만료 전 -> 인증 , 만료 -> DB 에서 RefreshToken 을 체크 후 맞으면 AceessToken 재발급

- [X] AccessToken 이 존재하지 않으면 -> 재로그인


<h3>JWT.js
  - secertKey 는 공개되면 안되므로 private 변수 설정
  - JWT 는 3 부분으로 이뤄짐 header , payload , signature
  - header 와 payload 는 각각 base64URL 인코딩한다.
  - signature 는 header 와 payload 를 '.' 으로 합친 후 secretKey 를 이용해서 (HMAC ...)

