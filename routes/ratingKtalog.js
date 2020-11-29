const router = require('express').Router();
const cors = require('cors')
let RatingKtalog = require('../models/RatingKtalog')

router.use(cors())

router.route('/register').post((req, res) => {
    const {commentary, objective, utility, usability, frequency, user} = req.body;

    RatingKtalog.create({commentary, objective, utility, usability, frequency, user})
        .then(rating => {
            if (rating) {
                res.json({message: 'Rating registered!'})
            } else {
                res.send({error: "erro ao criar"})
            }
            
        })
        .catch(err => {
            res.send({error: err})
        })

});

router.route('/getById').post((req, res) => {
    const {userId} = req.body;

    RatingKtalog.find({user: userId})
        .then(rating => {
            if (rating && rating.length > 0) {
                res.send({exist: true})
            } else {
                res.send({error: "erro ao criar"})
            }
            
        })
        .catch(err => {
            res.send({error: err})
        })

});


module.exports = router;
