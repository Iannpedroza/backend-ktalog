const router = require('express').Router();
const cors = require('cors');
const { populate } = require('../models/Category');
let Category = require('../models/Category');
let Service = require('../models/Service')
const multer  = require('multer')
const multerConfig = require("../config/multer");

router.route('/getByUserId').post((req, res) => {
    let userId = req.body.userId;
    Service.find({
        user: userId
    })
        .populate('category')
        .then(services => {
            if (services) {
                res.json(services)
            } else {
                res.send({error: "Não foi encontrado nenhum serviço"})
            }
        })
        .catch(err => {
            res.send('error: ' + err)
        })

});

router.post('/register', multer(multerConfig).fields([{name: 'image', maxCount: 1}, {name: 'productsImages[]'}]), function (req, res){
    let {name, description, phone, category, verified, cpf, averagePrice, user, address, cnpj, products, schedules} = req.body;
    products = products ? JSON.parse(products) : null;
    if (products && products.some(el => el.image != '')) {
        let i = 0;
        products.forEach(el => {
            if(el.image) {
                el.image = req.files['productsImages[]'] ? req.files['productsImages[]'][i].key.includes("uploads/") ? req.files['productsImages[]'][i].key : "uploads/" + req.files['productsImages[]'][i].key: null;
                i++;
            }
        });
    }
    console.log(products)
    console.log(req.files)
    schedules = schedules ? JSON.parse(schedules) : null;
    if (category) {
        Category.findOne({name: category})
            .then(categ => {
                category = categ;
                
                Service.create({name, description, phone, category, verified, cpf, averagePrice, user, address, cnpj, products, schedules, image: req.files['image'] ? req.files['image'][0].key.includes("uploads/") ? req.files['image'][0].key : "uploads/" + req.files['image'][0].key: null})
                    .then(service => {
                        console.log("Criado")
                        res.json(service);
                    })
                    .catch(err => {
                        console.log("Não Criou" + err)
                        res.send({error: err});
                    })
                
            })
            .catch(err => {
                console.log(err)
                res.send(err);
            })
    } 
        
    

});

router.route('/').get((req, res) => {
    Service.find({
    })
        .populate('category')
        .then(services => {
            if (services) {
                res.json(services)
            } else {
                res.send('nao existe categoria')
            }
        })
        .catch(err => {
            res.send('error: ' + err)
        })

}); 

router.route('/getById').post((req, res) => {
    Service.findById(req.body.id)
        .populate('category')
        .populate('rating.user')
        .then(service => {
            if (service) {
                res.json(service)
            } else {
                res.send('nao existe serviço')
            }
        })
        .catch(err => {
            res.send({error: err})
        })

}); 

router.route('/insertRating').post((req, res) => {
    let rating = req.body.ratingAux;
    Service.findById(req.body.id)
        .populate('rating.user')
        .then(service => {
            let avg;
            if (service ) {
                if (service.rating) {
                    let ratingAux = service.rating;
                    ratingAux.push(rating);
                    avg = ratingAux.reduce((total, next) => total + next.totalRating, 0) / service.rating.length;
                } else {
                    avg = rating.totalRating;
                }

                Service.findOneAndUpdate(
                    {
                        _id: req.body.id,
                    },
                    {
                        $push: {
                            rating: req.body.ratingAux
                        },
                        averageRating: avg.toFixed(1)
                    },
                    {new: true}
                )
                .populate('rating.user')
                .exec(
                    function (error, success) {
                        if (error) {
                            res.send({error: err})
                            console.log(error);
                        } else {
                            res.send(success)
                            console.log(success);
                        }
                    }
                ) 
                
            }
        })
    

}); 

router.route('/servicesSearch').post((req, res) => {
    let {name, sort, establishment} = req.body;
    let ratingSort;
    if (sort[0] != '-') {
        ratingSort = sort;
        sort = "-averageRating"
    } 
    Service.find({
        "$or":[
            {
                "name": {
                    "$regex": name,
                    "$options": "i"
                }
            }, {
                "description": {
                    "$regex": name,
                    "$options": "i"
                }
            }
        ]
    })
        .populate('category')
        .sort(sort)
        .sort('-rating.length')
        .lean()
        .then(services => {
            console.log(ratingSort);
            if (services && services.length > 0) {
                services = services.filter(service => service.category.establishment === establishment)
                if (ratingSort) {
                    services.forEach(el => {
                        if (el.rating && el.rating.length > 0) {
                            let averageRatingSort = el.rating.reduce((a, b) => a + (b[ratingSort] || 0), 0) / el.rating.length;
                            el.averageRatingSort = averageRatingSort;
                        } else {
                            el.averageRatingSort = 0;
                        }
                    });
                    services = services.sort((a,b) => b.averageRatingSort - a.averageRatingSort);
                }
                res.json(services);
            } else {
                res.send({error: "Nenhum serviço encontrado"})
            }
        })
        .catch(err => {
            return res.status(400).send({
                message: 'Erro desconhecido!'
            });
        })

}); 

router.route('/getAllServices').get((req, res) => {
    Service.find({
    })
        .populate('category')
        .sort('-averageRating')
        .sort('-rating.length')
        .then(services => {
            if (services && services.length > 0) {
                res.json(services.filter(service => service.category.establishment === false));
            } else {
                res.send({error: "Nenhum serviço encontrado"})
            }
        })
        .catch(err => {
            return res.status(400).send({
                message: 'Erro desconhecido!'
            });
        })

}); 

router.route('/topServices').get((req, res) => {
    Service.find({
        "verified": true
    })
        .populate('category')
        .sort('-averageRating')
        .sort('-rating.length')
        .limit(10)
        .then(services => {
            if (services) {
                res.json(services)
            } else {
                return res.status(400).send({
                    message: 'Serviços não encontrados!'
                });
            }
        })
        .catch(err => {
            return res.status(400).send({
                message: 'Erro desconhecido!'
            });
        })

});




module.exports = router;
