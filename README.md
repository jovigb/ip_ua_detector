# ip_ua_detector

---
parser ip or ua into json form by http protocal

## Dependent

```
https://github.com/hotoo/detector
https://github.com/ChiChou/node-ipip
```

## Installation

via npm:

Installation to global (with `-g` argument), you can use `detector` command in
terminal.

```
npm install detector [-g]
npm install ipip [-g]
```

## Usage

```
./bin/parse.sh [ start | stop ]
```

## Http Request
```
localhost:8080/?ua=Mozilla%2F5.0+%28Linux%3B+U%3B+Android+4.4.4%3B+zh-cn%3B+N958St+Build%2FKTU84P%29+AppleWebKit%2F533.1+%28KHTML%2C+like+Gecko%29Version%2F4.0+MQQBrowser%2F5.4+TBS%2F025489+Mobile+Safari%2F533.1+MicroMessenger%2F6.2.4.54_r266a9ba.601+NetType%2FWIFI+Language%2Fzh_CN^^Mozilla/5.0%20(iPhone;%20CPU%20iPhone%20OS%209_1%20like%20Mac%20OS%20X)%20AppleWebKit/601.1.46%20(KHTML,%20like%20Gecko)%20Version/9.0%20Mobile/13B143%20Safari/601.1
localhost:8080/?ip=177.154.235.156,222.73.152.10
```
