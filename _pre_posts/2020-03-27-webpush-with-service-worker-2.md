---
layout: post
title:  Service worker를 이용한 Web Push (2)
date: 2020-03-27 06:25
category: 
author: 
tags: [web, push]
summary: 
img: posts/2020-03-25_title.png
---

# Service Worker?
<https://developers.google.com/web/fundamentals/primers/service-workers?hl=ko>{:target="_blank"}  
구글의 서비스워커 소개에 좀 더 읽을만한 내용이 있습니다. 서비스 워커는 웹페이지나 사용자와 상호작용이 필요하지 않은 기능을 제공해 주기 위해서 만들어졌습니다. 이미 네이티브 앱에서는 당연하게 지원되는 기능들이지만 푸시나 백그라운드 동기화 같은 기능, 특히 오프라인 환경에서 서비스를 제공해 주기 위한 기능들은 기존 브라우저의 한계를 벗어난 새로운 역할이 필요로 했음을 짐작케 합니다. 아이폰과 안드로이드가 닮아가듯 요새 보면 점점 더 네이티브 환경은 웹을 닮아가고 웹은 네이티브 환경을 닮아가는 듯 합니다. 

PWA(Progressive Web Apps)에 대해서는 아래 내용들을 읽어보시면 재미있을것 같네요.
<https://medium.com/@MadeDesignbyMe/%EA%B5%AC%EA%B8%80%EC%9D%98-%ED%94%84%EB%A1%9C%EA%B7%B8%EB%A0%88%EC%8B%9C%EB%B8%8C-%EC%9B%B9-%EC%95%B1%EC%8A%A4%EB%A5%BC-%EC%95%84%EC%8B%AD%EB%8B%88%EA%B9%8C-8116f2766004>{:target="_blank"}  
<https://developers.google.com/web/fundamentals/codelabs/your-first-pwapp?hl=ko>{:target="_blank"}  


주기적 동기화와 지오펜싱 기능에 대한 언급이 있어서 찾아봤는데 주기적인 동기화는 이미 지원하는 브라우저들이 있고<https://whatwebcando.today/scheduler.html>{:target="_blank"} 지오펜싱은 아쉽게도 아무 벤더에서도 구현하지 않아 방치된 상태인가 봅니다. <https://whatwebcando.today/geofencing.html>{:target="_blank"}

이후 만들어볼 예제에 도움이 될만한 것들을 좀 정리해 봤습니다.

1. [GitHub 페이지](https://pages.github.com/){:target="_blank"}는 HTTPS를 통해 제공되기 때문에 데모를 호스팅하기 좋은 장소입니다.
2. chrome://inspect/#service-workers로 이동하여 사이트를 찾아 서비스 워커가 활성화되었는지 확인할 수 있습니다. 서비스워커 도입 초기에 디버깅용으로 사용하던 chrome://serviceworker-internals는 아직도 크롬에서 접근 가능합니다.
3. 앞서 MDN 문서에서도 언급되어 있듯, 별 생각없이 service worker내부에서 sync코드를 쓰고 수시간을 디버깅하는데 쓰는 삽질을 조심하세요.
> 설치 실패 알림 기능 부족 : 서비스 워커가 등록되더라도 chrome://inspect/#service-workers 또는 chrome://serviceworker-internals에 표시되지 않는 경우 오류가 발생했거나 event.waitUntil()에 거부된 프라미스를 전달했기 때문에 설치하지 못했을 수 있습니다.
4. 기본적으로 비 CORS는 실패함 : 일단 지금은 테스트이기 때문에 서버에서 Access-Control-allow-origin을 설정해서 진행해 보겠습니다.


# 웹 앱에 푸시 알림추가
<https://developers.google.com/web/fundamentals/codelabs/push-notifications?hl=ko>{:target="_blank"}
여기에 구글에서 친절하고 상세하고 작성해놓은 푸시 알림에 대한 예제가 있습니다. 하지만 저는 예제에서 나오는 크롬 웹서버를 사용하지 않고 node.js로 간단하게 서버를 만들어서 진행해 보도록 하겠습니다.

https://developer.mozilla.org/ko/docs/Web/Progressive_web_apps/Re-engageable_Notifications_Push
MDN에도 푸시에 대한 예제가 있습니다. 이 사이트들을 많이 참고 했습니다.

# Demo test
https://tisplay2devresource.z32.web.core.windows.net/test-webpush_client/test.html#