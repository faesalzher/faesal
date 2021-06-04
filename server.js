require('./models/db');

const express = require('express');
const path = require('path');
require('dotenv').config();
const exphbs = require('express-handlebars');
const userController = require('./controllers/userController');
const jwt = require('jsonwebtoken');
var router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');

var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('views', path.join(__dirname, '/views/'));
app.engine('hbs', exphbs({ extname: 'hbs', defaultLayout: 'mainLayout', layoutsDir: __dirname + '/views/layouts/' }));
app.set('view engine', 'hbs');

app.listen(process.env.PORT || 3000, () => {
    console.log('Express server started at port : 3000');
});

app.use('/user', userController);


const posts = [
    { username: "Kyle", title: "Post1" },
    { username: "Jim", title: "Post2" },
]


app.get('/loginPage', (req, res) => {
    res.render("login/login", {
        viewTitle: "Login"
    });
});



app.get('/posts', authenticateToken, (req, res) => {
    res.json(posts.filter(post => post.username == req.user.name))

})


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    // Bearer TOKEN
    if (token == null) return res.redirect('/loginPage')

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

let refreshTokens = []


app.post('/token', (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({ name: user.name })
        res.json({ accessToken: accessToken })
    })
})
app.post('/login', (req, res) => {
    const username = req.body.userName
    const user = { name: username }

    const accessToken = generateAccessToken(user)
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
    refreshTokens.push(refreshToken)
    // localStorage.setItem("accessToken", accessToken);
    res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

function generateAccessToken(user) {
    // var user = new User();
    // user.userName = req.body.userName;
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' })
}

