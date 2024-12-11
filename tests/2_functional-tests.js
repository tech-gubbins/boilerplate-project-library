const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let testBookId; // Variable to store a book ID for subsequent tests

  suite('Routing tests', function() {
    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Test Book' })
          .end(function(err, res) {
            assert.equal(res.status, 200, 'Response should be successful');
            assert.property(res.body, 'title', 'Response should have a title');
            assert.property(res.body, '_id', 'Response should have an _id');
            assert.equal(res.body.title, 'Test Book', 'Title should match submitted title');
            
            // Store the book ID for subsequent tests
            testBookId = res.body._id;
            done();
          });
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({}) // Empty object, no title
          .end(function(err, res) {
            assert.equal(res.body, 'missing required field title', 'Should return error for missing title');
            done();
          });
      });
    });

    suite('GET /api/books => array of books', function(){
      test('Test GET /api/books',  function(done){
        chai.request(server)
          .get('/api/books')
          .end(function(err, res){
            assert.equal(res.status, 200, 'Response should be successful');
            assert.isArray(res.body, 'Response should be an array');
            
            // Ensure each book has required properties
            if (res.body.length > 0) {
              assert.property(res.body[0], 'commentcount', 'Books should have commentcount');
              assert.property(res.body[0], 'title', 'Books should have title');
              assert.property(res.body[0], '_id', 'Books should have _id');
            }
            done();
          });
      });      
    });

    suite('GET /api/books/[id] => book object with [id]', function(){
      test('Test GET /api/books/[id] with id not in db',  function(done){
        // Use a fake MongoDB ObjectId
        const fakeId = '000000000000000000000000';
        chai.request(server)
          .get(`/api/books/${fakeId}`)
          .end(function(err, res){
            assert.equal(res.body, 'no book exists', 'Should return "no book exists" for invalid ID');
            done();
          });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        // Use the book ID from previous POST test
        chai.request(server)
          .get(`/api/books/${testBookId}`)
          .end(function(err, res){
            assert.equal(res.status, 200, 'Response should be successful');
            assert.property(res.body, 'title', 'Book should have title');
            assert.property(res.body, '_id', 'Book should have _id');
            assert.property(res.body, 'comments', 'Book should have comments array');
            assert.equal(res.body._id, testBookId, 'Book ID should match requested ID');
            done();
          });
      });
    });

    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server)
          .post(`/api/books/${testBookId}`)
          .send({ comment: 'Test comment' })
          .end(function(err, res){
            assert.equal(res.status, 200, 'Response should be successful');
            assert.property(res.body, 'comments', 'Book should have comments');
            assert.isArray(res.body.comments, 'Comments should be an array');
            assert.include(res.body.comments, 'Test comment', 'Comment should be added to comments');
            done();
          });
      });

      test('Test POST /api/books/[id] without comment field', function(done){
        chai.request(server)
          .post(`/api/books/${testBookId}`)
          .send({}) // No comment
          .end(function(err, res){
            assert.equal(res.body, 'missing required field comment', 'Should return error for missing comment');
            done();
          });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        const fakeId = '000000000000000000000000';
        chai.request(server)
          .post(`/api/books/${fakeId}`)
          .send({ comment: 'Test comment' })
          .end(function(err, res){
            assert.equal(res.body, 'no book exists', 'Should return "no book exists" for invalid ID');
            done();
          });
      });
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {
      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        chai.request(server)
          .delete(`/api/books/${testBookId}`)
          .end(function(err, res){
            assert.equal(res.body, 'delete successful', 'Should confirm successful deletion');
            done();
          });
      });

      test('Test DELETE /api/books/[id] with id not in db', function(done){
        const fakeId = '000000000000000000000000';
        chai.request(server)
          .delete(`/api/books/${fakeId}`)
          .end(function(err, res){
            assert.equal(res.body, 'no book exists', 'Should return "no book exists" for invalid ID');
            done();
          });
      });
    });
  });
});