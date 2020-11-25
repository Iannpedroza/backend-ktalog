const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ratingSchema = new Schema({
  commentary: {
    type: String,
    required: false,
    max: 100
  },
  costBenefit: {
    type: Number,
    required: true,
    
  },
  quality: {
    type: Number,
    required: true
  },
  attendance: {
    type: Number,
    required: true
  },
  totalRating: {
    type: Number
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  timestamps: true
}
)

const productSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
  },
  image: {
    type: String
  }
}, {
  timestamps: true
})

const addressSchema = new Schema({
  zipcode: {
    type: String,
    required: true,
    max: 8
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true,
    max: 2
  },
  neighborhood: {
    type: String,
    required: true
  },
  street: {
    type: String,
    required: true
  },
  number: {
    type: Number,
    required: true
  }
}
)

const scheduleSchema = new Schema({
  week_day:{
    type: Number,
    required: true
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  }
})

const serviceSchema = new Schema({
  name: {
    type: String,
    required: true,
    max: 20
  },
  description: {
    type: String,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: false
  },
  phone: {
    type: String,
    required: true,
    max: 11
  },
  verified: {
    type: Boolean,
    required: true,
    default: false
  },
  cpf: {
    type: String,
    max: 11,
  },
  cnpj: {
    type: String,
    max: 14
  },
  averagePrice: {
    type: Number
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  rating: [ratingSchema],
  products: [productSchema],
  schedules: [scheduleSchema],
  address: {
    type: addressSchema,
    required: true
  },
  averageRating: {
    type: Number
  },
  image: {
    type: String
  }

}, {
  timestamps: true
}
)

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;