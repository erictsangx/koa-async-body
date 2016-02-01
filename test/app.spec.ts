/**
 * Created by erictsangx on 18/1/2016.
 */


'use strict';

const KoaBusBoy = require('../index.js');
const request = require('request');
const host = 'http://localhost:3000';

import {toBuffer} from './testing';

describe('Test Request', () => {
    beforeAll((done)=> {
        const Koa = require('koa');

        const busboy = new KoaBusBoy({
            uploadDir: '/var/tmp'
        });

        const app = new Koa();

        app.use(busboy);

        app.use((ctx: any)=> {
            if (ctx.request.body) {
                ctx.body = ctx.request.body;
            } else {
                if (Object.keys(ctx.request.query).length > 0) {
                    ctx.body = ctx.request.query;
                }
                else {
                    ctx.body = 'hello world';
                }
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
            qs: {
                abc: 'edf',
                123: '456'
            },
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            json: true
        }, (error: Error, response: any, body: any) => {
            if (error && response.statusCode !== 200) throw error;
            expect(body).toEqual({
                123: '456',
                abc: 'edf'
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

    it('should support application/json', (done) => {
        request({
            method: 'POST',
            uri: host,
            body: {
                abc: 'edf',
                123: '456'
            },
            json: true
        }, (error: Error, response: any, body: any) => {
            if (error && response.statusCode !== 200) throw error;
            expect(body).toEqual({
                123: '456', abc: 'edf'
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
            expect(body.files.fileData.tmpPath).toContain('/var/tmp');
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