const Book = require('../models/book')
const cloudinary = require('../config/cloudinary')

const addBookForm = (req, res) => {
    res.render('books/new.ejs')
}

const addImg = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadimages = cloudinary.uploader.upload_stream({
            folder: 'books-project/books',
            resource_type: 'image'
        },
        (error, result) => {
            if(error) {
                reject(error)
            } else {
                resolve(result)
            }
        }
    )
    uploadimages.end(fileBuffer)
    })
}

const addBook = async (req, res) => {
    
    
    const addedImg = await addImg(req.file.buffer)

    const bookData = {}
    bookData.user = req.session.user._id
    bookData.title = req.body.title
    bookData.author = req.body.author
    bookData.pages = req.body.pages
    bookData.readingStatus = req.body.readingStatus
    bookData.image = {
        url: addedImg.secure_url,
        publicId: addedImg.public_id,
    }

    if(req.body.image) {
        bookData.image = req.body.image
    }

    let bookadded = await Book.create(bookData)
    res.redirect('books/show.ejs')
}

const index = async (req, res) => {
    const allBooks = await Book.find().populate('user')
    res.render('books/index.ejs', {allBooks})
}

module.exports = {
    addBookForm, addBook, index,
}