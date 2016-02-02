/**
 * Created by erictsangx on 2/2/2016.
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
