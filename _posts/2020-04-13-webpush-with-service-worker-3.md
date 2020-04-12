---
layout: post
title: Service worker를 이용한 Web Push (3)
date: 2020-04-13 00:52
category: 
author: 
tags: [web, push]
summary: 
img: posts/2020-04-13_img8.png
---
# References
[여기](https://developers.google.com/web/fundamentals/codelabs/push-notifications?hl=ko)에 구글에서 친절하고 상세하고 작성해놓은 푸시 알림에 대한 예제가 있습니다. 하지만 저는 예제에서 나오는 크롬 웹서버를 사용하지 않고 node.js로 간단하게 서버를 만들어서 진행해 보도록 하겠습니다.

[MDN](https://developer.mozilla.org/ko/docs/Web/Progressive_web_apps/Re-engageable_Notifications_Push)에도 푸시에 대한 예제가 있습니다. 이 사이트들을 많이 참고 했습니다.

# Server
이미 github/npm에 node.js용 web-push가 올라가 있습니다. <https://github.com/web-push-libs/web-push> 이제는 아는게 중요한게 아니라 어디에 있는지와 어떻게 쓰는지가 훨씬 중요한 시대 같습니다.

간단하게 서버를 만드는 것부터 시작해야 하는데 앞서 살펴본 내용중 https가 필요하다는 내용이 있었으니 인증서를 구해야합니다.
[let's encrypt](https://letsencrypt.org/ko/)에서 받거나 기존에 발급 받아놓은 인증서가 있어도 사용 가능하지만 여기서는 [mkcert](https://github.com/FiloSottile/mkcert)라는 것을 사용해 보겠습니다.

> mkcert is a simple tool for making locally-trusted development certificates. It requires no configuration.

간단한 설정으로 local에서 사용할 수 있는 인증서를 만들어주거나 설치해 주는 툴입니다. 현재 저는 윈도우 환경에서 글을 작성하고 있어서 [pre-built binary](https://github.com/FiloSottile/mkcert/releases)를 사용하겠습니다. 다운로드한 mkcert-v0.0.0-windows.amd64.exe는 CLI에서 사용가능합니다. 

```
>mkcert-v1.4.1-windows-amd64.exe -install
>mkcert-v1.4.1-windows-amd64.exe localhost 127.0.0.1 ::1
```

입력하게되면 현재 경로에 localhost-key+3.pem과 localhost+3.pem가 생깁니다. +3은 3개의 host를 지원한다는 거겠죠? 이 파일들을 읽어 https모듈쪽에 옵션으로 전달해주면 됩니다.

그럼 간단한 https 서버를 만들어 확인 해 보겠습니다.

server.js
```javascript
const express = require('express');
const https = require('https');
const fs = require('fs');

var cors = require('cors'); 

const port = process.env.PORT || 4999;

const app = express();

app.use(cors());    //cross origin 허용
app.use(express.json());    //json사용
app.use(express.urlencoded({ extended: true})); //body-parse사용

app.get('/', (req, res) =>{
    res.send("Web Push Server");
});

const options = {
    cert: fs.readFileSync('localhost+3.pem'),
    key: fs.readFileSync('localhost+3-key.pem')
};  

https.createServer(options, app).listen( port, () => {
    console.log(`webpush server running, port:${port}`);
});
```
서버를 실행해 봅니다.   
```shell
>node server.js
webpush server running, port:4999
```
정상적으로 인증서가 적용되어 서버가 구동되었다면  
![]({{site.baseurl}}/assets/img/posts/2020-04-13_img2.png)  
처럼 주소 왼쪽에 자물쇠 모양이 보이면서 서버에 접속할 수 있습니다.

![]({{site.baseurl}}/assets/img/posts/2020-04-13_img1.png)  
인증서가 제대로 적용되지 않으면 이렇게 에러가 보입니다.

https서버가 준비되었으니 본격적으로 web-push 내용을 추가해봅시다.

```javascript
var webpush = require('web-push');
const express = require('express');
const https = require('https');
const fs = require('fs');

var cors = require('cors'); 

const port = process.env.PORT || 4999;

const app = express();

app.use(cors());    //cross origin 허용
app.use(express.json());    //json사용
app.use(express.urlencoded({ extended: true})); //body-parse사용

app.use('/client', express.static('client'));       //구독 페이지
app.use('/sketcher', express.static('sketcher'));   //Push 전송 페이지

app.get('/', (req, res) =>{
    res.send("Web Push Server");
});

const options = {
    cert: fs.readFileSync('localhost+3.pem'),
    key: fs.readFileSync('localhost+3-key.pem')
};  

const vapidKeys = webpush.generateVAPIDKeys();
webpush.setVapidDetails(
    'mailto:transpine@gmail.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

// 1. service-worker의 pushManager가 Registration을 하기 위한  키를 받아오는 GET
app.get('/push/key', (req, res) => {
    console.log(`publick key sent: ${vapidKeys.publicKey}`);
    res.send({
        key: vapidKeys.publicKey
    });
});

// 2. 구독 POST
const temp_subs = [];
app.post('/push/subscribe', (req, res) => {
    temp_subs.push(req.body.subscription);
    console.log(`subscribed : ${JSON.stringify(req.body.subscription)}`);
    res.send('Subscribed');
});

// 3. 등록된 service-worker들에게 푸시를 보내는 POST
app.post('/push/notify', (req, res) => {
    console.log(`-------------------------------------------`);
    console.log(`notify requested : ${JSON.stringify(req.body)}`);
    let payload = {};
    payload.title = req.body.title;
    payload.message = req.body.message;

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

https.createServer(options, app).listen( port, () => {
    console.log(`webpush server running, port:${port}`);
});
```

3개의 API로 이루어져 있습니다.
1. service-worker의 pushManager가 Registration을 하기 위한  키를 받아오는 GET
2. 구독 POST
3. 등록된 service-worker들에게 푸시를 보내는 POST

우리는 서버를 실행시키고 클라이언트라는 주소의 창에서 service-worker를 등록하고 sketcher라는 주소의 창을 열어 푸시를 보낼겁니다. 클라이언트가 키를 받아와서(1) 구독하고(2) sketcher가 푸시를 보내는것이죠(3). 실제 product에서는 구독을 받게되면 DB에 구독정보를 저장하겠지만 우리는 간단한 버젼이니 temp_subs에 subscription정보를 저장해둘것입니다.

Push를 구독할 Client를 만들어 보겠습니다. 먼저 구독버튼과 받아온 public key를 보여주도록 구성합니다.
```html
<html>
    <head>
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
        <a class="btn_subscribe" id="subscribe">구독</a><br>
        Public KEY : <span id="receivedPubKey">-</span><br>
        <script src="client.js"></script>
    </body>
</html>
```
client.js
```javascript
// 1. service-worker 다운로드하여 등록
function registerPush(appPubkey) {
    navigator.serviceWorker.register('service-worker.js').then( (registration) =>{
        console.log("service worker Registered / getSubscription");

        return registration.pushManager.getSubscription()
            .then(function(subscription) {
                if (subscription) {
                    return subscription;
                }

                return registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(appPubkey)
                });
            }) 
            // 2. 구독 API호출하여 subscription정보를 전송
            .then(function(subscription) {
                console.log('post subscription : ', subscription);
                mysubscription = subscription;
                return fetch('https://127.0.0.1:4999/push/subscribe', {
                    method: 'post',
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify({ subscription: subscription })
                });
            }).catch( (error) =>{
                console.err(`subscription error : ${error}`);
            });        
    }).catch(function (err) {
        console.log("Service Worker Failed to Register", err);
    });    
}

function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i)  {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}

// 3. serviceWorker가 등록되어 있는지 확인하고 없으면 등록시작
document.querySelector('#subscribe').onclick = () =>{
    if (navigator.serviceWorker) {
        fetch('https://127.0.0.1:4999/push/key')
        .then( e => e.json()).then( (result) =>{
            document.querySelector('#receivedPubKey').innerText = result.key;
            registerPush(result.key);
        });
    }    
}
```
client.js에서는 구독 버튼을 눌렀을 때 현재 브라우저에 serviceWorker가 등록되어 있는지 확인하고 등록되어 있지 않으면 등록 절차를 시작합니다(3).  
service-worker등록이 시작되면 service-worker를 지정되어 있는 서버에서 다운로드후 등록합니다(1). 우리는 service-worker.js를 클라이언트와 동일한 주소에 넣고 다운로드 시키지만 service-worker만 따로 주소를 지정하여 다운로드해 올수도 있습니다. (register(service-worker.js)부분). 
pushManager로 부터 subscription정보를 받아오면 해당 정보를 서버에 전송하여 구독을 진행합니다.(3)

service-worker.js
```javascript
self.addEventListener('push', function (event) {
    const data = JSON.parse(event.data.text());
    
    event.waitUntil( async function() {
        self.registration.showNotification( data.title, {
            body: data.message
        })
    }());

});
```
service-worker에서는 push이벤트를 등록해두고 push가 발생하면 showNotification을 사용하여 PC에 타이틀과 내용으로 구성된 팝업형태의 notification을 보여주도록 해두었습니다.

style.css
```css
.btn_subscribe{
    background-color: antiquewhite;
    border:1px solid gray;
    padding: 2px;
    cursor: pointer;
}
```
push 보내는 쪽은 간단합니다. post로 제목과 내용만 넣어서 보내도록 하겠습니다.
```html
<html>
    <body>
        <form action="/push/notify" method="post">
            <input type="text" name="title">
            <input type="text" name="message">
            <button type="submit">보내기</button>
        </form>
    </body>
</html>
```

**※ Push API는 현재 크롬의 시크릿모드에서는 동작하지 않습니다.** 


이제 실제로 동작만 확인해보면 됩니다.
창을 3개를 동시에 열어서 보는것이 편합니다. 앞에서 이야기했듯이 service-worker가 등록되지 않는것을 확인하기 힘들기 때문에 chrome://inspect/#service-workers창을 열어 보면서 진행하는것이 좋기 때문입니다. 또한 브라우저(크롬) 디버그 창에서 servicw worker를 수동으로 업데이트하거나 unregister도 가능하게 해두었기 때문에 그것도 보면서 진행하면 좋습니다.

먼저 service-worker창을 열면 이렇게 아무것도 보이지 않습니다. 혹은 다른 service-worker가 보일수도 있습니다만 주소가 표시되는 부분을 잘 보시면서 원하는 service-worker가 맞는지 잘 구분 하세요. 이 창은 현재 열린창(탭)들에서 사용중인 service-worker들만을 보여줍니다.
![]({{site.baseurl}}/assets/img/posts/2020-04-13_img3.png)  

Client창입니다. F12를 눌러 Application탭에 들어가 보면 Service Workers라는 메뉴가 있습니다. Service workers from other origins를 눌러보시면 현재 사이트 뿐만 아니라 등록되어 있는 모든 service-worker들을 볼 수 있습니다. 정상적으로 구독이 되면 우리가 작업하는 service-worker도 표시가 될것입니다.
![]({{site.baseurl}}/assets/img/posts/2020-04-13_img4.png)  

Client창에서 구독 버튼을 눌러봅니다.  
![]({{site.baseurl}}/assets/img/posts/2020-04-13_img6.png)  
이렇게 console에 subscription정보가 찍히고 Service Worker에 우리가 만든 service worker가 등록되어 보이게 됩니다.
여기서 Push를 보내거나 sync를 테스트할수도 있습니다.

성공적으로 service-worker가 등록되었으니 크롬의 inspect창에도 우리가 만든 service worker가 보여야합니다.
만일 보이지 않는다면 service-worker.js가 제대로 다운로드 되었는지, 코드에서 에러가 없었는지 등을 확인 후 Client창에서 unregister를 직접눌러 unregister한후에 다시 페이지를 로드하고 구독버튼을 눌러 등록이 잘 되는지 살펴보세요.   
![]({{site.baseurl}}/assets/img/posts/2020-04-13_img5.png)  

마지막으로 sketcher를 열어 push를 보내보면  
![]({{site.baseurl}}/assets/img/posts/2020-04-13_img7.png)  

짜잔. Push가 잘 도착했습니다~♬  
![]({{site.baseurl}}/assets/img/posts/2020-04-13_img8.png)

여기까지 일반적인 Push의 사용이었구요. Push를 받아 브라우저에서 사용할 수 있도록 넘겨주는까지는 해봐야할것 같습니다. 
도착한 push에서 정보를 받아 브라우저에서 사용할 수 있는 방법은 다음글에서 연구해보겠습니다.