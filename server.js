const dotenv = require('dotenv')
dotenv.config()

const express = require('express')
const app = express()

const mongoose = require('mongoose') 
const methodOverride = require('method-override') 
const morgan = require('morgan')
const session = require('express-session') 
const { MongoStore } = require('connect-mongo')
const uploadimages = require('./config/multer') 
const path = require('path')

const userIsSigned = require('./middleware/is-user-signed-in')

const allowViewing = require('./middleware/allow-view')

const authCtrl = require('./controllers/auth')
const bookCtrl = require('./controllers/books')
const reviewCtrl = require('./controllers/reviews')

const port = process.env.PORT ? process.env.PORT : '3000'

mongoose.connect(process.env.MONGODB_URI)
mongoose.connection.on('connected', () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}`)
})

app.use(express.urlencoded({ extended: false}))
app.use(methodOverride('_method'))
app.use(morgan('dev'))
app.use(session({ 
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    })
}))

app.use(allowViewing)

app.use(express.static(path.join(__dirname, "public")))

app.get('/auth/sign-up', authCtrl.signUpForm) 
app.post('/auth/sign-up', authCtrl.signUp)

app.get('/auth/sign-in', authCtrl.signInForm)
app.post('/auth/sign-in', authCtrl.signIn)

app.delete('/auth/sign-out', authCtrl.signOut)

app.get('/books/new', userIsSigned, bookCtrl.addBookForm)
app.post('/books/create', userIsSigned, uploadimages.single('image'), bookCtrl.addBook)

app.get('/books/reviews', userIsSigned, reviewCtrl.showReview)


app.get('/books', userIsSigned, bookCtrl.index)

app.post('/books', userIsSigned, bookCtrl.index)

app.get('/search', userIsSigned, bookCtrl.search)

app.post('/books/:bookId/favorites', userIsSigned, bookCtrl.addFave)
app.get('/books/favorites', userIsSigned, bookCtrl.showFave)

app.get('/books/:bookId', userIsSigned, bookCtrl.showBook)

app.get('/books/:bookId/edit', userIsSigned, bookCtrl.editBook)
app.put('/books/:bookId', userIsSigned, uploadimages.single('image'), bookCtrl.updateBook)

app.delete('/books/:bookId', userIsSigned, bookCtrl.removeBook)

app.post('/books/:bookId/reviews', userIsSigned, reviewCtrl.reviewBook)
app.get('/books/:bookId/reviews', userIsSigned, reviewCtrl.showReview)

app.delete('/books/:bookId/favorites', userIsSigned, bookCtrl.removeFave)


app.get('/dashboard', userIsSigned, async (req, res) => {
    res.render('dashboard.ejs', {
        user: req.session.user,
    })
})

app.get('/', (req, res) => {
    res.render('home.ejs', {
        user: req.session.user
    })
})

app.delete('/', (req, res) => {
    res.render('home.ejs', {
        user: null
    })
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})