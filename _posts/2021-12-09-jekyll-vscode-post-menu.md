---
layout: post
title: vscode에서 Jekyll 포스트 작성시 템플릿 사용하기
date: 2021-12-09 23:45
category: [Tools]
author: JayD.Kang 
tags: []
summary:
img: posts/2021-12-09-title.png
---

포스트 작성시에 매번 파일을 복사해서 템플릿을 수정하는것이 번거로웠다. 특히 날짜와 시간은 더욱더.  
vscode로 글을 작성하기에 extension을 찾아 보았다. 

jekyll로 검색하면 jekyll-post이라는 이름이 하나 보인다.

![]({{site.baseurl}}/assets/img/posts/2021-12-09-img1.png)  
- 장점 : 자동으로 파일명과 날짜, 시간을 채워준다.
- 단점 : <font color="red">.post-template파일 안의 내용까지 원하는대로 변경해주지는 않는다.</font>

나는 타이틀 이미지와 포스트 중간에 들어가는 이미지도 날짜-파일명.png의 규칙으로 사용하기 때문에  
파일 안의 날짜, 시간 + 템플릿내용으로 custom하고 싶으니 이건 선택할 수 없다. (github이 있지만 수정해서 사용하는건 귀찮다.ㅠ)

다시 template으로 검색해서 제일 위에 보이는것을 설치한다.

![]({{site.baseurl}}/assets/img/posts/2021-12-09-img2.png)  
- 장점
  - 변수를 통해 내가 원하는 내용을 입력하는대로 매번 파일명, 파일 내용에 적용 가능하다.
  - callback 처럼 template.config.js에서 변경될 값을 수정할수도 있다(일부만).
- 단점
  - custom값을 입력하는 과정 몇단계가 더 추가된다.
  - 파일명에 날짜를 추가할 수 없었다.

## 설정
- .templates > $$var_POST.md 파일을 만든다.
  - 날짜를 var_date, 시각을 var_time이라는 변수명으로 정했다.
  - 타이틀 이미지와 반복해서 사용하는 image의 주소를 template에 추가하였다.
  
```
---
layout: post
title: 제목
date: var_date var_time
category: [Machine Learning, Svelte, Tools, Web]
author: JayD.Kang 
tags: []
summary: 
img: posts/var_date-title.png
---

![]({{site.baseurl}}/assets/img/posts/var_date-img1.png)
```

- template.config.js파일을 수정한다.

```javascript
  ...
  replaceFileTextFn: (fileText, templateName, utils) => {
    // @see https://www.npmjs.com/package/change-case
    const { changeCase } = utils;
    // You can change the text in the file
    const datetime = new Date();
    const month = `${datetime.getMonth()+1}`.padStart(2, '0');
    const date = `${datetime.getDate()}`.padStart(2, '0');

    const hour = `${datetime.getHours()}`.padStart(2, '0');
    const min = `${datetime.getMinutes()}`.padStart(2, '0');

    const dateString = `${datetime.getFullYear()}-${month}-${date}`;
    const timeString = `${hour}:${min}`;

    return fileText
      .replace(/var_date/g, dateString )  //날짜 치환
      .replace(/var_time/g, timeString )  //시각 치환
      .replace(/__templateName__/g, templateName)
      .replace(
        /__templateNameToPascalCase__/g,
        changeCase.pascalCase(templateName)
      )
      .replace(
        /__templateNameToParamCase__/g,
        changeCase.paramCase(templateName)
      );
  },
  ...
```

## 사용
- 파일을 만들 폴더 위에서 context menu를 열거나   
  위에서ctrl+shift+P로 command pallete를 열어 template을 입력해서 Template: Create New를 선택한다.  
  아니면 그냥 단축키 ctrl+alt+T를 눌러도 된다.  
![]({{site.baseurl}}/assets/img/posts/2021-12-09-img3.png)<br>  
![]({{site.baseurl}}/assets/img/posts/2021-12-09-img4.png)<br>  
![]({{site.baseurl}}/assets/img/posts/2021-12-09-img5.png)  
※ 확장자 md는 입력하지 않는다.

- 그럼 아래와 같이 템플릿이 잘 만들어진다. 이제 글만 잘쓰면 된다.  
![]({{site.baseurl}}/assets/img/posts/2021-12-09-img6.png)