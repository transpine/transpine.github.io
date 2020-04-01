---
layout: post
title:  Service worker를 이용한 Web Push (2)
date: 2020-04-01 22:12
category: 
author: 
tags: [web, push, JWT, VAPID]
summary: 
img: posts/2020-04-01_title.svg
---

구글의 문서를 조금 더 살펴보겠습니다.

# Service Worker?
<https://developers.google.com/web/fundamentals/primers/service-workers?hl=ko>{:target="_blank"}  
구글의 서비스워커 소개에 좀 더 읽을만한 내용이 있습니다. 서비스 워커는 웹페이지나 사용자와 상호작용이 필요하지 않은 기능을 제공해 주기 위해서 만들어졌습니다. 이미 네이티브 앱에서는 당연하게 지원되는 기능들이지만 푸시나 백그라운드 동기화 같은 기능, 특히 오프라인 환경에서 서비스를 제공해 주기 위한 기능들은 기존 브라우저의 한계를 벗어난 새로운 역할이 필요로 했음을 짐작케 합니다. 아이폰과 안드로이드가 닮아가듯 요새 보면 점점 더 네이티브 환경은 웹을 닮아가고 웹은 네이티브 환경을 닮아가는 듯 합니다. 

PWA(Progressive Web Apps)에 대해서는 아래 내용들을 읽어보시면 재미있을것 같네요.  
- [구글의 ‘프로그레시브 웹 앱스’를 아십니까?](https://medium.com/@MadeDesignbyMe/%EA%B5%AC%EA%B8%80%EC%9D%98-%ED%94%84%EB%A1%9C%EA%B7%B8%EB%A0%88%EC%8B%9C%EB%B8%8C-%EC%9B%B9-%EC%95%B1%EC%8A%A4%EB%A5%BC-%EC%95%84%EC%8B%AD%EB%8B%88%EA%B9%8C-8116f2766004){:target="_blank"}  
- [여러분의 첫 Progressive Web App](https://developers.google.com/web/fundamentals/codelabs/your-first-pwapp?hl=ko){:target="_blank"}  


주기적 동기화와 지오펜싱 기능에 대한 언급이 있어서 찾아봤는데 주기적인 동기화는 이미 지원하는 브라우저들이 있고<https://whatwebcando.today/scheduler.html>{:target="_blank"} 지오펜싱은 아쉽게도 아무 벤더에서도 구현하지 않아 방치된 상태인가 봅니다. <https://whatwebcando.today/geofencing.html>{:target="_blank"}

이후 만들어볼 예제에 도움이 될만한 것들을 좀 정리해 봤습니다.

1. [GitHub 페이지](https://pages.github.com/){:target="_blank"}는 HTTPS를 통해 제공되기 때문에 데모를 호스팅하기 좋은 장소입니다.
2. chrome://inspect/#service-workers로 이동하여 사이트를 찾아 서비스 워커가 활성화되었는지 확인할 수 있습니다. 서비스워커 도입 초기에 디버깅용으로 사용하던 chrome://serviceworker-internals는 아직도 크롬에서 접근 가능합니다.
3. 앞서 MDN 문서에서도 언급되어 있듯, 별 생각없이 service worker내부에서 sync코드를 쓰고 수시간을 디버깅하는데 쓰는 삽질을 조심하세요.
> 설치 실패 알림 기능 부족 : 서비스 워커가 등록되더라도 chrome://inspect/#service-workers 또는 chrome://serviceworker-internals에 표시되지 않는 경우 오류가 발생했거나 event.waitUntil()에 거부된 프라미스를 전달했기 때문에 설치하지 못했을 수 있습니다.
4. 기본적으로 비 CORS는 실패함 : 일단 지금은 테스트이기 때문에 서버에서 Access-Control-allow-origin을 설정해서 진행해 보겠습니다.

# The Web Push Protocol
Push를 받기위해 어떤 정보로 어떻게 subscribe되고, 메세지가 어떻게 오가는지 알아야합니다. 구독을 한 사람한테만 메세지를 보내야하고 그것을 식별하는 구조가 당연히 필요하겠죠?

![](https://developers.google.com/web/fundamentals/push-notifications/images/svgs/application-server-key-send.svg)  
<https://developers.google.com/web/fundamentals/push-notifications/web-push-protocol>{:target="_blank"}

0. Server에서는 Public키와 Private키를 생성합니다. Private키는 인증정보를 singing할 때 사용합니다. 서버에 방문하는 사람들은 구독을 하게 되면서 Public key를 받습니다.
1. 보낼 메세지가 생기면, 서버는 Client가 식별을 할 수 있도록 JSON 정보를 Private Key로 signing하고 헤더에 담아 보냅니다. JSON은 JWT(JSON web token) 이라는 표준에 맞춰서 구조화되어 보내집니다.

    ![](https://developers.google.com/web/fundamentals/push-notifications/images/svgs/authorization-jwt-diagram-header.svg)
    JWT Info는 현재 정보가 JWT타입이라는것과 Client가 Public key로 decrypt하여 signature부분을 검증 할 때 ES256(ECDSA using the P-256 curve and the SHA-256 hash algorithm)을 사용하라는 내용을 담고 있습니다.

    ```json
    { 
        "typ": "JWT",
        "alg": "ES256"
    }
    ```  
    JWT Data에는 aud(Audience:누구를 위한 VAPID인가? 푸시서버!), sub(Subscriber:푸시를 보내는 주체의 이메일이나 호스트주소), exp(Expiration)이 담깁니다.

    ```json
    {  
        "aud": "https://some-push-service.org",
        "exp": "1469618703",
        "sub": "mailto:example@web-push-book.org"  
    }
    ```
    ※ JWT는 요새 인증할때 많이 쓰이는 표준이라고 합니다. 더 [구체적으로는..](http://letmegooglethat.com/?q=JWT)

    메세지의 내용은 ECDH와 HKDF를 사용하는 방식으로, 이미 서로 알고 있는 정보인 Public key를 사용하여 메세지를 Encrypt/Descrpyt하는 방법을 사용합니다. 하지만 지금하는 간단한 테스트에는 이런 정보까지 사용하지 않아요^^
2. 헤더가 포함되어 있는 메세지를 Client에 보냅니다
3. Client의 브라우저, service worker가 그 메세지를 받고 pushManager에게 해독하라고 시킵니다. pushManager는 0.에서 받아 등록되어 있던 Public key를 사용하여 열심히 비교해봅니다. 
4. 그림은 마치 3을 decrypt해보고 결과를 4.에서 보내는 것 처럼 되어 있지만 그렇지 않습니다. 2.에서 Server가 Post로 메세지를 보내면 Client가 정상적으로 메세지를 받으면 201 OK를 보내줍니다. **Client가 메세지 Decryption을 못하면 service worker에서 에러가 발생하고 끝입니다**.

    >A successful POST will return a response of 201, however, if the User Agent cannot decrypt the message, your application will not get a “push” message. This is because the Push Server cannot decrypt the message so it has no idea if it is properly encoded.

    <https://blog.mozilla.org/services/2016/08/23/sending-vapid-identified-webpush-notifications-via-mozillas-push-service/>{:target="_blank"}

5. 메세지가 Valid 한것으로 확인되면 service worker의 'push' event를 통해 내용을 받을수 있습니다.

# VAPID
결국 VAPID(Voluntary APplication server IDentification) 표준을 따라 동작한다는 건데, 이걸 왜 쓸까요?

>An application server can voluntarily identify itself to a push service using the described technique. This identification information can be used by the push service to attribute requests that are made by the same application server to a single entity. This can used to reduce the secrecy for push subscription URLs by being able to restrict subscriptions to a specific application server.  An application server is further able to include additional information that the operator of a push service can use to contact the operator of the application server.

스펙의 처음에 나오는 내용입니다. 두가지 정도로 요약을 해봤습니다.
1. 구독을 특정 서버에 제한시킬 수 있다(restrict subscriptions to a specific application server)  
  기존의 푸시 구조에서는 보통 외부 서버(서비스)를 사용해서 Push를 하게 되기 때문에, 현재 서버에서 보내는건 사실 서비스를 등록한 서버에서도 보낼 수 있습니다. 보통의 서비스들이 push 요청을 relay해주는 형태이니 당연한 거겠죠? VAPID방식은 키교환을 통해 end-to-end로 이루어지는 방식이다보니 이런 장점이 생기는것 같습니다. 이미 Push 기술은 많이 고도화되어서 중간에 메세지를 relay 서버가 볼 수 없는 형태도 많이 있습니다만, 구조적으로 불가능하다는것은 장점이 맞는것 같습니다.
2. 푸시서버에 연락 가능하다(contact the operator of the application server)
  sub항목에 반드시 서비스하는 메일주소나 host를 넣어야 하기 때문에 누가 push를 보낼건지, 보내는지 알 수 있다는것입니다.

위에서 언급했던 [구글의 설명](https://developers.google.com/web/fundamentals/push-notifications/web-push-protocol)에서 좀 더 깊은 내용과 코드까지 정리가 되어 있고, 
[VAPID spec](https://tools.ietf.org/html/draft-thomson-webpush-vapid-02)이나 [mozilla의 문서](https://blog.mozilla.org/services/2016/08/23/sending-vapid-identified-webpush-notifications-via-mozillas-push-service/) 도 읽어보면 좋을것 같습니다.

다음 포스트부터 실제 구현을 진행해 보도록 하겠습니다.