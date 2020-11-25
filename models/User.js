const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const userSchema = new Schema({
  first_name: {
    type: String,
    required: true,
    trim: true,
    max: 30
  },
  last_name: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  resetLink: {
    data: String,
    default: ''
  },
  avatar: {
    type: String
  }
}, {
  timestamps: true
}
)

const User = mongoose.model('User', userSchema);

module.exports = User;