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