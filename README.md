This middleware is written on top of busboy for koa2.x to parse url-encoded/multiplart form data and ``async/await`` since koa2.x does not support ``generator`` any more and most of koa body parsers are still using ``generator``

##install
``npm install koa2-busboy``

##example
```javascript
'use strict';

const Koa = require('koa');
const KoaBusBoy = require('koa2-busboy');

const busboy = new KoaBusBoy({
    limits: {
        fileSize: 1024*1024*2,
        files: 1,
        parts: 1000,
    },
    uploadDir: '/var/tmp'
});
//You find the options in https://github.com/mscdex/busboy

const app = new Koa();

app.use(busboy);

app.use((ctx)=> {
    if (ctx.formData) {
        ctx.body = ctx.formData;
    } else {
        ctx.body = 'hello world';
    }
});

app.listen(3000);
```
