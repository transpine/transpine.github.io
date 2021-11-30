---
layout: post
title: Android Studio 실행시 Address already in use가 나올경우
date: 2021-11-26 23:58
category: [Flutter]
author: 
tags: [IDE]
summary: 
img: posts/2021-11-27_img1.png
---

Android Studio 실행시 
```
internal error. Please refer to https://jb.gg/ide/critical-startup-erros
...
Address already in use: bind
```
와 같은 에러가 나오는 경우가 있다. 위에 언급된 [https://jb.gg/ide/critical-startup-erros](https://jb.gg/ide/critical-startup-erros)를 찾아가 보면
[https://youtrack.jetbrains.com/issue/IDEA-238995](https://youtrack.jetbrains.com/issue/IDEA-238995)를 참고하라고 한다. 해당 쓰레드에

>it tries to bind on the first available port between 6942 and 6991

>Hyper-V reserving the huge range of ports

따위의 언급이 있다. 나는 현재 환경에서 docker, wsl2등을 위해 hyper-v를 사용중인데 이 녀석이 포트를 선점한다는 뜻이다.

[https://github.com/docker/for-win/issues/3171](https://github.com/docker/for-win/issues/3171)를 참고하자.

Powershell을 관리자 권한으로 실행하고 아래 커맨드를 실행하자.
AndroidStudio를 여러개 instance로 실행하는 경우가 있어 numberofports는 10으로 잡아주었다.

```shell
#hyper-v 비활성화. 재부팅 한다.
dism.exe /Online /Disable-Feature:Microsoft-Hyper-V

#이러면 6942로 부터 10개의 포트는 선점하지 못한다.
netsh int ipv4 add excludedportrange protocol=tcp startport=6942 numberofports=10

#hyper-v 활성화. 재부팅 한다.
dism.exe /Online /Enable-Feature:Microsoft-Hyper-V /All
```

