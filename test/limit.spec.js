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
var index_1 = require('../index');
const request = require('request');
const host = 'http://localhost:3000';
function toBuffer(file) {
    let buffer = new Buffer(file.byteLength);
    let view = new Uint8Array(file);
    for (let i = 0; i < buffer.length; ++i) {
        buffer[i] = view[i];
    }
    return buffer;
}
describe('Test Limit', () => {
    beforeAll((done) => {
        const Koa = require('koa');
        const busboy = new index_1.default({
            limits: {
                fields: 1,
                fileSize: 1
            }
        });
        const app = new Koa();
        app.use(busboy.middleware((error, ctx) => {
            ctx.throw(400, error);
        }));
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
    it('should throw fieldsLimit', (done) => {
        request({
            method: 'POST',
            uri: host,
            formData: {
                abc: 'edf',
                123: '456'
            },
            json: true
        }, (error, response, body) => {
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
        }, (error, response, body) => {
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
