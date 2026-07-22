const Book = require('../models/book')
const cloudinary = require('../config/cloudinary')
const uploadimages = require('../config/multer')
const Review = require('../models/review')

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
    bookData.genre = req.body.genre
    bookData.readingStatus = req.body.readingStatus
    bookData.image = {
        url: addedImg.secure_url,
        publicId: addedImg.public_id,
    }

    if(req.body.image) {
        bookData.image = req.body.image
    }

    let bookadded = await Book.create(bookData)
    res.redirect('/books')
}

const index = async (req, res) => {
    const allBooks = await Book.find({user: req.session.user._id}).populate('user')
    const selectReadingStatus = req.body?.status

    let displayBooks = allBooks
    if(selectReadingStatus && selectReadingStatus !== 'everyBook') {
        displayBooks = allBooks.filter(
            book =>  {
                return book && book.readingStatus === selectReadingStatus
            }
        )
    }
    res.render('books/index.ejs', {
        allBooks: displayBooks,
        selectReadingStatus: selectReadingStatus || 'everyBook',
    })
}

const showBook = async (req, res) => {
    const bookFound = await Book.findById(req.params.bookId).populate('user')
    const reviews = await Review.find({book: req.params.bookId}).populate('userRev')

    res.render('books/show.ejs', {
        bookFound,
        reviews,
        req,
    })
}

const editBook = async (req, res) => {
    const bookFound = await Book.findById(req.params.bookId)
    res.render('books/edit.ejs', {
        bookFound,
    })
}

const updateBook = async (req, res) => {
    const bookFound = await Book.findById(req.params.bookId)
    const oldPublicId = bookFound.image?.publicId

    bookFound.user = req.session.user._id
    bookFound.title = req.body.title
    bookFound.author = req.body.author
    bookFound.pages = req.body.pages
    bookFound.genre = req.body.genre
    bookFound.readingStatus = req.body.readingStatus

    if(req.file) {
        const addedImg = await addImg(req.file.buffer)
        bookFound.image = {
            url: addedImg.secure_url,
            publicId: addedImg.public_id,
        }
    }

    await bookFound.save()
    res.redirect(`/books/${req.params.bookId}`)
}

const addFave = async (req, res) => {
    await Book.findByIdAndUpdate(req.params.bookId, {
        $push: {favoriteByUser: req.session.user._id}
    })
    
    res.redirect('/books/favorites')
}

const showFave = async (req, res) => {
    const faveBook = await Book.find({ favoriteByUser: req.session.user._id })
    res.render('books/favorites.ejs', {
        faveBook,
    })
}

const removeFave = async (req, res) => {
    await Book.findByIdAndUpdate(req.params.bookId, {
        $pull: {favoriteByUser: req.session.user._id}
    })

    res.redirect('/books/favorites')
}

const removeBook = async (req, res) => {
    const bookFound = await Book.findById(req.params.bookId)

    if(bookFound.user.equals(req.session.user._id)) {
        await Book.findByIdAndDelete(req.params.bookId)
        res.redirect('/books')
    } else {
        res.send('no removing')
    }
}

// make a search funciont
// try console logging req.query
//try to filter where title: req.query.title
const search = async(req, res) => {
    const allBooks = await Book.find({user: req.session.user._id}).populate('user')
    const selectReadingStatus = req.body?.status
    let displayBooks = allBooks
    if(selectReadingStatus && selectReadingStatus !== 'everyBook') {
        displayBooks = allBooks.filter(
            book =>  {
                return book && book.readingStatus === selectReadingStatus
            }
        )
    }
    

    const filterBook = req.query?.title || ''
    if(filterBook != ''){
        displayBooks = displayBooks.filter(
            book => {
                return book && book.title && book.title.toLocaleLowerCase().includes(filterBook.toLocaleLowerCase())
            }
        )
    }

    res.render('books/index.ejs', {
        allBooks: displayBooks,
        selectReadingStatus: selectReadingStatus || 'everyBook',
        query: req.query || {},
    })

}

module.exports = {
    addBookForm, addBook, index, showBook, editBook, updateBook, removeBook, addFave, showFave, removeFave, search,
}

//CODE GRAVEYARD
//Update Book Function:
    // let bookData = {}
    // bookData.user = req.session.user._id
    // bookData.title = req.body.title
    // bookData.author = req.body.author
    // bookData.pages = req.body.pages
    // bookData.readingStatus = req.body.readingStatus
    // await Book.findByIdAndUpdate(req.params.bookId, bookData)

    // const searchTitle = req.query.search
    // let filterBook = { user: req.session.user._id}
    // if(searchTitle) {
    //     filter.title = 
    // }
    // const searchedbooks = await Book.find(filterBook)