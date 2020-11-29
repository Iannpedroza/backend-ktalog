const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const ratingKtalogSchema = new Schema({
  commentary: {
    type: String,
    required: false,
    max: 100
  },
  objective: {
    type: Boolean,
    required: true
  },
  utility: {
    type: Number,
    required: true
  },
  usability: {
    type: Number,
    required: true
  },
  frequency: {
    type: Number,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  }
}
)

const RatingKtalog = mongoose.model('RatingKtalog', ratingKtalogSchema);

module.exports = RatingKtalog;