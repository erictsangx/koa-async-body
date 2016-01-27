/**
 * Created by erictsangx on 18/1/2016.
 */

'use strict';

const Busboy = require('busboy');
const fs = require('fs');
const os = require('os');
const tmp = require('tmp');

import {IncomingMessage} from 'http';
import ReadableStream = NodeJS.ReadableStream;

const parseParams = require('busboy/lib/utils').parseParams;

interface IOptions {
    headers?: number;
    highWaterMark?: number;
    fileHwm?: number;
    defCharset?: number;
    preservePath?: boolean;
    limits?: {
        fieldNameSize?: number;
        fieldSize?: number;
        fields?: number;
        fileSize?: number;
        files?: number;
        parts?: number;
        headerPairs?: number;
    };
    uploadDir?: string;
}

function parser (req: IncomingMessage, options?: IOptions) {
    if (!req.headers['content-type']) {
        return new Promise((resolve)=> {
            resolve(null);
        });
    }

    const parsed = parseParams(req.headers['content-type']);

    if (parsed[0] === 'multipart/form-data') {
        return formParser(req, options);
    }

    else {
        if (parsed[0] === 'application/json') {
            return jsonParser(req);
        }
    }
}


function formParser (req: IncomingMessage, options?: IOptions) {

    if (options) {
        options.headers = req.headers;
    }
    else {
        options = {
            headers: req.headers
        };
    }
    const busboy = new Busboy(options);
    return new Promise((resolve, reject)=> {
        let formData: any = {
            fields: {},
            files: {}
        };
        let hasError: string;
        busboy.on('file', function(fieldName: string, stream: ReadableStream, filename: string, encoding: string, mimeType: string) {
            //save tmp files
            const tmpDir = (options.uploadDir ? options.uploadDir : os.tmpDir());
            const tmpPath = tmp.tmpNameSync({template: tmpDir + '/upload-XXXXXXXXXXXXXXXXXXX'});
            stream.pipe(fs.createWriteStream(tmpPath));

            stream.on('end', function() {
                //push file data
                formData.files[fieldName] = {
                    fileName: filename,
                    mimeType: mimeType,
                    tmpPath: tmpPath
                };
            });

            stream.on('limit', function() {
                hasError = 'filesSizeLimit';
            });
        });
        busboy.on('field', function(fieldName: string, val: any) {
            //push text data
            formData.fields[fieldName] = val;
        });
        busboy.on('partsLimit', function() {
            hasError = 'partsLimit';
        });
        busboy.on('filesLimit', function() {
            hasError = 'filesNumberLimit';
        });
        busboy.on('fieldsLimit', function() {
            hasError = 'fieldsLimit';
        });
        busboy.on('finish', function() {
            if (hasError) {
                reject(hasError);
            } else {
                resolve(formData);
            }
        });
        req.pipe(busboy);
    });
}


function jsonParser (req: IncomingMessage) {
    return new Promise((resolve) => {
        let fullBody = '';

        req.on('data', (chunk: any) => {
            fullBody += chunk.toString();
        });

        req.on('end', ()=> {
            try {
                fullBody = JSON.parse(fullBody);
                resolve(fullBody);
            } catch (error) {
                resolve({});
            }
        });
    });
}

function KoaBusBoy (options?: IOptions) {
    return async (ctx: any, next: any) => {
        try {
            ctx.request.body = await parser(ctx.req, options);
            return next();
        } catch (error) {
            if (!(error instanceof Error)) {
                error = new Error(error);
            }
            ctx.app.emit('error', error, ctx);
        }
    };
}

module.exports = KoaBusBoy;