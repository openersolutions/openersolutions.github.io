var gulp = require('gulp');
var inject = require('gulp-inject');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var fs = require('fs');
var path = require('path');
var rename = require('gulp-rename');
var es = require('event-stream');
var injectString = require('gulp-inject-string');

gulp.task('watch', ['build'], function () {
    gulp.watch('./src/**/*', ['build']);
});

gulp.task('build', function () {
    var jobs = require('./src/pages/jobs/map.json').jobs;

    var stream = gulp.src(['./src/styles/main.scss'])
        .pipe(sourcemaps.init())
        .pipe(sass({ includePaths: ['node_modules', '.'] }).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist'));

    var index_stream = gulp.src('./src/pages/index.html')
        .pipe(inject(stream, { ignorePath: 'dist/', addRootSlash: false }));

    var jobStyleStream = gulp.src(['./src/styles/jobs.scss'])
        .pipe(sourcemaps.init())
        .pipe(sass({ includePaths: ['node_modules', '.'] }).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist'));

    var jobPageStreams = []
    var jobPagePathsMap = {}
    for (let i = 0; i < jobs.length; i++) {
        let job = jobs[i]

        if (!(job.title && job.path)) continue
        if (job.path == 'index.html' || job.path == 'template.html' ||
            path.extname(job.path) != '.html' || !fs.existsSync(path.join('./src/pages/jobs/', job.path))) continue

        jobPageStreams.push(gulp.src(['./src/pages/jobs/template.html'])
            .pipe(inject(jobStyleStream, {
                ignorePath: 'dist/',
                addRootSlash: false,
                addPrefix: '../'
            }))
            .pipe(injectString.replace('@@TITLE@@', job.title))
            .pipe(injectString.replace('@@BYLINE@@', `<small>Palo Alto, CA - Engineering - Full-Time</small>`))
            .pipe(inject(gulp.src([path.join('./src/pages/jobs/', job.path)]), {
                addRootSlash: false,
                starttag: '<!-- inject:body:html -->',
                transform: function (filePath, file) {
                    // return file contents as string
                    return file.contents.toString('utf8')
                }
            }))
            .pipe(rename(job.path))
            .pipe(gulp.dest('./dist/jobs')));

        jobPagePathsMap[job.path] = job
    }

    gulp.src(['./src/pages/jobs/template.html'])
        .pipe(rename('index.html'))
        .pipe(inject(jobStyleStream, {
            ignorePath: 'dist/',
            addRootSlash: false,
            addPrefix: '../'
        }))
        .pipe(injectString.replace('@@TITLE@@', 'Postings'))
        .pipe(injectString.replace('@@BYLINE@@', `${jobs.length} Job Postings`))
        .pipe(inject(es.merge(jobPageStreams), {
            ignorePath: 'dist/jobs/',
            addRootSlash: false,
            starttag: '<!-- inject:body:html -->',
            transform: function (filePath, file) {
                // return file contents as string

                let job = jobPagePathsMap[filePath]
                return `<div class="job-item"><a href="${filePath}" target="_blank">${job.title}</a></div>`
            }
        }))
        .pipe(gulp.dest('./dist/jobs'));

    return index_stream.pipe(gulp.dest('./dist'));
});

copy('./node_modules/font-awesome/fonts/**/*', './dist/fonts');
copy('./src/fonts/**/*', './dist/fonts');
copy('./src/images/**/*', './dist/images');
copy('CNAME', './dist');

function copy(origin, dest) {
    return gulp.src(origin)
        .pipe(gulp.dest(dest));
}