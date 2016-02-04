This middleware is written on top of busboy for koa2.x to parse request bodies and ``async/await``.
It will parse content-types with `multipart/form-data`, `application/x-www-form-urlencoded` and `application/json`.

##Install
``npm install koa-async-body``

##Example
```javascript
'use strict';

const Koa = require('koa');
const KoaBody = require('koa-async-body');

const koaBody = new KoaBody({
    limits: {
        fileSize: 1024*1024*2,
        files: 1,
        parts: 1000,
    }, //You can find the options in https://github.com/mscdex/busboy
    uploadDir: '/var/tmp', //customize the upload directory, default use require('os').tmpDir()
    keyPath: 'foobar' //customize appending to `koa context`, default use `ctx.requestBody`
});

const app = new Koa();

app.use(koaBody);

app.use((ctx)=> {
    if (ctx.requestBody) { //null if no request body
        ctx.body = ctx.requestBody;
    } else {
        ctx.body = 'hello world';
    }
});

app.listen(3000);
//curl -v -X POST 'http://localhost:3000' --data-urlencode 'hello=world'
```

##Error handling
```javascript
app.on('error',(error,ctx)=>{
    // Error('filesSizeLimit')
    // Error('partsLimit')
    // Error('filesLimit')
    // Error('fieldsLimit')
    if(error.message === 'filesSizeLimit')  {
        ctx.status = 400;
        ctx.body = 'filesize too big!!!'
    }
});
