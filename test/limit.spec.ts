/**
 * Created by erictsangx on 18/1/2016.
 */


'use strict';

import KoaBusBoy from '../index';
const request = require('request');
const host = 'http://localhost:3000';


function toBuffer (file: any) {
    let buffer = new Buffer(file.byteLength);
    let view = new Uint8Array(file);
    for (let i = 0; i < buffer.length; ++i) {
        buffer[i] = view[i];
    }
    return buffer;
}


describe('Test Limit', () => {
    beforeAll((done)=> {
        const Koa = require('koa');

        const busboy = new KoaBusBoy({
            limits: {
                fields: 1,
                fileSize: 1
            }
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

        app.listen(3000, ()=> {
            done();
        });
    });
    it('should throw fieldsLimit', (done) => {
        request({
            method: 'POST',
            uri: host,
            formData: {
                abc: 'edf',
                123: '456'
            },
            json: true
        }, (error: Error, response: any, body: any) => {
            expect(response.statusCode).toBe(400);
            expect(body).toEqual('fieldsLimit');
            done();
        });
    });

    it('should throw filesSizeLimit', (done) => {
        let req = request({
            method: 'POST',
            uri: host,
            formData: {},
            json: true
        }, (error: Error, response: any, body: any) => {
            expect(response.statusCode).toBe(400);
            expect(body).toEqual('filesSizeLimit');
            done();
        });

        let form = req.form();
        let fs = require('fs');
        let file = fs.readFileSync(__dirname + '/dummy.txt');
        form.append('fileData', toBuffer(file), {
            filename: 'dummy.txt'
        });
    });

});