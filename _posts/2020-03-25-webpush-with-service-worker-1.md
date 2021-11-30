---
layout: post
title: Service worker를 이용한 Web Push (1)
date: 2020-03-25 18:37
category: [Web]
author: 
tags: [web, push]
summary: 
img: posts/2020-03-25_title.png
---

가만히 앉아 있어도 수만가지 정보를 갖다 바쳐주는 지금의 시대에 Push는 기본중의 기본 feature입니다. 모바일 환경의 발전이 그 필요성을 가속시켰지만 최근에는 윈도우나 OSX등의 환경에서도 수시로 무언가(?) 도착합니다. websocket이나 socket.io를 이용하여 Push를 구현하여 사용하곤 했었는데 최근 PWA으로 만들어진 앱들이 많아지고 그 앱들이 socket.io등과 다른 방식으로 Push를 쓰는것을 보게되었습니다. 관심을 두던차에 필요해져서 한번 파보기로 했습니다.

먼저, 크롬이나 엣지로 접속한 사이트들이 프로그램 설치나 정보제공없이 구독을하게 하고 푸시가 날아오는것을 보면 브라우저 레벨에서 적용된 기술로 추정됩니다. Web Push로 구글링을 해봅니다.  

![search result]({{site.baseurl}}/assets/img/posts/2020-03-25_img1.png)

구글문서가 제일 위에 있지만, 내용을 알기위해 표준을 먼저 살펴보는게 좋을것 같습니다.

# Web Push
<https://developer.mozilla.org/ko/docs/Web/API/Push_API>{:target="_blank"}

>Push API는 웹 애플리케이션이 현재 로딩이 되어 있지 않더라도 서버로부터 메시지를 받을 수 있도록 하는 기능이다. 이는 개발자들이 비동기적으로 사용자에게 새로운 내용을 시기적절하게 전달할 수 있도록 만들어 준다.

브라우저와 같은 프로그램이 열려 있지 않더라도 메세지를 받는 다는 내용으로 보입니다. 웹에서 구독하게되면 날아오는 새글 알림등은 브라우저를 켜지 않더라도 윈도우 알림으로 날아오곤 하니 아마도 이 API를 사용하지 않았을까요? 

>애플리케이션이 push 메시지를 받기 위해서, service worker를 활성화한다.

**service worker**라는 곳을 활성화한다는것을 보니 proxy같은 역할을 해주는 녀석이 service worker인가 보네요. 중요해 보이니 나중에 다시 찾아 봅시다.

> PushManager.subscribe().  
PushSubscription에 애플리케이션이 보내야 하는 push메시지를 담고, (엔드포인트와 암호화키가 필요)  
service worker는ServiceWorkerGlobalScope.onpush 라는 이벤트 핸들러로부터 전달되는 push 메시지를 처리하기 시작한다.  

아무에게나 push를 보내면 안되기 때문에 우리가 들어가는 페이지에서 구독을 받게 되는데, 그때 만들어지는 구독 정보가 서버쪽에 전달이 될테고 서버쪽에서는 이 정보를 갖고 있다가 나중에 보내야할 정보가 있을 때 같이 보내는 형태로 보입니다.

>각 요청은 capability URL:(당신의 애플리케이션)을 특정하여 엔드포인트를 구성하기 때문에 엔드포인트 URL은 보안에 신경을 써야 하며, 그렇지 않을 경우 다른 애플리케이션에서 당신의 애플리케이션에 push 메시지를 보낼 가능성도 있다.

엔드포인트 URL이 노출되지 않게 주의하라는 내용이군요.

>push 메시지를 전달하기 위해 service worker를 활성화하는 건, 리소스 사용이 늘어나는 결과를 가져오기 때문에, 특히 배터리 사용에 영향을 미친다.   
한편 push메시지 처리를 위해 브라우저 간 다른 스키마를 가지기 때문에, 표준화된 메커니즘이 없다. Firefox는 한정된 숫자(quota)만을 push 메시지로 보내도록 해 놓았다. 이러한 제한은 사이트에 방문할 때마다 초기화되며, Chrome은 제한이 없으며 모든 push 메시지가 보이도록 한다.

Firefox는 사이트를 한번 방문하고 나서 이후에 전송할 수 있는 푸시 메세지 개수의 한계가 있습니다. 다시 방문을 유도하지 않고서는 계속해서 Push를 보낼수는 없다는 이야기네요. 크롬은 그런 제한따위 두지 않겠다고합니다. 브라우저간의 표준이야기가 나오니 기능 호환성을 체크해 봅시다.

![search result]({{site.baseurl}}/assets/img/posts/2020-03-25_img2.png){: width="80%"}

OSX야 크게 기대를 하지는 않았습니다만 Android webview는 좀 아쉽네요. 아직까지는 Platform위에 직접 얹어지는 프로그램들에게 UX를 주려는 용도로만 사용할 수 있겠습니다.  

위에서 service worker를 통해서 push가 동작한다고 했으니 바로 service worker를 확인하러 가봅니다.

# Service Worker
<https://developer.mozilla.org/ko/docs/Web/API/Service_Worker_API>{:target="_blank"}

>Service worker는 기본적으로 웹 응용 프로그램, 브라우저 및 네트워크 (사용 가능한 경우) 사이에있는 프록시 서버의 역할을 합니다. 또한 효과적인 오프라인 환경을 만들고 네트워크 요청을 가로 채고 네트워크 사용 가능 여부에 따라 적절한 조치를 취하고 서버에있는 자산을 업데이트하기위한 것입니다. 또한 푸시 알림 및 백그라운드 동기화 API에 대한 액세스를 허용합니다.

역시 이녀석은 중요한 놈이었습니다. browser 같은 프로그램이 백그라운드에서 동작할 수 있도록 service를 working하게 해준다는 의미로 service worker라고 이름지은건 너무 당연해 보입니다.

>service worker는 작업자 컨텍스트(worker context)에서 실행되기 때문에 DOM 액세스가 없으며 앱에 권한을 부여하는 기본 JavaScript와는 다른 스레드에서 실행되므로 차단되지 않습니다. 완전 비동기로 설계되었습니다. 결과적으로 동기식 XHR 및 localStorage와 같은 API를 서비스 작업자 내부에서 사용할 수 없습니다.

DOM 접근이 안된답니다. DOM 주물럭거리는 재미로 개발하는 Frontend 작업에 DOM 접근을 못하게 하다니! 사실 이런 컨셉은 다른 플랫폼과 비슷한것 같습니다. 서비스 형태로 동작하는 모듈들은 태생적으로 다른 모듈들과 다른 life cycle을 갖는 경우가 많아서 이런식으로 직접 접근이 안되는 경우가 많습니다. 또한 완전 비동기라 비동기 코드를 사용해야 합니다. 실제 코드 작업해보시면 알겠지만 service worker안에서 동기식 코드를 쓰게되면 브라우저가 아무런 에러도 주지않고 그냥 멍때리고 있습니다. 주의가 필요합니다.

>서비스 작업자는 보안상의 이유로 HTTPS를 통해서만 실행됩니다. 네트워크 요청을 수정하면 중간 공격에서 사람에게 크게 개방 될 수 있습니다. Firefox에서는 Service Worker API도 숨겨져있어 사용자가 private browsing mode에있을 때 사용할 수 없습니다.

난관이 많네요.. 보통 local/http로 테스트하고 진행하는데 https를 통해서만 실행되니 https 서비스가 가능한 클라이언트용 서버가 필요할것 같습니다. 클라이언트가 https에서 동작한다고 하면 https(Client)가 http(Server)를 호출할 수 없으니 테스트용 서버도 역시 https서비스가 가능하도록 준비해야 할것 같습니다. 테스트를 위해서 준비해야 할 것들이 점점 많아지는 느낌입니다. 진짜 그정도로 쓸만한거야?

## 수명주기
service worker는 Registration을 포함하여 Download, Install, Activate라는 4단계의 수명주기를 가진다고 MDN에 적혀있긴 합니다만, MDN에 표기된 내용은 상태라기 보다는 동작과 상태를 섞어 표현해 두었기 때문에 좀 더 명확한 표기라고 생각되는 구글의 자료를 가져왔습니다.

![service worker lifecycle](https://developers.google.com/web/fundamentals/primers/service-workers/images/sw-lifecycle.png?hl=ko)
from <https://developers.google.com/web/fundamentals/primers/service-workers?hl=ko>{:target="_blank"}

- No Service Worker : 사용자가 페이지에 처음 엑세스 할 때 맞이하는 상태입니다. 이 때 동작하는 Service Worker를 확인하고 없다면 Register합니다.

- Installing : 등록시 지정한 위치에서 Service Worker 파일이(ex. service-worker.js) 다운로드되어 설치됩니다. 설치가 완료되면 Activate상태로 진행합니다. 
  - 기존 Service Worker 파일이 존재하는 상태에서 새로운 파일이 다운로드 되면 두 파일을 바이트 단위로 비교해서 차이가 나면 다른파일로 간주해서 Service Worker 업데이트 과정을 거치게됩니다.

- Activated : Service Worker의 설치가 완료되면 활성화가 되지만 바로 되지 않을수도 있습니다. 기존에 동작하던 Service Worker가 있는 경우, 해당 Service Worker가 사용되는 페이지가 더 존재하지 않는 시점에 새로운 Service Worker가 활성화 됩니다.   
  - Service Worker를 수정하게되면 기존 페이지들을 찾아서 모두 닫아주어야만 새로운 Service Worker가 활성화됩니다(저도 이걸 몰라서 꽤 애먹었었습니다). 아니면 ServiceWorkerGlobalScope.skipWaiting()를 사용하여 활성화가 바로 일어나게 하고 Clients.claim()을 직접 호출하여 현재 페이지에 적용되게 할수도 있습니다.

- Fetch/Message : Service Worker가 지정한 이벤트에 대해서 동작하고, 결과를 가져다주는 상태입니다.  

![fetch](https://mdn.mozillademos.org/files/12634/sw-fetch.png)
from <https://developer.mozilla.org/ko/docs/Web/API/Service_Worker_API/Using_Service_Workers>{:target="_blank"}

구글의 설명에서는 명시적으로 fetch/message상태라고 적어두어서 햇갈리긴 하지만, fetch 이벤트 같은 경우 위 그림과 같이 브라우저가 리소스를 요청(fetch)할 때 Service Worker가 요청을 대신 받아 저장되어 있던 cache를 돌려주는 등의 동작을 할때 사용합니다. 우리는 우리는 push를 구현하고 싶어하기 때문에 event는 fetch가 아니라 push입니다. 또한 사용자가 능동적으로 페이지를 요청할 때 하는 동작이 아니므로 event.respondWith로 결과를 돌려주어야 할 필요도 없습니다. 하지만 중간에서 Service Worker가 이벤트를 받아 처리하면 우리가 그 결과를 주물럭 거려야 한다는 의미에서는 같은 상태에서 이루어진다고 볼 수 있겠네요.

>첫번째 기본 예제를 만드는 방법을 보여주는 완전한 튜토리얼이 있습니다. [Using Service Workers](https://developer.mozilla.org/ko/docs/Web/API/Service_Worker_API/Using_Service_Workers).를 읽으세요.

MDN에서 tutorial을 제공해 주고 있기는 하지만 처음 시작할 때 검색 결과에 걸려있던 구글 문서를 한번 살펴보는게 좋을것 같습니다. 아직 블랙박스가 많아 보이거든요(service worker와의 통신등)...
