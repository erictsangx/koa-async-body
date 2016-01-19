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
    //ignore content-types if it is 'application/x-www-form-urlencoded' & 'multipart/form-data'
    if (!req.headers['content-type']) {
        return new Promise((resolve)=> {
            resolve(null);
        });
    } else {
        const parsed = parseParams(req.headers['content-type']);
        if (parsed[0] !== 'application/x-www-form-urlencoded' && parsed[0] !== 'multipart/form-data') {
            return new Promise((resolve)=> {
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


class KoaBusBoy {
    options: IOptions;

    constructor (options?: IOptions) {
        this.options = options;
    }

    middleware (cb?: (error: Error, ctx: any)=>void) {
        return async (ctx: any, next: any) => {
            try {
                ctx.formData = await parser(ctx.req, this.options);
                await next();
            } catch (error) {
                if (cb) {
                    cb(error, ctx);
                }
                else {
                    throw error;
                }
            }
        };
    }
}

module.exports = KoaBusBoy;