---
layout: post
title:  Service worker를 이용한 Web Push (3)
date: 2020-03-27 06:25
category: 
author: 
tags: [web, push]
summary: 
img: posts/2020-04-02_title.png
---

# References
[여기](https://developers.google.com/web/fundamentals/codelabs/push-notifications?hl=ko){:target="_blank"}에 구글에서 친절하고 상세하고 작성해놓은 푸시 알림에 대한 예제가 있습니다. 하지만 저는 예제에서 나오는 크롬 웹서버를 사용하지 않고 node.js로 간단하게 서버를 만들어서 진행해 보도록 하겠습니다.

[MDN](https://developer.mozilla.org/ko/docs/Web/Progressive_web_apps/Re-engageable_Notifications_Push)에도 푸시에 대한 예제가 있습니다. 이 사이트들을 많이 참고 했습니다.

# Server
이미 github/npm에 node.js용 web-push가 올라가 있습니다. <https://github.com/web-push-libs/web-push>{:target="_blank"} 이제는 아는게 중요한게 아니라 어디에 있는지와 어떻게 쓰는지가 훨씬 중요한 시대 같습니다.

간단하게 서버를 만드는 것부터 시작해야 하는데 앞서 살펴본 내용중 https가 필요하다는 내용이 있었으니 인증서를 구해야합니다.
[let's encrypt](https://letsencrypt.org/ko/)에서 받거나 기존에 발급 받아놓은 인증서가 있어도 사용 가능하지만 여기서는 [mkcert](https://github.com/FiloSottile/mkcert)라는 것을 사용해 보겠습니다.

> mkcert is a simple tool for making locally-trusted development certificates. It requires no configuration.

간단한 설정으로 local에서 사용할 수 있는 인증서를 만들어주거나 설치해 주는 툴입니다. 현재 저는 윈도우 환경에서 글을 작성하고 있어서 [pre-built binary](https://github.com/FiloSottile/mkcert/releases)를 사용하겠습니다. 다운로드한 mkcert-v0.0.0-windows.amd64.exe는 CLI에서 사용가능합니다. 

```
>mkcert-v1.4.1-windows-amd64.exe localhost
```

입력하게되면 현재 경로에 localhost-key.pem과 localhost.pem가 생깁니다. 이 파일들을 읽어 https모듈쪽에 옵션으로 전달해주면 됩니다.

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
    cert: fs.readFileSync('localhost.pem'),
    key: fs.readFileSync('localhost-key.pem')
};  

https.createServer(options, app).listen( port, () => {
    console.log(`webpush server running, port:${port}`);
});
```
실행해보면   
```
>node server.js
webpush server running, port:4999
```
![]({{site.baseurl}}/assets/img/posts/2020-03-27_img1.png)

와 같이 나오지만 테스트중이기 때문에 가뿐히 무시하고 "고급 > localhost(안전하지 않음)(으)로 이동"을 눌러 이동하면 아래와 같이 동작하는 모습을 볼 수 있을것입니다.

![]({{site.baseurl}}/assets/img/posts/2020-03-27_img2.png)

https서버가 준비되었으니 본격적으로 web-push 내용을 추가해봅시다.

```javascript

```





https://tisplay2devresource.z32.web.core.windows.net/test-webpush_client/test.html#