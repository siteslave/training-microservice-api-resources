const gulp = require('gulp');
const ts = require('gulp-typescript');
const uglify = require('gulp-uglify');

const tsProject = ts.createProject('tsconfig.json', { noImplicitAny: true });

gulp.task('build', () => {
  return tsProject.src()
    .pipe(tsProject())
    .js.pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('default', gulp.series('build'));