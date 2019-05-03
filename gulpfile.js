var
    bump = require('gulp-bump'),
    del = require('del'),
    exec = require('child_process').exec,
    gulp = require('gulp'),
    fs = require('fs');

var copy = function (done) {
    const pkgjson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const readMe = fs.readFileSync('./README.md', 'utf8');
    delete pkgjson.scripts;
    delete pkgjson.devDependencies;
    const filepathReadme = './dist/README.md';
    const filepath = './dist/package.json';
    fs.writeFileSync(filepathReadme, readMe, 'utf-8');
    fs.writeFileSync(filepath, JSON.stringify(pkgjson, null, 2), 'utf-8');
    done();
};

var compile = function (cb) {
    exec('ngc -p tsconfig-aot.json', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })
};

var publish = function (cb) {
    exec('npm publish ./dist', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
};

exports.compile = compile;
exports.clean = del.bind(null, ['./dist/*']);
exports.copy = copy;
exports.publish = publish;
