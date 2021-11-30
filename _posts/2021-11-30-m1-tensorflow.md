---
layout: post
title: Apple Silicon (M1Pro)에서 tensorflow 실행하기
date: 2021-11-30 21:20
category: [Machine Learning]
author: 
tags: [ML]
summary: 
img: posts/2021-11-30-img2.png
---

1] anaconda가 필요하다. apple에서 miniconda로 환경을 배포하고 있기 때문이다.
- https://www.anaconda.com/products/individual
- 나는 Python 3.9 • 64-Bit Graphical Installer • 515 MB 로 설치하였다.

2] 설치가 되었으면 apple에서 가이드하는 페이지를 보고 그대로 따라하면 된다.
- [Getting Started with tensorflow-metal PluggableDevice](https://developer.apple.com/metal/tensorflow-plugin/)

3] 중간에 Conda env부분을 눌러 다운로드 받은 스크립트를 실행하고 나면 ~/miniforge3 경로에 가상 환경이 만들어진다.

4] tensorflow-macos,  tensorflow-metal까지 설치하고 나면 완료.
하지만 이대로 설치하면 numpy 1.9.6이 설치되는데 버전이 맞지 않다고 나온다.
```
python -m pip install numpy==1.19.2
```
로 다시 설치해주면 된다.

5] 정상적으로 설치되어 실행하면 아래와 같은 로그와 GPU 사용량을 확인할 수 있다. 
![결과]({{site.baseurl}}/assets/img/posts/2021-11-30-img1.png)

![결과]({{site.baseurl}}/assets/img/posts/2021-11-30-img2.png){: width="30%"}

6] intel mac에서 plaid-ml로 사용하던 것보다는 훨씬 빠른것 같다. 간단한 테스트용으로 사용하면 나쁘지 않을것 같다.
