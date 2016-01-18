```
'use strict';

const Koa = require('koa');
import KoaBusBoy from './lib/parser';

const busboy = new KoaBusBoy({
    limits: {
        fileSize: 1024*1024*2,
        files: 1,
        parts: 1000,
    },
    uploadDir: '/var/tmp'
});

const app = new Koa();

app.use(busboy.middleware((error: Error, ctx: any)=> {
    ctx.throw(400, error);
}));

app.use((ctx: any)=> {
    if (ctx.formData) {
        ctx.body = ctx.formData;
    } else {
        ctx.body = 'hello world';
    }
});

app.listen(3000);
```