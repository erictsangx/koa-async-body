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
            uploadDir: '/var/tmp',
            keyPath: 'foobar'
        });

        const app = new Koa();

        app.use(busboy);

        app.use((ctx: any)=> {
            if (ctx.foobar) {
                ctx.body = ctx.foobar;
            } else {
                ctx.body = 'hello world';
            }
        });

        app.listen(3000, ()=> {
            done();
        });
    });
    it('should return empty body', (done) => {
        request({
            method: 'POST',
            uri: host,
        }, (error: Error, response: any, body: any) => {
            if (error && response.statusCode !== 200) throw error;
            expect(body).toEqual('{}');
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
                123: '456',
                abc: 'edf'
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
            expect(body.fileData.fileName).toEqual('dummy.txt');
            expect(body.fileData.mimeType).toEqual('text/plain');
            expect(body.fileData.tmpPath).toContain('/var/tmp');
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