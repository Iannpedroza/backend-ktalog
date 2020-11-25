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
    required: true
  },
  quality: {
    type: Number,
    required: true
  },
  attendance: {
    type: Number,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}
)

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;