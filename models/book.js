const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	comments: [
		{
			type: String,
		},
	],
	comment_count: {
		type: Number,
		default: 0,
	},
});

module.exports = mongoose.model('Book', BookSchema);
