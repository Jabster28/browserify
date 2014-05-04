var browserify = require('../');
var vm = require('vm');
var test = require('tap').test;
var path = require('path');
var through = require('through2');

var os = require('os');
var tmpdir = (os.tmpdir || os.tmpDir)();
var dir = path.join(
    tmpdir,
    'browserify-test-' + Math.random(),
    'aaabbbzzz'
);
var dirstring = dir.split(path.sep).slice(-2).join(path.sep);

test('leaking information about system paths', function (t) {
    t.plan(3);
    
    var b = browserify({ basedir: dir });
    var stream = through();
    stream.push('process.nextTick(function () {'
        + 't.ok(true)'
        + '})'
    );
    stream.push(null);
    b.add(stream);
    
    b.bundle(function (err, src) {
        t.equal(src.indexOf(dirstring), -1, 'temp directory visible');
        t.equal(src.indexOf(process.cwd()), -1, 'cwd directory visible');
        vm.runInNewContext(src, { t: t, setTimeout: setTimeout });
    });
});
