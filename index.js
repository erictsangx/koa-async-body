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
const Busboy = require('busboy');
const fs = require('fs');
const os = require('os');
const tmp = require('tmp');
const parseParams = require('busboy/lib/utils').parseParams;
function parser(req, options) {
    if (!req.headers['content-type']) {
        return new Promise((resolve) => {
            resolve({});
        });
    }
    const parsed = parseParams(req.headers['content-type']);
    if (parsed[0] === 'multipart/form-data' || parsed[0] === 'application/x-www-form-urlencoded') {
        return formParser(req, options);
    }
    else {
        if (parsed[0] === 'application/json') {
            return jsonParser(req);
        }
    }
}
function formParser(req, options) {
    if (options) {
        options.headers = req.headers;
    }
    else {
        options = {
            headers: req.headers
        };
    }
    const busboy = new Busboy(options);
    return new Promise((resolve, reject) => {
        let formData = {};
        let hasError;
        busboy.on('file', function (fieldName, stream, filename, encoding, mimeType) {
            //save tmp files
            const tmpDir = (options.uploadDir ? options.uploadDir : os.tmpDir());
            const tmpPath = tmp.tmpNameSync({ template: tmpDir + '/upload-XXXXXXXXXXXXXXXXXXX' });
            stream.pipe(fs.createWriteStream(tmpPath));
            stream.on('end', function () {
                //push file data
                formData[fieldName] = {
                    fileName: filename,
                    mimeType: mimeType,
                    tmpPath: tmpPath
                };
            });
            stream.on('limit', function () {
                hasError = 'filesSizeLimit';
            });
        });
        busboy.on('field', function (fieldName, val) {
            //push text data
            formData[fieldName] = val;
        });
        busboy.on('partsLimit', function () {
            hasError = 'partsLimit';
        });
        busboy.on('filesLimit', function () {
            hasError = 'filesNumberLimit';
        });
        busboy.on('fieldsLimit', function () {
            hasError = 'fieldsLimit';
        });
        busboy.on('finish', function () {
            if (hasError) {
                reject(hasError);
            }
            else {
                resolve(formData);
            }
        });
        req.pipe(busboy);
    });
}
function jsonParser(req) {
    return new Promise((resolve) => {
        let fullBody = '';
        req.on('data', (chunk) => {
            fullBody += chunk.toString();
        });
        req.on('end', () => {
            try {
                fullBody = JSON.parse(fullBody);
                resolve(fullBody);
            }
            catch (error) {
                resolve({});
            }
        });
    });
}
function append(ctx, keyPath, body) {
    if (keyPath === '' || keyPath === null || keyPath === undefined) {
        ctx.requestBody = body;
    }
    else {
        ctx[keyPath] = body;
    }
}
function KoaBusBoy(options) {
    if (options) {
        //check uploadDir is a string value
        if (options.uploadDir !== null && options.uploadDir !== undefined) {
            if (typeof options.uploadDir !== 'string') {
                throw new Error('koa-async-body: passing a non-string value to uploadDir');
            }
        }
        //check keyPath is string value
        if (options.keyPath !== null && options.keyPath !== undefined) {
            if (typeof options.keyPath !== 'string') {
                throw new Error('koa-async-body: passing a non-string value to keyPath');
            }
        }
    }
    return (ctx, next) => __awaiter(this, void 0, Promise, function* () {
        try {
            const result = yield parser(ctx.req, options);
            if (Object.keys(result).length === 0) {
                append(ctx, options.keyPath, null);
            }
            else {
                append(ctx, options.keyPath, result);
            }
            return next();
        }
        catch (error) {
            if (!(error instanceof Error)) {
                error = new Error(error);
            }
            ctx.app.emit('error', error, ctx);
        }
    });
}
module.exports = KoaBusBoy;
