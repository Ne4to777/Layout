gulp = require 'gulp'
minifyCSS = require 'gulp-clean-css'
rename = require 'gulp-rename'
browserSync = require('browser-sync').create()
uglify = require 'gulp-uglify'
plumber = require 'gulp-plumber'
stylus = require 'gulp-stylus'
nib = require 'nib'
coffee = require 'gulp-coffee'
gutil = require 'gulp-util'
ServerTest = require('karma').Server
supervisor = require 'gulp-supervisor'

gulp.task 'test', ->
	new ServerTest
		configFile:__dirname + '/karmaCfg.js'
	.start()

gulp.task 'coffee', ->
	gulp.src 'coffee/*.coffee'
		.pipe do plumber
		.pipe coffee
			bare:true
		.on 'error', gutil.log
		.pipe gulp.dest 'public/js/'

gulp.task 'uglify', ['coffee'], ->
	gulp.src 'scripts/*.js'
		.pipe do uglify
		.pipe rename
			suffix: '.min'
		.pipe gulp.dest 'public/js/'

gulp.task 'stylus', ->
	gulp.src 'stylus/main.styl'
		.pipe do plumber
		.pipe stylus 
			use: do nib
		.pipe gulp.dest 'stylus'

gulp.task 'buildCSS', ['stylus'], ->
	gulp.src 'stylus/main.css'
		.pipe minifyCSS
			keepSpecialComments:0
			compability:true
			noAdvanced:false
		.pipe rename 'main.min.css'
		.pipe gulp.dest 'public/css'

gulp.task 'browser-sync',['buildCSS'], ->
	browserSync.init null,
		proxy: 'http://localhost:3000'
		files: ['public/**/*.*', 'views/*.pug']
		browser: 'chrome'
		port: 5000

gulp.task 'supervisor', ['buildCSS'], ->
	supervisor 'app.js',
		args:[]
		watch:[]
		ignore:['node_modules','bower','views','public','stylus','images','coffee']
		pollInterval:500
		extensions:[]
		exec:'node'
		debug:false
		debugBrk:false
		harmony:true
		noRestartOn:'exit'
		forceWatch:true
		quiet:false
		
gulp.task 'default', ['supervisor', 'browser-sync'], ->
	gulp.watch ['stylus/main.styl'], ['buildCSS']
	gulp.watch ['coffee/*.coffee'], ['uglify']