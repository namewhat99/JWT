### 라이브러리 없이 JWT 로그인 구현<br>
  
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

   - 처음 사용자가 ID , PW 로 로그인 , 이때 정보가 맞으면 인증을 통과하고 AccessToken 과 uuid 발급, uuid 은 Redis 캐시 에 저장하고 AccessToken 과 uuid 모두 쿠키에 저장 , uuid 는 httpOnly 설정.
   
   - 사용자는 AccessToken 을 이용해서 인증을 진행한다. AccessToken 은 authorization header 담아서 서버에 요청
   
   - AccessToken 이 해당 서버에서 발행한 것이 맞고 만료 전 인 경우, 인가
   
   - AccessToken 이 해당 서버에서 발행한 것이 맞지만 만료된 경우, refreshUuid 를 캐시에서 찾아서 해당 사용자가 맞는지 확인한다.
   
   - 해당 사용자가 맞으면 accessToken 재발행, uuid 도 값 갱신
   
   - 이 부분을 middleware 로 구현해서 각 페이지에서 인가를 확인한다.

- [구현의 근거 ](#jwt-) <br>

   - 일단 공부의 목적이 가장 컸지만 그래도 나름의 근거를 가지고 시도했다, xss 와 csrf 에 관한거는 제외하고 구현함 (추후에 공부해볼 예정)
   
   - ~~access token 을 JS 전역변수로 하려했는데 일단 프런트 지식(Redux 라는것을 이요하면 된다고 하는데,,, 추후에 알게되면 더 해보자)에 대한 부재로 쿠키에 저장~~
   <span style=color:pink> 현재 단계에서는 크게 의미가 없다고 생각되서 진행하지 않았다. 지금 SSR 방식의 렌더링을 사용하고 있는데 JS private 변수를 사용하면 새로고침 할 때마다 다시 이 변수가 초기화된다. 
  CSR 에서는 계속 JS 변수가 남아있기 때문에 괜찮지만 SSR 방식의 경우 매번 access Token 이 날아가기 때문에 다시 요청이 필요하다. 현재로서는 큰 의미 없음. 구현을 해 보았다는것에 의미를 두자 ~~이것때문에 하루 날린거는... 크흠~~</span>
    
   - 쿠키는 클라이언트, 서버에서 모두 저장할 수 있다. 일단 서버에서 저장했는데 이유는 서버코드는 브라우저에서 볼 수 없다. 만약 브라우저에서 document.cookie 로 저장한다면 쿠키에 access token 과 uuid 가 저장됨을 알 수 있다.
   
   - 이번에 처음으로 redis 를 사용해봤다. DB 를 사용할 수도 있었지만 redis 로 구현해 보고 싶었다. 처음 써보는 캐시이기도 하고 어떻게 동작하는지 간단히 공부하는 기회가 되었다.
   
   - <span style="color:Red">한가지 의문이 있었다. 쿠키에 토큰값을 저장하면 굳이 authorization header 에 access token 값을 넣어서 전달할 필요 없이 서버에서 바로 확인이 가능하다. 그런데 왜 authorization header 에 넣어서 전달할까? 
</span>

   - <span style="color:skyblue"> 이에 대해 여러가지 답변이 있었다.
    1. 토큰을 전달하는 것이 중요하지 쿠키를 통해 전달하나 authorization header 를 통해 전달하나는 구현하는 사람이 택하는 것 이다.
    2. 저장과 통신은 별개이다. 쿠키는 단지 access token 을 저장하는 용도일 뿐이고 쿠키를 통해 인증이 가능하지만 통신의 용도는 authorization header 가 맞다.
    3. authorization header 에 대해 조금 더 공부해 보시면 답이 나올겁니다.
  
  - <span style="color:skyblue"> 여러가지 의견이 있었고 사실 구현은 선택하는 문제이다. 하지만 아직 부족한 것 같다. 내가 작성하는 코드들에 근거를 갖고 싶은데 아직 모든것을 설명하지 못한다. 더 노력해야 될 것 같다.
  

- [공부할 거리 ](#jwt-) <br>
   - authorization header , bearer
   - ~~axios 에는 header 에 고정적으로 값을 담을 수 있는 기능이 있는데 js 에도 있나?~~
   - ~~refresh_uuid 를 검증할 때, DB 를 사용해도 되지만 경험삼아 redis 사용 예정~~
   - xss, csrf 


