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


describe('Test', () => {
    beforeAll((done)=> {
        const Koa = require('koa');

        const busboy = new KoaBusBoy();

        const app = new Koa();

        app.use(busboy.middleware((error: Error, ctx: any)=> {
            ctx.throw(400, error);
        }));

        app.use((ctx: any)=> {
            if (ctx.formData) {
                //console.info('ctx.formData', ctx.req.headers,ctx.formData);
                ctx.body = ctx.formData;
            } else {
                ctx.body = 'hello world';
            }
        });

        app.listen(3000, ()=> {
            done();
        });
    });
    it('should support application/x-www-form-urlencoded', (done) => {
        request({
            method: 'POST',
            uri: host,
            form: {
                abc: 'edf',
                123: '456'
            },
            json: true
        }, (error: Error, response: any, body: any) => {
            if (error && response.statusCode !== 200) throw error;
            expect(body).toEqual({
                fields: {
                    123: '456',
                    abc: 'edf'
                }, files: {}
            });
            done();
        });
    });

    it('should support multipart/form-data', (done) => {
        request({
            method: 'POST',
            uri: host,
            formData: {
                abc: 'edf',
                123: '456'
            },
            json: true
        }, (error: Error, response: any, body: any) => {
            if (error && response.statusCode !== 200) throw error;
            expect(body).toEqual({
                fields: {
                    123: '456',
                    abc: 'edf'
                }, files: {}
            });
            done();
        });
    });
    it('should support uploading files', (done) => {
        let req = request({
            method: 'POST',
            uri: host,
            formData: {
                abc: 'edf',
                123: '456'
            },
            json: true
        }, (error: Error, response: any, body: any) => {
            if (error && response.statusCode !== 200) throw error;
            expect(body.fields).toEqual({});
            expect(body.files.fileData.fileName).toEqual('dummy.txt');
            expect(body.files.fileData.mimeType).toEqual('text/plain');
            done();
        });

        let form = req.form();
        let fs = require('fs');
        let file = fs.readFileSync(__dirname + '/dummy.txt');
        console.info(file);
        form.append('fileData', toBuffer(file), {
            filename: 'dummy.txt'
        });
    });

    
});