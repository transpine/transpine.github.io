---
layout: post
title: svelte SASS 설정
date: 2021-12-10 00:35
category: [Svelte]
author: JayD.Kang 
tags: []
summary: 
img: 
---

css가 나한테 제일 불편한 건 변수사용, cascade가 되지 않는다는 점이다.  
sass를 적용하기 위해서 찾아보니 scss를 번들링해서 indexl.html파일에 넣는 방식,   
preprocess시 scss를 로드해서 번들링하는 방식등이 있었다.

하지만 3.44.2 버전 기준으로 간단하게 적용하는 방법이 있다.  
rollup.config.js안에 preprocess만 추가해주면 된다. 

먼저 필요한 플러그인을 설치합니다.

```sheel
npm i sass rollup-plugin-scss --save-dev
```

```javascript
import sveltePreProcess from 'svelte-preprocess';

...
plugins: [
		svelte({
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production,
			},
			preprocess: sveltePreProcess(),
		}),

...
```   

## 사용-inline
```html
<style lang="scss">
	$primary-color: #ff3e00;

	h1 {
		color: $primary-color;
	}
</style>
```

## 사용-import
```html
<style lang="scss">
	@import "Test1.scss";
</style>
```

