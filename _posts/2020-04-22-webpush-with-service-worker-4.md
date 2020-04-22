---
layout: post
title: Service worker를 이용한 Web Push (4)
date: 2020-04-22 18:41
category: 
author: 
tags: [web, push]
summary: 
img: posts/2020-04-22_title.jpg
---
이번엔 Push를 받아서 브라우저에서 사용할 수 있는 방법에 대해서 알아보겠습니다.  
service-worker를 업데이트 해야 하기 때문에 기존에 동작하던 service-worker의 unregister가 필요합니다. 서버를 실행시켜 client page의 개발자모드 > Application에 들어가 localhost의 service-worker를 Unregister합니다.

```shell
>node server.js
```
![]({{site.baseurl}}/assets/img/posts/2020-04-22_img1.png)

이제 서버를 종료하고 service-worker를 업데이트 해야합니다. sketcher쪽에서 타이틀, 메세지, 이미지 주소를 보내 브라우저에서 보이도록 해봅시다.

(sketcher)index.html
```html
<html>
    <body>
        <form action="/push/notify" method="post">
            TITLE <input type="text" name="title"><BR>
            MESSAGE <input type="text" name="message"><BR>
            IMAGE URL <input type="text" name="image_url">
            <button type="submit">보내기</button>
        </form>
    </body>
</html>
```

server.js의 notify쪽 에서 POST로 받아온 image_url값을 전달하도록 추가합니다.
```javascript
// 3. 등록된 브라우저 들에게 푸시를 보내는 POST
app.post('/push/notify', (req, res) => {
    console.log(`-------------------------------------------`);
    console.log(`notify requested : ${JSON.stringify(req.body)}`);
    let payload = {};
    payload.title = req.body.title;
    payload.message = req.body.message;
    payload.image_url = req.body.image_url; //<--

    for(const subs of temp_subs){
        webpush.sendNotification(subs, JSON.stringify(payload))
        .then( (response) => {
            console.log('sent notification');
            res.sendStatus(201);
        }).catch( (err) => {
            console.error(`notification error : ${err}`);
            res.sendStatus(500);
        });
    }
});
```

client가 다운로드하여 동작시킬 service-worker가, 메세지를 받아 브라우저에서 불리는 스크립트에 전달할 수 있도록 하는 내용을 추가해 줍니다. 현재 클라이언트들 중 조건에 맞는 것을 찾아 postMessage함수를 통해 데이터를 전달합니다. MDN의 [matchAll()](https://developer.mozilla.org/en-US/docs/Web/API/Clients/matchAll)을 보면 파라미터들에 대한 설명이 있습니다.

> includeUncontrolled: A Boolean — true로 설정되면, matching operation가 현재 서비스워커와 동일한 origin을 공유하는 모든 서비스워커 클라이언트를 반환한다. 그렇지 않으면(false이면) 현재 서비스워커로 컨트롤되는 서비스워커 클라이언트만 반환한다. 기본값은 false  
type: Sets the type of clients you want matched. Available values are "window", "worker", "sharedworker", and "all". The default is "all".

includeUncontrolled가 기본값인 false로 설정되어 있으면 window타입의 클라이언트가 아닌 현재 서비스워크로 컨트롤되는 서비스워커 클라이언트가 반환됩니다. 우리는 window client에서 값을 받아 처리하고 싶기 때문에 includeUncontrolled를 true로 설정해줍니다. 그리고 origin을 공유하는 클라이언트들에게 postMessage로 data를 전달합니다.

service-worker.js
```javascript
self.addEventListener('push', function (event) {
    const data = JSON.parse(event.data.text());
    
    event.waitUntil( async function() {
        for (const client of await self.clients.matchAll({includeUncontrolled: true})) {
            client.postMessage(data);
        }

        self.registration.showNotification( data.title, {
            body: data.message
        })
    }());

});
```

클라이언트에서 받아 처리하는 부분이 필요하겠죠? navigator.serviceWorker.addEventListener의 'message' 이벤트를 통해 서비스워커로부터 받은 메세지를 처리할 수 있습니다. 제목과 내용을 넣고, img에 src를 지정하도록 해줍니다.

client.js
```javascript
    navigator.serviceWorker.addEventListener('message', function(event) {
        console.log("Got Reply from service worker:", event.data);
        document.querySelector('.title').innerText = event.data.title;
        document.querySelector('.message').innerText = event.data.message;
        document.querySelector('.result_image').src = event.data.image_url;
    });
```

(client)index.html
```html
<html>
    <head>
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
        <a class="btn_subscribe" id="subscribe">구독</a><br>
        Public KEY : <span id="receivedPubKey">-</span><br>
        <script src="client.js"></script>
        <h3>PUSH 내용</h3>
        TITLE : <span class="title"></span><BR>
        MESSAGE : <span class="message"></span><BR>
        <img class="result_image" alt="Not Yet Recieved">
    </body>
</html>
```

서버를 실행시키고 구독만 해놓은 상태입니다.  
![]({{site.baseurl}}/assets/img/posts/2020-04-22_img2.png)

sketcher에서 내용과 이미지 주소를 입력후 보내기!  
![]({{site.baseurl}}/assets/img/posts/2020-04-22_img3.png)

푸시 팝업이 보이면서 동시에 브라우저에서 푸시 내용이 업데이트 됩니다.  
![]({{site.baseurl}}/assets/img/posts/2020-04-22_img4.png)

※ CODE - https://github.com/transpine/webpush-with-service-worker-simulator

여기까지 service-worker를 이용한 기본적인 webpush를 알아보고 만들어 봤습니다. 아직까지 많은 기능이 지원되는 않고, 브라우저들이 모두 지원하지는 않는 내용이라서 범용성이 떨어지는것도 사실입니다. 하지만 윈도우나 OSX의 OS 레벨에서의 알림 지원이 계속되고 있고 safari나 chrome에서도 지원을 계속하고 있는 만큼 앞으로의 커버리지가 더 궁금해지는 기술이었습니다.