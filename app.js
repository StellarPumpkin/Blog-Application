const express = require('express'),
    port = process.env.PORT || 3000,
    path = require('path'),
    app = express(),
    cookieParser = require('cookie-parser'),
    Users = require('./models/users.js'),
    Comments = require('./models/comments'),
    Posts = require('./models/posts.js'),
    cookieSession = require('express-session');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());
app.use(express.urlencoded({
    extended: true
}));
app.use(cookieSession({
    name: 'blogCookie',
    secret: 'secretSignature'
}));



//Setup middleware that checks if user is logged in or not
let checkLoggedIn = (req, res, next) => {
    console.log(`this is userCookie: ${req.cookies.blogCookie}`);
    console.log(`This is the user: ${req.session.Users}`);
    //here it checks if both cookie and user exist already, creates automatic cookie?

    if (req.cookies.blogCookie && req.session.Users) {
        console.log('checkLoggedIn fount that user ws already logged in');
        res.redirect('/profile');
    }
    console.log('checkLoggedIn found that user is new here');
    next()
};

//rendering login, register, profile
app.get('/', checkLoggedIn, (req, res) => {
    res.redirect('login');
});
app.get('/', (req, res) => {
    res.render('login');
});

app.route('/register')
    .get(checkLoggedIn, (req, res) => {
        res.render('register')
    })
    .post((req, res) => {
        Users.create({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                //password: req.body.password
            }).then((retrivedUser) => {
                req.session.Users = retrivedUser.dataValues;
                res.redirect('/profile');
            })
            .catch((error) => {
                console.log(`Something went wrong: ${error.stack}`);
                res.redirect('/register');
            });
    });



//login page
app.route('/login')
    .get(checkLoggedIn, (req, res) => {
        res.render('login');
    })
    .post((req, res) => {
        let username = req.body.username,
            password = req.body.password;
        console.log(`login username: ${username}`);
        console.log(`password username: ${password}`);

        Users.findOne({
                where: {
                    username: username,
                    password: password
                }
            })
            .then((retrivedUser) => {
                req.session.Users = retrivedUser.dataValues;
                res.redirect('/profile');
            })
            .catch((error) => {
                console.log(`Something went wrong: ${error.stack}`);
                res.render('error');
            })
    });



//profile page
app.get('/profile', (req, res) => {
    if (req.session.Users && req.cookies.blogCookie) {
        res.render('profile', {
            username: req.session.Users.username
        });

    } else {
        res.redirect('/login');
    }
});



//render create page, make a form (NEED TO FIX REDIRECT)
app.get('/create', (req, res) => {
    res.render('create')
});

app.post('/create', (req, res) => {
    Posts.create({

            title: req.body.title,
            body: req.body.body,
            userId: req.session.Users.id
        }).then((retrivedPost) => {
            console.log(retrivedPost.dataValues);
            req.session.Users = retrivedPost.dataValues
            res.redirect('/post/' + retrivedPost.dataValues.id)
            console.log('we have redirected')
        })
        .catch((error) => {
            console.log(`Something went wrong: ${error.stack}`);
        })
});



// Page with the created post/current post
app.get('/post/:id', (req, res) => {
    let id = req.params.id;
    Posts.findById(id).then((retrivedPosts) => {
        Comments.findAll({
            where: {
                postId: id,
            }

        }).then((retrivedComment) => {
            res.render('post', {
                title: retrivedPosts.dataValues.title,
                body: retrivedPosts.dataValues.body,
                postId: id,
                allComments: retrivedComment
            })
        }).catch((error) => {
            console.log(`Something is wrong: ${error.stack}`);
        })
    })
});








//here I can look up my own posts
app.get('/myposts', (req, res) => {

    if (req.session.Users && req.cookies.blogCookie) {
        Posts.findAll({
                where: {
                    userId: req.session.Users.id
                }
            }).then((retrivedUserPosts) => {
                res.render('myposts.ejs', {
                    myPosts: retrivedUserPosts
                })
            })

            , (error) => {
                console.log(`Something went wrong when reading with findAll(): ${error.stack}`)
            }
    }
});

//Here I can see all posts
app.get('/allposts', (req, res) => {
    Posts.findAll().then((retrivedPostArray) => {
        res.render('allposts', {
            allposts: retrivedPostArray
        })
    }, (error) => {
        console.log(`Something went wrong when reading with findAll(): ${error.stack}`)
    });

});

//Leaving comments SECTION YEAH
app.post('/post/:id/comments', (req, res) => {
    let id = req.params.id;
    Comments.create({
        username: req.body.username,
        message: req.body.message,
        postId: id,
    })
    Posts.findById(id).then((retrivedPosts) => {
        Comments.findAll({
            where: {
                postId: id
            }
        }).then((retrivedComments) => {
            res.render('post', {
                postId: id,
                allComments: retrivedComments,
                title: retrivedPosts.dataValues.title,
                body: retrivedPosts.dataValues.body



            })

        })
    })
});



//create route logout where we delete cookie associated with this user session
app.get('/logout', (req, res) => {
    if (req.session.Users && req.cookies.blogCookie) {
        res.clearCookie('blogCookie');
        console.log('Cookie has been delted');
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});


app.listen(port, (req, res) => console.log(`Up on: ${port}`));