const Review = require('../models/review')
const Book = require('../models/book')

const reviewBook = async (req, res) => {
    const bookFound = await Book.findById(req.params.bookId)

    const reviewData = {}
    reviewData.comment = req.body.comment
    reviewData.rating = req.body.rating
    reviewData.user = req.session.user._id

    console.log(reviewData)

    res.redirect(`/books/${req.params.bookId}`)
}

module.exports = { reviewBook, }