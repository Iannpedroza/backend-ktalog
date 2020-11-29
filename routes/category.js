const router = require('express').Router();
const cors = require('cors')
let Category = require('../models/Category')

router.use(cors())

router.route('/register').post((req, res) => {
    const {name, establishment} = req.body;

    if (name) {
        Category.create({name, establishment})
            .then(category => {
                res.json({status: category.name + 'Registered!'})
            })
            .catch(err => {
                res.send('error' + err)
            })
    }

});

router.route('/').get((req, res) => {

    Category.find({
    })
        .then(categories => {
            if (categories) {
                res.json(categories)
            } else {
                res.send('nao existe categoria')
            }
        })
        .catch(err => {
            res.send('error: ' + err)
        })

});


module.exports = router;
