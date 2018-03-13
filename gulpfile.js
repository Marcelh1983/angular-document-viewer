// credits for build-script to benbaran https://github.com/benbaran/ 

var
    bump = require('gulp-bump'),
    del = require('del'),
    exec = require('child_process').exec,
    gulp = require('gulp'),
    fs = require('fs');

gulp.task('clean', function () {
    del(['./dist/*']);
});

gulp.task('compile', function (cb) {
    exec('ngc -p tsconfig-aot.json', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('bump', function () {
    gulp.src('./package.json')
        .pipe(bump({
            type: 'patch'
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('copy', function (cb) {

    const pkgjson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

    delete pkgjson.scripts;

    delete pkgjson.devDependencies;

    const filepath = './dist/package.json';

    fs.writeFileSync(filepath, JSON.stringify(pkgjson, null, 2), 'utf-8');
});

gulp.task('git-add', function (cb) {
    exec('git add -A', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});


gulp.task('git-commit', function (cb) {

    var package = require('./package.json');

    exec('git commit -m "Version ' + package.version + ' release."', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('git-push', function (cb) {

    exec('git push', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

gulp.task('publish', function (cb) {

    exec('npm publish ./dist', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

