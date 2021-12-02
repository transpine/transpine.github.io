---
layout: post
title: Column Selection(Multi Cursor)
date: 2021-12-02 22:54
category: [Tools]
author: 
tags: [IDE]
summary: 
img: posts/2021-12-02-img1.png
---

vscode에는 multi cursor라는 기능이 있다. 개발시 수시로 사용하는 것으로, 없었다면 내 시간의 매우 많은 부분을 낭비했을 훌륭한 기능이다.

편집중 alt키(mac은 option)와 마우스 클릭혹은 방향키를 눌러 여러개의 커서를 동시에 만들고 같은 내용을 동시에 수정할 수 있다.
Shift, Ctrl키와의 조합도 가능하므로 잘만 쓰면 regular expression을 굳이 안써도 된다.

하지만 jetbrain IDE(Android Studio)에서도 이런 기능이 지원하던가?

안될리가 없다.

android studio에서는 Column Selection Mode라고 부른다.

## 1. 키보드로 Column Selection 모드 켜고 편집하기

  Normal Selection 모드에서는 오른쪽 하단 Carret표시 부분에 아무런 표시도 되어있지 않지만

![]({{site.baseurl}}/assets/img/posts/2021-12-02-img2.png)

alt + shift + insert를 눌러 Column Selection Mode에 진입하면 아래처럼 Column이라는 글자가 나타난다.

![]({{site.baseurl}}/assets/img/posts/2021-12-02-img3.png)

모드가 켜지고 나면 vscode와 마찬가지로 여러개의 커서로 선택을 할 수 있다. 

![]({{site.baseurl}}/assets/img/posts/2021-12-02-img1.png)

- 현재 위치의 위, 아래 부분을 선택하려면 shift를 누른채 방향키로 선택한다.

- 라인을 건너뛰어 다른 라인을 선택하려면 alt+shift+ctrl을 누른채로 해당 라인을 선택한다.

- 좌, 우 이동은 vscode와 동일하게 ctrl이나 방향키를 이용하여 이동 가능하다(ctrl+w를 통해 word단위로도 이동 가능하다.)

<font color="crimson">※ 붙여넣기를 할 때 유의할 점이 있다.</font>

위에서 column 모드를 켜고 복사를 했기 때문에 그대로 붙여넣기 할 위치로 이동해서 붙여넣기 하면

![]({{site.baseurl}}/assets/img/posts/2021-12-02-img4.png)

이처럼 커서가 하나인데도 불구하고 복사되어 있는 라인의 개수만큼 overrite가 되어 버린다.

원하는대로 현재 라인 이후에 모두 붙여넣기 하고 싶다면 다시 alt+shift+insert를 눌러 column mode를 해제하고 난 이후에 붙여넣기 하면 된다.

![]({{site.baseurl}}/assets/img/posts/2021-12-02-img5.png)

## 2. 마우스로 편집하기
   
ctrl+alt를 누른채로 마우스로 선택하면 된다. 

라인을 건너뛰어 새로운 라인을 추가하고 싶다면 shift를 눌러 원하는 영역을 드래그하면 된다.

<font color="crimson">※ 여기서도 유의할 점이 있다. </font>

ctrl+alt는 심볼정의로 이동하는 단축키이다. 

애써 영역을 선택해놓고 심볼을 눌러 버려 이동하게되면 선택해 두었던 블록이 전부 풀려버린다(!!..**WTF**)

## 결론

지원은 한다. vscode와 거의 동일한 기능으로 사용은 가능하다. 하지만 매우 불편하다. 


alt키를 base로 하여 키조합을 가능하게 하고 현재 선택된 영역, 붙여넣기 될 영역을 caret으로 인지할 수 있게 해놓은 vscode에 비해,

진입과정도 복잡하고 다른 기능과 겹쳐 selection이 풀릴 수도 있는 jetbrain IDE의 선택모드는 작업중 화를 초래한다. <u>건강하려면 최소한의 기능만 사용하라.</u>

