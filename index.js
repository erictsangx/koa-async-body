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
    //ignore content-types if it is 'application/x-www-form-urlencoded' & 'multipart/form-data'
    if (!req.headers['content-type']) {
        return new Promise((resolve) => {
            resolve(null);
        });
    }
    else {
        const parsed = parseParams(req.headers['content-type']);
        if (parsed[0] !== 'application/x-www-form-urlencoded' && parsed[0] !== 'multipart/form-data') {
            return new Promise((resolve) => {
                resolve(null);
            });
        }
    }
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
        let formData = {
            fields: {},
            files: {}
        };
        let hasError;
        busboy.on('file', function (fieldName, stream, filename, encoding, mimeType) {
            //save tmp files
            const tmpPath = (options.uploadDir ? options.uploadDir : os.tmpDir());
            const saveTo = tmp.tmpNameSync({ template: tmpPath + '/upload-XXXXXXXXXXXXXXXXXXX' });
            stream.pipe(fs.createWriteStream(saveTo));
            stream.on('end', function () {
                //push file data
                formData.files[fieldName] = {
                    fileName: filename,
                    mimeType: mimeType,
                    savedPath: saveTo
                };
            });
            stream.on('limit', function () {
                hasError = 'filesSizeLimit';
            });
        });
        busboy.on('field', function (fieldName, val) {
            //push text data
            formData.fields[fieldName] = val;
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
class KoaBusBoy {
    constructor(options) {
        this.options = options;
    }
    middleware(cb) {
        return (ctx, next) => __awaiter(this, void 0, Promise, function* () {
            try {
                ctx.formData = yield parser(ctx.req, this.options);
                console.info('ctx.formData', ctx.formData);
                yield next();
            }
            catch (error) {
                if (cb) {
                    cb(error, ctx);
                }
                else {
                    throw error;
                }
            }
        });
    }
}
exports.default = KoaBusBoy;
