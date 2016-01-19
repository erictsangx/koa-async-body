/**
 * Created by erictsangx on 18/1/2016.
 */
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, Promise, generator) {
    return new Promise(function (resolve, reject) {
        generator = generator.call(thisArg, _arguments);
        function cast(value) { return value instanceof Promise && value.constructor === Promise ? value : new Promise(function (resolve) { resolve(value); }); }
        function onfulfill(value) { try { step("next", value); } catch (e) { reject(e); } }
        function onreject(value) { try { step("throw", value); } catch (e) { reject(e); } }
        function step(verb, value) {
            var result = generator[verb](value);
            result.done ? resolve(result.value) : cast(result.value).then(onfulfill, onreject);
        }
        step("next", void 0);
    });
};
const KoaBusBoy = require('../index.js');
const request = require('request');
const host = 'http://localhost:3000';
var testing_1 = require('./testing');
describe('Test Request', () => {
    beforeAll((done) => {
        const Koa = require('koa');
        const busboy = new KoaBusBoy({
            uploadDir: '/var/tmp'
        });
        const app = new Koa();
        app.use(busboy);
        app.use((ctx) => {
            if (ctx.formData) {
                ctx.body = ctx.formData;
            }
            else {
                ctx.body = 'hello world';
            }
        });
        app.listen(3000, () => {
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
        }, (error, response, body) => {
            if (error && response.statusCode !== 200)
                throw error;
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
        }, (error, response, body) => {
            if (error && response.statusCode !== 200)
                throw error;
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
        }, (error, response, body) => {
            if (error && response.statusCode !== 200)
                throw error;
            expect(body.fields).toEqual({});
            expect(body.files.fileData.fileName).toEqual('dummy.txt');
            expect(body.files.fileData.mimeType).toEqual('text/plain');
            expect(body.files.fileData.tmpPath).toContain('/var/tmp');
            done();
        });
        let form = req.form();
        let fs = require('fs');
        let file = fs.readFileSync(__dirname + '/dummy.txt');
        form.append('fileData', testing_1.toBuffer(file), {
            filename: 'dummy.txt'
        });
    });
});
