var _ = require('underscore'),
	keystone = require('keystone'),
	middleware = require('./middleware'),
    // restful = require('restful-keystone-onode')(keystone),
	importRoutes = keystone.importer(__dirname);

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
var routes = {
	views: importRoutes('./views'),
	api: importRoutes('./api'),
};

// create a route that handles signin

function signin (req, res) {

	if (!req.body.username || !req.body.password) return res.json({ success: false });

	keystone.list('User').model.findOne({ email: req.body.username }).exec(function (err, user) {

		if (err || !user) {
			return res.json({
				success: false,
				session: false,
				message: (err && err.message ? err.message : false) || 'Sorry, there was an issue signing you in, please try again.',
			});
		}

		keystone.session.signin({ email: user.email, password: req.body.password }, req, res, function (user) {

			return res.json({
				success: true,
				session: true,
				date: new Date().getTime(),
				userId: user.id,
			});

		}, function (err) {

			return res.json({
				success: true,
				session: false,
				message: (err && err.message ? err.message : false) || 'Sorry, there was an issue signing you in, please try again.',
			});

		});

	});
}

// you'll want one for signout too
function signout (req, res) {
	keystone.session.signout(req, res, function () {
		res.json({ signedout: true });
	});
}
// also create some middleware that checks the current user

// as long as you're using Keystone's session management, the user
// will already be loaded if there is a valid current session

function checkAuth (req, res, next) {
		// you could check user permissions here too
	if (req.user) return next();
	return res.status(403).json({ error: 'no access' });
}

// Setup Route Bindings
exports = module.exports = function (app) {

	// Views
	app.get('/', routes.views.index);
	app.get('/blog/:category?', routes.views.blog);
	app.get('/blog/post/:post', routes.views.post);
	app.get('/gallery', routes.views.gallery);
	app.all('/contact', routes.views.contact);

	// add an API endpoint for signing in _before_ your protected routes
	app.post('/api/signin', signin);
	app.post('/api/signout', signout);

// then bind that middleware in your routes before any paths
// that should be protected
	app.all('/api*', checkAuth);


	//
	app.get('/api/post/list', keystone.middleware.api, routes.api.posts.get);
	app.get('/api/post/:id', keystone.middleware.api, routes.api.posts.get);

};
