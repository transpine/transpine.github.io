---
layout: post
title: Dynamic Route Page에서 BottomSheet 사용
date: 2021-12-19 23:29
category: [Flutter]
author: JayD.Kang 
tags: [Flutter]
summary: 
img: posts/2021-12-19-title.png
---

BottomSheet을 만들기 위해 예제들을 찾아보면 보통  
1) flag로 제어해서 widget을 return해주거나
2) callback형태로 showBottomSheet을 호출하는 형태

가 있는것 같다. 굳이 flag를 두고 제어할 필요가 없는것 같아서 2)의 형태로  
작업하다 보니 of(context)에서 context를 받아오지 못한다. 

```
======== Exception caught by gesture ===============================================================
The following assertion was thrown while handling a gesture:
Scaffold.of() called with a context that does not contain a Scaffold.

No Scaffold ancestor could be found starting from the context that was passed to Scaffold.of(). This usually happens when the context provided is from the same StatefulWidget as that whose build function actually creates the Scaffold widget being sought.

There are several ways to avoid this problem. The simplest is to use a Builder to get a context that is "under" the Scaffold. For an example of this, please see the documentation for Scaffold.of():
  https://api.flutter.dev/flutter/material/Scaffold/of.html
A more efficient solution is to split your build function into several widgets. This introduces a new context from which you can obtain the Scaffold. In this solution, you would have an outer widget that creates the Scaffold populated by instances of your new inner widgets, and then in these inner widgets you would use Scaffold.of().
A less elegant but more expedient solution is assign a GlobalKey to the Scaffold, then use the key.currentState property to obtain the ScaffoldState rather than using the Scaffold.of() function.
```

context에 Scaffold가 없다는 것이다. Dynamic Route를 위해서 각 페이지별로 Scaffold를 만들어  
return하도록 구성되어 있는경우 callback에서 context를 접근하는경우 context에 scaffold가   
만들어지지 않아 발생하는 문제로 보인다.

찾아보니 scaffold에 GlobalKey&lt;ScaffoldState&gt;를 주고 해당 키를 통해 scaffold에 접근하여  
bottomSheet을 만드는 방법이 있었다. ([https://stackoverflow.com/a/56220850](https://stackoverflow.com/a/56220850))

1. State class에 key를 추가한다.
```dart
final _scaffoldKey = GlobalKey<ScaffoldState>();
```

2. Scaffold에 key를 할당한다.
```dart
Scaffold(
  key: _scaffoldKey,
  ...
  child: [
      ElevatedButton(onPressed: _showBottomSheetCallback, child: Text("BottomSheet"))
  ]
```
3. callback에서 key를 통해 showBottomSheet을 호출한다.
```dart
_showPersistentBottomSheet(){
  _scaffoldKey.currentState?.showBottomSheet((context){
        return BottomSheetContent();  //bottomSheet에 들어갈 widget
      }).closed.whenComplete(() {
        if (mounted) {
          setState(() {
            _showBottomSheetCallback = _showPersistentBottomSheet;  //재호출
          });
        }
      });
}
```

### 적용
![]({{site.baseurl}}/assets/img/posts/2021-12-19-img1.gif)
