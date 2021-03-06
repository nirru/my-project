/**
 * Created by nikk on 11/5/17.
 */
var async = require('async'),
	keystone = require('keystone');

var Post = keystone.list('Post');

/**
 * List Posts
 */
exports.list = function(req, res) {
	Post.Modal.find(function(err, items) {

		if (err) return res.apiError('database error', err);

		// res.apiResponse({
		// 	posts: items
		// });

		res.json(items);

	});
}

/**
 * Get Post by ID
 */
exports.get = function(req, res) {
	Post.model.findById(req.params.id).exec(function(err, item) {

		if (err) return res.apiError('database error', err);
		if (!item) return res.apiError('not found');

		res.apiResponse({
			post: item
		});

		// res.json(item);
	});
}


