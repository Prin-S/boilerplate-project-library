'use strict';

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

let bookSchema = new mongoose.Schema({
  title: String,
  comments: [{
    comment: String
  }],
  commentcount: {
    type: Number,
    default: 0
  }
})

let Book = mongoose.model("Book", bookSchema);

// For clearing the database
/*Book.remove((err) => {
  console.log( "Database cleared" );
});*/

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]

      // Find all titles
      Book.find({}, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.json(data);
        }
      });
    })
    
    .post(function (req, res){
      let title = req.body.title;
      //response will contain new book object including atleast _id and title

      // If the 'title' field is empty
      if (!title) {
        res.send('missing required field title');
      } else {
        // Check if title exists
        Book.find({title}, (err, data) => {
          if (err) {
            console.log(err);
          } else {
            // If title is not found
            if (data[0] === undefined) {
              // Create new title
              Book.create({title}, (err, data) => {
                if (err) {
                  console.log(err);
                } else {
                  // Find title again as it has just been added
                  Book.find({title}, (err, data) => {
                    if (err) {
                      console.log(err);
                    } else {
                      // Show title details
                      res.json({_id: data[0]._id, title: data[0].title});
                    }
                  });
                }
              });
            } else {
              // If title is found, just show title details
              res.json({_id: data[0]._id, title: data[0].title});
            }
          }
        });
      }
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      
      // Select all titles to delete
      Book.deleteMany({}, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.send('complete delete successful');
        }
      });
    });

  app.route('/api/books/:id')
    .get(function (req, res){
      let bookId = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}

      // Find title according to entered 'bookId'
      Book.find({_id: bookId}, (err, data) => {
        if (err) {
          // If an invalid 'bookId' is entered
          res.send('no book exists');
        } else if (data.length == 0) {
          // Sometimes an empty array is returned when an invalid 'bookId' is entered
          res.send('no book exists');
        } else {
          // Show title details
          res.json({_id: data[0]._id, title: data[0].title, comments: data[0].comments, commentcount: data[0].commentcount});
        }
      });
    })
    
    .post(function(req, res){
      let bookId = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get

      // If 'comment' is missing
      if (!comment) {
        res.send('missing required field comment');
      } else {
        // Find title according to entered 'bookId' and if 'bookId' exists, update it with new comment and increase 'commentcount' by 1
        Book.findByIdAndUpdate(bookId, {$push: {comments: {comment}}, $inc: {commentcount: 1}}, {new: true}, (err, data) => {
          if (err) {
            // If no book is found ('bookId.length' is longer or shorter than actual)
            res.send('no book exists');
          } else if (!data) {
            // If no book is found ('bookId.length' is correct)
            res.send('no book exists');
          } else {
            // Create an array of only comments (no '_id')
            let justComments = data.comments.map(each => each.comment);

            // Show title details
            res.json({_id: data._id, title: data.title, comments: justComments, commentcount: data.commentcount});
          }
        });
      }
    })
    
    .delete(function(req, res){
      let bookId = req.params.id;
      //if successful response will be 'delete successful'

      // Find title according to entered 'bookId'
      Book.find({_id: bookId}, (err, data) => {
        if (err) {
          // If an invalid 'bookId' is entered
          res.send('no book exists');
        } else if (data.length == 0) {
          // Sometimes an empty array is returned when an invalid 'bookId' is entered
          res.send('no book exists');
        } else {
          // If 'bookId' exists, delete it
          Book.deleteOne({_id: bookId}, (err, data) => {
            if (err) {
              console.log(err);
            } else {
              res.send('delete successful');
            }
          });
        }
      });
    });
  
};
