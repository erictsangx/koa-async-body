/**
 * Created by erictsangx on 12/1/2016.
 */

'use strict';

const gulp = require('gulp');

var treatTestErrorsAsFatal = true;

function runJasmineTests(globs, done) {
    const fork = require('child_process').fork;
    const args = ['--'].concat(globs);

    fork('./tools/cjs-jasmine', args, {stdio: 'inherit'})
        .on('close', function jasmineCloseHandler(exitCode) {
            if (exitCode && treatTestErrorsAsFatal) {
                var err = new Error('Jasmine tests failed');
                // Mark the error for gulp similar to how gulp-utils.PluginError does it.
                // The stack is not useful in this context.
                err.showStack = false;
                done(err);
            } else {
                done();
            }
        });
}


gulp.task('test', function (done) {
    runJasmineTests(['test/**/*.spec.js'], done);
});