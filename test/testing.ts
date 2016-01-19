/**
 * Created by erictsangx on 19/1/2016.
 */

'use strict';

function toBuffer (file: any) {
    let buffer = new Buffer(file.byteLength);
    let view = new Uint8Array(file);
    for (let i = 0; i < buffer.length; ++i) {
        buffer[i] = view[i];
    }
    return buffer;
}

export {
    toBuffer
}