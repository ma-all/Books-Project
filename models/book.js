const mongoose = require('mongoose')
const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    image: {
        url: {
            type: String,
            required: true,
        },
        publicId: {
            type: String,
            required: true,
        },
    },
    author: {
        type: String,
        required: true,
    },
    pages: {
        type: Number,
        required: true,
        min: 0,
    },
    readingStatus: {
        type: String,
        enum: ['currentRead', 'hasRead', 'toBeRead'],
        required: true,
    },
})
const Book = mongoose.model('Book', bookSchema)
module.exports = Book