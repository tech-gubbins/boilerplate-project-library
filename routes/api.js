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
				// Fetch all books, but explicitly select and compute the required fields
				const books = await Book.find({}).select('title _id comments');

				// Map the books to include commentcount
				const booksWithCommentCount = books.map((book) => ({
					title: book.title,
					_id: book._id,
					commentcount: book.comments ? book.comments.length : 0,
				}));

				res.json(booksWithCommentCount);
			} catch (err) {
				res.status(500).json({ error: 'Error retrieving books' });
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
					commentcount: 0,
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
				const result = await Book.deleteMany({});

				// Only send 'complete delete successful' if at least one book was deleted
				if (result.deletedCount > 0) {
					return res.send('complete delete successful');
				}

				// If no books were deleted, indicate as such
				return res.status(404).send('no books to delete');
			} catch (err) {
				// Log error for server-side debugging
				console.error('Delete books error:', err);

				// Send a 500 status with error message
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
				book.commentcount += 1;

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
