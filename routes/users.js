const router = require('express').Router();
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const fetch = require('node-fetch')
const mailgun = require("mailgun-js");
const DOMAIN = "sandbox62ba1541b1c54fa69aeb0d9353f9cd78.mailgun.org";
const mg = mailgun({apiKey: process.env.MAILGUN_APIKEY, domain: DOMAIN});
const _ = require('lodash')

const multer  = require('multer')
const multerConfig = require("../config/multer");

let User = require('../models/User');
const { ServiceDiscovery } = require('aws-sdk');
const Service = require('../models/Service');

process.env.SECRET_KEY = 'secret'

router.route('/profile').get((req, res) => {
    var decoded = jwt.verify(req.headers['authorization'], process.env.SECRET_KEY)

    User.findOne({
        _id: decoded._id
    })
        .then(user => {
            if (user) {
                res.json(user)
            } else {
                res.send('User does not exist')
            }
        })
        .catch(err => {
            res.send('error: ' + err)
        })
});

router.route('/getById').post((req, res) => {
    User.findOne({
        _id: req.body.id
    })
        .then(user => {
            if (user) {
                res.json(user)
            } else {
                res.send({error: 'nao existe'})
            }
        })
        .catch(err => {
            res.send('error: ' + err)
        })
});

router.post('/updateInfo', multer(multerConfig).single('avatar'), function (req, res) {
    User.findOne({
        _id: req.body.id
    })
        .then(user => {
            if (user) {
                user.updateOne({
                    first_name: req.body.name,
                    last_name: req.body.lastName,
                    email: req.body.email,
                    avatar: req.file ? req.file.path : null,
                })
                    .then(user => {
                        if (res) {
                            res.send(user);
                        }
                    })
            }
        })
})

router.post('/register', multer(multerConfig).single('avatar'), async (req, res) => {
    const today = new Date()
    const userData = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password,
        avatar: req.file ? req.file.key.includes("uploads/") ? req.file.key : "uploads/" + req.file.key: null,
        created: today
    };

    User.findOne({
        email: req.body.email
    })
        .then(user => {
            if (!user) {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    userData.password = hash
                    User.create(userData)
                        .then(user => {
                            res.json({ status: user.email + ' Registered!' })
                        })
                        .catch(err => {
                            res.send('error: ' + err)
                        })
                })
            } else {
                res.json({ error: 'User already exists' })
            }
        })
        .catch(err => {
            res.send('error: ' + err)
        })

});

router.route('/delete').post((req, res) => {
    const {userId} = req.body;
    
    User.deleteOne({
        _id: userId
    })
        .then(del => {
            if (del.deletedCount === 1) {
                Service.find({
                    user: userId
                })
                    .then(services => {
                        if (services && services.length > 0){
                            Service.deleteMany({
                                user: userId
                            })
                                .then(del => {
                                    res.send({message: "Foram deletados " + del.deletedCount + " serviços."});
                                })
                        } else {
                            res.send({message: "A conta foi deletada"})
                        }
                    })
            } else {
                res.send({error: "Não foi possível excluir a conta."})
            }
        })
});

router.route('/login').post((req, res) => {
    User.findOne({
        email: req.body.email
    })
        .then(user => {
            if (user) {
                if (bcrypt.compareSync(req.body.password, user.password)) {
                    // Passwords match
                    const payload = {
                        _id: user._id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email
                    }
                    let token = jwt.sign(payload, process.env.SECRET_KEY, {
                        expiresIn: 1440
                    })
                    res.send({
                        token,
                        name: user.first_name,
                        id: user._id,
                        avatar: user.avatar
                    });
                } else {
                    // Passwords don't match
                    res.json({ error: "Passwords don't match" })
                }
            } else {
                res.json({ error: 'User does not exist1' })
            }
        })
        .catch(err => {
            res.send('error: ' + err)
        })
});

router.route('/fblogin').post((req, res) => {
    const {userID, accessToken} = req.body;

    let urlGraphFacebook = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;
    fetch(urlGraphFacebook, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(response => {
        const {email, name} = response;
        User.findOne({email})
            .then(user => {
                if (user) {
                    const token = jwt.sign({_id: user._id}, process.env.SECRET_KEY, {expiresIn: '7d'});
                    const {_id, name, email} = user;

                    res.json({
                        token,
                        user: {_id, name, email}
                    })
                } else {
                    let password = email+process.env.SECRET_KEY;
                    const userData = {
                        first_name: name,
                        last_name: req.body.last_name,
                        email: email,
                        password: password
                    };

                    User.create(userData)
                        .then(user => {
                            const token = jwt.sign({_id: user._id}, process.env.SECRET_KEY, {expiresIn: '7d'});
                            const {_id, name, email} = newUser;

                            res.json({
                                token,
                                user: {_id, name, email}
                            })
                        })

                        .catch(err => {
                            console.log(err);
                            return res.status(400).json({
                                error: "something went wrong1"
                            })
                        })
                }
            })
            .catch(err => {
                console.log(err);
                return res.status(400).json({
                    error: err
                })
            })

    });
});

router.route('/forgot-password').put((req, res) => {
    const {email} = req.body;

    User.findOne({email})
        .then(user => {
            if (!user) {
                return res.status(400).json({error: "User with this email does not exists."});
            }

            const token = jwt.sign({_id: user._id}, process.env.RESET_PASSWORD_KEY, {expiresIn: '20m'});

            const data = {
                from: 'noreply@hello.com',
                to: email,
                subject: 'Reset password',
                html: `
                    <h2>Please click on giver link to reset your password</h2>
                    <p>${process.env.CLIENT_URL}/resetpassword/${token}</p>
                `
            }

            return user.updateOne({resetLink: token}, function(err, success) {
                if (err) {
                    return res.status(400).json({error: "reset password link error"});
                } else {
                    mg.messages().send(data, function (error, body) {
                        if(error) {
                            return res.json({
                                error: error.message
                            })
                        }
                        return res.json({message: 'Email has been sent, kindly follow the instructions'});
                    })
                }

            })

        })
        .catch(err => {
            return res.status(401).json({error: "teste"});
        })
});

router.route('/reset-password').put((req, res) => {
    const {resetLink, newPassword} = req.body;

    if (resetLink) {
        jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, function(error, decodedData) {
            if (error) {
                return res.status(401).json({
                    error: "Incorrect token or it is expired!"
                });
            }
            User.findOne({resetLink})
                .then(user => {
                    if (!user) {
                        return res.status(400).json({error: "User with this token does not exist."});
                    }

                    const obj = {
                        password: newPassword,
                        resetLink: ''
                    }

                    user = _.extend(user, obj);

                    user.save((err, result) => {
                        if(err) {
                            return res.status(400).json({error: "reset password error."});
                        } else {
                            return res.status(200).json({message: "Your password has been changed."});
                        }
                    })
                })
                .catch(err => {
                    return res.status(400).json({error: err});
                })
        })
    } else {
        return res.status(401).json({error: "Authentication erro!!!"});
    }
});
module.exports = router;
