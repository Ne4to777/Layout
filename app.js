'use strict'
var app = require('express')();

// port setup
app.set('port', process.env.PORT || 3000);

// view engine setup
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

// server starts
if (!module.parent) {
	app
		.disable('x-powered-by')
		.disable('etag')
		.listen(app.get('port'), function () {
			console.log('listening on port ' + this.address()
				.port);
		})
};

// middleware
app.use(
	//	favicon
	// require('serve-favicon')(__dirname + '/public/favicon.ico'),
	// router
	require('./router'),
	// logger
	// require('morgan')('dev'),
	// json body parser
	require('body-parser')
	.json(),
	// url body parser
	require('body-parser')
	.urlencoded({
		extended: true
	}),
	// cookie parser
	require('cookie-parser')(),
	// static
	require('express')
	.static(__dirname + '/public')
);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

module.exports = app;