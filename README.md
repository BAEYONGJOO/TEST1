# TEST1 과제

실시간으로 들어 오는 매수, 매도에 대한 호가창과 거래체결 현황을 보여주는 어플리케이션입니다.

실시간 서버는 NodeJs 어플리케이션서버에 express, express-generator, socket.io 패키지를 이용하여 구성하였습니다. 

실시간 INPUT 데이터는 test1_input.js에 구성하였으며, 서버로부터 데이터 전송간격은 1초입니다.

거래체결 변화를 시각적인 챠트로 표현한 버전입니다.

## 문제 해결 전략

### 매수, 매도 데이터 처리 및 컴포넌트 적용

TEST1 과제의 매수, 매도의 데이터가 1초의 간격으로 websocket을 통하여 다음과 같은 데이터가 웹브라우저에 전송됩니다.
```js
d = {
   no : 데이터 순번,
   type : 'B' or 'S',   ==> 매수(B) 또는 매도(S)
   price : 가격,
   qty : 수량
}
```

위의 JSON Object를 이용하여 매수,매도행 컴포넌트를 생성한 뒤 컴포넌트 ID를 JSON Object에 저장한 뒤 매수(B), 매도(S)에 따라 각기 다른 Array에 저장합니다.
```js
var item = components.createItem(d);
d.id = item.id;
data[d.type.toLowerCase() + '_data'].push(d);
```

### 매수, 매도 거래체결 프로세스

웹페이지에 추가된 item(매수 또는 매도 컴포넌트)에 데이터 유형에 따라 'buy' 또는 'sale' 이벤트를 트리거합니다.(buy 또는 sale 이벤트를 단일 이벤트로 통합가능하지만 동작 상태를 좀더 명확히 구분하기 위하여 분리)

item에 'buy' 또는 'sale' 이벤트가 발생할 경우 매수,매도 거래체결 프로세스가 동작합니다.

* 매수 거래체결 처리 이벤트
```js
var d1 = this.data.s_data.filter(function(v){
    // 매도 데이터에서 매수 조건에 맞는 데이터 반환
    return (v.price <= d.price) && v.qty != 0;
});
...
// 가격 및 수량을 기준으로 정렬(낮은가격)
d1.sort(function(a,b){ if(a.price==b.price) { return a.qty - b.qty; } else return a.price - b.price});
// 거래가능한 매수데이터로 거래체결 처리
```
* 매수 거래체결 처리 이벤트
```js
var d1 = this.data.b_data.filter(function(v){
    // 매수 데이터에서 매도 조건에 맞는 데이터 반환
    return (v.price >= d.price) && v.qty > 0;
});
...
// 가격 및 수량을 기준으로 정렬(높은가격)
d1.sort(function(a,b){ if(a.price==b.price) { return a.qty - b.qty; } else return b.price - a.price});
// 거래가능한 매수데이터로 거래체결 처리
```

매수, 매도 거래체결 프로세스가 동작할 때 수량(qty)의 변화가 발생하는 item에 'update'이벤트를 트리거합니다.

### 수량변화 표시

매수, 매도 컴포넌트에 'update'이벤트가 발생하면 update클래스명을 추가합니다.
```js
item.addClass('update');
if(item.qty == 0){item.addClass('remove');}
```

## 설치 및 실행

TEST1 과제를 실행하기 위하여 다음의 각 단계를 실행합니다:
```
> node bin/www
```

### 1) Nodejs 설치

[Nodejs 홈페이지](http://www.nodejs.org)에 접속하여 8.10.0 LTS 버전을 [다운로드](https://nodejs.org/dist/v8.10.0/node-v8.10.0.pkg)하여 설치합니다.

### 2) Nodejs 패키지 설치

window command 창 또는 mac os(or linux) console 창에서 yjbae_test1_chart.zip 압축이 풀려 있는 폴더로 이동합니다.
```
> cd yjbae_test1_chart
```

다음의 명령을 실행합니다.
```
> npm install
```

### 3) 실행다음의 명령을 실행합니다.

TEST1 과제를 실행하기 위해서 다음의 명령을 수행합니다.
```
> node bin/www
```

### 4) TEST1 과제 실행 확인.

TEST1 과제를 확인하기 위하여 웹브라우저(크롬, 사파리, IE 11버전 이상)를 실행하고 다음의 주소를 입력합니다.
```
http://localhost:3000
```

## 개발 환경

### Server
 * Nodejs 서버 8.10.0 LTS
 * Nodejs 패키지 : express, express-generator, socket.io

### Web Client 
 * 웹브라우저 : 크롬, 사파리, IE11+, EDGE

## 개발자 : 배용주, ilikempower@gmail.com