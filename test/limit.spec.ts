/**
 * Created by erictsangx on 18/1/2016.
 */


'use strict';

const KoaBusBoy = require('../index.js');
const request = require('request');
const host = 'http://localhost:3001';

import {toBuffer} from './testing';

describe('Test Limit', () => {
    beforeAll((done)=> {
        jasmine.DEFAULT_TIMEOUT_INTERVAL=1000;
        const Koa = require('koa');

        const busboy = new KoaBusBoy({
            limits: {
                fields: 1,
                fileSize: 1
            }
        });

        const app = new Koa();

        app.use(busboy);

        app.use((ctx: any)=> {
            if (ctx.formData) {
                ctx.body = ctx.formData;
            } else {
                ctx.body = 'hello world';
            }
        });

        app.on('error', (error: Error, ctx: any)=> {
            ctx.status = 400;
            ctx.body = error.message;
        });
        app.listen(3001, ()=> {
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