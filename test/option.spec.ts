/**
 * Created by erictsangx on 2/2/2016.
 */

'use strict';

const KoaBusBoy = require('../index.js');

describe('Test Options', () => {

    it('should throw if uploadDir is a non-string value', () => {
        expect(() => {
            KoaBusBoy({
                uploadDir: {},
                keyPath: 'foobar'
            });
        }).toThrow(new Error('koa-async-body: passing a non-string value to uploadDir'));
    });


    it('should throw if keyPath is a non-string value', () => {
        expect(() => {
            KoaBusBoy({
                uploadDir: 'dd',
                keyPath: {}
            });
        }).toThrow(new Error('koa-async-body: passing a non-string value to keyPath'));
    });


});