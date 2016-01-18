/**
 * Created by erictsangx on 18/1/2016.
 */

'use strict';

const Busboy = require('busboy');
const path = require('path');
const fs = require('fs');
const os = require('os');
import {IncomingMessage} from 'http';
import ReadableStream = NodeJS.ReadableStream;
const parseParams = require('busboy/lib/utils').parseParams;

interface IOptions {
    headers?: number;
    highWaterMark?: number;
    fileHwm?: number;
    defCharset?: number;
    preservePath?: number;
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
    //ignore content-types except 'application/x-www-form-urlencoded' & 'multipart/form-data'
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
            let saveTo: string;
            if (options.uploadDir) {
                saveTo = path.join(options.uploadDir, path.basename(fieldName + new Date));
            }
            else {
                saveTo = path.join(os.tmpdir(), path.basename(fieldName + new Date));
            }
            //save tmp files
            stream.pipe(fs.createWriteStream(saveTo));

            stream.on('end', function() {
                //push file data
                formData.files[fieldName] = {
                    fileName: filename,
                    encoding: encoding,
                    mimeType: mimeType,
                    savedPath: saveTo
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

export default KoaBusBoy;