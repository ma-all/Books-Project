const User = require('../models/user')
const bcrypt = require('bcrypt')

const signUpForm = (req, res) => {
    res.render('auth/sign-up.ejs')
}

const signUp = async (req, res) => {
    const addUserData = await User.findOne({
        username: req.body.username
    })
    if(addUserData){
        return res.send('Username is taken.')
    }
    let dataOfUser = {}
    dataOfUser.username = req.body.username
    const hidePass = bcrypt.hashSync(req.body.password, 10)
    dataOfUser.password = hidePass
    const user = await User.create(dataOfUser)
    req.session.user = {
        username: user.username,
        _id: user._id
    }
    req.session.save(()=>{
        res.redirect('/')
    })
}

module.exports = {
    signUpForm, signUp,
}