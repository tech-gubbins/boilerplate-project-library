/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

const Book = require('../models/book');

module.exports = function (app) {
	app
		.route('/api/books')

		// GET all books
		.get(async (req, res) => {
			try {
				const books = await Book.find({}).select('title _id comment_count');
				res.json(books);
			} catch (err) {
				res.status(500).json({ error: 'Error retreiving books' });
			}
		})

		// POST a new book
		.post(async (req, res) => {
			const { title } = req.body;

			if (!title) {
				return res.json('missing required field title');
			}

			try {
				const newBook = new Book({
					title,
					comments: [],
					comment_count: 0,
				});

				const savedBook = await newBook.save();
				res.json({
					title: savedBook.title,
					_id: savedBook._id,
				});
			} catch (err) {
				res.status(500).json({ error: 'Error saving book' });
			}
		})

		// DELETE all books
		.delete(async (req, res) => {
			try {
				await Book.deleteMang({});
				res.json('complete delete successful');
			} catch (err) {
				res.status(500).json({ error: 'Error deleting books' });
			}
		});

	app
		.route('/api/books/:id')

		// GET a single book
		.get(async (req, res) => {
			try {
				const book = await Book.findById(req.params.id);

				if (!book) {
					return res.json('no book exists');
				}

				res.json({
					title: book.title,
					_id: book._id,
					comments: book.comments,
				});
			} catch (err) {
				res.json('no book exists');
			}
		})

		// POST a comment to a book
		.post(async (req, res) => {
			const { comment } = req.body;

			if (!comment) {
				return res.json('missing required field comment');
			}

			try {
				const book = await Book.findById(req.params.id);

				if (!book) {
					return res.json('no book exists');
				}

				book.comments.push(comment);
				book.comment_count += 1;

				const updatedBook = await book.save();

				res.json({
					title: updatedBook.title,
					_id: updatedBook._id,
					comments: updatedBook.comments,
				});
			} catch (err) {
				res.json('no book exists');
			}
		})

		// DELETE a book
		.delete(async (req, res) => {
			try {
				const book = await Book.findByIdAndDelete(req.params.id);

				if (!book) {
					return res.json('no book exists');
				}

				res.json('delete successful');
			} catch (err) {
				res.json('no book exists');
			}
		});
};
